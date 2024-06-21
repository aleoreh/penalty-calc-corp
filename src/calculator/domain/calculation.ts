import kopeks, { Kopek2 } from "../../lib/kopek2"
import { BillingPeriod } from "../../lib/period"
import formulas, { Formula } from "./formula"
import keyRateParts, { KeyRatePart } from "./key-rate-part"
import { Penalty, PenaltyItem } from "./penalty"
import { KeyRate } from "./types"

export type Calculation = {
    period: BillingPeriod
    items: CalculationItem[]
}

export type CalculationItem = {
    debtAmount: Kopek2
    dateFrom: Date
    dateTo: Date
    totalDays: number
    ratePart: KeyRatePart
    rate: KeyRate
    doesMoratoriumActs: boolean
    doesDefermentActs: boolean
    formula: Formula
    penaltyAmount: Kopek2
}

export function calculationFromPenalty(penalty: Penalty): Calculation {
    const newCalculationItem = (item: PenaltyItem): CalculationItem => {
        return {
            ...item,
            dateFrom: item.date,
            dateTo: item.date,
            totalDays: 1,
            ratePart: item.ratePart,
            formula: formulas.empty,
        }
    }

    const joinResultRow = (
        calculationItem: CalculationItem,
        row: PenaltyItem
    ): CalculationItem => {
        const res = {
            ...calculationItem,
            dateTo: row.date,
            totalDays: calculationItem.totalDays + 1,
            penaltyAmount: kopeks.add(
                calculationItem.penaltyAmount,
                row.penaltyAmount
            ),
            formula: formulas.empty,
        }
        return { ...res, formula: formulas.createFormula(res) }
    }

    const itemsEqual = (
        resultRow: Pick<
            CalculationItem,
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
        items: penalty.items.reduce(
            (acc, row) =>
                acc.length === 0 || !itemsEqual(acc[acc.length - 1], row)
                    ? [...acc, newCalculationItem(row)]
                    : [
                          ...acc.slice(0, -1),
                          joinResultRow(acc[acc.length - 1], row),
                      ],
            [] as CalculationItem[]
        ),
    }
}

export const calculations = {
    fromPenalty: calculationFromPenalty,
}

export default calculations
