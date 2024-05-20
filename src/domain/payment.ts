export type Payment = {
    date: Date
    amount: Kopek
}

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
