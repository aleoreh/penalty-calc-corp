import { dayjs } from "./dayjs"
import { Payment } from "./payment"

type PaymentId = number

const generatePaymentId = (debt: Debt): PaymentId =>
    debt.payments.length === 0
        ? 1
        : Math.max(...debt.payments.map((x) => x.id)) + 1

export type Debt = {
    period: Date
    amount: Kopek
    dueDate: Date
    payments: (Payment & { id: PaymentId })[]
}

export const createEmptyDebt = (period: Date, daysToPay: number): Debt => ({
    period,
    amount: 0 as Kopek,
    dueDate: getDefaultDueDate(period, daysToPay),
    payments: [],
})

export const updateDebt =
    ({ amount, dueDate }: Pick<Debt, "amount" | "dueDate">) =>
    (debt: Debt): Debt => ({
        ...debt,
        amount,
        dueDate,
    })

export const addPayment =
    (payment: Payment) =>
    (debt: Debt): Debt => ({
        ...debt,
        payments: [
            ...debt.payments,
            { ...payment, id: generatePaymentId(debt) },
        ],
    })

export const removePayment =
    (id: PaymentId) =>
    (debt: Debt): Debt => ({
        ...debt,
        payments: debt.payments.filter((x) => x.id !== id),
    })

export const paymentsLength = (debt: Debt): number => debt.payments.length

export const paymentsAmount = (debt: Debt): Kopek =>
    debt.payments.reduce((acc, x) => acc + x.amount, 0) as Kopek

export const getDefaultDueDate = (debtPeriod: Date, daysToPay: number): Date =>
    dayjs(debtPeriod)
        .endOf("month")
        .add(daysToPay + 1, "day")
        .toDate()

export const getRemainingBalance = (debt: Debt) =>
    debt.amount -
    debt.payments.reduce((acc, payment) => acc + payment.amount, 0)

export const periodKey = (period: Date) => {
    return dayjs(period).format("L")
}

const debts = {
    update: updateDebt,
    addPayment,
    removePayment,
    paymentsLength,
    paymentsAmount,
    getDefaultDueDate,
    createEmptyDebt,
    getRemainingBalance,
}

export default debts

