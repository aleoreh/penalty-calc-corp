import { CalculatorConfig } from "../domain/calculator-config"

export type GetConfig = () => Promise<CalculatorConfig>
