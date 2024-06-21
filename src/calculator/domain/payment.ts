import Opaque, { create } from "ts-opaque"
import { Kopek2 } from "../../lib/kopek2"
import { BillingPeriod } from "../../lib/period"

export type PaymentId = Opaque<number, Payment>

export type PaymentBody = {
    date: Date
    amount: Kopek2
    period?: BillingPeriod
}

export type Payment = { id: PaymentId } & PaymentBody

type CreatePaymentParams = {
    id: number
    date: Date
    amount: Kopek2
    period?: BillingPeriod
}

export function createPayment({
    id,
    date,
    amount,
    period,
}: CreatePaymentParams): Payment {
    return {
        id: create(id),
        date,
        amount,
        period,
    }
}

export const payments = {
    create: createPayment,
}

export default payments
