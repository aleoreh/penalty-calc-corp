import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs, { Dayjs } from "dayjs"
import { useState } from "react"
import { CalculatorConfig } from "../../../domain/calculator-config"
import { Debt } from "../../../domain/debt"
import { ConfirmDialog, useConfirmDialog } from "../../components/ConfirmDialog"
import { UI } from "../../types"
import { CalculationResults } from "../CalculationResults"
import { DebtsList } from "../DebtsList/DebtsList"
import { CalculatorSettings } from "./CalculatorSettings"

export const Calculator: UI.Calculator = ({
    defaultCalculationDate,
    defaultConfig,
    startCalculation,
    calculationResults,
}) => {
    const [calculationDate, setCalculationDate] = useState<Dayjs | null>(
        dayjs(defaultCalculationDate)
    )
    const [config, setConfig] = useState<CalculatorConfig>(defaultConfig)
    const [debts, setDebts] = useState<Debt[]>([])

    // ~~~~~~~~~~~~ clear confirm ~~~~~~~~~~~~ //

    const [clearConfirmOpened, setClearConfirmOpened] = useState(false)

    const clearConfirm = useConfirmDialog({
        id: "clearConfirm",
        open: clearConfirmOpened,
        onClose: (debts?: Debt[]) => {
            setClearConfirmOpened(false)
            debts && setDebts([])
        },
    })

    const onDebtsClear = () => {
        clearConfirm.configure({
            value: debts,
            title: "Очистить список долгов?",
            confirmText: "Да, очистить!",
        })
        setClearConfirmOpened(true)
    }

    // ~~~~~~~~~~~~~~~ helpers ~~~~~~~~~~~~~~~ //

    const calculate = () => {
        startCalculation(
            calculationDate?.toDate() || defaultCalculationDate,
            config,
            debts
        )
    }

    // ~~~~~~~~~~~~~~~~~ jsx ~~~~~~~~~~~~~~~~~ //

    return (
        <Stack className="calculator">
            <CalculatorSettings
                calculationDate={
                    calculationDate?.toDate() || defaultCalculationDate
                }
                config={config}
                setConfig={setConfig}
                defaultConfig={defaultConfig}
            />
            <DatePicker
                label="Дата расчета"
                value={calculationDate}
                onChange={setCalculationDate}
                sx={{ alignSelf: "flex-start" }}
            />
            <DebtsList config={config} debts={debts} setDebts={setDebts} />
            <Stack direction="row" justifyContent="flex-end">
                <Button variant="outlined" onClick={onDebtsClear}>
                    Очистить список долгов
                </Button>
                <Button variant="contained" onClick={calculate}>Рассчитать</Button>
            </Stack>
            {calculationResults.length > 0 && (
                <CalculationResults
                    calculationDate={
                        calculationDate || dayjs(defaultCalculationDate)
                    }
                    calculationResults={calculationResults}
                />
            )}
            <ConfirmDialog {...clearConfirm} />
        </Stack>
    )
}

