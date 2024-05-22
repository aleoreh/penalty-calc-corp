import Opaque, { BaseType, create, widen } from "ts-opaque"

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

const paymentModule: IPaymentModule = {
    toPaymentId,
    fromPaymentId,
    create: createPayment,
    update: updatePayment,
}

export default paymentModule

