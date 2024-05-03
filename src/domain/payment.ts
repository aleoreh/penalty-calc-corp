export type Payment = {
    date: Date
    amount: Kopek
}

export const updatePayment =
    ({ date, amount }: Pick<Payment, "date" | "amount">) =>
    (payment: Payment): Payment => ({ ...payment, date, amount })

const payments = {
    update: updatePayment,
}

export default payments
