import { Add } from "@mui/icons-material"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs, { Dayjs } from "dayjs"
import { useState } from "react"

import { GridColDef } from "@mui/x-data-grid"
import { DataGrid } from "@mui/x-data-grid/DataGrid"
import { NumericFormatCustom } from "../../shared/helpers"
import { PenaltyGrid } from "./PenaltyGrid"
import { ResultTable, penaltiesFoldedForPeriod } from "./penalty"
import { Debt, Payment } from "./penalty.types"

function CalcPeriodsTable(props: { debts: Debt[] }) {
    const columns: GridColDef<Debt>[] = [
        {
            field: "period",
            headerName: "Период",
            valueFormatter: (x) => x.value.format("MMM YYYY"),
        },
        {
            field: "sum",
            headerName: "Сумма",
            valueFormatter: (x) => {
                return new Intl.NumberFormat("ru-RU", {
                    style: "currency",
                    currency: "RUR",
                    maximumFractionDigits: 2,
                }).format(x.value)
            },
        },
    ]
    return (
        <DataGrid
            columns={columns}
            rows={props.debts}
            hideFooter={true}
        ></DataGrid>
    )
}

export function PenaltyCalc() {
    const [calcDate, setCalcDate] = useState<Dayjs | null>(dayjs())

    const [debtPeriodInput, setDebtPeriodInput] = useState<Dayjs | null>(null)
    const [debtAmountInput, setDebtAmountInput] = useState<string>("")
    const [debts, setDebts] = useState<Debt[]>([])

    const [paymentDateInput, setPaymentDateInput] = useState<Dayjs | null>(null)
    const [paymentSumInput, setPaymentSumInput] = useState<string>("")
    const [payments, setPayments] = useState<Payment[]>([])

    const [results, setResults] = useState<ResultTable[]>([])

    const DebtInput = () => (
        <Stack direction="row">
            <DatePicker
                label="Расчетный период, месяц/год"
                views={["year", "month"]}
                value={debtPeriodInput}
                onChange={setDebtPeriodInput}
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
                value={debtAmountInput}
                onChange={(evt) => {
                    setDebtAmountInput(evt.target.value)
                }}
            />
            <IconButton
                sx={{ alignSelf: "center" }}
                onClick={addDebt}
                disabled={!debtPeriodInput || !debtAmountInput}
            >
                <Add />
            </IconButton>
        </Stack>
    )

    const PaymentInput = () => (
        <Stack direction="row">
            <DatePicker
                label="Дата оплаты"
                value={paymentDateInput}
                onChange={setPaymentDateInput}
                sx={{
                    flexGrow: 1,
                }}
            />
            <TextField
                label="Сумма оплаты, р."
                InputProps={{
                    inputComponent: NumericFormatCustom as any,
                }}
                value={paymentSumInput}
                onChange={(evt) => {
                    setPaymentSumInput(evt.target.value)
                }}
            />
            <IconButton
                sx={{ alignSelf: "center" }}
                onClick={addPayment}
                disabled={!paymentDateInput || !paymentSumInput}
            >
                <Add />
            </IconButton>
        </Stack>
    )

    function startCalculation(): void {
        if (!!calcDate) {
            setResults(penaltiesFoldedForPeriod(calcDate, debts, payments))
        }
    }

    function addDebt() {
        const debtAmount = parseFloat(debtAmountInput)
        const alreadyExists =
            debts.filter((debt) => debt.period.isSame(debtPeriodInput, "month"))
                .length > 0
        if (!!debtPeriodInput && !!debtAmount && !alreadyExists) {
            setDebts([...debts, { period: debtPeriodInput, sum: debtAmount }])
            setDebtAmountInput("")
            setDebtPeriodInput(null)
        }
    }

    function deleteDebt(debtPeriod: Dayjs) {
        setDebts(
            debts.filter((debt) => !debt.period.isSame(debtPeriod, "month"))
        )
    }

    function showDebts() {
        const sortedDebts = [...debts]
            .sort((debt1, debt2) => debt1.period.diff(debt2.period))
            .map((row) => ({ ...row, id: row.period.unix() }))
        return (
            sortedDebts.length > 0 && <CalcPeriodsTable debts={sortedDebts} />
        )
    }

    function addPayment() {
        const paymentSum = parseFloat(paymentSumInput)
        if (!!paymentDateInput && !!paymentSum) {
            setPayments([...payments])
        }
    }

    function clear() {
        setResults([])
        setDebts([])
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
                        <Typography align="left" variant="h5">
                            Заполните список долгов:
                        </Typography>
                        <DebtInput />
                        <Stack>{showDebts()}</Stack>
                        <Stack display="none">
                            <Typography>
                                или импортируйте долги из таблицы:
                            </Typography>
                            <Button>Импортировать долги</Button>
                        </Stack>
                    </Stack>
                    <Stack>
                        <Typography align="left" variant="h5">
                            Заполните список платежей при наличии:
                        </Typography>
                        <PaymentInput />
                        <IconButton sx={{ alignSelf: "flex-start" }}>
                            <Add />
                        </IconButton>
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
                            disabled={debts.length === 0}
                            onClick={startCalculation}
                        >
                            Рассчитать
                        </Button>
                        <Button onClick={clear}>Очистить</Button>
                    </Stack>
                </Stack>
            </Container>
            {results.map((result, i) => (
                <PenaltyGrid resultTable={result} key={i} />
            ))}
        </Box>
    )
}
