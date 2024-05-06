// TODO: переименовать модуль в calculate.port.ts

import { pipe } from "@mobily/ts-belt"
import { CalculationResult } from "../domain/calculation-result"
import {
    Calculator,
    calculatePenalty,
    penaltyToResult,
} from "../domain/calculator"
import { Debt } from "../domain/debt"

export type Calculate = (
    calculator: Calculator,
    debt: Debt
) => Promise<CalculationResult>

export const calculate: Calculate = async (calculator, debt) =>
    pipe(calculatePenalty(calculator, debt), penaltyToResult)
