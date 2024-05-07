import { CalculatorConfig } from "../domain/calculator-config"

export namespace UI {
    export type Calculator = (props: {
        config: CalculatorConfig
    }) => JSX.Element

    export type AppTitle = () => JSX.Element
}
