import { CalculatorConfig } from "../domain/calculator-config"

export namespace UI {
    export type Calculator = (props: {
        config: CalculatorConfig
    }) => JSX.Element

    export type CalculatorSettings = (props: {
        config: CalculatorConfig
        setConfig: (config: CalculatorConfig) => void
    }) => JSX.Element


    export type AppTitle = () => JSX.Element
}
