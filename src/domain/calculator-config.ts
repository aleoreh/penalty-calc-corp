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
    // TODO: изменить имя на keyRateGetter
    value: CalculatorConfig["getKeyRate"]
): CalculatorConfig => ({ ...config, getKeyRate: value })

const calculatorConfigs = {
    setKeyRateGetter,
}

export default calculatorConfigs
