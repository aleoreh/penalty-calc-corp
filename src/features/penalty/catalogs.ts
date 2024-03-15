import dayjs, { Dayjs } from "dayjs"

const keyRates: [string, number][] = [["1900-01-01", 9.5]]

const moratoriums: [string, string][] = [["2020-04-06", "2021-01-01"]]

/**
 * Ключевая ставка на дату
 *
 * @param {Dayjs} date
 * @return {*}  {number}
 */
export function getKeyRate(date: Dayjs): number {
    return keyRates.filter(([dateStr, _]) => {
        return date.diff(dayjs(dateStr)) >= 0
    })[keyRates.length - 1][1]
}

/**
 * Показывает, действует ли на данную дату мораторий на начисление пени
 *
 * @param {Dayjs} date
 * @return {*}  {boolean}
 */
export function doesMoratoriumActs(date: Dayjs): boolean {
    return false // TODO: брать из справочника
}
