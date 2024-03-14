import {
    Box,
    Button,
    Container,
    Stack,
    TextField,
    Typography,
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs, { Dayjs } from "dayjs"
import React, { useState } from "react"
import { NumericFormat, NumericFormatProps } from "react-number-format"

import * as Penalty from "../penalty/penalty"
import { DataGrid } from "@mui/x-data-grid/DataGrid"
import { GridColDef } from "@mui/x-data-grid/models/colDef"

interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void
    name: string
}

const NumericFormatCustom = React.forwardRef<NumericFormatProps, CustomProps>(
    function NumericFormatCustom(props, ref) {
        const { onChange, ...other } = props

        return (
            <NumericFormat
                {...other}
                getInputRef={ref}
                onValueChange={(values) => {
                    onChange({
                        target: {
                            name: props.name,
                            value: values.value,
                        },
                    })
                }}
                thousandSeparator=" "
                decimalSeparator=","
                decimalScale={2}
                valueIsNumericString
            />
        )
    }
)

export function PenaltyCalc() {
    const [calcDate, setCalcDate] = useState<Dayjs | null>(dayjs())
    const [calcPeriod, setCalcPeriod] = useState<Dayjs | null>(null)
    const [debtSum, setDebtSum] = useState<number>(0)
    const [result, setResult] = useState<
        {
            id: number
            date: Dayjs
            debt: number
            delayDaysCount: number
            fraction: string
            moratorium: boolean
            penalty: number
        }[]
    >([])

    const columns: GridColDef[] = [
        { field: "id", headerName: "id" },
        {
            field: "date",
            headerName: "Дата",
            width: 200,
            valueFormatter: (x) => x.value.format("LL"),
        },
        { field: "debt", headerName: "Сумма долга" },
        { field: "delayDaysCount", headerName: "Количество дней просрочки" },
        {
            field: "fraction",
            headerName: "Доля ключевой ставки",
        },
        { field: "moratorium", headerName: "Действует мораторий" },
        {
            field: "penalty",
            headerName: "Сумма пени",
            type: "number",
        },
    ]

    function isValid(): boolean {
        return !(calcPeriod === null || calcDate === null)
    }

    function startCalculation(): void {
        if (calcPeriod === null || calcDate === null) return

        const res: typeof result = []

        const start = Penalty.startDate(calcPeriod)

        for (let i = 1; start.add(i, "day").diff(calcDate, "day") <= 0; i++) {
            const day = start.add(i, "day")
            const delayDaysCount = Penalty.delayDaysCount(day, start)
            res.push({
                id: i,
                date: day,
                debt: debtSum,
                delayDaysCount: Penalty.delayDaysCount(day, start),
                fraction: Penalty.keyRateFraction(
                    delayDaysCount,
                    Penalty.FRACTION_CHANGE_DAY
                ).repr,
                moratorium: Penalty.doesMoratoriumActs(day),
                penalty: Penalty.penalty(calcDate, calcPeriod, debtSum, day),
            })
        }

        setResult(res)
    }

    return (
        <Box paddingBlock={2}>
            <Container
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                <Typography variant="h4" component="h1">
                    Калькулятор пеней за ЖКУ
                </Typography>
                <Stack component="form" gap={2}>
                    <Stack>
                        <DatePicker
                            label="Дата расчета"
                            value={calcDate}
                            onAccept={setCalcDate}
                        />
                    </Stack>
                    <Stack>
                        <Typography>
                            Введите сумму долга за расчетный период:
                        </Typography>
                        <Stack>
                            <DatePicker
                                label="Расчетный период, месяц/год"
                                views={["year", "month"]}
                                value={calcPeriod}
                                onChange={setCalcPeriod}
                            />
                            <TextField
                                id="debt-sum-input"
                                label="Сумма долга, р."
                                required
                                InputProps={{
                                    inputComponent: NumericFormatCustom as any,
                                }}
                                value={debtSum}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    setDebtSum(parseFloat(event.target.value))
                                }}
                            />
                        </Stack>
                        <Typography>
                            или импортируйте долги из таблицы:
                        </Typography>
                        <Button>Импортировать долги</Button>
                    </Stack>
                    <Stack>
                        <Typography>Если долг частично оплачен:</Typography>
                        <Button>Импортировать платежи</Button>
                    </Stack>
                    <Stack direction="row">
                        <Button
                            variant="contained"
                            fullWidth
                            disabled={!isValid()}
                            onClick={startCalculation}
                        >
                            Рассчитать
                        </Button>
                        <Button>Очистить</Button>
                    </Stack>
                </Stack>
            </Container>
            <DataGrid columns={columns} rows={result} />
        </Box>
    )
}
