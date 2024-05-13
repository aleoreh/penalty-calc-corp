import { CalculatorConfig } from "../domain/calculator-config"

export type GetCalculatorConfig = (date: Date) => Promise<CalculatorConfig>
