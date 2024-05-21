import { AddOutlined, ExpandMoreOutlined } from "@mui/icons-material"
import Accordion from "@mui/material/Accordion"
import AccordionDetails from "@mui/material/AccordionDetails"
import AccordionSummary from "@mui/material/AccordionSummary"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"
import Table from "@mui/material/Table"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs, { Dayjs } from "dayjs"
import { useState } from "react"
import { Debt, getRemainingBalance } from "../../../domain/debt"
import {
    Payment,
    PaymentBody,
    createPayment,
    toPaymentId,
} from "../../../domain/payment"
import { Form } from "../../components/Form"
import { Input } from "../../components/Input"
import { Popup, usePopup } from "../../components/Popup"
import { useValidatedForm, useValidatedInput } from "../../formValidation"
import { inputDecoders } from "../../validationDecoders"

type DistributePayments = (
    payment: Payment,
    debts: Debt[]
) => { debts: Debt[]; remainder: number }

function addPayment(payments: Payment[], payment: Payment): Payment[] {
    return [...payments, payment]
}

function deletePayment(payments: Payment[], payment: Payment): Payment[] {
    return payments.filter((x) => x.id !== payment.id)
}

function replacePayment(payments: Payment[], payment: Payment): Payment[] {
    return payments.map((x) => (x.id === payment.id ? payment : x))
}

type PaymentViewProps = {
    payment: Payment
}

const PaymentView = ({ payment }: PaymentViewProps) => {
    return (
        <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">
                от {dayjs(payment.date).format("LL")} на {payment.amount}
            </Typography>
        </Stack>
    )
}

type AddPaymentFormProps = {
    debts: Debt[]
    setDebts: (debts: Debt[]) => void
    addPayment: (payment: Payment) => void
    distributePayment: DistributePayments
    close: () => void
}

const AddPaymentForm = ({
    debts,
    setDebts,
    addPayment,
    distributePayment,
    close,
}: AddPaymentFormProps) => {
    const [paymentId] = useState(dayjs().unix())
    const [paymentDate, setPaymentDate] = useState<Dayjs | null>(dayjs())

    const amountInput = useValidatedInput(
        String(0),
        "Сумма платежа",
        inputDecoders.decimal,
        {
            type: "text",
            id: "payment-amount",
            name: "paymentAmount",
        }
    )

    const [distributedPayments, setDistributedPayments] = useState<
        ReturnType<DistributePayments>
    >({
        debts,
        remainder: 0,
    })

    const distribute = () => {
        if (!paymentDate || !amountInput.validatedValue.ok) return

        setDistributedPayments(
            distributePayment(
                createPayment(
                    paymentId,
                    paymentDate.toDate(),
                    amountInput.validatedValue.value as Kopek
                ),
                debts
            )
        )
    }

    const submit = () => {
        amountInput.validatedValue.ok &&
            paymentDate &&
            addPayment({
                id: toPaymentId(paymentId),
                date: paymentDate.toDate(),
                amount: amountInput.validatedValue.value as Kopek,
            })

        setDebts(distributedPayments.debts)
    }

    const form = useValidatedForm([amountInput], submit, close, () => {
        setDistributedPayments({ debts, remainder: 0 })
    })

    return (
        <Form {...form}>
            <Stack>
                <DatePicker
                    label={"Дата платежа"}
                    value={paymentDate}
                    onChange={setPaymentDate}
                />
                <Input {...amountInput} />
                <Button onClick={distribute}>Распределить</Button>
                <TableContainer>
                    <TableHead>
                        <TableRow>
                            <TableCell>Период</TableCell>
                            <TableCell>Сумма</TableCell>
                            <TableCell>Остаток</TableCell>
                        </TableRow>
                    </TableHead>
                    <Table>
                        {distributedPayments.debts.map((debt) => (
                            <TableRow>
                                <TableCell>
                                    {dayjs(debt.period).format("MMMM YYYY")}
                                </TableCell>
                                <TableCell>{debt.amount}</TableCell>
                                <TableCell>
                                    {getRemainingBalance(debt)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </Table>
                </TableContainer>
                <Typography>
                    Не распределено: {distributedPayments.remainder}
                </Typography>
            </Stack>
        </Form>
    )
}

type PaymentsListProps = {
    debts: Debt[]
    setDebts: (debts: Debt[]) => void
    payments: Payment[]
    setPayments: (payments: Payment[]) => void
    distributePayment: DistributePayments
}

export const PaymentsList = ({
    debts,
    setDebts,
    setPayments,
    payments,
    distributePayment,
}: PaymentsListProps) => {
    // ~~~~~~~~~~~ add payment form ~~~~~~~~~~ //

    const [addPaymentOpened, setAddPaymentOpened] = useState(false)

    const addPaymentPopup = usePopup(addPaymentOpened, () => {
        setAddPaymentOpened(false)
    })

    const handleAddPayment = (payment: Payment) => {
        setPayments(addPayment(payments, payment))
    }

    // ~~~~~~~~~~~~~~~~~ jsx ~~~~~~~~~~~~~~~~~ //

    return (
        <>
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                    <Typography component="h2" variant="h6">
                        Платежи
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack>
                        <IconButton
                            title="Добавить"
                            type="button"
                            onClick={() => {
                                setAddPaymentOpened(true)
                            }}
                            sx={{ alignSelf: "flex-end" }}
                        >
                            <AddOutlined></AddOutlined>
                        </IconButton>
                        {payments.map((payment) => (
                            <PaymentView payment={payment} />
                        ))}
                    </Stack>
                </AccordionDetails>
            </Accordion>
            <Popup {...addPaymentPopup}>
                <AddPaymentForm
                    debts={debts}
                    setDebts={setDebts}
                    addPayment={handleAddPayment}
                    distributePayment={distributePayment}
                    close={addPaymentPopup.close}
                />
            </Popup>
        </>
    )
}

