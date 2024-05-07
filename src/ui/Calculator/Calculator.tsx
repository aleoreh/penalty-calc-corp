import { useState } from "react"
import { UI } from "../types"
import { CalculatorSettings } from "./CalculatorSettings"
import { CalculatorConfig } from "../../domain/calculator-config"

export const Calculator: UI.Calculator = ({ config: configProp }) => {
    const [config, setConfig] = useState<CalculatorConfig>(configProp)

    return (
        <>
            <CalculatorSettings config={config} setConfig={setConfig} />
        </>
    )
}

