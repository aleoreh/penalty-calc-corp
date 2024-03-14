import { Dayjs } from "dayjs"

const FRACTION_CHANGE_DAY = 90

/**
 * Начальный день отсчета (следующий после последнего дня периода расчета)
 *
 * @param {Dayjs} calcPeriod
 * @return {*}  {Dayjs}
 */
function startDate(calcPeriod: Dayjs): Dayjs {
    return calcPeriod.endOf("month")
}

/**
 * Дата начала просрочки
 *
 * @param {Dayjs} startDate
 * @return {*}  {Dayjs}
 */
function delayStartDate(startDate: Dayjs): Dayjs {
    // крайний срок платежа за расчетный период
    const startDelayDaysCount = 11

    return startDate.add(startDelayDaysCount, "day")
}

/**
 * Коэффициент для применения до и после начала просрочки (0, 1)
 *
 * @param {Dayjs} date
 * @return {*}  {number}
 */
function deferredCoef(date: Dayjs, delayStartDate: Dayjs): number {
    // Количество дней, в течение которых пеня не начисляется
    const deferredDaysCount = 31

    return date.diff(delayStartDate.add(deferredDaysCount, "day")) < 0 ? 0 : 1
}

/**
 * Количество дней просрочки
 *
 * @param {Dayjs} date
 * @param {Dayjs} delayStartDate
 * @return {*}  {number}
 */
function delayDaysCount(date: Dayjs, delayStartDate: Dayjs): number {
    return date.diff(delayStartDate, "day")
}

/**
 * Доля ключевой ставки, зависящая от количества дней просрочки
 *
 * @param {number} delayDaysCount
 * @param {number} fractionChangeDay
 * @return {*}  {{ value: number; repr: string }}
 */
function keyRateFraction(
    delayDaysCount: number,
    fractionChangeDay: number
): { value: number; repr: string } {
    return delayDaysCount < fractionChangeDay
        ? { value: 1 / 300, repr: "1/300" }
        : { value: 1 / 130, repr: "1/130" }
}

/**
 * Ключевая ставка на дату
 *
 * @param {Dayjs} calcDate
 * @return {*}  {number}
 */
function keyRate(calcDate: Dayjs): number {
    return 9.5 // TODO: брать из справочника
}

/**
 * Показывает, действует ли на данную дату мораторий на начисление пени
 *
 * @param {Dayjs} calcDate
 * @return {*}  {boolean}
 */
function doesMoratoriumActs(calcDate: Dayjs): boolean {
    return false // TODO: брать из справочника
}

/**
 * Рассчитывает сумму пени за день date
 *
 * @param {Dayjs} calcDate - дата произведения расчета
 * @param {Dayjs} calcPeriod - расчетный период
 * @param {number} debt - сумма долга
 * @param {Dayjs} day - день, за который рассчитывается пеня
 * @return {*}  {number}
 */
function penalty(
    calcDate: Dayjs,
    calcPeriod: Dayjs,
    debt: number,
    day: Dayjs
): number {
    const start = startDate(calcPeriod)
    const b = deferredCoef(day, delayStartDate(start))
    const k = keyRateFraction(delayDaysCount(day, start), 90).value
    const r = keyRate(calcDate)
    const m = doesMoratoriumActs(day) ? 0 : 1

    return b * k * (r / 100) * debt * m
}

export {
    FRACTION_CHANGE_DAY,
    startDate,
    delayDaysCount,
    keyRateFraction,
    doesMoratoriumActs,
    penalty,
}
