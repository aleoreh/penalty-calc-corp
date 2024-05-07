import { useState } from "react"
import { UI } from "../types"
import { CalculatorSettings } from "./CalculatorSettings"
import { CalculatorConfig } from "../../domain/calculator-config"
import { DebtList } from "./DebtList"
import { Debt } from "../../domain/debt"

export const Calculator: UI.Calculator = ({ config: configProp }) => {
    const [config, setConfig] = useState<CalculatorConfig>(configProp)
    const [debts, setDebts] = useState<Debt[]>([])

    return (
        <>
            <CalculatorSettings config={config} setConfig={setConfig} />
            <DebtList debts={debts} setDebts={setDebts} />
        </>
    )
}

