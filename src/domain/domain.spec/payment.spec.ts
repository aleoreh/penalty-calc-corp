import { it } from "@fast-check/jest"
import { Arbitrary, date, integer, record } from "fast-check"
import { Payment, updatePaymentDeprecated } from "../payment"

const kopekArb = integer() as Arbitrary<Kopek>

const paymentArb: Arbitrary<Payment> = record({
    date: date(),
    amount: kopekArb,
})

describe("Оплата:", () => {
    it.prop([paymentArb, date(), kopekArb])(
        "при изменении платежа устанавливаются новые значения",
        (payment, newDate, newAmount) => {
            const newPayment = updatePaymentDeprecated({
                date: newDate,
                amount: newAmount,
            })(payment)

            expect({
                date: newPayment.date,
                amount: newPayment.amount,
            }).toEqual({
                date: newDate,
                amount: newAmount,
            })
        }
    )
})
