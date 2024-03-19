import dayjs, { Dayjs } from "dayjs"
import isBetween from "dayjs/plugin/isBetween"
import { keyRates, moratoriums } from "./penalty.data"
import { Debt } from "./penalty.types"

dayjs.extend(isBetween)

type PenaltiesTable = {
    id: number
    date: Dayjs
    debt: number
    delayDaysCount: number
    fraction: string
    moratorium: boolean
    rate: number
    penalty: number
    deferredCoef: number
}[]

type ResultRow = {
    id: number
    debt: number
    dateFrom: Dayjs
    dateTo: Dayjs
    daysCount: number
    fraction: string
    moratorium: boolean
    rate: number
    penalty: number
    deferredCoef: number
}

export type ResultTable = ResultRow[]

export type PenaltyParams = {
    debtPeriod: Dayjs
    debtSum: number
    calcDate: Dayjs
}

class Penalty {
    static daysCountToPay = 10
    private static _fractionChangeDay = 91

    /**
     * Ключевая ставка на дату
     *
     * @param {Dayjs} date
     * @return {*}  {number}
     */
    static getKeyRate(date: Dayjs): number {
        return keyRates.filter(([startDate, _]) => {
            return date.isAfter(startDate)
        })[keyRates.length - 1][1]
    }

    /**
     * Показывает, действует ли на данную дату мораторий на начисление пени
     *
     * @param {Dayjs} date
     * @return {*}  {boolean}
     */
    static doesMoratoriumActs(date: Dayjs): boolean {
        return moratoriums.some(([start, end]) => {
            return date.isBetween(start, end, "day", "[]")
        })
    }

    constructor(public debt: Debt) {}

    /**
     * Дата начала просрочки
     *
     * @return {*}  {Dayjs}
     */
    get dueDate(): Dayjs {
        return this.debt.period
            .endOf("month")
            .add(Penalty.daysCountToPay, "day")
    }

    /**
     * Коэффициент для применения до и после начала просрочки (0, 1)
     *
     * @param {Dayjs} date
     * @return {*}  {number}
     */
    getDeferredCoef(date: Dayjs): number {
        // Количество дней, в течение которых пеня не начисляется
        const deferredDaysCount = 31

        return date.diff(this.dueDate.add(deferredDaysCount, "day")) < 0 ? 0 : 1
    }

    /**
     * Количество дней просрочки
     *
     * @param {Dayjs} date
     * @return {*}  {number}
     */
    getDaysOverdue(date: Dayjs): number {
        return date.diff(this.dueDate, "day")
    }

    /**
     * Доля ключевой ставки, зависящая от количества дней просрочки
     *
     * @param {Dayjs} date
     * @return {*}  {{ value: number; repr: string }}
     */
    getKeyRateFraction(date: Dayjs): { value: number; repr: string } {
        return this.getDaysOverdue(date) < Penalty._fractionChangeDay
            ? { value: 1 / 300, repr: "1/300" }
            : { value: 1 / 130, repr: "1/130" }
    }

    /**
     * Рассчитывает на дату calcDate сумму пени за день day
     *
     * @param {Dayjs} calcDate - дата произведения расчета
     * @param {Dayjs} day - день, за который рассчитывается пеня
     * @return {*}  {number}
     */
    calculate(calcDate: Dayjs, day: Dayjs): number {
        const b = this.getDeferredCoef(day)
        const k = this.getKeyRateFraction(day).value
        const r = Penalty.getKeyRate(calcDate)
        const m = Penalty.doesMoratoriumActs(day) ? 0 : 1

        return Math.round(b * k * r * this.debt.sum * m * 100) / 100
    }
}

function calculatePenalties(calcDate: Dayjs, penalty: Penalty): PenaltiesTable {
    const res: PenaltiesTable = []

    for (let i = 1; i <= calcDate.diff(penalty.dueDate, "day"); i++) {
        const day = penalty.dueDate.add(i, "day")

        const value = {
            id: day.unix(),
            date: day,
            debt: penalty.debt.sum,
            delayDaysCount: penalty.getDaysOverdue(day),
            fraction: penalty.getKeyRateFraction(day).repr,
            moratorium: Penalty.doesMoratoriumActs(day),
            rate: Penalty.getKeyRate(calcDate),
            deferredCoef: penalty.getDeferredCoef(day),
            penalty: penalty.calculate(calcDate, day),
        }

        res.push(value)
    }

    return res
}

function penaltiesToResultTable(
    penalty: Penalty,
    table: PenaltiesTable
): ResultTable {
    function addResultRow(row: PenaltiesTable[number]): ResultRow {
        return {
            ...row,
            dateFrom: row.date,
            dateTo: row.date,
            daysCount: 1,
            fraction: penalty.getKeyRateFraction(row.date).repr,
        }
    }

    function joinResultRow(
        resultRow: ResultRow,
        row: PenaltiesTable[number]
    ): ResultRow {
        return {
            ...resultRow,
            dateTo: row.date,
            daysCount: resultRow.daysCount + 1,
            penalty: resultRow.penalty + row.penalty,
        }
    }

    function resultRowEqual(
        row1: Pick<
            ResultRow,
            "debt" | "rate" | "fraction" | "moratorium" | "deferredCoef"
        >,
        row2: Pick<
            PenaltiesTable[number],
            "debt" | "rate" | "fraction" | "moratorium" | "deferredCoef"
        >
    ) {
        return (
            row1.debt === row2.debt &&
            row1.rate === row2.rate &&
            row1.fraction === row2.fraction &&
            row1.moratorium === row2.moratorium &&
            row1.deferredCoef === row2.deferredCoef
        )
    }

    return table.reduce(
        (acc, row) =>
            acc.length === 0 || !resultRowEqual(acc[acc.length - 1], row)
                ? [...acc, addResultRow(row)]
                : [
                      ...acc.slice(0, -1),
                      joinResultRow(acc[acc.length - 1], row),
                  ],
        [] as ResultTable
    )
}

export function penaltiesFoldedForPeriod(
    calcDate: Dayjs,
    debts: Debt[]
): ResultTable[] {
    return debts.map((debt) => {
        const penalty = new Penalty(debt)
        const penalties = calculatePenalties(calcDate, penalty)
        return penaltiesToResultTable(penalty, penalties)
    })
}
