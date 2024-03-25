import { Delete, Done } from "@mui/icons-material"
import { List, ListItem, Snackbar } from "@mui/material"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import { GridColDef } from "@mui/x-data-grid"
import { DataGrid } from "@mui/x-data-grid/DataGrid"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs, { Dayjs } from "dayjs"
import { useEffect, useState } from "react"

import { CustomGridColDef, NumericFormatCustom } from "../../shared/helpers"
import { PenaltyGrid } from "./PenaltyGrid"
import {
    ResultTable,
    defaultDueDate,
    penaltiesFoldedForPeriod,
} from "./penalty"
import { Debt, Payment } from "./penalty.types"

type DebtWithId = Debt & { id: number }
type PaymentWithId = Payment & { id: number }

function DebtInput(props: {
    submit: (period: Dayjs, dueDate: Dayjs, amount: number) => void
}) {
    const [periodInput, setPeriodInput] = useState<Dayjs | null>(null)
    const [dueDateInput, setDueDateInput] = useState<Dayjs | null>(null)
    const [amountInput, setAmountInput] = useState<string>("")

    useEffect(() => {
        periodInput && setDueDateInput(defaultDueDate(periodInput))
    }, [periodInput])

    function clearInputs() {
        setPeriodInput(null)
        setDueDateInput(null)
        setAmountInput("")
    }

    function submit() {
        const amount = parseFloat(amountInput)
        if (periodInput && dueDateInput && !isNaN(amount)) {
            props.submit(periodInput, dueDateInput, amount)
            clearInputs()
        }
    }

    return (
        <Stack direction="row" alignItems="start">
            <Stack direction="row">
                <DatePicker
                    label="Расчетный период"
                    views={["year", "month"]}
                    value={periodInput}
                    onChange={setPeriodInput}
                    sx={{
                        flexGrow: 1,
                    }}
                />
                <DatePicker
                    label="Начало просрочки"
                    value={dueDateInput}
                    slotProps={{
                        textField: {
                            helperText: <>{dueDateInput?.format("dddd")}</>,
                        },
                    }}
                    onChange={setDueDateInput}
                    sx={{
                        flexGrow: 1,
                    }}
                />
            </Stack>
            <Stack direction="row">
                <TextField
                    label="Сумма долга, р."
                    required
                    InputProps={{
                        inputComponent: NumericFormatCustom as any,
                    }}
                    value={amountInput}
                    onChange={(evt) => {
                        setAmountInput(evt.target.value)
                    }}
                />
                <Button
                    onClick={submit}
                    disabled={!periodInput || !amountInput}
                    sx={{ flexShrink: 0 }}
                >
                    <Tooltip title="Добавить долг в список">
                        <Done />
                    </Tooltip>
                </Button>
            </Stack>
        </Stack>
    )
}

function PaymentInput(props: {
    addPayment: (period: Dayjs, date: Dayjs, sum: number) => void
}) {
    const [periodInput, setPeriodInput] = useState<Dayjs | null>(null)
    const [dateInput, setDateInput] = useState<Dayjs | null>(null)
    const [sumInput, setSumInput] = useState<string>("")

    function submit() {
        if (periodInput && dateInput && sumInput !== undefined) {
            const sum = parseFloat(sumInput)
            if (!!periodInput && !!dateInput && !isNaN(sum)) {
                props.addPayment(periodInput, dateInput, sum)
                setPeriodInput(null)
                setDateInput(null)
                setSumInput("")
            }
        }
    }

    return (
        <Stack direction="row">
            <DatePicker
                label="Расчетный период"
                views={["year", "month"]}
                value={periodInput}
                onChange={setPeriodInput}
                sx={{
                    flexGrow: 1,
                }}
            />
            <DatePicker
                label="Дата оплаты"
                views={["year", "month", "day"]}
                value={dateInput}
                onChange={setDateInput}
                sx={{
                    flexGrow: 1,
                }}
            />
            <TextField
                label="Сумма оплаты, р."
                InputProps={{
                    inputComponent: NumericFormatCustom as any,
                }}
                value={sumInput}
                onChange={(evt) => {
                    setSumInput(evt.target.value)
                }}
            />
            <Button
                onClick={submit}
                disabled={!periodInput || !sumInput}
                sx={{ flexShrink: 0 }}
            >
                <Tooltip title="Добавить оплату в список">
                    <Done />
                </Tooltip>
            </Button>
        </Stack>
    )
}

function DebtsList(props: {
    debts: DebtWithId[]
    deleteRow: (id: number) => () => void
}) {
    const columns: GridColDef<(typeof props.debts)[number]>[] = [
        {
            field: "period",
            headerName: "Период",
            valueFormatter: (x) => x && x.value.format("MMMM YYYY"),
        },
        {
            field: "dueDate",
            headerName: "Дата начала просрочки",
            valueFormatter: (x) => x && x.value.format("dd, ll"),
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
        {
            field: "delete",
            headerName: "Удалить",
            flex: 0,
            align: "right",
            renderCell: (params) => {
                return (
                    <Button
                        variant="text"
                        onClick={
                            !!params.row.id
                                ? props.deleteRow(params.row.id)
                                : undefined
                        }
                    >
                        <Delete />
                    </Button>
                )
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
        />
    )
}

function PaymentsList(props: {
    payments: PaymentWithId[]
    deleteRow: (id: number) => () => void
}) {
    const columns: GridColDef<(typeof props.payments)[number]>[] = [
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
        {
            field: "delete",
            headerName: "Удалить",
            flex: 0,
            align: "right",
            renderCell: (params) => {
                return (
                    <Button
                        variant="text"
                        onClick={
                            params.row.id !== undefined
                                ? props.deleteRow(params.row.id)
                                : undefined
                        }
                    >
                        <Delete />
                    </Button>
                )
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
            editMode="row"
        />
    )
}

export function PenaltyCalc() {
    const [snackbar, setSnackbar] = useState<[boolean, string]>([false, ""])
    const [isCalculated, setIsCalculated] = useState<boolean>(false)
    const [calcDate, setCalcDate] = useState<Dayjs | null>(dayjs())
    const [debts, setDebts] = useState<DebtWithId[]>([])
    const [payments, setPayments] = useState<PaymentWithId[]>([])
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

    function addDebt(period: Dayjs, dueDate: Dayjs, amount: number) {
        const alreadyExists =
            debts.filter((debt) => debt.period.isSame(period, "month")).length >
            0
        if (!alreadyExists) {
            setDebts([
                ...debts,
                { id: period.unix(), period, dueDate, sum: amount },
            ])
            setIsCalculated(false)
        } else {
            setSnackbar([
                true,
                `Долг за ${period.format("MMMM YYYY")} уже добавлен`,
            ])
        }
    }

    function deleteDebt(id: number) {
        setDebts(debts.filter((debt) => debt.id !== id))
        setIsCalculated(false)
    }

    function showDebts() {
        const sortedDebts = [...debts].sort((debt1, debt2) =>
            debt1.period.diff(debt2.period)
        )

        return sortedDebts.length > 0 ? (
            <DebtsList
                debts={sortedDebts}
                deleteRow={(id: number) => () => deleteDebt(id)}
            />
        ) : (
            <></>
        )
    }

    function addPayment(period: Dayjs, date: Dayjs, sum: number) {
        const paymentId =
            payments.length === 0
                ? 0
                : [...payments].sort((x, y) => x.id - y.id)[payments.length - 1]
                      .id + 1

        setPayments([...payments, { id: paymentId, period, date, sum }])
        setIsCalculated(false)
    }

    function deletePayment(paymentId: number) {
        console.log("deleting ", paymentId)
        setPayments(payments.filter((payment) => payment.id !== paymentId))
        setIsCalculated(false)
    }

    function showPayments() {
        const sortedPayments = [...payments].sort((payment1, payment2) =>
            payment1.date.diff(payment2.date)
        )

        return sortedPayments.length > 0 ? (
            <PaymentsList
                payments={sortedPayments}
                deleteRow={(id: number) => () => deletePayment(id)}
            />
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
                    <PenaltyGrid
                        calcDate={calcDate || dayjs()}
                        table={result}
                    />
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
                        <DebtInput submit={addDebt} />
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
                        <PaymentInput addPayment={addPayment} />
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
            <Snackbar
                open={snackbar[0]}
                message={snackbar[1]}
                autoHideDuration={6000}
                onClose={() => setSnackbar([false, ""])}
            />
        </Box>
    )
}
