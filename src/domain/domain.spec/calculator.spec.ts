import calculationResults from "../calculation-result"
import { Calculator, calculatePenalty, penaltyToResult } from "../calculator"
import { CalculatorConfig } from "../calculator-config"
import { dayjs } from "../dayjs"
import {
    Debt,
    DebtPaymentBody,
    addDebtPayment,
    getDefaultDueDate,
} from "../debt"
import { Moratorium } from "../moratorium"
import { PaymentId } from "../payment"
import penalties from "../penalty"

const moratoriums = (
    [
        ["2020-04-06", "2021-01-01"],
        ["2022-03-31", "2022-10-01"],
    ] as const
).map(([start, end]) => [new Date(start), new Date(end)] as Moratorium)

function createCalculation() {
    const period = new Date("2019-05-01")
    const startDebtAmount = 100000 as Kopek
    const config: CalculatorConfig = {
        daysToPay: 10,
        deferredDaysCount: 30,
        moratoriums,
        keyRate: 0.095,
        fractionChangeDay: 90,
    }
    const payments: DebtPaymentBody[] = [
        { date: new Date("2020-01-01"), amount: 10000 as Kopek },
    ]
    const calculator: Calculator = {
        calculationDate: new Date("2024-04-19"),
        config,
    }
    const initialDebt: Debt = {
        amount: startDebtAmount,
        payments: [],
        period,
        dueDate: getDefaultDueDate(period, config.daysToPay),
    }
    const debt = payments.reduce(
        (acc, x) => addDebtPayment("1" as PaymentId, x)(acc),
        initialDebt
    )
    const result = calculatePenalty(calculator, debt)

    return {
        calculator,
        debt,
        result,
        startDebtAmount,
    }
}

describe("Калькулятор - расчет ежедневной пени", () => {
    const { calculator, debt, result, startDebtAmount } = createCalculation()

    const expected = {
        length: dayjs(calculator.calculationDate).diff(debt.dueDate, "day") + 1,
        dueDate: new Date("2019-06-11"),
        finalDebtAmount: 90000,
        deferredDaysCount: 30,
        moratoriumDaysCount: 271 + 185,
        one300DaysCount: 90,
        one130DaysCount: 1684,
        startDebtAmountDaysCount: 205,
        startDebtAmountPenalty: 10304,
        finalDebtAmountDaysCount: 156900,
        finalDebtAmountPenalty: 73201,
        lastDate: new Date("2024-04-18"),
        penaltyAmount: 83505,
    }

    it(`Количество дней расчета = ${expected.length}`, () => {
        expect(result.rows.length).toBe(expected.length)
    })

    it(`Дата начала просрочки = ${expected.dueDate}`, () => {
        expect(
            dayjs(result.rows[0].date).startOf("day").toDate()
        ).toStrictEqual(dayjs(expected.dueDate).startOf("day").toDate())
    })

    it(`Конечная сумма долга = ${expected.finalDebtAmount}`, () => {
        expect(result.rows.slice(-1)[0].debtAmount).toBe(
            expected.finalDebtAmount
        )
    })

    it(`Количество дней отсрочки = ${expected.deferredDaysCount}`, () => {
        expect(result.rows.filter((x) => x.doesDefermentActs).length).toBe(
            expected.deferredDaysCount
        )
    })

    it(`Количество дней моратория = ${expected.moratoriumDaysCount}`, () => {
        expect(result.rows.filter((x) => x.doesMoratoriumActs).length).toBe(
            expected.moratoriumDaysCount
        )
    })

    it(`Количество дней расчета по 1/300 = ${expected.one300DaysCount}`, () => {
        expect(
            result.rows.filter((x) => x.ratePart.denominator === 300).length
        ).toBe(expected.one300DaysCount)
    })

    it(`Количество дней расчета по 1/130 = ${expected.one130DaysCount}`, () => {
        expect(
            result.rows.filter((x) => x.ratePart.denominator === 130).length
        ).toBe(expected.one130DaysCount)
    })

    it(`Количество дней с задолженностью ${startDebtAmount} = ${expected.startDebtAmountDaysCount}`, () => {
        expect(
            result.rows.filter((x) => x.debtAmount === startDebtAmount).length
        ).toBe(expected.startDebtAmountDaysCount)
    })

    it(`Сумма пеней по задолженности ${startDebtAmount} = ${expected.startDebtAmountPenalty}`, () => {
        expect(
            penalties.getTotalAmount(
                penalties.filter((x) => x.debtAmount === startDebtAmount)(
                    result
                )
            )
        ).toBeCloseTo(expected.startDebtAmountPenalty, 0)
    })

    it(`Количество дней с задолженностью ${expected.finalDebtAmount} = ${expected.finalDebtAmountDaysCount}`, () => {
        expect(
            result.rows.filter((x) => x.debtAmount === startDebtAmount).length
        ).toBe(expected.startDebtAmountDaysCount)
    })

    it(`Сумма пеней по задолженности ${expected.finalDebtAmount} = ${expected.finalDebtAmountPenalty}`, () => {
        expect(
            penalties.getTotalAmount(
                penalties.filter(
                    (x) => x.debtAmount === expected.finalDebtAmount
                )(result)
            )
        ).toBeCloseTo(expected.finalDebtAmountPenalty, 0)
    })

    it(`Последняя дата расчета = ${expected.lastDate}`, () => {
        expect(
            dayjs(result.rows.slice(-1)[0].date).startOf("day").toDate()
        ).toStrictEqual(dayjs(expected.lastDate).startOf("day").toDate())
    })

    it(`Сумма пеней = ${expected.penaltyAmount}`, () => {
        expect(penalties.getTotalAmount(result)).toBeCloseTo(
            expected.penaltyAmount,
            0
        )
    })
})

describe("Калькулятор - расчет результата", () => {
    const { result: penalty, startDebtAmount } = createCalculation()

    const result = penaltyToResult(penalty)

    const expected = {
        resultLength: 8,
        penaltyAmount: penalties.getTotalAmount(penalty),
        penaltyAmountOfStartDebt: penalties.getTotalAmount(
            penalties.filter((x) => x.debtAmount === startDebtAmount)(penalty)
        ),
        penaltyAmountOfOne130: penalties.getTotalAmount(
            penalties.filter((x) => x.ratePart.denominator === 130)(penalty)
        ),
    }

    it(`Количество строк расчета = ${expected.resultLength}`, () => {
        expect(result.rows.length).toEqual(expected.resultLength)
    })

    it(`Сумма пеней = ${expected.penaltyAmount}`, () => {
        expect(calculationResults.getTotalAmount(result)).toBeCloseTo(
            expected.penaltyAmount,
            0
        )
    })

    it(`Сумма пеней по долгу ${startDebtAmount} = ${expected.penaltyAmountOfStartDebt}`, () => {
        expect(
            calculationResults.getTotalAmount(
                calculationResults.filter(
                    (x) => x.debtAmount === startDebtAmount
                )(result)
            )
        ).toBeCloseTo(expected.penaltyAmountOfStartDebt, 0)
    })

    it(`Сумма пеней по доле 1/130 = ${expected.penaltyAmountOfOne130}`, () => {
        expect(
            calculationResults.getTotalAmount(
                calculationResults.filter(
                    (x) => x.ratePart.denominator === 130
                )(result)
            )
        ).toBeCloseTo(expected.penaltyAmountOfOne130, 0)
    })
})

