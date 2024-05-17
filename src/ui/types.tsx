import { Calculate } from "../app/calculate"
import { CalculatorConfig } from "../domain/calculator-config"
import { Debt } from "../domain/debt"

export namespace UI {
    export type Calculator = (props: {
        defaultCalculationDate: Date
        defaultConfig: CalculatorConfig
        calculate: Calculate
    }) => JSX.Element

    export type CalculatorSettings = (props: {
        calculationDate: Date
        config: CalculatorConfig
        setConfig: (config: CalculatorConfig) => void
        defaultConfig: CalculatorConfig
    }) => JSX.Element

    export type DebtList = (props: {
        config: CalculatorConfig
        debts: Debt[]
        setDebts: (debts: Debt[]) => void
    }) => JSX.Element

    export type AppTitle = () => JSX.Element
}

