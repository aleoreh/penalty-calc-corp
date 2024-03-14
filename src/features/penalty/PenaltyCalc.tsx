import {
    Box,
    Button,
    Container,
    Stack,
    TextField,
    Typography,
} from "@mui/material"
import { DataGrid } from "@mui/x-data-grid/DataGrid"
import { GridColDef } from "@mui/x-data-grid/models/colDef"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs, { Dayjs } from "dayjs"
import React, { useState } from "react"
import { NumericFormat, NumericFormatProps } from "react-number-format"

import { Penalty } from "../penalty/penalty"

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

type PenaltiesTable = {
    id: number
    date: Dayjs
    debt: number
    delayDaysCount: number
    fraction: string
    moratorium: boolean
    rate: number
    penalty: number
    deferredCoef: number
}[]

type ResultTable = {
    id: number
    debt: number
    dateFrom: Dayjs
    dateTo: Dayjs
    daysCount: number
    fraction: string
    moratorium: boolean
    rate: number
    penalty: number
    deferredCoef: number
}[]

function penaltiesToResultTable(
    penalty: Penalty,
    table: PenaltiesTable
): ResultTable {
    function addResultRow(row: PenaltiesTable[number]): ResultTable[number] {
        return {
            ...row,
            dateFrom: row.date,
            dateTo: row.date,
            daysCount: 1,
            fraction: penalty.getKeyRateFraction(row.date).repr,
        }
    }

    function joinResultRow(
        resultRow: ResultTable[number],
        row: PenaltiesTable[number]
    ): ResultTable[number] {
        return {
            ...resultRow,
            dateTo: row.date,
            daysCount: resultRow.daysCount + 1,
            penalty: resultRow.penalty + row.penalty,
        }
    }

    function resultRowEqual(
        row1: Pick<
            ResultTable[number],
            "debt" | "rate" | "fraction" | "moratorium" | "deferredCoef"
        >,
        row2: Pick<
            PenaltiesTable[number],
            "debt" | "rate" | "fraction" | "moratorium" | "deferredCoef"
        >
    ) {
        return (
            row1.debt === row2.debt &&
            row1.rate === row2.rate &&
            row1.fraction === row2.fraction &&
            row1.moratorium === row2.moratorium &&
            row1.deferredCoef === row2.deferredCoef
        )
    }

    return table.reduce((acc, row, i) => {
        return acc.length === 0 || !resultRowEqual(acc[acc.length - 1], row)
            ? [...acc, addResultRow(row)]
            : [...acc.slice(0, -1), joinResultRow(acc[acc.length - 1], row)]
    }, [] as ResultTable)
}

export function PenaltyCalc() {
    const [calcDate, setCalcDate] = useState<Dayjs | null>(dayjs())
    const [debtPeriod, setDebtPeriod] = useState<Dayjs | null>(null)
    const [debtSum, setDebtSum] = useState<number>(0)
    const [result, setResult] = useState<ResultTable>([])

    const columns: GridColDef[] = [
        { field: "id" },
        { field: "debt", headerName: "Сумма долга" },
        {
            field: "dateFrom",
            headerName: "Период с",
            width: 200,
            valueFormatter: (x) => x.value.format("LL"),
        },
        {
            field: "dateTo",
            headerName: "Период по",
            width: 200,
            valueFormatter: (x) => x.value.format("LL"),
        },
        { field: "daysCount", headerName: "Дней" },
        { field: "fraction", headerName: "Доля ставки" },
        { field: "moratorium", headerName: "Действует мораторий" },
        { field: "rate", headerName: "Ставка" },
        {
            field: "penalty",
            headerName: "Сумма пени",
        },
        {
            field: "deferredCoef",
            headerName: "Отсрочка",
            valueGetter: (x) => !x.value,
        },
    ]

    function isValid(): boolean {
        return !(debtPeriod === null || calcDate === null)
    }

    function startCalculation(): void {
        if (debtPeriod === null || calcDate === null) return

        const penaltiesTable: PenaltiesTable = []

        const penalty = new Penalty(debtPeriod, debtSum)

        for (let i = 1; i <= calcDate.diff(penalty.dueDate, "day"); i++) {
            const day = penalty.dueDate.add(i, "day")

            const value = {
                id: day.unix(),
                date: day,
                debt: debtSum,
                delayDaysCount: penalty.getDaysOverdue(day),
                fraction: penalty.getKeyRateFraction(day).repr,
                moratorium: Penalty.doesMoratoriumActs(day),
                rate: Penalty.getKeyRate(calcDate),
                deferredCoef: penalty.getDeferredCoef(day),
                penalty: penalty.calculate(calcDate, day),
            }

            penaltiesTable.push(value)
        }

        setResult(penaltiesToResultTable(penalty, penaltiesTable))
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
                            onChange={setCalcDate}
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
                                value={debtPeriod}
                                onChange={setDebtPeriod}
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
