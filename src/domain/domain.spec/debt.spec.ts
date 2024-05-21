import { it } from "@fast-check/jest"
import { A, D } from "@mobily/ts-belt"
import { Arbitrary, array, date, integer, record, uuid } from "fast-check"
import {
    Debt,
    DebtPayment,
    addDebtPayment,
    getDefaultDueDate,
    paymentsAmount,
    paymentsLength,
    removePayment,
    updateDebt,
} from "../debt"
import { PaymentId, toPaymentId } from "../payment"

type DebtInit = {
    period: Date
    amount: Kopek
}

const kopekArb = integer() as Arbitrary<Kopek>

const debtArb: Arbitrary<DebtInit> = record({
    period: date(),
    amount: kopekArb,
})

const idArb: Arbitrary<number> = integer()
const paymentIdArb: Arbitrary<PaymentId> = uuid().map(toPaymentId)

const debtPaymentArb: Arbitrary<DebtPayment> = record({
    paymentId: paymentIdArb,
    id: idArb,
    date: date(),
    amount: kopekArb,
})

const debtPaymentsArb = array(debtPaymentArb)
const nonEmptyPaymentsArb = array(debtPaymentArb, { minLength: 1 })

const daysToPay = 10

const createDebt = (debtData: DebtInit, payments: DebtPayment[]): Debt => {
    const initialDebt: Debt = {
        ...debtData,
        dueDate: getDefaultDueDate(debtData.period, daysToPay),
        payments: [],
    }
    const debt = payments.reduce(
        (acc, x) => addDebtPayment(x.paymentId, x)(acc),
        initialDebt
    )
    return debt
}

describe("Долг:", () => {
    it.prop([debtArb, debtPaymentsArb, date(), kopekArb])(
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

    it.prop([paymentIdArb, debtArb, debtPaymentsArb])(
        "при добавлении платежей их количество увеличивается ",
        (paymentId, debtData, payments) => {
            const debt = createDebt(debtData, payments)
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
            const initDebt = createDebt(debtData, payments)
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

    it.prop([debtArb, nonEmptyPaymentsArb])(
        "при удалении платежа сумма платежей уменьшается на сумму удаленного платежа",
        (debtData, payments) => {
            const debt = createDebt(debtData, payments)
            const randomIndex = Math.floor(Math.random() * paymentsLength(debt))
            const removedAmount = debt.payments[randomIndex].amount
            const randomIndexId = debt.payments[randomIndex].paymentId
            const newDebt = removePayment(randomIndexId)(debt)

            expect(paymentsAmount(newDebt)).toEqual(
                paymentsAmount(debt) - removedAmount
            )
        }
    )
})

