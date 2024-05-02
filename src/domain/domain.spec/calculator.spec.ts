import { dayjs } from "../dayjs"
import calculationResults from "../calculation-result"
import calculator, { CalculatorContext } from "../calculator"
import { CalculatorConfig } from "../calculator-config"
import { Payment } from "../payment"
import penalties from "../penalty"

function createCalculation() {
    const period = new Date("2019-05-01")
    const startDebtAmount = 1000
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
    const payments: Payment[] = [{ date: new Date("2020-01-01"), amount: 100 }]
    const context: CalculatorContext = {
        config,
        calculationDate: new Date("2024-04-19"),
        debt: {
            amount: startDebtAmount,
            payments,
            period,
            dueDate: calculator.getDefaultDueDate(period, config.daysToPay),
        },
    }
    const result = calculator.calculatePenalty(context)

    return {
        context,
        result,
        startDebtAmount,
    }
}

describe("Калькулятор - расчет ежедневной пени", () => {
    const { context, result, startDebtAmount } = createCalculation()

    const expected = {
        length: dayjs(context.calculationDate).diff(context.debt.dueDate, "day") + 1,
        dueDate: new Date("2019-06-11"),
        finalDebtAmount: 900,
        deferredDaysCount: 30,
        moratoriumDaysCount: 271 + 185,
        one300DaysCount: 90,
        one130DaysCount: 1684,
        startDebtAmountDaysCount: 205,
        startDebtAmountPenalty: 103.04,
        finalDebtAmountDaysCount: 1569,
        finalDebtAmountPenalty: 732.01,
        lastDate: new Date("2024-04-18"),
        penaltyAmount: 835.05,
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
            penalties.getTotalPenaltyAmount(
                penalties.filter((x) => x.debtAmount === startDebtAmount)(
                    result
                )
            )
        ).toBeCloseTo(expected.startDebtAmountPenalty, 2)
    })

    it(`Количество дней с задолженностью ${expected.finalDebtAmount} = ${expected.finalDebtAmountDaysCount}`, () => {
        expect(
            result.rows.filter((x) => x.debtAmount === startDebtAmount).length
        ).toBe(expected.startDebtAmountDaysCount)
    })

    it(`Сумма пеней по задолженности ${expected.finalDebtAmount} = ${expected.finalDebtAmountPenalty}`, () => {
        expect(
            penalties.getTotalPenaltyAmount(
                penalties.filter(
                    (x) => x.debtAmount === expected.finalDebtAmount
                )(result)
            )
        ).toBeCloseTo(expected.finalDebtAmountPenalty, 2)
    })

    it(`Последняя дата расчета = ${expected.lastDate}`, () => {
        expect(
            dayjs(result.rows.slice(-1)[0].date).startOf("day").toDate()
        ).toStrictEqual(dayjs(expected.lastDate).startOf("day").toDate())
    })

    it(`Сумма пеней = ${expected.penaltyAmount}`, () => {
        expect(penalties.getTotalPenaltyAmount(result)).toBeCloseTo(
            expected.penaltyAmount,
            2
        )
    })
})

describe("Калькулятор - расчет результата", () => {
    const { context, result: penalty, startDebtAmount } = createCalculation()

    const result = calculator.penaltyToResult(penalty)

    const expected = {
        resultLength: 8,
        penaltyAmount: penalties.getTotalPenaltyAmount(penalty),
        penaltyAmountOfStartDebt: penalties.getTotalPenaltyAmount(
            penalties.filter((x) => x.debtAmount === startDebtAmount)(penalty)
        ),
        penaltyAmountOfOne130: penalties.getTotalPenaltyAmount(
            penalties.filter((x) => x.ratePart.denominator === 130)(penalty)
        ),
    }

    it(`Количество строк расчета = ${expected.resultLength}`, () => {
        expect(result.rows.length).toEqual(expected.resultLength)
    })

    it(`Сумма пеней = ${expected.penaltyAmount}`, () => {
        expect(calculationResults.getTotalPenaltyAmount(result)).toBeCloseTo(
            expected.penaltyAmount,
            2
        )
    })

    it(`Сумма пеней по долгу ${startDebtAmount} = ${expected.penaltyAmountOfStartDebt}`, () => {
        expect(
            calculationResults.getTotalPenaltyAmount(
                calculationResults.filter(
                    (x) => x.debtAmount === startDebtAmount
                )(result)
            )
        ).toBeCloseTo(expected.penaltyAmountOfStartDebt)
    })

    it(`Сумма пеней по доле 1/130 = ${expected.penaltyAmountOfOne130}`, () => {
        expect(
            calculationResults.getTotalPenaltyAmount(
                calculationResults.filter(
                    (x) => x.ratePart.denominator === 130
                )(result)
            )
        ).toBeCloseTo(expected.penaltyAmountOfOne130)
    })
})
