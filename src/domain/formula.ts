import keyRateParts, { KeyRatePart } from "./keyrate-part"

export type Formula = string

type From = (params: {
    debtAmount: number
    rate: number
    doesDefermentActs: boolean
    doesMoratoriumActs: boolean
    totalDays: number
    ratePart: KeyRatePart
}) => Formula

const empty: Formula = ""

const from: From = ({
    debtAmount,
    rate,
    doesDefermentActs,
    doesMoratoriumActs,
    totalDays,
    ratePart,
}) => {
    const debtAmountFormatted = new Intl.NumberFormat("ru-RU", {
        style: "decimal",
        minimumFractionDigits: 2,
    }).format(debtAmount)
    const keyRateFormatted = `${rate * 100}%`
    return doesDefermentActs
        ? "Отсрочка"
        : doesMoratoriumActs
        ? "Мораторий"
        : `${totalDays} ∙ ${keyRateParts.format(
              ratePart
          )} ∙ ${keyRateFormatted} ∙ ${debtAmountFormatted}`
}

const formulas = {
    empty,
    from,
}

export default formulas
