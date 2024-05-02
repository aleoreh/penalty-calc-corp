import { CalculationResult } from "../domain/calculation-result"
import Calculator, { CalculatorContext } from "../domain/calculator"

export type Calculate = (
    context: CalculatorContext
) => Promise<CalculationResult>

export const calculate: Calculate = async (context) => {
    const penalty = Calculator.calculatePenalty(context)
    return Calculator.penaltyToResult(penalty)
}
