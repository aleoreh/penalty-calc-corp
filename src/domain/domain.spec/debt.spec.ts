import { it } from "@fast-check/jest"
import { A, D } from "@mobily/ts-belt"
import { Arbitrary, array, date, integer, record } from "fast-check"
import {
    Debt,
    DebtPaymentBody,
    addPayment,
    getDefaultDueDate,
    paymentsAmount,
    paymentsLength,
    removePayment,
    updateDebt,
} from "../debt"

type DebtInit = {
    period: Date
    amount: Kopek
}

const kopekArb = integer() as Arbitrary<Kopek>

const debtArb: Arbitrary<DebtInit> = record({
    period: date(),
    amount: kopekArb,
})

const paymentArb: Arbitrary<DebtPaymentBody> = record({
    date: date(),
    amount: kopekArb,
})

const paymentsArb = array(paymentArb)
const nonEmptyPaymentsArb = array(paymentArb, { minLength: 1 })

const daysToPay = 10

const createDebt = (debtData: DebtInit, payments: DebtPaymentBody[]): Debt => {
    const initialDebt: Debt = {
        ...debtData,
        dueDate: getDefaultDueDate(debtData.period, daysToPay),
        payments: [],
    }
    const debt = payments.reduce((acc, x) => addPayment(x)(acc), initialDebt)
    return debt
}

describe("Долг:", () => {
    it.prop([debtArb, paymentsArb, date(), kopekArb])(
        "при обновлении долга устанавливаются новые значения",
        (debtData, payments, newDueDate, newAmount) => {
            const initDebt = createDebt(debtData, payments)
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

    it.prop([debtArb, paymentsArb])(
        "при добавлении платежей их количество увеличивается ",
        (debtData, payments) => {
            const debt = createDebt(debtData, payments)
            payments.forEach((payment) => {
                expect(
                    paymentsLength(addPayment(payment)(debt))
                ).toBeGreaterThan(paymentsLength(debt))
            })
        }
    )

    it.prop([debtArb, paymentsArb, paymentArb])(
        "новый идентификатор платежа больше максимального на единицу",
        (debtData, payments, newPayment) => {
            const initDebt = createDebt(debtData, payments)
            const initDebtMaxId =
                paymentsLength(initDebt) === 0
                    ? 0
                    : Math.max(...initDebt.payments.map(D.getUnsafe("id")))
            const newDebt = addPayment(newPayment)(initDebt)
            const newDebtMaxId = A.last(newDebt.payments)?.id

            expect(newDebtMaxId).toEqual(initDebtMaxId + 1)
        }
    )

    it.prop([debtArb, nonEmptyPaymentsArb])(
        "при удалении платежа сумма платежей уменьшается на сумму удаленного платежа",
        (debtData, payments) => {
            const debt = createDebt(debtData, payments)
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

