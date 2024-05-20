import { DeleteOutlined } from "@mui/icons-material"
import CreateOutlined from "@mui/icons-material/CreateOutlined"
import Button from "@mui/material/Button"
import List from "@mui/material/List"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import dayjs from "dayjs"
import { useState } from "react"
import { Debt, DebtPayment, removePayment } from "../../../domain/debt"
import { ConfirmDialog } from "../../components/ConfirmDialog"
import { useConfirmDialog } from "../../components/ConfirmDialog/ConfirmDialog"

type PaymentProps = {
    payment: DebtPayment
    onDelete: (payment: DebtPayment) => void
    onEdit: (payment: DebtPayment) => void
}

const Payment = ({ payment, onDelete, onEdit }: PaymentProps) => {
    return (
        <Stack direction="row">
            <Typography>{dayjs(payment.date).format("LL")}</Typography>
            <Typography>{payment.amount}</Typography>
            <Button onClick={() => onDelete(payment)}>
                <DeleteOutlined></DeleteOutlined>
            </Button>
            <Button onClick={() => onEdit(payment)}>
                <CreateOutlined></CreateOutlined>
            </Button>
        </Stack>
    )
}

type Props = {
    debt: Debt
    setDebt: (debt: Debt) => void
}

export const Payments = ({ debt, setDebt }: Props) => {
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

    return (
        <>
            <Stack direction="row">
                <Typography>Оплачено</Typography>
                <List>
                    {debt.payments.map((payment) => (
                        <Payment
                            key={payment.id}
                            payment={payment}
                            onDelete={onPaymentDelete}
                            onEdit={() => {
                                throw new Error("onEdit's not implemented")
                            }}
                        />
                    ))}
                </List>
            </Stack>
            <ConfirmDialog {...paymentDeleteConfirm} />
        </>
    )
}

