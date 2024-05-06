import { CalculatorConfig } from "../domain/calculator-config"
import calculatorConfigService from "../services/calculator-config-service"

export type GetDefaultCalculatorConfig = () => Promise<CalculatorConfig>

export const getDefaultCalculatorConfig: GetDefaultCalculatorConfig =
    async () => calculatorConfigService.getDefaultConfig()
