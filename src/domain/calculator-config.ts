import { KeyRatePart } from "./keyrate-part"

export type CalculatorConfig = {
    daysToPay: number
    deferredDaysCount: number
    getKeyRate: (date: Date) => number
    getKeyRatePart: (daysOverdue: number) => KeyRatePart
    doesMoratoriumActs: (date: Date) => boolean
}

const setKeyRateGetter = (
    config: CalculatorConfig,
    value: CalculatorConfig["getKeyRate"]
): CalculatorConfig => ({ ...config, getKeyRate: value })

const calculatorConfig = {
    setKeyRateGetter,
}

export default calculatorConfig
