import dayjs, { Dayjs } from "dayjs"
import isBetween from "dayjs/plugin/isBetween"

import { keyRates, moratoriums } from "../data"
import { Debt, Payment } from "./types"

dayjs.extend(isBetween)

// количество дней, отведенное на оплату
const daysToPay = 10

type PenaltyRow = {
    id: number
    period: Dayjs
    date: Dayjs
    debtAmount: number
    keyRateFraction: { value: number; repr: string }
    moratorium: boolean
    keyRate: number
    penaltyAmount: number
    deferredCoef: number
}

type PenaltiesTable = PenaltyRow[]

type ResultRow = {
    id: number
    period: Dayjs
    debtAmount: number
    dateFrom: Dayjs
    dateTo: Dayjs
    daysCount: number
    keyRateFraction: { value: number; repr: string }
    moratorium: boolean
    keyRate: number
    penaltyAmount: number
    deferredCoef: number
}

export type ResultTable = ResultRow[]

/**
 * Дата начала просрочки
 */
export function defaultDueDate(debtPeriod: Dayjs): Dayjs {
    return debtPeriod.endOf("month").add(daysToPay + 1, "day")
}

/**
 * Коэффициент для применения до и после начала просрочки (0, 1)
 *
 */
function deferredCoef(
    deferredDaysCount: number,
    dueDate: Dayjs,
    date: Dayjs
): number {
    return date.isBefore(dueDate.add(deferredDaysCount, "day"), "day") ? 0 : 1
}

/**
 * Количество дней просрочки
 *
 */
function daysOverdue(dueDate: Dayjs, date: Dayjs): number {
    return date.diff(dueDate, "day")
}

/**
 * Доля ключевой ставки, зависящая от количества дней просрочки
 *
 */
function keyRateFraction(
    fractionChangeDay: number,
    daysOverdue: number
): { value: number; repr: string } {
    return daysOverdue < fractionChangeDay
        ? { value: 1 / 300, repr: "1/300" }
        : { value: 1 / 130, repr: "1/130" }
}

/**
 * Ключевая ставка на дату
 *
 */
function keyRate(date: Dayjs): number {
    return keyRates.filter(([startDate, _]) => {
        return date.isAfter(startDate)
    })[keyRates.length - 1][1]
}

/**
 * Показывает, действует ли на данную дату мораторий на начисление пени
 *
 */
function doesMoratoriumActs(date: Dayjs): boolean {
    return moratoriums.some(([start, end]) => {
        return date.isBetween(start, end, "day", "[]")
    })
}

function calculatePenalties(init: {
    debt: Debt
    calcDate: Dayjs
    paymentsPerPeriod: Payment[]
}) {
    // отсрочка платежа по пене
    const deferredDaysCount = 30

    // день, после которого наступает изменение доли ставки расчета пени
    const fractionChangeDay = 90

    // ключевая ставка ЦБ
    const _keyRate = keyRate(init.calcDate)

    const calcPenalty = (
        debtPeriod: Dayjs,
        debtAmount: number,
        date: Dayjs
    ) => {
        const b = deferredCoef(deferredDaysCount, init.debt.dueDate, date)
        const k = keyRateFraction(
            fractionChangeDay,
            daysOverdue(defaultDueDate(debtPeriod), date)
        ).value
        const r = _keyRate
        const m = doesMoratoriumActs(date) ? 0 : 1
        const s = debtAmount

        return b * k * r * s * m
    }

    const makeDayRow = (debtAmount: number, date: Dayjs): PenaltyRow => {
        return {
            id: date.unix(),
            period: init.debt.period,
            date,
            debtAmount,
            keyRateFraction: keyRateFraction(
                fractionChangeDay,
                daysOverdue(init.debt.dueDate, date)
            ),
            moratorium: doesMoratoriumActs(date),
            keyRate: _keyRate,
            deferredCoef: deferredCoef(
                deferredDaysCount,
                init.debt.dueDate,
                date
            ),
            penaltyAmount: calcPenalty(init.debt.period, debtAmount, date),
        }
    }

    const nextDayRow = (row: PenaltyRow): PenaltyRow => {
        const day = row.date
        const dayPayment = init.paymentsPerPeriod
            .filter((payment) => payment.date.isSame(day, "day"))
            .reduce((acc, value) => acc + value.sum, 0)

        const newDebtAmount = row.debtAmount - dayPayment
        const newDay = day.add(1, "day")

        return makeDayRow(newDebtAmount, newDay)
    }

    let acc: PenaltiesTable = []
    let dayRow = makeDayRow(init.debt.sum, init.debt.dueDate)

    while (dayRow.date.isBefore(init.calcDate)) {
        acc.push(dayRow)
        dayRow = nextDayRow(dayRow)
    }

    return acc
}

function foldPenalties(table: PenaltiesTable): ResultTable {
    function addResultRow(row: PenaltyRow): ResultRow {
        return {
            ...row,
            dateFrom: row.date,
            dateTo: row.date,
            daysCount: 1,
            keyRateFraction: row.keyRateFraction,
        }
    }

    function joinResultRow(resultRow: ResultRow, row: PenaltyRow): ResultRow {
        return {
            ...resultRow,
            dateTo: row.date,
            daysCount: resultRow.daysCount + 1,
            penaltyAmount: resultRow.penaltyAmount + row.penaltyAmount,
        }
    }

    function resultRowEqual(
        resultRow: Pick<
            ResultRow,
            | "debtAmount"
            | "keyRate"
            | "keyRateFraction"
            | "moratorium"
            | "deferredCoef"
        >,
        penaltyRow: Pick<
            PenaltyRow,
            | "debtAmount"
            | "keyRate"
            | "keyRateFraction"
            | "moratorium"
            | "deferredCoef"
        >
    ) {
        return (
            resultRow.debtAmount === penaltyRow.debtAmount &&
            resultRow.keyRate === penaltyRow.keyRate &&
            resultRow.keyRateFraction.value ===
                penaltyRow.keyRateFraction.value &&
            resultRow.moratorium === penaltyRow.moratorium &&
            resultRow.deferredCoef === penaltyRow.deferredCoef
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
    debts: Debt[],
    payments: Payment[]
): ResultTable[] {
    return debts.map((debt) => {
        const penalties = calculatePenalties({
            debt,
            calcDate,
            paymentsPerPeriod: payments.filter((payment) =>
                payment.period.isSame(debt.period, "month")
            ),
        })
        return foldPenalties(penalties)
    })
}
