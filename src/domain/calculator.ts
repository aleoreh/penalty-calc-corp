import { dayjs } from "../lib/dayjs"
import { CalculationResult, CalculationResultRow } from "./calculation-result"
import { Debt } from "./debt"
import formulas from "./formula"
import keyRateParts, { type KeyRatePart } from "./keyrate-part"
import { Penalty, PenaltyRow } from "./penalty"

export type CalculatorConfig = {
    daysToPay: number
    deferredDaysCount: number
    getKeyRate: (date: Date) => number
    getKeyRatePart: (daysOverdue: number) => KeyRatePart
    doesMoratoriumActs: (date: Date) => boolean
}

export type CalculatorContext = {
    config: CalculatorConfig
    calculationDate: Date
    dueDate: Date
    debt: Debt
}

const doesDefermentActs = (
    dueDate: Date,
    deferredDaysCount: number,
    date: Date
): boolean =>
    dayjs(date).isBefore(dayjs(dueDate).add(deferredDaysCount, "day"), "day")

const daysOverdue = (dueDate: Date, date: Date): number =>
    dayjs(date).diff(dueDate, "day")

const calculateDailyAmount = (
    params: {
        dueDate: Date
        deferredDaysCount: number
        keyRatePart: KeyRatePart
        keyRate: number
        doesMoratoriumActs: boolean
    },
    debtAmount: number,
    date: Date
): number => {
    const k = keyRateParts.getNumericValue(params.keyRatePart)
    const r = params.keyRate
    const s = debtAmount

    return doesDefermentActs(params.dueDate, params.deferredDaysCount, date) ||
        params.doesMoratoriumActs
        ? 0
        : k * r * s
}

export type CalculatePenalty = (context: CalculatorContext) => Penalty
export const calculatePenalty: CalculatePenalty = (context) => {
    // -------- helpers ------- //

    const makeRow = (debtAmount: number, date: Date): PenaltyRow => ({
        id: date.valueOf(),
        date: date,
        debtAmount: debtAmount,
        doesDefermentActs: doesDefermentActs(
            context.dueDate,
            context.config.deferredDaysCount,
            date
        ),
        doesMoratoriumActs: context.config.doesMoratoriumActs(date),
        penaltyAmount: calculateDailyAmount(
            {
                deferredDaysCount: context.config.deferredDaysCount,
                doesMoratoriumActs: context.config.doesMoratoriumActs(date),
                dueDate: context.dueDate,
                keyRate: context.config.getKeyRate(date),
                keyRatePart: context.config.getKeyRatePart(
                    daysOverdue(context.dueDate, date)
                ),
            },
            debtAmount,
            date
        ),
        rate: context.config.getKeyRate(date),
        ratePart: context.config.getKeyRatePart(
            daysOverdue(context.dueDate, date)
        ),
    })
    const nextRow = (row: PenaltyRow): PenaltyRow => {
        const dayPayment = context.debt.payments
            .filter((payment) => dayjs(payment.date).isSame(row.date, "day"))
            .reduce((acc, value) => acc + value.amount, 0)

        const newDebtAmount = row.debtAmount - dayPayment
        const newDay = dayjs(row.date).add(1, "day").toDate()

        return makeRow(newDebtAmount, newDay)
    }

    // --------- main --------- //

    const rows: PenaltyRow[] = []

    let curRow: PenaltyRow = makeRow(context.debt.amount, context.dueDate)

    while (dayjs(curRow.date).isBefore(context.calculationDate)) {
        rows.push(curRow)
        curRow = nextRow(curRow)
    }

    return {
        period: context.debt.period,
        rows,
    }
}

export type PenaltyToResult = (penalty: Penalty) => CalculationResult
export const penaltyToResult: PenaltyToResult = (penalty) => {
    const addResultRow = (row: PenaltyRow): CalculationResultRow => {
        return {
            ...row,
            dateFrom: row.date,
            dateTo: row.date,
            totalDays: 1,
            ratePart: row.ratePart,
            formula: formulas.empty,
        }
    }

    const joinResultRow = (
        resultRow: CalculationResultRow,
        row: PenaltyRow
    ): CalculationResultRow => {
        return {
            ...resultRow,
            dateTo: row.date,
            totalDays: resultRow.totalDays + 1,
            penaltyAmount: resultRow.penaltyAmount + row.penaltyAmount,
            formula: formulas.from(resultRow),
        }
    }

    const equals = (
        resultRow: Pick<
            CalculationResultRow,
            | "debtAmount"
            | "rate"
            | "ratePart"
            | "doesMoratoriumActs"
            | "doesDefermentActs"
        >,
        penaltyRow: Pick<
            PenaltyRow,
            | "debtAmount"
            | "rate"
            | "ratePart"
            | "doesDefermentActs"
            | "doesMoratoriumActs"
        >
    ) => {
        return (
            resultRow.debtAmount === penaltyRow.debtAmount &&
            resultRow.rate === penaltyRow.rate &&
            keyRateParts.equals(resultRow.ratePart, penaltyRow.ratePart) &&
            resultRow.doesMoratoriumActs === penaltyRow.doesMoratoriumActs &&
            resultRow.doesDefermentActs === penaltyRow.doesDefermentActs
        )
    }

    return {
        period: penalty.period,
        rows: penalty.rows.reduce(
            (acc, row) =>
                acc.length === 0 || !equals(acc[acc.length - 1], row)
                    ? [...acc, addResultRow(row)]
                    : [
                          ...acc.slice(0, -1),
                          joinResultRow(acc[acc.length - 1], row),
                      ],
            [] as CalculationResult["rows"]
        ),
    }
}

export const defaultDueDate = (debtPeriod: Date, daysToPay: number): Date =>
    dayjs(debtPeriod)
        .endOf("month")
        .add(daysToPay + 1, "day")
        .toDate()
