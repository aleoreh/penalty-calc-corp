import { Formula } from "./formula"
import { KeyRatePart } from "./keyrate-part"

export type CalculationResultItem = {
    debtAmount: Kopek
    dateFrom: Date
    dateTo: Date
    totalDays: number
    ratePart: KeyRatePart
    rate: number
    doesMoratoriumActs: boolean
    doesDefermentActs: boolean
    formula: Formula
    penaltyAmount: Kopek
}

export type CalculationResult = {
    period: Date
    rows: CalculationResultItem[]
}

export const getTotalAmount = (value: CalculationResult): Kopek =>
    value.rows.reduce((acc, x) => acc + x.penaltyAmount, 0) as Kopek

export const filterCalculationResult =
    (predicate: (value: CalculationResultItem, index: number) => boolean) =>
    (value: CalculationResult): CalculationResult => ({
        ...value,
        rows: value.rows.filter(predicate),
    })

const calculationResults = {
    filter: filterCalculationResult,
    getTotalAmount,
}

export default calculationResults
