import { dayjs } from "../lib/dayjs"
import { CalculationResult } from "./calculation-result"
import { Debt } from "./debt"
import keyRatePart, { KeyRatePart } from "./key-rate-part"
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

const doesDefermentActs = (context: CalculatorContext, date: Date): boolean =>
    dayjs(date).isBefore(
        dayjs(context.dueDate).add(context.config.deferredDaysCount, "day"),
        "day"
    )

const daysOverdue = (dueDate: Date, date: Date): number =>
    dayjs(date).diff(dueDate, "day")

const calculateDailyAmount = (
    context: CalculatorContext,
    debtAmount: number,
    date: Date
): number => {
    const k = keyRatePart.getNumericValue(
        context.config.getKeyRatePart(daysOverdue(context.dueDate, date))
    )
    const r = context.config.getKeyRate(date)
    const s = debtAmount

    return doesDefermentActs(context, date) ||
        context.config.doesMoratoriumActs(date)
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
        doesDefermentActs: doesDefermentActs(context, date),
        doesMoratiriumActs: context.config.doesMoratoriumActs(date),
        penaltyAmount: calculateDailyAmount(context, debtAmount, date),
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
