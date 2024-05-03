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

const debts = {
    update: updateDebt,
    addPayment,
    removePayment,
    paymentsLength,
    paymentsAmount,
}

export default debts
