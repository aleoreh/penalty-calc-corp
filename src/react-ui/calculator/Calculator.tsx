import { CalculatorConfig } from "../../domain/calculator-config"

type CalculatorType = (props: { config: CalculatorConfig }) => JSX.Element

const Calculator: CalculatorType = ({ config }) => {
    return (
        <h1>Калькулятор</h1>
    )
}

export default Calculator
