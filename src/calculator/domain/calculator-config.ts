import { Moratorium } from "./moratorium"
import { KeyRate } from "./types"

export type CalculatorConfig = {
    daysToPay: number
    deferredDaysCount: number
    moratoriums: Moratorium[]
    keyRate: KeyRate
    fractionChangeDay: number
}

type CalculatorConfigParams = {
    daysToPay: number
    deferredDaysCount: number
    keyRate: number
    fractionChangeDay: number
}

export function createCalculatorConfig({
    daysToPay,
    deferredDaysCount,
    keyRate,
    fractionChangeDay,
}: CalculatorConfigParams): CalculatorConfig {
    return {
        daysToPay,
        deferredDaysCount,
        keyRate,
        fractionChangeDay,
        moratoriums: [],
    }
}

export function calculatorConfigWithMoratoriums(moratoriums: Moratorium[]) {
    return (calculatorConfig: CalculatorConfig): CalculatorConfig => ({
        ...calculatorConfig,
        moratoriums,
    })
}

export const calculatorConfigs = {
    create: createCalculatorConfig,
    withMoratoriums: calculatorConfigWithMoratoriums,
}

export default calculatorConfigs

