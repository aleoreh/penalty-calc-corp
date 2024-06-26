import {
    AddOutlined,
    ExpandMoreOutlined,
    PlaylistAddOutlined,
} from "@mui/icons-material"
import Accordion from "@mui/material/Accordion"
import AccordionDetails from "@mui/material/AccordionDetails"
import AccordionSummary from "@mui/material/AccordionSummary"
import Button from "@mui/material/Button"
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
import { formatCurrency } from "../../../utils"
import { ConfirmDialog } from "../../components/ConfirmDialog"
import { useConfirmDialog } from "../../components/ConfirmDialog/ConfirmDialog"
import { Form } from "../../components/Form"
import { Input } from "../../components/Input"
import { Popup, usePopup } from "../../components/Popup"
import { useValidatedForm, useValidatedInput } from "../../formValidation"
import { UI } from "../../types"
import { inputDecoders } from "../../validationDecoders"
import { DebtsClipboardLoader } from "../DebtsClipboardLoader/DebtsClipboardLoader"
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

function addDebt(
    debts: Debt[],
    inputDebtPeriod: Dayjs,
    daysToPay: number,
    amount: Kopek
): Debt[] {
    const newDebt = createEmptyDebt(inputDebtPeriod.toDate(), daysToPay)
    return [
        ...debts,
        {
            ...newDebt,
            amount,
        },
    ].sort((x, y) => x.period.getTime() - y.period.getTime())
}

function updateDebt(debts: Debt[], debt: Debt): Debt[] {
    return debts.map((x) =>
        periodKey(x.period) === periodKey(debt.period) ? debt : x
    )
}

function deleteDebt(debts: Debt[], debt: Debt): Debt[] {
    return debts.filter((x) => periodKey(x.period) !== periodKey(debt.period))
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
        inputDebtPeriod &&
            debtAmountInput.validatedValue.ok &&
            setDebts(
                addDebt(
                    debts,
                    inputDebtPeriod,
                    config.daysToPay,
                    debtAmountInput.validatedValue.value as Kopek
                )
            )
    }

    const debtAmountInput = useValidatedInput(
        "",
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
        setInputDebtPeriod(inputDebtPeriod?.add(1, "month") || null)
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
        <Form
            {...debtAddForm}
            submitAndContinue={submitDebtAddAndContinue}
            title="Долг"
        >
            <Stack>
                <DatePicker
                    label={"Период"}
                    value={inputDebtPeriod}
                    onChange={handleInputDebtPeriodChange}
                    views={["year", "month"]}
                    view="month"
                    openTo="year"
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
    // ~~~~~~~~~~~~ add debt form ~~~~~~~~~~~~ //

    const [addDebtPopupOpened, setAddDebtPopupOpened] = useState<boolean>(false)

    const addDebtPopup = usePopup(addDebtPopupOpened, () => {
        setAddDebtPopupOpened(false)
    })

    // ~~~~~~~ add multiple debts form ~~~~~~~ //

    const [addDebtsPopupOpened, setAddDebtsPopupOpened] =
        useState<boolean>(false)

    const addDebtsPopup = usePopup(addDebtsPopupOpened, () => {
        setAddDebtsPopupOpened(false)
    })

    // ~~~~~~~~ confirm delete dialog ~~~~~~~~ //

    const [isConfirmDeleteOpened, setIsConfirmDeleteOpened] = useState(false)

    const debtDeleteConfirmDialog = useConfirmDialog({
        id: "debtDeleteConfirm",
        open: isConfirmDeleteOpened,
        onClose: (debt?: Debt) => {
            setIsConfirmDeleteOpened(false)
            debt && setDebts(deleteDebt(debts, debt))
        },
    })

    const confirmDebtDeleting = (debt: Debt) => {
        debtDeleteConfirmDialog.configure({
            value: debt,
            title: `Удалить долг за ${dayjs(debt.period).format("MMMM YYYY")}?`,
            confirmText: "Да, удалить!",
        })
        setIsConfirmDeleteOpened(true)
    }

    // ~~~~~~~~~~~~~~~ helpers ~~~~~~~~~~~~~~~ //

    const setDebt = (debt: Debt) => {
        setDebts(updateDebt(debts, debt))
    }

    const submitMany = (debtsList: { period: Date; amount: number }[]) => {
        const newDebts = debtsList.reduce(
            (acc, { period, amount }) =>
                addDebt(acc, dayjs(period), config.daysToPay, amount as Kopek),
            [] as Debt[]
        )
        setDebts(newDebts)
    }

    // ~~~~~~~~~~~~~~~~~ jsx ~~~~~~~~~~~~~~~~~ //

    return (
        <>
            <Accordion className="debts-list" defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                    <Typography component="h2" variant="h6">
                        Долги
                    </Typography>
                    {debts.length > 0 && (
                        <Typography variant="h6" paddingInlineStart={1}>
                            ({debts.length})
                        </Typography>
                    )}
                </AccordionSummary>
                <AccordionDetails>
                    <Stack>
                        <Stack direction="row">
                            <Button
                                title="Добавить"
                                type="button"
                                onClick={() => {
                                    setAddDebtPopupOpened(true)
                                }}
                                startIcon={<AddOutlined />}
                            >
                                Добавить долг
                            </Button>
                            <Button
                                title="Загрузить несколько долгов"
                                type="button"
                                onClick={() => {
                                    setAddDebtsPopupOpened(true)
                                }}
                                startIcon={<PlaylistAddOutlined />}
                            >
                                Загрузить несколько
                            </Button>
                        </Stack>
                        <TableContainer>
                            <Table>
                                {debts.length > 0 && (
                                    <TableHead>
                                        <TableRow key="DebtsList.head">
                                            <TableCell>Период</TableCell>
                                            <TableCell>
                                                Начало просрочки
                                            </TableCell>
                                            <TableCell>Долг</TableCell>
                                            <TableCell>Погашение</TableCell>
                                            <TableCell>Остаток</TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableHead>
                                )}
                                <TableBody>
                                    {debts.map((debt) => (
                                        <DebtItemRow
                                            key={periodKey(debt.period)}
                                            debt={debt}
                                            setDebt={setDebt}
                                            deleteDebt={() =>
                                                confirmDebtDeleting(debt)
                                            }
                                        />
                                    ))}
                                    {totalRemainingBalance(debts) > 0 && (
                                        <TableRow key="DebtsList.total">
                                            <TableCell
                                                colSpan={3}
                                                sx={{ border: "none" }}
                                            ></TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{
                                                    border: "none",
                                                }}
                                            >
                                                Итого:
                                            </TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{
                                                    border: "none",
                                                }}
                                            >
                                                {formatCurrency(
                                                    totalRemainingBalance(debts)
                                                )}
                                            </TableCell>
                                            <TableCell
                                                sx={{ border: "none" }}
                                            ></TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Stack>
                </AccordionDetails>
            </Accordion>
            <Popup {...addDebtPopup}>
                <DebtAddForm
                    config={config}
                    debts={debts}
                    setDebts={setDebts}
                    openPopup={() => {
                        setAddDebtPopupOpened(true)
                    }}
                    closePopup={() => {
                        setAddDebtPopupOpened(false)
                    }}
                />
            </Popup>
            <Popup {...addDebtsPopup}>
                <DebtsClipboardLoader
                    submit={submitMany}
                    closePopup={() => {
                        setAddDebtsPopupOpened(false)
                    }}
                />
            </Popup>
            <ConfirmDialog {...debtDeleteConfirmDialog} />
        </>
    )
}

