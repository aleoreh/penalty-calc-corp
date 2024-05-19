import { DeleteOutlined } from "@mui/icons-material"
import CreateOutlined from "@mui/icons-material/CreateOutlined"
import Button from "@mui/material/Button"
import List from "@mui/material/List"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import dayjs from "dayjs"
import { Debt } from "../../../domain/debt"
import { Payment as PaymentType } from "../../../domain/payment"

type PaymentProps = {
    payment: PaymentType
    onDelete: (payment: PaymentType) => void
    onEdit: (payment: PaymentType) => void
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
    payments: Debt["payments"]
    setPayments: (payments: Debt["payments"]) => void
}

export const Payments = ({ payments, setPayments }: Props) => {
    return (
        <Stack direction="row">
            <Typography>Оплачено</Typography>
            <List>
                {payments.map((payment) => (
                    <Payment
                        key={payment.id}
                        payment={payment}
                        onDelete={() => {
                            throw new Error("onDelete's not implemented")
                        }}
                        onEdit={() => {
                            throw new Error("onEdit's not implemented")
                        }}
                    />
                ))}
            </List>
        </Stack>
    )
}
