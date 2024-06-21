import { Kopek2 } from "../../lib/kopek2"
import keyRateParts, { KeyRatePart } from "./key-rate-part"

export type Formula = string

type CreateFormulaParams = {
    debtAmount: Kopek2
    rate: number
    doesDefermentActs: boolean
    doesMoratoriumActs: boolean
    totalDays: number
    ratePart: KeyRatePart
}

export const emptyFormula: Formula = ""

export function createFormula({
    debtAmount,
    rate,
    doesDefermentActs,
    doesMoratoriumActs,
    totalDays,
    ratePart,
}: CreateFormulaParams): Formula {
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
    empty: emptyFormula,
    createFormula,
}

export default formulas

