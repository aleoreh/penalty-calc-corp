import { CalculatorConfig } from "../../domain/calculator-config"

type CalculatorType = (props: { config: CalculatorConfig }) => JSX.Element

export const Calculator: CalculatorType = ({ config }) => {
    return <h1>Калькулятор</h1>
}

