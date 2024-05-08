export const representKeyRateInPercents = (keyRate: number): string => {
    return Intl.NumberFormat("ru-RU", { style: "percent" }).format(keyRate)
}

const keyRates = {
    representInPercents: representKeyRateInPercents,
}

export default keyRates
