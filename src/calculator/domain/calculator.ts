import { pipe } from "@mobily/ts-belt"
import days from "../../lib/days"
import kopeks, { Kopek2 } from "../../lib/kopek2"
import periods, { BillingPeriod } from "../../lib/period"
import { Calculation, calculations } from "./calculation"
import { CalculatorConfig } from "./calculator-config"
import {
    Debt,
    addPayoff,
    createDebt,
    getDebtRemainingBalance,
    updatePayoff,
} from "./debt"
import keyRateParts, { KeyRatePart } from "./key-rate-part"
import { Payment, PaymentBody, PaymentId, createPayment } from "./payment"
import { Penalty, PenaltyItem } from "./penalty"
import { KeyRate } from "./types"
import {
    doesMoratoriumActs,
    getKeyRatePart,
    getPayoffsAmountByDate,
    nextId,
} from "./utils"

export type DistributionMethod = "fifo" | "lastIsFirst"

export type Calculator = {
    calculationDate: Date
    config: CalculatorConfig
    debts: Debt[]
    payments: Payment[]
}

export function createCalculator(
    calculationDate: Date,
    config: CalculatorConfig
): Calculator {
    return {
        calculationDate,
        config,
        debts: [],
        payments: [],
    }
}

export function setKeyRate(
    calculator: Calculator,
    keyRate: KeyRate
): Calculator {
    return {
        ...calculator,
        config: {
            ...calculator.config,
            keyRate,
        },
    }
}

export function setCalculationDate(
    calculator: Calculator,
    date: Date
): Calculator {
    return {
        ...calculator,
        calculationDate: date,
    }
}

export function addDebt(anyDateInPeriod: Date, amount: number) {
    return (calculator: Calculator): Calculator => {
        const newDebt = createDebt(
            anyDateInPeriod,
            amount,
            calculator.config.daysToPay
        )
        return {
            ...calculator,
            debts: [...calculator.debts, newDebt],
        }
    }
}

export function deleteDebt(period: BillingPeriod) {
    return (calculator: Calculator): Calculator => ({
        ...calculator,
        debts: calculator.debts.filter((x) => !days.equals(x.period, period)),
    })
}

export function addPayment(
    paymentBody: PaymentBody,
    distributionMethod: DistributionMethod
) {
    return (calculator: Calculator): Calculator => {
        const payment = createPayment({
            ...paymentBody,
            id: nextId(calculator.payments.map((x) => x.id)),
        })
        const { debts } = distributePayment(
            payment,
            calculator.debts,
            distributionMethod
        )
        return {
            ...calculator,
            payments: [...calculator.payments, payment],
            debts,
        }
    }
}

export function deletePayment(paymentId: PaymentId) {
    return (calculator: Calculator): Calculator => {
        const payments = calculator.payments.filter((x) => x.id !== paymentId)
        const debts = calculator.debts.map((debt) => ({
            ...debt,
            payoffs: debt.payoffs.filter(
                (payoff) => payoff.paymentId !== paymentId
            ),
        }))
        return {
            ...calculator,
            payments,
            debts,
        }
    }
}

export function runCalculator(calculator: Calculator): Calculation[] {
    return calculator.debts.map((debt) => {
        const penalty = calculatePenalty(
            calculator.config,
            calculator.calculationDate,
            debt
        )
        return calculations.fromPenalty(penalty)
    })
}

function doesDefermentActs(dueDate: Date, date: Date): boolean {
    return days.compare(date, dueDate) === "LT"
}

function calculateDailyPenalty(
    params: {
        dueDate: Date
        deferredDaysCount: number
        keyRatePart: KeyRatePart
        keyRate: number
        doesMoratoriumActs: boolean
    },
    debtAmount: Kopek2,
    date: Date
): Kopek2 {
    const k = keyRateParts.value(params.keyRatePart)
    const r = params.keyRate
    const s = debtAmount

    return doesDefermentActs(params.dueDate, date) || params.doesMoratoriumActs
        ? kopeks.asKopek(0)
        : pipe(s, kopeks.multiplyByScalar(k), kopeks.multiplyByScalar(r))
}

function daysOverdue(dueDate: Date, date: Date): number {
    return days.diff(date, dueDate)
}

function calculatePenalty(
    calculatorConfig: CalculatorConfig,
    calculationDate: Date,
    debt: Debt
): Penalty {
    const makeItem = (
        debtAmount: Kopek2,
        date: Date,
        dueDate: Date
    ): PenaltyItem => ({
        date,
        debtAmount,
        doesDefermentActs: doesDefermentActs(dueDate, date),
        doesMoratoriumActs: doesMoratoriumActs(calculatorConfig, date),
        penaltyAmount: calculateDailyPenalty(
            {
                deferredDaysCount: calculatorConfig.deferredDaysCount,
                doesMoratoriumActs: doesMoratoriumActs(calculatorConfig, date),
                dueDate: dueDate,
                keyRate: calculatorConfig.keyRate,
                keyRatePart: getKeyRatePart(
                    calculatorConfig,
                    daysOverdue(dueDate, date)
                ),
            },
            debtAmount,
            date
        ),
        rate: calculatorConfig.keyRate,
        ratePart: getKeyRatePart(calculatorConfig, daysOverdue(dueDate, date)),
    })

    const nextItem = (item: PenaltyItem): PenaltyItem => {
        const dayPayoffs = getPayoffsAmountByDate(debt, item.date)

        const newDebtAmount = kopeks.subtract(item.debtAmount, dayPayoffs)
        const newDay = days.add(item.date, 1)

        return makeItem(newDebtAmount, newDay, debt.dueDate)
    }

    const items: PenaltyItem[] = []

    let curItem = makeItem(debt.amount, debt.dueDate, debt.dueDate)

    while (days.compare(curItem.date, calculationDate) === "LT") {
        items.push(curItem)
        curItem = nextItem(curItem)
    }

    return {
        period: debt.period,
        items,
    }
}

function distributePayment(
    payment: Payment,
    debts: Debt[],
    method: DistributionMethod
): { debts: Debt[]; remainder: Kopek2 } {
    const replaceDebt = (debt: Debt, debts: Debt[]) => {
        return debts.map((x) =>
            periods.equal(x.period, debt.period) ? debt : x
        )
    }

    if (debts.length === 0) return { debts, remainder: payment.amount }

    /**
     * fifo - сортируем по возрастанию периода долга
     * lastIsFirst - сначала целевой период (payment.period), затем - fifo
     */
    const sorter = (d1: Debt, d2: Debt) => {
        // для метода lastIsFirst:
        // payment.period всегда меньше остальных,
        // любой другой всегда больше payment.period
        return method === "fifo" || !payment.period
            ? d1.period.getTime() - d2.period.getTime()
            : periods.equal(d1.period, payment.period)
            ? -1
            : periods.equal(d2.period, payment.period)
            ? 1
            : days.diff(d1.period, d2.period)
    }

    const sortedDebts = [...debts].sort(sorter)

    return sortedDebts.reduce(
        ({ debts, remainder }, debt) => {
            if (remainder === 0) return { debts, remainder }

            const debtRemainingBalance = getDebtRemainingBalance(debt)
            const [repaymentAmount, nextRemainder] =
                remainder < debtRemainingBalance
                    ? [remainder, kopeks.asKopek(0)]
                    : [
                          debtRemainingBalance,
                          kopeks.subtract(remainder, debtRemainingBalance),
                      ]

            const foundPayoff = debt.payoffs.find(
                (x) => x.paymentId === payment.id
            )

            const updatedDebt =
                foundPayoff !== undefined
                    ? updatePayoff(foundPayoff.id, {
                          ...foundPayoff,
                          repaymentAmount,
                      })(debt)
                    : addPayoff({
                          paymentId: payment.id,
                          paymentDate: payment.date,
                          repaymentAmount,
                      })(debt)

            const nextDebts = replaceDebt(updatedDebt, debts)

            return { debts: nextDebts, remainder: nextRemainder }
        },
        {
            debts,
            remainder: payment.amount,
        }
    )
}

export const calculators = {
    create: createCalculator,
    setKeyRate,
    setCalculationDate,
    addDebt,
    deleteDebt,
    run: runCalculator,
}

export default calculators

