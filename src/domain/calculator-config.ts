import { dayjs } from "./dayjs"
import { KeyRatePart } from "./keyrate-part"
import { Moratorium } from "./moratorium"

export type CalculatorConfig = {
    daysToPay: number
    deferredDaysCount: number
    moratoriums: Moratorium[]
    keyRate: number
    fractionChangeDay: number
}

export const doesMoratoriumActs = (
    config: CalculatorConfig,
    date: Date
): boolean =>
    config.moratoriums.some(([start, end]) => {
        return dayjs(date).isBetween(start, end, "day", "[]")
    })

export const getKeyRatePart = (
    config: CalculatorConfig,
    daysOverdue: number
): KeyRatePart =>
    daysOverdue < config.fractionChangeDay
        ? { numerator: 1, denominator: 300 }
        : { numerator: 1, denominator: 130 }

const calculatorConfigs = {
    doesMoratoriumActs,
    getKeyRatePart,
}

export default calculatorConfigs

