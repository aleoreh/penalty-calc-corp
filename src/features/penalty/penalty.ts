import { Dayjs } from "dayjs"

import { doesMoratoriumActs, getKeyRate } from "./catalogs"

export class Penalty {
    static dueDaysAfter = 10
    static _fractionChangeDay = 91

    private _debtPeriod: Dayjs
    private _debt: number

    constructor(debtPeriod: Dayjs, debt: number) {
        this._debt = debt
        this._debtPeriod = debtPeriod
    }

    get debtSum(): number {
        return this._debt
    }

    /**
     * Дата начала просрочки
     *
     * @return {*}  {Dayjs}
     */
    get dueDate(): Dayjs {
        return this._debtPeriod.endOf("month").add(Penalty.dueDaysAfter, "day")
    }

    /**
     * Коэффициент для применения до и после начала просрочки (0, 1)
     *
     * @param {Dayjs} date
     * @return {*}  {number}
     */
    getDeferredCoef(date: Dayjs): number {
        // Количество дней, в течение которых пеня не начисляется
        const deferredDaysCount = 31

        return date.diff(this.dueDate.add(deferredDaysCount, "day")) < 0 ? 0 : 1
    }

    /**
     * Количество дней просрочки
     *
     * @param {Dayjs} date
     * @return {*}  {number}
     */
    getDaysOverdue(date: Dayjs): number {
        return date.diff(this.dueDate, "day")
    }

    /**
     * Доля ключевой ставки, зависящая от количества дней просрочки
     *
     * @param {Dayjs} date
     * @return {*}  {{ value: number; repr: string }}
     */
    getKeyRateFraction(date: Dayjs): { value: number; repr: string } {
        return this.getDaysOverdue(date) < Penalty._fractionChangeDay
            ? { value: 1 / 300, repr: "1/300" }
            : { value: 1 / 130, repr: "1/130" }
    }

    /**
     * Рассчитывает на дату calcDate сумму пени за день day
     *
     * @param {Dayjs} calcDate - дата произведения расчета
     * @param {Dayjs} day - день, за который рассчитывается пеня
     * @return {*}  {number}
     */
    calculate(calcDate: Dayjs, day: Dayjs): number {
        const b = this.getDeferredCoef(day)
        const k = this.getKeyRateFraction(day).value
        const r = getKeyRate(calcDate)
        const m = doesMoratoriumActs(day) ? 0 : 1

        return b * k * (r / 100) * this._debt * m
    }
}
