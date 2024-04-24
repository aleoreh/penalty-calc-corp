import { Formula } from "./formula"
import { KeyRatePart } from "./key-rate-part"

export type CalculationResultRow = {
    debtAmount: number
    dateFrom: Date
    dateTo: Date
    totalDays: number
    ratePart: KeyRatePart
    rate: number
    doesMoratiriumActs: boolean
    doesDefermentActs: boolean
    formula: Formula
    penaltyAmount: number
}

export type CalculationResult = {
    period: Date
    rows: CalculationResultRow[]
}
