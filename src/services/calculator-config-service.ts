import { GetConfig } from "../app/ports"
import { appConfig } from "../data"
import { dayjs } from "../domain/dayjs"

const getConfig: GetConfig = async () => {
    return {
        daysToPay: appConfig.daysToPay,
        deferredDaysCount: appConfig.deferredDaysCount,
        doesMoratoriumActs: (date) =>
            appConfig.moratoriums.some(([start, end]) => {
                return dayjs(date).isBetween(start, end, "day", "[]")
            }),
        getKeyRate: (date) =>
            appConfig.keyRates.filter(([startDate, _]) => {
                return dayjs(date).isAfter(startDate)
            })[appConfig.keyRates.length - 1][1],
        getKeyRatePart: (daysOverdue) =>
            daysOverdue < appConfig.fractionChangeDay
                ? { numerator: 1, denominator: 300 }
                : { numerator: 1, denominator: 130 },
    }
}

const calculatorConfigService = {
    getConfig,
}

export default calculatorConfigService
