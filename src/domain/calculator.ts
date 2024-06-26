import { CalculationResult, CalculationResultItem } from "./calculation-result"
import {
    CalculatorConfig,
    doesMoratoriumActs,
    getKeyRatePart,
} from "./calculator-config"
import { dayjs } from "./dayjs"
import { Debt, getDefaultDueDate } from "./debt"
import formulas from "./formula"
import keyRateParts, { type KeyRatePart } from "./keyrate-part"
import { Penalty, PenaltyItem } from "./penalty"

export type Calculator = {
    config: CalculatorConfig
    calculationDate: Date
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
    debtAmount: Kopek,
    date: Date
): Kopek => {
    const k = keyRateParts.getNumericValue(params.keyRatePart)
    const r = params.keyRate
    const s = debtAmount

    return (
        doesDefermentActs(params.dueDate, params.deferredDaysCount, date) ||
        params.doesMoratoriumActs
            ? 0
            : k * r * s
    ) as Kopek
}

export type CalculatePenalty = (calculator: Calculator, debt: Debt) => Penalty
export const calculatePenalty: CalculatePenalty = (context, debt) => {
    // -------- helpers ------- //

    const makeRow = (debtAmount: Kopek, date: Date): PenaltyItem => ({
        id: date.valueOf(),
        date: date,
        debtAmount: debtAmount,
        doesDefermentActs: doesDefermentActs(
            debt.dueDate,
            context.config.deferredDaysCount,
            date
        ),
        doesMoratoriumActs: doesMoratoriumActs(context.config, date),
        penaltyAmount: calculateDailyAmount(
            {
                deferredDaysCount: context.config.deferredDaysCount,
                doesMoratoriumActs: doesMoratoriumActs(context.config, date),
                dueDate: debt.dueDate,
                keyRate: context.config.keyRate,
                keyRatePart: getKeyRatePart(
                    context.config,
                    daysOverdue(debt.dueDate, date)
                ),
            },
            debtAmount,
            date
        ),
        rate: context.config.keyRate,
        ratePart: getKeyRatePart(
            context.config,
            daysOverdue(debt.dueDate, date)
        ),
    })
    const nextRow = (row: PenaltyItem): PenaltyItem => {
        const dayPayment = debt.payments
            .filter((payment) => dayjs(payment.date).isSame(row.date, "day"))
            .reduce((acc, value) => acc + value.amount, 0) as Kopek

        const newDebtAmount = (row.debtAmount - dayPayment) as Kopek
        const newDay = dayjs(row.date).add(1, "day").toDate()

        return makeRow(newDebtAmount, newDay)
    }

    // --------- main --------- //

    const rows: PenaltyItem[] = []

    let curRow: PenaltyItem = makeRow(debt.amount, debt.dueDate)

    while (dayjs(curRow.date).isBefore(context.calculationDate)) {
        rows.push(curRow)
        curRow = nextRow(curRow)
    }

    return {
        period: debt.period,
        rows,
    }
}

export type PenaltyToResult = (penalty: Penalty) => CalculationResult
export const penaltyToResult: PenaltyToResult = (penalty) => {
    const addResultRow = (row: PenaltyItem): CalculationResultItem => {
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
        resultRow: CalculationResultItem,
        row: PenaltyItem
    ): CalculationResultItem => {
        const res = {
            ...resultRow,
            dateTo: row.date,
            totalDays: resultRow.totalDays + 1,
            penaltyAmount: (resultRow.penaltyAmount +
                row.penaltyAmount) as Kopek,
            formula: "",
        }
        return { ...res, formula: formulas.createFormula(res) }
    }

    const equals = (
        resultRow: Pick<
            CalculationResultItem,
            | "debtAmount"
            | "rate"
            | "ratePart"
            | "doesMoratoriumActs"
            | "doesDefermentActs"
        >,
        penaltyRow: Pick<
            PenaltyItem,
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

const calculators = {
    calculatePenalty,
    penaltyToResult,
    getDefaultDueDate,
}

export default calculators

