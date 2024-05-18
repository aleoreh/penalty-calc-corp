import { AddOutlined } from "@mui/icons-material"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Stack from "@mui/material/Stack"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"
import { DatePicker, DateValidationError } from "@mui/x-date-pickers"
import dayjs, { Dayjs } from "dayjs"
import { useMemo, useState } from "react"

import debtsModule, {
    Debt,
    createEmptyDebt,
    getDefaultDueDate,
    periodKey
} from "../../../domain/debt"
import { Form } from "../../components/Form"
import { Input } from "../../components/Input"
import { Popup } from "../../components/Popup"
import { usePopup } from "../../components/Popup/Popup"
import { useValidatedForm, useValidatedInput } from "../../formValidation"
import { UI } from "../../types"
import { inputDecoders } from "../../validationDecoders"
import { DebtItemRow } from "./DebtItemRow"

function periodIsIn(periods: Date[]) {
    return (period: Dayjs) =>
        periods.map(periodKey).includes(periodKey(period.toDate()))
}

function totalRemainingBalance(debts: Debt[]) {
    return debts.reduce(
        (acc, debt) => acc + debtsModule.getRemainingBalance(debt),
        0
    )
}

export const DebtsList: UI.DebtList = ({ config, debts, setDebts }) => {
    const [inputDebtPeriod, setInputDebtPeriod] = useState<Dayjs | null>(
        dayjs()
    )
    const [dueDate, setDueDate] = useState<Dayjs | null>(dayjs())

    const [popupOpened, setPopupOpened] = useState<boolean>(false)

    const [periodError, setPeriodError] = useState<DateValidationError | null>(
        null
    )

    const debtAmountInput = useValidatedInput(
        String(0),
        "Сумма долга",
        inputDecoders.decimal,
        {
            type: "text",
            id: "debt-amount",
            name: "debtAmount",
        }
    )

    const submitDebtAdd = () => {
        const newDebt =
            inputDebtPeriod &&
            createEmptyDebt(inputDebtPeriod.toDate(), config.daysToPay)
        newDebt &&
            debtAmountInput.validatedValue.ok &&
            setDebts([
                ...debts,
                {
                    ...newDebt,
                    amount: debtAmountInput.validatedValue.value as Kopek,
                },
            ])
    }

    const submitDebtAddAndContinue = () => {
        submitDebtAdd()
        open()
    }

    const debtAddForm = useValidatedForm(
        [debtAmountInput],
        submitDebtAdd,
        () => {
            setPopupOpened(false)
        }
    )

    const popup = usePopup(popupOpened, () => {
        debtAddForm.reset()
        setPopupOpened(false)
    })

    const open = () => {
        debtAddForm.reset()
        setPopupOpened(true)
    }

    const handleInputDebtPeriodChange = (value: Dayjs | null) => {
        setInputDebtPeriod(value)
        value &&
            setDueDate(
                dayjs(getDefaultDueDate(value.toDate(), config.daysToPay))
            )
    }

    const periodErrorMessage = useMemo(() => {
        switch (periodError) {
            case "shouldDisableMonth":
                return "Такой период уже есть в списке"
            default:
                return ""
        }
    }, [periodError])

    return (
        <>
            <Box className="debt-list" component="section">
                <Container maxWidth="md">
                    <Stack direction="row">
                        <Typography>Долги</Typography>
                        <Button title="Добавить" type="button" onClick={open}>
                            <AddOutlined></AddOutlined>
                        </Button>
                    </Stack>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Период</TableCell>
                                    <TableCell>Начало просрочки</TableCell>
                                    <TableCell>Долг</TableCell>
                                    <TableCell>Остаток</TableCell>
                                    <TableCell>...</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {debts.map((debt) => (
                                    <DebtItemRow
                                        key={periodKey(debt.period)}
                                        debt={debt}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Typography>Итого: {totalRemainingBalance(debts)} р.</Typography>
                </Container>
            </Box>
            <Popup {...popup}>
                <Form
                    {...debtAddForm}
                    submitAndContinue={submitDebtAddAndContinue}
                >
                    <Stack>
                        <DatePicker
                            label={"Период"}
                            value={inputDebtPeriod}
                            onChange={handleInputDebtPeriodChange}
                            views={["month"]}
                            view="month"
                            shouldDisableMonth={periodIsIn(
                                debts.map((x) => x.period)
                            )}
                            onError={setPeriodError}
                            slotProps={{
                                textField: {
                                    helperText: periodErrorMessage,
                                },
                            }}
                        />
                        <DatePicker
                            label={"Начало просрочки"}
                            value={dueDate}
                            onChange={setDueDate}
                        />
                        <Input {...debtAmountInput} />
                    </Stack>
                </Form>
            </Popup>
        </>
    )
}

