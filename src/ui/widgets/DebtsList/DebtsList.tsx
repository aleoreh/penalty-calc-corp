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

import { CalculatorConfig } from "../../../domain/calculator-config"
import debtsModule, {
    Debt,
    createEmptyDebt,
    getDefaultDueDate,
    periodKey,
} from "../../../domain/debt"
import { ConfirmDialog } from "../../components/ConfirmDialog"
import { useConfirmDialog } from "../../components/ConfirmDialog/ConfirmDialog"
import { Form } from "../../components/Form"
import { Input } from "../../components/Input"
import { Popup, usePopup } from "../../components/Popup"

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

type DebtAddFormProps = {
    config: CalculatorConfig
    debts: Debt[]
    setDebts: (debts: Debt[]) => void
    openPopup: () => void
    closePopup: () => void
}

const DebtAddForm = ({
    config,
    debts,
    setDebts,
    openPopup,
    closePopup,
}: DebtAddFormProps) => {
    const [inputDebtPeriod, setInputDebtPeriod] = useState<Dayjs | null>(
        dayjs()
    )
    const [dueDate, setDueDate] = useState<Dayjs | null>(dayjs())
    const [periodError, setPeriodError] = useState<DateValidationError | null>(
        null
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

    const debtAddForm = useValidatedForm(
        [debtAmountInput],
        submitDebtAdd,
        closePopup
    )

    const submitDebtAddAndContinue = () => {
        submitDebtAdd()
        open()
    }

    const handleInputDebtPeriodChange = (value: Dayjs | null) => {
        setInputDebtPeriod(value)
        value &&
            setDueDate(
                dayjs(getDefaultDueDate(value.toDate(), config.daysToPay))
            )
    }

    const open = () => {
        debtAddForm.reset()
        openPopup()
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
        <Form {...debtAddForm} submitAndContinue={submitDebtAddAndContinue}>
            <Stack>
                <DatePicker
                    label={"Период"}
                    value={inputDebtPeriod}
                    onChange={handleInputDebtPeriodChange}
                    views={["month"]}
                    view="month"
                    shouldDisableMonth={periodIsIn(debts.map((x) => x.period))}
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
    )
}

export const DebtsList: UI.DebtList = ({ config, debts, setDebts }) => {
    const [popupOpened, setPopupOpened] = useState<boolean>(false)

    const [isConfirmDeleteOpened, setIsConfirmDeleteOpened] = useState(false)

    const openPopup = () => {
        setPopupOpened(true)
    }

    const closePopup = () => {
        setPopupOpened(false)
    }

    const debtDeleteConfirmDialog = useConfirmDialog({
        id: "debtDeleteConfirm",
        open: isConfirmDeleteOpened,
        onClose: (debt?: Debt) => {
            setIsConfirmDeleteOpened(false)
            if (debt) {
                setDebts(
                    debts.filter(
                        (x) => periodKey(x.period) !== periodKey(debt.period)
                    )
                )
            }
        },
    })

    const popup = usePopup(popupOpened, closePopup)

    const confirmDebtDeleting = (debt: Debt) => {
        debtDeleteConfirmDialog.configure({
            value: debt,
            title: `Удалить долг за ${dayjs(debt.period).format("MMMM YYYY")}?`,
            confirmText: "Да, удалить",
        })
        setIsConfirmDeleteOpened(true)
    }

    return (
        <>
            <Box className="debt-list" component="section">
                <Container maxWidth="md">
                    <Stack direction="row">
                        <Typography>Долги</Typography>
                        <Button
                            title="Добавить"
                            type="button"
                            onClick={openPopup}
                        >
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
                                        deleteDebt={() =>
                                            confirmDebtDeleting(debt)
                                        }
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Typography>
                        Итого: {totalRemainingBalance(debts)} р.
                    </Typography>
                </Container>
            </Box>
            <Popup {...popup}>
                <DebtAddForm
                    config={config}
                    debts={debts}
                    setDebts={setDebts}
                    openPopup={openPopup}
                    closePopup={closePopup}
                />
            </Popup>
            <ConfirmDialog {...debtDeleteConfirmDialog} />
        </>
    )
}

