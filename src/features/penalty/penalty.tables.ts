import { Dayjs } from "dayjs"
import { Penalty } from "./penalty"

export type PenaltiesTable = {
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

export function calculatePenalties(
    penalty: Penalty,
    calcDate: Dayjs
): PenaltiesTable {
    const res: PenaltiesTable = []

    for (let i = 1; i <= calcDate.diff(penalty.dueDate, "day"); i++) {
        const day = penalty.dueDate.add(i, "day")

        const value = {
            id: day.unix(),
            date: day,
            debt: penalty.debtSum,
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

export function penaltiesToResultTable(
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
