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

export type LegalPersonType = "juridical" | "natural"

export const isLegalPersonType = (value: string): value is LegalPersonType => {
    return value === "juridical" || value === "natural"
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

export const withLegalPersonType = (
    legalPersonType: LegalPersonType,
    calculatorConfig: CalculatorConfig,
    defaultConfig: CalculatorConfig
): CalculatorConfig => {
    switch (legalPersonType) {
        case "natural":
            return defaultConfig
        case "juridical":
            return {
                ...calculatorConfig,
                deferredDaysCount: 0,
                fractionChangeDay: -Infinity,
            }
    }
}

const calculatorConfigs = {
    doesMoratoriumActs,
    getKeyRatePart,
    withLegalPersonType,
    isLegalPersonType,
}

export default calculatorConfigs

