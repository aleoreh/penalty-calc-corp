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

import { PenaltyGrid } from "./PenaltyGrid"
import { ResultTable, penaltiesFoldedForPeriod } from "./penalty"
import { Debt, Payment, debtFromNullable } from "./penalty.types"

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
    const [debtPeriod, setDebtPeriod] = useState<Dayjs | null>(null)
    const [debtSum, setDebtSum] = useState<number | null>(null)
    const [paymentDate, setPaymentDate] = useState<Dayjs | null>(null)
    const [paymentSum, setPaymentSum] = useState<number | null>(null)
    const [results, setResults] = useState<ResultTable[]>([])

    function validateDebtInput(): Debt[] {
        return !!debtPeriod && !!debtSum
            ? [
                  {
                      period: debtPeriod,
                      sum: debtSum,
                  },
              ]
            : []
    }

    function validatePaymentInput(): Payment[] {
        return !!debtPeriod && !!paymentDate && !!paymentSum
            ? [
                  {
                      period: debtPeriod,
                      date: paymentDate,
                      sum: paymentSum,
                  },
              ]
            : []
    }

    function startCalculation(): void {
        const debt = debtFromNullable({ period: debtPeriod, sum: debtSum })

        if (!!debt && !!calcDate) {
            setResults(penaltiesFoldedForPeriod(calcDate, [debt]))
        }
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
                        <Stack direction="row">
                            <DatePicker
                                label="Расчетный период, месяц/год"
                                views={["year", "month"]}
                                value={debtPeriod}
                                onChange={setDebtPeriod}
                                sx={{
                                    flexGrow: 1,
                                }}
                            />
                            <TextField
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
                        <Stack display="none">
                            <Typography>
                                или импортируйте долги из таблицы:
                            </Typography>
                            <Button>Импортировать долги</Button>
                        </Stack>
                    </Stack>
                    <Stack>
                        <Typography>
                            Если долг частично оплачен, введите сумму и дату
                            оплаты:
                        </Typography>
                        <Stack direction="row">
                            <DatePicker
                                label="Дата оплаты"
                                value={paymentDate}
                                onChange={setPaymentDate}
                                sx={{
                                    flexGrow: 1,
                                }}
                            />
                            <TextField
                                label="Сумма оплаты, р."
                                InputProps={{
                                    inputComponent: NumericFormatCustom as any,
                                }}
                                value={paymentSum}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    setPaymentSum(
                                        parseFloat(event.target.value)
                                    )
                                }}
                            />
                        </Stack>
                        <Stack display="none">
                            <Typography>
                                или импортируйте платежи из таблицы:
                            </Typography>
                            <Button>Импортировать платежи</Button>
                        </Stack>
                    </Stack>
                    <Stack direction="row">
                        <Button
                            variant="contained"
                            fullWidth
                            disabled={validateDebtInput().length === 0}
                            onClick={startCalculation}
                        >
                            Рассчитать
                        </Button>
                        <Button onClick={() => setResults([])}>Очистить</Button>
                    </Stack>
                </Stack>
            </Container>
            {results.map((result) => (
                <PenaltyGrid resultTable={result} />
            ))}
        </Box>
    )
}
