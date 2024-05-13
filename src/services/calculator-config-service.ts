import { GetCalculatorConfig } from "../app/ports"
import { appConfig } from "../data"
import { dayjs } from "../domain/dayjs"
import { Moratorium } from "../domain/moratorium"

function getMoratoriums(rawMoratoriums: (typeof appConfig)["moratoriums"]) {
    return rawMoratoriums.map(
        ([start, end]) => [new Date(start), new Date(end)] as Moratorium
    )
}

function getKeyRate(
    keyRatesData: (typeof appConfig)["keyRates"],
    date: Date
): number {
    return keyRatesData.filter(([startDate, _]) => {
        return dayjs(date).isAfter(startDate)
    })[keyRatesData.length - 1][1]
}

export const getDefaultCalculatorConfig: GetCalculatorConfig = async (
    date: Date
) => {
    return {
        daysToPay: appConfig.daysToPay,
        deferredDaysCount: appConfig.deferredDaysCount,
        moratoriums: getMoratoriums(appConfig.moratoriums),
        keyRate: getKeyRate(appConfig.keyRates, date),
        fractionChangeDay: appConfig.fractionChangeDay,
    }
}

const calculatorConfigService = {
    getDefaultConfig: getDefaultCalculatorConfig,
}

export default calculatorConfigService

