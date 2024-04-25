import { Formula } from "./formula"
import { KeyRatePart } from "./keyrate-part"

export type CalculationResultRow = {
    debtAmount: number
    dateFrom: Date
    dateTo: Date
    totalDays: number
    ratePart: KeyRatePart
    rate: number
    doesMoratoriumActs: boolean
    doesDefermentActs: boolean
    formula: Formula
    penaltyAmount: number
}

export type CalculationResult = {
    period: Date
    rows: CalculationResultRow[]
}

const getTotalPenaltyAmount = (value: CalculationResult): number =>
    value.rows.reduce((acc, x) => acc + x.penaltyAmount, 0)

const filter =
    (predicate: (value: CalculationResultRow, index: number) => boolean) =>
    (value: CalculationResult): CalculationResult => ({
        ...value,
        rows: value.rows.filter(predicate),
    })

const calculationResults = {
    filter,
    getTotalPenaltyAmount,
}

export default calculationResults
