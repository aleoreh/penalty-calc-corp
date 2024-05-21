import { dayjs } from "./dayjs"
import { PaymentId } from "./payment"

type DebtPaymentId = number

/**
 * Заголовочная часть погашения
 */
export type DebtPaymentHead = { id: DebtPaymentId; paymentId: PaymentId }

/**
 * Тело погашения
 */
export type DebtPaymentBody = { date: Date; amount: Kopek }

/**
 * Погашение долга - та часть оплаты,
 * которая зачитывается в погашение этого долга
 */
export type DebtPayment = DebtPaymentHead & DebtPaymentBody

const generatePaymentId = (debt: Debt): DebtPaymentId =>
    debt.payments.length === 0
        ? 1
        : Math.max(...debt.payments.map((x) => x.id)) + 1

export type Debt = {
    period: Date
    amount: Kopek
    dueDate: Date
    payments: DebtPayment[]
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

export const addDebtPayment =
    (paymentId: PaymentId, debtPayment: DebtPaymentBody) =>
    (debt: Debt): Debt => ({
        ...debt,
        payments: [
            ...debt.payments,
            { ...debtPayment, id: generatePaymentId(debt), paymentId },
        ],
    })

export const createDebtPayment = (
    date: Date,
    amount: number
): DebtPaymentBody => ({
    date,
    amount: amount as Kopek,
})

export const updatePayment = (payment: DebtPayment) => (debt: Debt) => ({
    ...debt,
    payments: debt.payments.map((x) => (x.id === payment.id ? payment : x)),
})

export const removePayment =
    (paymentId: PaymentId) =>
    (debt: Debt): Debt => ({
        ...debt,
        payments: debt.payments.filter((x) => x.paymentId !== paymentId),
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
    addDebtPayment,
    updatePayment,
    removePayment,
    paymentsLength,
    paymentsAmount,
    getDefaultDueDate,
    createEmptyDebt,
    getRemainingBalance,
    createDebtPayment,
}

export default debts

