import { useState } from "react"
import { CalculatorConfig } from "../../../domain/calculator-config"
import { Debt } from "../../../domain/debt"
import { UI } from "../../types"
import { CalculatorSettings } from "./CalculatorSettings"
import { DebtList } from "./DebtList"

export const Calculator: UI.Calculator = ({
    config: configProp,
    calculate,
}) => {
    const [calculationDate, setCalculationDate] = useState<Date>(new Date())
    const [config, setConfig] = useState<CalculatorConfig>(configProp)
    const [debts, setDebts] = useState<Debt[]>([])

    const clearDebtList = () => {
        setDebts([])
    }

    const handleCalculationDateInput = (
        evt: React.FormEvent<HTMLInputElement>
    ) => {
        setCalculationDate(new Date(evt.currentTarget.value) || new Date())
    }

    return (
        <>
            <label className="calculation-date" title="Дата расчета">
                Дата расчета
                <input type="date" onInput={handleCalculationDateInput} />
            </label>
            <CalculatorSettings config={config} setConfig={setConfig} />
            <DebtList debts={debts} setDebts={setDebts} />
            <button
                onClick={() => calculate({ calculationDate, config }, debts[0])}
            >
                Рассчитать
            </button>
            <button onClick={clearDebtList}>Очистить список долгов</button>
        </>
    )
}

