import TableRow from "@mui/material/TableRow"

import {
    CreateOutlined,
    DeleteOutline,
    MoneyOutlined,
} from "@mui/icons-material"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"
import TableCell from "@mui/material/TableCell"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs, { Dayjs } from "dayjs"
import { useState } from "react"
import {
    Debt,
    DebtPaymentBody,
    getRemainingBalance,
    paymentsAmount,
    periodKey,
} from "../../../domain/debt"
import { formatCurrency, formatDateLong, formatPeriod } from "../../../utils"
import { Form } from "../../components/Form"
import { Input } from "../../components/Input"
import { Popup, usePopup } from "../../components/Popup"
import { useValidatedForm, useValidatedInput } from "../../formValidation"
import { inputDecoders } from "../../validationDecoders"
import { DebtPayments } from "./DebtsPayments"
import Typography from "@mui/material/Typography"

type DebtEditFormProps = {
    debt: Debt
    setDebt: (debt: Debt) => void
    close: () => void
}

const DebtEditForm = ({ debt, setDebt, close }: DebtEditFormProps) => {
    const [dueDate, setDueDate] = useState<Dayjs | null>(dayjs())

    const debtAmountInput = useValidatedInput(
        String(debt.amount),
        "Сумма долга",
        inputDecoders.decimal,
        {
            type: "text",
            id: "debt-amount",
            name: "debtAmount",
        }
    )

    const submit = () => {
        debtAmountInput.validatedValue.ok &&
            dueDate &&
            setDebt({
                ...debt,
                amount: debtAmountInput.validatedValue.value as Kopek,
                dueDate: dueDate.toDate(),
            })
    }

    const form = useValidatedForm([debtAmountInput], submit, close)

    return (
        <Form {...form}>
            <Stack>
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

type AddPaymentFormProps = {
    addPayment: (payment: DebtPaymentBody) => void
    close: () => void
}

const AddPaymentForm = ({ addPayment, close }: AddPaymentFormProps) => {
    const [paymentDate, setPaymentDate] = useState<Dayjs | null>(dayjs())

    const amountInput = useValidatedInput(
        String(0),
        "Сумма оплаты",
        inputDecoders.decimal,
        {
            type: "text",
            id: "payment-amount",
            name: "paymentAmount",
        }
    )

    const submit = () => {
        amountInput.validatedValue.ok &&
            paymentDate &&
            addPayment({
                date: paymentDate.toDate(),
                amount: amountInput.validatedValue.value as Kopek,
            })
    }

    const form = useValidatedForm([amountInput], submit, close)

    return (
        <Form {...form}>
            <Stack>
                <DatePicker
                    label={"Дата оплаты"}
                    value={paymentDate}
                    onChange={setPaymentDate}
                />
                <Input {...amountInput} />
            </Stack>
        </Form>
    )
}

type Props = {
    debt: Debt
    setDebt: (debt: Debt) => void
    deleteDebt: () => void
}

export const DebtItemRow = ({ debt, setDebt, deleteDebt }: Props) => {
    // ~~~~~~~~~~~~~~ edit form ~~~~~~~~~~~~~~ //

    const [editDebtOpened, setEditDebtOpened] = useState(false)

    const editDebtPopup = usePopup(editDebtOpened, () => {
        setEditDebtOpened(false)
    })

    // ~~~~~~~~~~~ add payment form ~~~~~~~~~~ //

    const [addPaymentOpened, setAddPaymentOpened] = useState(false)

    const addPaymentPopup = usePopup(addPaymentOpened, () => {
        setAddPaymentOpened(false)
    })

    const addPayment = (payment: DebtPaymentBody) => {
        // setDebt(debts.addPayment(payment)(debt))
    }

    // ~~~~~~~~~~~~~~~~~ jsx ~~~~~~~~~~~~~~~~~ //

    return (
        <TableRow
            key={periodKey(debt.period)}
            className="debt-item-row"
            sx={{ verticalAlign: "baseline" }}
        >
            <TableCell>{formatPeriod(debt.period)}</TableCell>
            <TableCell>{formatDateLong(debt.dueDate)}</TableCell>
            <TableCell align="right">{formatCurrency(debt.amount)}</TableCell>
            <TableCell>
                {paymentsAmount(debt) > 0 ? (
                    <DebtPayments debt={debt} setDebt={setDebt} />
                ) : (
                    <Typography align="center">-</Typography>
                )}
            </TableCell>
            <TableCell align="right">
                {formatCurrency(getRemainingBalance(debt))}
            </TableCell>
            <TableCell>
                <Stack direction="row" gap={0} justifyContent="flex-end">
                    <IconButton
                        onClick={() => setAddPaymentOpened(true)}
                        sx={{ display: "none" }}
                    >
                        <MoneyOutlined></MoneyOutlined>
                    </IconButton>
                    <IconButton
                        onClick={() => setEditDebtOpened(true)}
                        sx={{ display: "none" }}
                    >
                        <CreateOutlined></CreateOutlined>
                    </IconButton>
                    <IconButton
                        onClick={deleteDebt}
                        title={`Удалить долг за ${formatPeriod(debt.period)}`}
                    >
                        <DeleteOutline></DeleteOutline>
                    </IconButton>
                </Stack>
            </TableCell>
            <Popup {...editDebtPopup}>
                <DebtEditForm
                    debt={debt}
                    setDebt={setDebt}
                    close={editDebtPopup.close}
                />
            </Popup>
            <Popup {...addPaymentPopup}>
                <AddPaymentForm
                    addPayment={addPayment}
                    close={addPaymentPopup.close}
                />
            </Popup>
        </TableRow>
    )
}

