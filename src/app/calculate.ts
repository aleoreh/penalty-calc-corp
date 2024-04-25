import { CalculationResult } from "../domain/calculation-result"
import calculator, { CalculatorContext } from "../domain/calculator"

export type Calculate = (
    context: CalculatorContext
) => Promise<CalculationResult>

export const calculate: Calculate = async (context) => {
    const penalty = calculator.calculatePenalty(context)
    return calculator.penaltyToResult(penalty)
}
