import { CalculatorConfig } from "../domain/calculator-config"
import calculatorConfigService from "../services/calculator-config-service"

export type GetDefaultCalculatorConfig = (
    date: Date
) => Promise<CalculatorConfig>

export const getDefaultCalculatorConfig: GetDefaultCalculatorConfig = async (
    date: Date
) => calculatorConfigService.getDefaultConfig(date)
