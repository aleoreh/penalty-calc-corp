import { dayjs } from "./dayjs"
import { KeyRatePart } from "./keyrate-part"
import { Moratorium } from "./moratorium"

export type CalculatorConfig = {
    daysToPay: number
    deferredDaysCount: number
    moratoriums: Moratorium[]
    getKeyRate: (date: Date) => number
    getKeyRatePart: (daysOverdue: number) => KeyRatePart
}

export const doesMoratoriumActs = (
    config: CalculatorConfig,
    date: Date
): boolean =>
    config.moratoriums.some(([start, end]) => {
        return dayjs(date).isBetween(start, end, "day", "[]")
    })

export const setKeyRateGetter = (
    config: CalculatorConfig,
    keyRateGetter: CalculatorConfig["getKeyRate"]
): CalculatorConfig => ({ ...config, getKeyRate: keyRateGetter })

const calculatorConfigs = {
    doesMoratoriumActs,
    setKeyRateGetter,
}

export default calculatorConfigs

