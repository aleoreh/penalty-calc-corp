import { CalculationResult } from "./calculation-result"
import { Debt } from "./debt"
import { Penalty } from "./penalty"
import { KeyRatePart } from "./key-rate-part"

export type CalculatorConfig = {
    daysToPay: number
    deferredDaysCount: number
    getKeyRate: (date: Date) => number
    getKeyRatePart: (daysOverdue: number) => KeyRatePart
    doesMoratoriumActs: (date: Date) => boolean
}

export type CalculatorContext = {
    calculationDate: Date
}

export type CalculatePenalty = (
    config: CalculatorConfig,
    context: CalculatorContext,
    debt: Debt
) => Penalty
export type PenaltyToResult = (penalty: Penalty) => CalculationResult
