import { CalculationResult } from "../domain/calculation-result"
import { CalculatorConfig } from "../domain/calculator-config"
import { Debt } from "../domain/debt"

export namespace UI {
    export type Calculator = (props: {
        defaultCalculationDate: Date
        defaultConfig: CalculatorConfig
        startCalculation: (
            calculationDate: Date,
            config: CalculatorConfig,
            debts: Debt[]
        ) => void
        calculationResults: CalculationResult[],
        clearCalculationResults: () => void
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

