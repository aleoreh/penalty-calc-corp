import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs, { Dayjs } from "dayjs"
import { useState } from "react"

import { CalculatorConfig } from "../../../domain/calculator-config"
import { Debt } from "../../../domain/debt"
import { UI } from "../../types"
import { CalculatorSettings } from "./CalculatorSettings"
import { DebtList } from "./DebtList"

export const Calculator: UI.Calculator = ({
    defaultCalculationDate,
    defaultConfig,
    calculate,
}) => {
    const [calculationDate, setCalculationDate] = useState<Dayjs | null>(
        dayjs(defaultCalculationDate)
    )
    const [config, setConfig] = useState<CalculatorConfig>(defaultConfig)
    const [debts, setDebts] = useState<Debt[]>([])

    const clearDebtList = () => {
        setDebts([])
    }

    return (
        <Stack direction="column">
            <DatePicker
                label="Дата расчета"
                value={calculationDate}
                onChange={setCalculationDate}
            />
            <CalculatorSettings
                calculationDate={
                    calculationDate?.toDate() || defaultCalculationDate
                }
                config={config}
                setConfig={setConfig}
                defaultConfig={defaultConfig}
            />
            <DebtList config={config} debts={debts} setDebts={setDebts} />
            <Button
                variant="outlined"
                onClick={() =>
                    calculate(
                        {
                            calculationDate:
                                calculationDate?.toDate() ||
                                defaultCalculationDate,
                            config,
                        },
                        debts[0]
                    )
                }
            >
                Рассчитать
            </Button>
            <Button variant="outlined" onClick={clearDebtList}>
                Очистить список долгов
            </Button>
        </Stack>
    )
}

