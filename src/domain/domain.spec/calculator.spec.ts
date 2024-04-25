import { dayjs } from "../../lib/dayjs"
import {
    CalculatorConfig,
    CalculatorContext,
    calculatePenalty,
    defaultDueDate,
} from "../calculator"
import { Payment } from "../payment"

describe("calculator", () => {
    const period = new Date("2019-05-01")
    const startDebtAmount = 1000
    const config: CalculatorConfig = {
        daysToPay: 10,
        deferredDaysCount: 30,
        doesMoratoriumActs: (date) =>
            dayjs(date).isBetween("2020-04-06", "2021-01-01", "day", "[]") ||
            dayjs(date).isBetween("2022-03-31", "2022-10-01", "day", "[]"),
        getKeyRate: (date) => 0.095,
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
        },
        dueDate: defaultDueDate(period, config.daysToPay),
    }
    const result = calculatePenalty(context)

    const expected = {
        length: dayjs(context.calculationDate).diff(context.dueDate, "day") + 1,
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
        expect(result.rows.filter((x) => x.doesMoratiriumActs).length).toBe(
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
            result.rows
                .filter((x) => x.debtAmount === startDebtAmount)
                .reduce((acc, x) => acc + x.penaltyAmount, 0)
        ).toBeCloseTo(expected.startDebtAmountPenalty, 2)
    })

    it(`Количество дней с задолженностью ${expected.finalDebtAmount} = ${expected.finalDebtAmountDaysCount}`, () => {
        expect(
            result.rows.filter((x) => x.debtAmount === startDebtAmount).length
        ).toBe(expected.startDebtAmountDaysCount)
    })

    it(`Сумма пеней по задолженности ${expected.finalDebtAmount} = ${expected.finalDebtAmountPenalty}`, () => {
        expect(
            result.rows
                .filter((x) => x.debtAmount === expected.finalDebtAmount)
                .reduce((acc, x) => acc + x.penaltyAmount, 0)
        ).toBeCloseTo(expected.finalDebtAmountPenalty, 2)
    })

    it(`Последняя дата расчета = ${expected.lastDate}`, () => {
        expect(
            dayjs(result.rows.slice(-1)[0].date).startOf("day").toDate()
        ).toStrictEqual(dayjs(expected.lastDate).startOf("day").toDate())
    })

    it(`Сумма пени = ${expected.penaltyAmount}`, () => {
        expect(
            result.rows.reduce((acc, x) => acc + x.penaltyAmount, 0)
        ).toBeCloseTo(expected.penaltyAmount, 2)
    })
})
