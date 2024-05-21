import {
    AddOutlined,
    DeleteOutline,
    ExpandMoreOutlined,
} from "@mui/icons-material"
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
import { Payment, createPayment, toPaymentId } from "../../../domain/payment"
import { ConfirmDialog, useConfirmDialog } from "../../components/ConfirmDialog"
import { Form } from "../../components/Form"
import { Input } from "../../components/Input"
import { Popup, usePopup } from "../../components/Popup"
import { useValidatedForm, useValidatedInput } from "../../formValidation"
import { inputDecoders } from "../../validationDecoders"

type DistributeMethod = "fifo" | "lastIsFirst"

type DistributePayments = (
    payment: Payment,
    debts: Debt[],
    method: DistributeMethod
) => { debts: Debt[]; remainder: number }

function addPayment(payments: Payment[], payment: Payment): Payment[] {
    return [...payments, payment]
}

export function deletePayment(
    payments: Payment[],
    payment: Payment
): Payment[] {
    return payments.filter((x) => x.id !== payment.id)
}

function replacePayment(payments: Payment[], payment: Payment): Payment[] {
    return payments.map((x) => (x.id === payment.id ? payment : x))
}

type PaymentViewProps = {
    payment: Payment
    deletePayment: (payment: Payment) => void
}

const PaymentView = ({ deletePayment, payment }: PaymentViewProps) => {
    // ~~~~~~~~ confirm delete dialog ~~~~~~~~ //

    const [isConfirmDeleteOpened, setIsConfirmDeleteOpened] = useState(false)

    const paymentDeleteConfirmDialog = useConfirmDialog({
        id: "paymentDeleteConfirm",
        open: isConfirmDeleteOpened,
        onClose: (payment?: Payment) => {
            setIsConfirmDeleteOpened(false)
            payment && deletePayment(payment)
        },
    })

    const confirmPaymentDeleting = (payment: Payment) => {
        paymentDeleteConfirmDialog.configure({
            value: payment,
            title: `Удалить платёж от ${dayjs(payment.date).format(
                "LL"
            )} на сумму ${payment.amount}?`,
            confirmText: "Да, удалить",
        })
        setIsConfirmDeleteOpened(true)
    }

    return (
        <>
            <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">
                    от {dayjs(payment.date).format("LL")} на {payment.amount}
                </Typography>
                <IconButton onClick={() => confirmPaymentDeleting(payment)}>
                    <DeleteOutline></DeleteOutline>
                </IconButton>
            </Stack>
            <ConfirmDialog {...paymentDeleteConfirmDialog} />
        </>
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

    const distribute = (method: DistributeMethod) => () => {
        if (!paymentDate || !amountInput.validatedValue.ok) return

        setDistributedPayments(
            distributePayment(
                createPayment(
                    paymentId,
                    paymentDate.toDate(),
                    amountInput.validatedValue.value as Kopek
                ),
                debts,
                method
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
                <Typography>Распределить</Typography>
                <Stack direction="row">
                    <Button
                        onClick={distribute("fifo")}
                        title="Распределить начиная с самых ранних"
                    >
                        С самых ранних
                    </Button>
                    <Button
                        onClick={distribute("lastIsFirst")}
                        title="Распределить сначала на последний долг, затем с самых ранних"
                    >
                        Сначала последний
                    </Button>
                </Stack>
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
    deletePayment: (payment: Payment) => void
    distributePayment: DistributePayments
}

export const PaymentsList = ({
    debts,
    setDebts,
    setPayments,
    payments,
    deletePayment,
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
                            <PaymentView
                                payment={payment}
                                deletePayment={() => deletePayment(payment)}
                            />
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
