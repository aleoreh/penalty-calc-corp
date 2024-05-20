import TableRow from "@mui/material/TableRow"

import {
    CreateOutlined,
    DeleteOutline,
    MoneyOutlined,
} from "@mui/icons-material"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import TableCell from "@mui/material/TableCell"
import dayjs, { Dayjs } from "dayjs"
import { useState } from "react"
import debts, { Debt, getRemainingBalance } from "../../../domain/debt"

import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { Form } from "../../components/Form"
import { Input } from "../../components/Input"
import { Popup, usePopup } from "../../components/Popup"
import { useValidatedForm, useValidatedInput } from "../../formValidation"
import { inputDecoders } from "../../validationDecoders"
import { Payments } from "./Payments"
import { Payment } from "../../../domain/payment"

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
    addPayment: (payment: Payment) => void
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

    const addPayment = (payment: Payment) => {
        setDebt(debts.addPayment(payment)(debt))
    }

    // ~~~~~~~~~~~~~~~ payments ~~~~~~~~~~~~~~ //

    const setPayments = () => {
        throw new Error("DebtItemRow.setPayments' not implemented")
    }

    // ~~~~~~~~~~~~~~~~~ jsx ~~~~~~~~~~~~~~~~~ //

    return (
        <>
            <TableRow className="debt-item-row">
                <TableCell>{dayjs(debt.period).format("MMMM YYYY")}</TableCell>
                <TableCell>{dayjs(debt.dueDate).format("L")}</TableCell>
                <TableCell>{debt.amount}</TableCell>
                <TableCell>{getRemainingBalance(debt)}</TableCell>
                <TableCell>
                    <Stack direction="row">
                        <Button onClick={() => setAddPaymentOpened(true)}>
                            <MoneyOutlined></MoneyOutlined>
                        </Button>
                        <Button onClick={() => setEditDebtOpened(true)}>
                            <CreateOutlined></CreateOutlined>
                        </Button>
                        <Button onClick={deleteDebt}>
                            <DeleteOutline></DeleteOutline>
                        </Button>
                    </Stack>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={5}>
                    <Payments debt={debt} setDebt={setDebt} />
                </TableCell>
            </TableRow>
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
        </>
    )
}

