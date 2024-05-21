/**
 * Идентификатор документа оплаты
 */
export type PaymentId = string & { __brand: PaymentId }

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

/**
 * DEPRECATED!
 */
export const updatePaymentDeprecated =
    ({ date, amount }: Pick<Payment, "date" | "amount">) =>
    (payment: Payment): Payment => ({ ...payment, date, amount })

const payments = {
    update: updatePaymentDeprecated,
}

export default payments
