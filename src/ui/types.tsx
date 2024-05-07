import { CalculatorConfig } from "../domain/calculator-config"
import { Debt } from "../domain/debt"

export namespace UI {
    export type Calculator = (props: {
        config: CalculatorConfig
    }) => JSX.Element

    export type CalculatorSettings = (props: {
        config: CalculatorConfig
        setConfig: (config: CalculatorConfig) => void
    }) => JSX.Element

    export type DebtList = (props: {
        debts: Debt[]
        setDebts: (debts: Debt[]) => void
    }) => JSX.Element

    export type AppTitle = () => JSX.Element
}
