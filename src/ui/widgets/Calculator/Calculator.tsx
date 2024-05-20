import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs, { Dayjs } from "dayjs"
import { useState } from "react"

import { CalculatorConfig } from "../../../domain/calculator-config"
import { Debt } from "../../../domain/debt"
import { UI } from "../../types"
import { DebtsList } from "../DebtsList/DebtsList"
import { CalculatorSettings } from "./CalculatorSettings"
import { ConfirmDialog, useConfirmDialog } from "../../components/ConfirmDialog"

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

    // ~~~~~~~~~~~~~~~~~ jsx ~~~~~~~~~~~~~~~~~ //

    return (
        <Stack className="calculator" direction="column">
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
            <DebtsList config={config} debts={debts} setDebts={setDebts} />
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
            <Button variant="outlined" onClick={onDebtsClear}>
                Очистить список долгов
            </Button>
            <ConfirmDialog {...clearConfirm} />
        </Stack>
    )
}

