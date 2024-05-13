import { GetCalculatorConfig } from "../app/ports"
import { appConfig } from "../data"
import { dayjs } from "../domain/dayjs"
import { Moratorium } from "../domain/moratorium"

function getMoratoriums(
    rawMoratoriums: (typeof appConfig)["moratoriums"]
) {
    return rawMoratoriums.map(
        ([start, end]) => [new Date(start), new Date(end)] as Moratorium
    )
}

export const getDefaultCalculatorConfig: GetCalculatorConfig = async () => {
    return {
        daysToPay: appConfig.daysToPay,
        deferredDaysCount: appConfig.deferredDaysCount,
        moratoriums: getMoratoriums(appConfig.moratoriums),
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
    getDefaultConfig: getDefaultCalculatorConfig,
}

export default calculatorConfigService

