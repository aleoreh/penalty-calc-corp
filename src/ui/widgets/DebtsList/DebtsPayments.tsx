import { DeleteOutlined } from "@mui/icons-material"
import CreateOutlined from "@mui/icons-material/CreateOutlined"
import IconButton from "@mui/material/IconButton"
import List from "@mui/material/List"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs, { Dayjs } from "dayjs"
import { useState } from "react"
import {
    Debt,
    DebtPayment as DebtPaymentType,
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

type DebtPaymentProps = {
    payment: DebtPaymentType
    setPayment: (payment: DebtPaymentType) => void
    onDelete: (payment: DebtPaymentType) => void
}

const DebtPayment = ({ payment, setPayment, onDelete }: DebtPaymentProps) => {
    // ~~~~~~~~~ payment edit dialog ~~~~~~~~~ //

    const [paymentEditPopupOpened, setPaymentEditPopupOpened] = useState(false)

    const paymentEditPopup = usePopup(paymentEditPopupOpened, () => {
        setPaymentEditPopupOpened(false)
    })

    return (
        <>
            <Stack
                className="debt-payment"
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
            >
                <Typography variant="body2">
                    {dayjs(payment.date).format("LL")}
                </Typography>
                <Typography variant="body2">{payment.amount}</Typography>
                <IconButton onClick={() => onDelete(payment)}>
                    <DeleteOutlined></DeleteOutlined>
                </IconButton>
                <IconButton onClick={() => setPaymentEditPopupOpened(true)}>
                    <CreateOutlined></CreateOutlined>
                </IconButton>
            </Stack>
            <Popup {...paymentEditPopup}>
                <DebtPaymentEditForm
                    payment={payment}
                    setPayment={setPayment}
                    close={paymentEditPopup.close}
                />
            </Popup>
        </>
    )
}

type DebtPaymentEditFormProps = {
    payment: DebtPaymentType
    setPayment: (payment: DebtPaymentType) => void
    close: () => void
}

const DebtPaymentEditForm = ({
    payment,
    setPayment,
    close,
}: DebtPaymentEditFormProps) => {
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

export const DebtPayments = ({ debt, setDebt }: Props) => {
    // ~~~~~~~~ payment delete confirm ~~~~~~~ //

    const [paymentDeleteConfirmIsOpened, setPaymentDeleteConfirmIsOpened] =
        useState(false)

    const paymentDeleteConfirm = useConfirmDialog({
        id: "paymentDeleteConfirm",
        open: paymentDeleteConfirmIsOpened,
        onClose: (payment?: Debt["payments"][number]) => {
            setPaymentDeleteConfirmIsOpened(false)
            payment && setDebt(removePayment(payment.paymentId)(debt))
        },
    })

    const onPaymentDelete = (payment: DebtPaymentType) => {
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

    const setPayment = (payment: DebtPaymentType) => {
        setDebt(updatePayment(payment)(debt))
    }

    // ~~~~~~~~~~~~~~~~~ jsx ~~~~~~~~~~~~~~~~~ //

    return (
        <>
            <Stack
                className="debt-payments"
                direction="row"
                justifyContent="flex-end"
                alignItems="flex-start"
            >
                <Typography variant="body2">Зачтено:</Typography>
                <List>
                    {debt.payments.map((payment) => (
                        <DebtPayment
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

