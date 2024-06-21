import days, { addDay, compareDays, endOfPeriod } from "../../lib/days"
import kopeks, { Kopek2 } from "../../lib/kopek2"
import { CalculatorConfig } from "./calculator-config"
import { Debt } from "./debt"
import { KeyRatePart, createKeyRatePart } from "./key-rate-part"

export function doesMoratoriumActs(
    config: CalculatorConfig,
    date: Date
): boolean {
    return config.moratoriums.some(
        ([start, end]) =>
            (compareDays(start, date) === "LT" ||
                compareDays(start, date) === "EQ") &&
            (compareDays(date, end) === "EQ" || compareDays(date, end) === "LT")
    )
}

export function getKeyRatePart(
    config: CalculatorConfig,
    daysOverdue: number
): KeyRatePart {
    return daysOverdue < config.fractionChangeDay
        ? createKeyRatePart(1, 300)
        : createKeyRatePart(1, 130)
}

export function compareDebtsPeriod(debt1: Debt, debt2: Debt): Ordering {
    return compareDays(debt1.period, debt2.period)
}

export function getDefaultDueDate(debtPeriod: Date, daysToPay: number): Date {
    return addDay(endOfPeriod(debtPeriod, "month"), daysToPay + 1)
}

export function getPayoffsAmountByDate(debt: Debt, date: Date): Kopek2 {
    return debt.payoffs
        .filter((payoff) => days.equals(payoff.paymentDate, date))
        .reduce(
            (acc, value) => kopeks.add(acc, value.repaymentAmount),
            kopeks.asKopek(0)
        )
}

export function nextId(ids: number[]): number {
    return Math.max(...ids) + 1
}
