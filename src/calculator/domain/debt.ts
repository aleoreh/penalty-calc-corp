import Opaque, { create } from "ts-opaque"
import kopeks, { Kopek2, kopekFromRuble } from "../../lib/kopek2"
import { BillingPeriod, billingPeriodFromDate } from "../../lib/period"
import { PaymentId } from "./payment"
import { getDefaultDueDate } from "./utils"

export type PayoffId = Opaque<number, Payoff>

export type Debt = {
    period: BillingPeriod
    amount: Kopek2
    dueDate: Date
    payoffs: Payoff[]
}

export type PayoffBody = {
    paymentId: PaymentId
    paymentDate: Date
    repaymentAmount: Kopek2
}

export type Payoff = {
    id: PayoffId
} & PayoffBody

export function createDebt(
    anyDateInPeriod: Date,
    amount: number,
    daysToPay: number
): Debt {
    return {
        period: billingPeriodFromDate(anyDateInPeriod),
        amount: kopekFromRuble(amount),
        dueDate: getDefaultDueDate(anyDateInPeriod, daysToPay),
        payoffs: [],
    }
}

export function addPayoff({
    paymentId,
    paymentDate,
    repaymentAmount,
}: PayoffBody) {
    return (debt: Debt): Debt => ({
        ...debt,
        payoffs: [
            ...debt.payoffs,
            {
                id: generatePayoffId(debt),
                paymentId,
                paymentDate,
                repaymentAmount,
            },
        ],
    })
}

export function updatePayoff(payoffId: PayoffId, payoffBody: PayoffBody) {
    return (debt: Debt): Debt => ({
        ...debt,
        payoffs: debt.payoffs.map((x) =>
            x.id === payoffId ? { ...x, ...payoffBody } : x
        ),
    })
}

export function getDebtPeriod(debt: Debt): BillingPeriod {
    return debt.period
}

export function getDebtRemainingBalance(debt: Debt): Kopek2 {
    return kopeks.subtract(
        debt.amount,
        debt.payoffs.reduce(
            (acc, payoff) => kopeks.add(acc, payoff.repaymentAmount),
            kopeks.asKopek(0)
        )
    )
}

function generatePayoffId(debt: Debt): PayoffId {
    return create(
        debt.payoffs.length === 0
            ? 1
            : Math.max(...debt.payoffs.map((x) => x.id)) + 1
    )
}

export const debts = {
    create: createDebt,
    addPayoff,
    updatePayoff,
    getPeriod: getDebtPeriod,
    getRemainingBalance: getDebtRemainingBalance,
}

export default debts

