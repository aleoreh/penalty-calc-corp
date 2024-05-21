import { it } from "@fast-check/jest"
import { A, D } from "@mobily/ts-belt"
import { Arbitrary, array, date, integer, record, string } from "fast-check"
import {
    Debt,
    DebtPaymentBody,
    addDebtPayment,
    getDefaultDueDate,
    paymentsAmount,
    paymentsLength,
    removePayment,
    updateDebt,
} from "../debt"
import { PaymentId } from "../payment"

type DebtInit = {
    period: Date
    amount: Kopek
}

const kopekArb = integer() as Arbitrary<Kopek>

const debtArb: Arbitrary<DebtInit> = record({
    period: date(),
    amount: kopekArb,
})

const debtPaymentArb: Arbitrary<DebtPaymentBody> = record({
    date: date(),
    amount: kopekArb,
})

const paymentIdArb: Arbitrary<string> = string()

const debtPaymentsArb = array(debtPaymentArb)
const nonEmptyPaymentsArb = array(debtPaymentArb, { minLength: 1 })

const daysToPay = 10

const createDebt = (
    paymentId: PaymentId,
    debtData: DebtInit,
    payments: DebtPaymentBody[]
): Debt => {
    const initialDebt: Debt = {
        ...debtData,
        dueDate: getDefaultDueDate(debtData.period, daysToPay),
        payments: [],
    }
    const debt = payments.reduce(
        (acc, x) => addDebtPayment(paymentId, x)(acc),
        initialDebt
    )
    return debt
}

describe("Долг:", () => {
    it.prop([paymentIdArb, debtArb, debtPaymentsArb, date(), kopekArb])(
        "при обновлении долга устанавливаются новые значения",
        (paymentId, debtData, payments, newDueDate, newAmount) => {
            const initDebt = createDebt(
                paymentId as PaymentId,
                debtData,
                payments
            )
            const newDebt = updateDebt({
                amount: newAmount,
                dueDate: newDueDate,
            })(initDebt)

            expect({ amount: newDebt.amount, dueDate: newDueDate }).toEqual({
                amount: newAmount,
                dueDate: newDueDate,
            })
        }
    )

    it.prop([paymentIdArb, debtArb, debtPaymentsArb])(
        "при добавлении платежей их количество увеличивается ",
        (paymentId, debtData, payments) => {
            const debt = createDebt(paymentId as PaymentId, debtData, payments)
            payments.forEach((payment) => {
                expect(
                    paymentsLength(
                        addDebtPayment(paymentId as PaymentId, payment)(debt)
                    )
                ).toBeGreaterThan(paymentsLength(debt))
            })
        }
    )

    it.prop([paymentIdArb, debtArb, debtPaymentsArb, debtPaymentArb])(
        "новый идентификатор платежа больше максимального на единицу",
        (paymentId, debtData, payments, newPayment) => {
            const initDebt = createDebt(
                paymentId as PaymentId,
                debtData,
                payments
            )
            const initDebtMaxId =
                paymentsLength(initDebt) === 0
                    ? 0
                    : Math.max(...initDebt.payments.map(D.getUnsafe("id")))
            const newDebt = addDebtPayment(
                paymentId as PaymentId,
                newPayment
            )(initDebt)
            const newDebtMaxId = A.last(newDebt.payments)?.id

            expect(newDebtMaxId).toEqual(initDebtMaxId + 1)
        }
    )

    it.prop([paymentIdArb, debtArb, nonEmptyPaymentsArb])(
        "при удалении платежа сумма платежей уменьшается на сумму удаленного платежа",
        (paymentId, debtData, payments) => {
            const debt = createDebt(paymentId as PaymentId, debtData, payments)
            const randomIndex = Math.floor(Math.random() * paymentsLength(debt))
            const removedAmount = debt.payments[randomIndex].amount
            const randomIndexId = debt.payments[randomIndex].id
            const newDebt = removePayment(randomIndexId)(debt)

            expect(paymentsAmount(newDebt)).toEqual(
                paymentsAmount(debt) - removedAmount
            )
        }
    )
})

