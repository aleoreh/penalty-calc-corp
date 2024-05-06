import { KeyRatePart } from "./keyrate-part"

export type CalculatorConfig = {
    daysToPay: number
    deferredDaysCount: number
    getKeyRate: (date: Date) => number
    getKeyRatePart: (daysOverdue: number) => KeyRatePart
    doesMoratoriumActs: (date: Date) => boolean
}

export const setKeyRateGetter = (
    config: CalculatorConfig,
    keyRateGetter: CalculatorConfig["getKeyRate"]
): CalculatorConfig => ({ ...config, getKeyRate: keyRateGetter })

const calculatorConfigs = {
    setKeyRateGetter,
}

export default calculatorConfigs

