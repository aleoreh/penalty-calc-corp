import { it } from "@fast-check/jest"
import { A, D } from "@mobily/ts-belt"
import { Arbitrary, array, date, integer, record } from "fast-check"

import { getDefaultDueDate } from "../calculator"
import { CalculatorConfig } from "../calculator-config"
import { dayjs } from "../dayjs"
import {
    Debt,
    addPayment,
    paymentsAmount,
    paymentsLength,
    removePayment,
    updateDebt,
} from "../debt"
import { Payment } from "../payment"

type DebtInit = {
    period: Date
    amount: number
}

const debtArb: Arbitrary<DebtInit> = record({
    period: date(),
    amount: integer(),
})

const paymentArb: Arbitrary<Payment> = record({
    date: date(),
    amount: integer(),
})

const paymentsArb = array(paymentArb)
const nonEmptyPaymentsArb = array(paymentArb, { minLength: 1 })

const config: CalculatorConfig = {
    daysToPay: 10,
    deferredDaysCount: 30,
    doesMoratoriumActs: (date) =>
        dayjs(date).isBetween("2020-04-06", "2021-01-01", "day", "[]") ||
        dayjs(date).isBetween("2022-03-31", "2022-10-01", "day", "[]"),
    getKeyRate: () => 0.095,
    getKeyRatePart: (daysOverdue) =>
        daysOverdue < 90
            ? { numerator: 1, denominator: 300 }
            : { numerator: 1, denominator: 130 },
}

const createDebt = (debtData: DebtInit, payments: Payment[]): Debt => {
    const initialDebt: Debt = {
        ...debtData,
        dueDate: getDefaultDueDate(debtData.period, config.daysToPay),
        payments: [],
    }
    const debt = payments.reduce((acc, x) => addPayment(x)(acc), initialDebt)
    return debt
}

describe("Долг:", () => {
    it.prop([debtArb, paymentsArb, date(), integer()])(
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
