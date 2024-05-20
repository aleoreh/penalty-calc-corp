import { DeleteOutlined } from "@mui/icons-material"
import CreateOutlined from "@mui/icons-material/CreateOutlined"
import Button from "@mui/material/Button"
import List from "@mui/material/List"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs, { Dayjs } from "dayjs"
import { useState } from "react"
import {
    Debt,
    DebtPayment,
    removePayment,
    updatePayment,
} from "../../../domain/debt"
import { ConfirmDialog } from "../../components/ConfirmDialog"
import { useConfirmDialog } from "../../components/ConfirmDialog/ConfirmDialog"
import { Form } from "../../components/Form"
import { Input } from "../../components/Input"
import { Popup, usePopup } from "../../components/Popup"
import { useValidatedForm, useValidatedInput } from "../../formValidation"
import { inputDecoders } from "../../validationDecoders"

type PaymentProps = {
    payment: DebtPayment
    setPayment: (payment: DebtPayment) => void
    onDelete: (payment: DebtPayment) => void
}

const Payment = ({ payment, setPayment, onDelete }: PaymentProps) => {
    // ~~~~~~~~~ payment edit dialog ~~~~~~~~~ //

    const [paymentEditPopupOpened, setPaymentEditPopupOpened] = useState(false)

    const paymentEditPopup = usePopup(paymentEditPopupOpened, () => {
        setPaymentEditPopupOpened(false)
    })

    return (
        <>
            <Stack className="payment" direction="row">
                <Typography>{dayjs(payment.date).format("LL")}</Typography>
                <Typography>{payment.amount}</Typography>
                <Button onClick={() => onDelete(payment)}>
                    <DeleteOutlined></DeleteOutlined>
                </Button>
                <Button onClick={() => setPaymentEditPopupOpened(true)}>
                    <CreateOutlined></CreateOutlined>
                </Button>
            </Stack>
            <Popup {...paymentEditPopup}>
                <PaymentEditForm
                    payment={payment}
                    setPayment={setPayment}
                    close={paymentEditPopup.close}
                />
            </Popup>
        </>
    )
}

type PaymentEditFormProps = {
    payment: DebtPayment
    setPayment: (payment: DebtPayment) => void
    close: () => void
}

const PaymentEditForm = ({
    payment,
    setPayment,
    close,
}: PaymentEditFormProps) => {
    const [paymentDate, setPaymentDate] = useState<Dayjs | null>(dayjs())

    const amountInput = useValidatedInput(
        String(payment.amount),
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
            setPayment({
                ...payment,
                date: paymentDate.toDate(),
                amount: amountInput.validatedValue.value as Kopek,
            })
    }

    const form = useValidatedForm([amountInput], submit, close)

    // ~~~~~~~~~~~~~~~~~ jsx ~~~~~~~~~~~~~~~~~ //

    return (
        <>
            <Form {...form}>
                <Stack>
                    <DatePicker
                        label="Дата оплаты"
                        value={paymentDate}
                        onChange={setPaymentDate}
                    />
                    <Input {...amountInput} />
                </Stack>
            </Form>
        </>
    )
}

type Props = {
    debt: Debt
    setDebt: (debt: Debt) => void
}

export const Payments = ({ debt, setDebt }: Props) => {
    // ~~~~~~~~ payment delete confirm ~~~~~~~ //

    const [paymentDeleteConfirmIsOpened, setPaymentDeleteConfirmIsOpened] =
        useState(false)

    const paymentDeleteConfirm = useConfirmDialog({
        id: "paymentDeleteConfirm",
        open: paymentDeleteConfirmIsOpened,
        onClose: (payment?: Debt["payments"][number]) => {
            setPaymentDeleteConfirmIsOpened(false)
            payment && setDebt(removePayment(payment.id)(debt))
        },
    })

    const onPaymentDelete = (payment: DebtPayment) => {
        paymentDeleteConfirm.configure({
            value: payment,
            title: `Удалить оплату от ${dayjs(payment.date).format(
                "L"
            )} на сумму ${payment.amount} р.?`,
            confirmText: "Да, удалить!",
        })
        setPaymentDeleteConfirmIsOpened(true)
    }

    // ~~~~~~~~~~~~~~~ helpers ~~~~~~~~~~~~~~~ //

    const setPayment = (payment: DebtPayment) => {
        setDebt(updatePayment(payment)(debt))
    }

    // ~~~~~~~~~~~~~~~~~ jsx ~~~~~~~~~~~~~~~~~ //

    return (
        <>
            <Stack className="payments" direction="row">
                <Typography>Оплачено</Typography>
                <List>
                    {debt.payments.map((payment) => (
                        <Payment
                            key={payment.id}
                            payment={payment}
                            setPayment={setPayment}
                            onDelete={onPaymentDelete}
                        />
                    ))}
                </List>
            </Stack>
            <ConfirmDialog {...paymentDeleteConfirm} />
        </>
    )
}

