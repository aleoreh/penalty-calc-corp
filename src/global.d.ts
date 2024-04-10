type AppConfig = {
    daysToPay: number
    deferredDaysCount: number
    fractionChangeDay: number
    keyRates: ReadonlyArray<Readonly<[string, number]>>
    moratoriums: ReadonlyArray<Readonly<[string, string]>>
}
