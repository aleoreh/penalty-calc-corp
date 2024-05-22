import Opaque, { BaseType, create, widen } from "ts-opaque"
import { dayjs } from "./dayjs"

interface IPaymentModule {
    toPaymentId: (value: string | number) => PaymentId
    fromPaymentId: (paymentId: PaymentId) => BaseType<PaymentId>
    create: (
        paymentId: string | number,
        date: Date,
        amount: Kopek,
        period?: Date
    ) => Payment
    update: (paymentBody: PaymentBody, payment: Payment) => Payment
    repr: (payment: Payment) => string
}

/**
 * Идентификатор документа оплаты
 */
export type PaymentId = Opaque<string | number, "PaymentId">

/**
 * Заголовочная часть документа оплаты
 */
export type PaymentHead = {
    id: PaymentId
}

/**
 * Содержательная часть документа оплаты
 */
export type PaymentBody = {
    date: Date
    amount: Kopek
    period?: Date
}

export type Payment = PaymentHead & PaymentBody

export const createPayment: IPaymentModule["create"] = (
    paymentId,
    date,
    amount,
    period?
) => ({
    id: paymentId as PaymentId,
    date,
    amount,
    period,
})

export const updatePayment: IPaymentModule["update"] = (
    paymentBody,
    payment
) => ({
    ...payment,
    ...paymentBody,
})

export const toPaymentId: IPaymentModule["toPaymentId"] = (value) =>
    create<PaymentId>(value)

export const fromPaymentId: IPaymentModule["fromPaymentId"] = (paymentId) =>
    widen(paymentId)

export const paymentRepr: IPaymentModule["repr"] = (payment) => {
    const dateRepr = dayjs(payment.date).format("LL")
    const amountRepr = new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
    }).format(payment.amount)
    const periodRepr = payment.period
        ? dayjs(payment.period).format("MMMM\u00A0YYYY")
        : undefined

    const periodText = periodRepr ? ` за ${periodRepr}` : ""

    return `Оплата ${amountRepr} от ${dateRepr}${periodText}`
}

const paymentModule: IPaymentModule = {
    toPaymentId,
    fromPaymentId,
    create: createPayment,
    update: updatePayment,
    repr: paymentRepr,
}

export default paymentModule

