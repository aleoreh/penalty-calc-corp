import { Done } from "@mui/icons-material"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { GridColDef } from "@mui/x-data-grid"
import { DataGrid } from "@mui/x-data-grid/DataGrid"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs, { Dayjs } from "dayjs"
import { useEffect, useState } from "react"
// ====
import { List, ListItem } from "@mui/material"
import Tooltip from "@mui/material/Tooltip"
import { CustomGridColDef, NumericFormatCustom } from "../../shared/helpers"
import { PenaltyGrid } from "./PenaltyGrid"
import { ResultTable, penaltiesFoldedForPeriod } from "./penalty"
import { Debt, Payment } from "./penalty.types"

function DebtInput(props: {
    period: Dayjs | null
    setPeriod: (x: Dayjs | null) => void
    amount: string
    setAmount: (x: string) => void
    addDebt: () => void
}) {
    return (
        <Stack direction="row">
            <DatePicker
                label="Расчетный период"
                views={["year", "month"]}
                value={props.period}
                onChange={props.setPeriod}
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
                value={props.amount}
                onChange={(evt) => {
                    props.setAmount(evt.target.value)
                }}
            />
            <Button
                onClick={props.addDebt}
                disabled={!props.period || !props.amount}
                sx={{ flexShrink: 0 }}
            >
                <Tooltip title="Добавить долг в список">
                    <Done />
                </Tooltip>
            </Button>
        </Stack>
    )
}

function PaymentInput(props: {
    period: Dayjs | null
    setPeriod: (x: Dayjs | null) => void
    date: Dayjs | null
    setDate: (x: Dayjs | null) => void
    sum: string
    setSum: (x: string) => void
    addPayment: () => void
}) {
    return (
        <Stack direction="row">
            <DatePicker
                label="Расчетный период"
                views={["year", "month"]}
                value={props.period}
                onChange={props.setPeriod}
                sx={{
                    flexGrow: 1,
                }}
            />
            <DatePicker
                label="Дата оплаты"
                value={props.date}
                onChange={props.setDate}
                sx={{
                    flexGrow: 1,
                }}
            />
            <TextField
                label="Сумма оплаты, р."
                InputProps={{
                    inputComponent: NumericFormatCustom as any,
                }}
                value={props.sum}
                onChange={(evt) => {
                    props.setSum(evt.target.value)
                }}
            />
            <Button
                onClick={props.addPayment}
                disabled={!props.date || !props.sum}
                sx={{ flexShrink: 0 }}
            >
                <Tooltip title="Добавить оплату в список">
                    <Done />
                </Tooltip>
            </Button>
        </Stack>
    )
}

function DebtsList(props: { debts: Debt[] }) {
    const columns: GridColDef[] = [
        {
            field: "period",
            headerName: "Период",
            valueFormatter: (x) => x && x.value.format("MMMM YYYY"),
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
            columns={columns
                .map(CustomGridColDef.staticCol)
                .map(CustomGridColDef.stretch)}
            rows={props.debts}
            hideFooter={true}
        ></DataGrid>
    )
}

function PaymentsList(props: { payments: Payment[] }) {
    const columns: GridColDef<Payment>[] = [
        {
            field: "period",
            headerName: "Расчетный период",
            valueFormatter: (x) => x.value.format("MMMM YYYY"),
        },
        {
            field: "date",
            headerName: "Дата оплаты",
            valueFormatter: (x) => x.value.format("L"),
        },
        {
            field: "sum",
            headerName: "Сумма оплаты",
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
            columns={columns
                .map(CustomGridColDef.staticCol)
                .map(CustomGridColDef.stretch)}
            rows={props.payments}
            hideFooter={true}
        ></DataGrid>
    )
}

export function PenaltyCalc() {
    const [isCalculated, setIsCalculated] = useState<boolean>(false)

    const [calcDate, setCalcDate] = useState<Dayjs | null>(dayjs())

    const [debtPeriodInput, setDebtPeriodInput] = useState<Dayjs | null>(null)
    const [debtAmountInput, setDebtAmountInput] = useState<string>("")
    const [debts, setDebts] = useState<Debt[]>([])

    const [paymentPeriodInput, setPaymentPeriodInput] = useState<Dayjs | null>(
        null
    )
    const [paymentDateInput, setPaymentDateInput] = useState<Dayjs | null>(null)
    const [paymentSumInput, setPaymentSumInput] = useState<string>("")
    const [payments, setPayments] = useState<(Payment & { id: number })[]>([])

    const [results, setResults] = useState<ResultTable[]>([])

    useEffect(() => {
        !isCalculated && setResults([])
    }, [isCalculated])

    useEffect(() => {
        setIsCalculated(false)
    }, [calcDate])

    function startCalculation(): void {
        if (!!calcDate) {
            setResults(penaltiesFoldedForPeriod(calcDate, debts, payments))
            setIsCalculated(true)
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
            setIsCalculated(false)
        }
    }

    function deleteDebt(debtPeriod: Dayjs) {
        setDebts(
            debts.filter((debt) => !debt.period.isSame(debtPeriod, "month"))
        )
        setIsCalculated(false)
    }

    function showDebts() {
        const sortedDebts = [...debts]
            .sort((debt1, debt2) => debt1.period.diff(debt2.period))
            .map((row) => ({ ...row, id: row.period.unix() }))
        return sortedDebts.length > 0 ? (
            <DebtsList debts={sortedDebts} />
        ) : (
            <></>
        )
    }

    function addPayment() {
        const paymentSum = parseFloat(paymentSumInput)

        if (!!paymentPeriodInput && !!paymentDateInput && !!paymentSum) {
            const paymentId = payments.length
                ? 0
                : [...payments].sort((x, y) => x.id - y.id).slice(-1)[0].id + 1

            setPayments([
                ...payments,
                {
                    id: paymentId,
                    period: paymentPeriodInput,
                    date: paymentDateInput,
                    sum: paymentSum,
                },
            ])
            setPaymentPeriodInput(null)
            setPaymentDateInput(null)
            setPaymentSumInput("")
            setIsCalculated(false)
        }
    }

    function deletePayment(paymentId: number) {
        setPayments(payments.filter((payment) => payment.id !== paymentId))
        setIsCalculated(false)
    }

    function showPayments() {
        const sortedPayments = [...payments]
            .sort((payment1, payment2) => payment1.date.diff(payment2.date))
            .map((row) => ({ ...row, id: row.date.unix() }))

        return sortedPayments.length > 0 ? (
            <PaymentsList payments={sortedPayments} />
        ) : (
            <></>
        )
    }

    function showResult() {
        return results.map((result, i) => {
            return (
                <ListItem
                    key={i}
                    sx={{
                        display: "flex",
                        alignItems: "stretch",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Typography variant="h5" align="left">
                        {result.length > 0 &&
                            result[0].period.format("MMMM YYYY")}
                    </Typography>
                    <PenaltyGrid resultTable={result} />
                </ListItem>
            )
        })
    }

    function clear() {
        setResults([])
        setDebts([])
        setPayments([])
    }

    return (
        <Box paddingBlock={2} gap={2} display="flex" flexDirection="column">
            <Container
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                <Typography variant="h4" component="h1">
                    Калькулятор пеней ЖКУ (в разработке)
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
                        <Stack>{showDebts()}</Stack>
                        <DebtInput
                            period={debtPeriodInput}
                            setPeriod={setDebtPeriodInput}
                            amount={debtAmountInput}
                            setAmount={setDebtAmountInput}
                            addDebt={addDebt}
                        />
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
                        <Stack>{showPayments()}</Stack>
                        <PaymentInput
                            period={paymentPeriodInput}
                            setPeriod={setPaymentPeriodInput}
                            date={paymentDateInput}
                            setDate={setPaymentDateInput}
                            sum={paymentSumInput}
                            setSum={setPaymentSumInput}
                            addPayment={addPayment}
                        />
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
            <Container maxWidth="lg">
                <List>{showResult()}</List>
            </Container>
        </Box>
    )
}
