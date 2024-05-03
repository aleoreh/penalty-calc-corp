import { it } from "@fast-check/jest"
import { Arbitrary, date, integer, record } from "fast-check"
import { Payment, updatePayment } from "../payment"

const paymentArb: Arbitrary<Payment> = record({
    date: date(),
    amount: integer(),
})

describe("Оплата:", () => {
    it.prop([paymentArb, date(), integer()])(
        "при изменении платежа устанавливаются новые значения",
        (payment, newDate, newAmount) => {
            const newPayment = updatePayment({
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
