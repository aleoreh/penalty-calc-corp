import { dayjs } from "./dayjs"
import { KeyRatePart } from "./keyrate-part"
import { Moratorium } from "./moratorium"

export type CalculatorConfig = {
    daysToPay: number
    deferredDaysCount: number
    moratoriums: Moratorium[]
    getKeyRate: (date: Date) => number
    getKeyRatePart: (daysOverdue: number) => KeyRatePart
    doesMoratoriumActs: (date: Date) => boolean
}

export const setKeyRateGetter = (
    config: CalculatorConfig,
    keyRateGetter: CalculatorConfig["getKeyRate"]
): CalculatorConfig => ({ ...config, getKeyRate: keyRateGetter })

export const generateDoesMoratoriumActsFn =
    (moratoriums: Moratorium[]) => (date: Date) =>
        moratoriums.some(([start, end]) => {
            return dayjs(date).isBetween(start, end, "day", "[]")
        })

const calculatorConfigs = {
    setKeyRateGetter,
    generateDoesMoratoriumActsFn,
}

export default calculatorConfigs

