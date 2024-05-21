interface IPaymentModule {
    toPaymentId: (value: string | number) => PaymentId
    create: (paymentId: string | number, date: Date, amount: Kopek) => Payment
    update: (paymentBody: PaymentBody, payment: Payment) => Payment
}

/**
 * Идентификатор документа оплаты
 */
export type PaymentId = (string | number) & { __brand: PaymentId }

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
}

export type Payment = PaymentHead & PaymentBody

export const createPayment: IPaymentModule["create"] = (
    paymentId,
    date,
    amount
) => ({
    id: paymentId as PaymentId,
    date,
    amount,
})

export const updatePayment: IPaymentModule["update"] = (
    paymentBody,
    payment
) => ({
    ...payment,
    ...paymentBody,
})

export const toPaymentId: IPaymentModule["toPaymentId"] = (value) =>
    value as PaymentId

const paymentModule: IPaymentModule = {
    toPaymentId,
    create: createPayment,
    update: updatePayment,
}

export default paymentModule

