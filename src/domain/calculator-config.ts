import { dayjs } from "./dayjs"
import { KeyRatePart } from "./keyrate-part"
import { Moratorium } from "./moratorium"

export type CalculatorConfig = {
    daysToPay: number
    deferredDaysCount: number
    moratoriums: Moratorium[]
    keyRate: number
    getKeyRatePart: (daysOverdue: number) => KeyRatePart
}

export const doesMoratoriumActs = (
    config: CalculatorConfig,
    date: Date
): boolean =>
    config.moratoriums.some(([start, end]) => {
        return dayjs(date).isBetween(start, end, "day", "[]")
    })

const calculatorConfigs = {
    doesMoratoriumActs,
}

export default calculatorConfigs

