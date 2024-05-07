import { CalculatorConfig } from "../../domain/calculator-config"

type CalculatorProps = { config: CalculatorConfig }

export const Calculator = ({ config }: CalculatorProps) => {
    return <h1>Калькулятор</h1>
}

