// действующий ключевые ставки (дата, значение)
const keyRates = [["1900-01-01", 0.095]] as const

// действующие моратории (начало, конец)
const moratoriums = [
    ["2020-04-06", "2021-01-01"],
    ["2022-03-31", "2022-10-01"],
] as const

// количество дней, отведенное на оплату
const daysToPay = 10

// отсрочка платежа по пене
const deferredDaysCount = 30

// день, после которого наступает изменение доли ставки расчета пени
const fractionChangeDay = 90

export const appConfig = {
    daysToPay,
    deferredDaysCount,
    fractionChangeDay,
    keyRates,
    moratoriums,
}
