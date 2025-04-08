import {
    AddOutlined,
    DeleteOutline,
    ExpandMoreOutlined,
    PlaylistAddOutlined,
} from "@mui/icons-material"
import Accordion from "@mui/material/Accordion"
import AccordionDetails from "@mui/material/AccordionDetails"
import AccordionSummary from "@mui/material/AccordionSummary"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import Stack from "@mui/material/Stack"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs, { Dayjs } from "dayjs"
import { useState } from "react"
import {
    Debt,
    DebtPayment,
    debtRepr,
    generateUniqueDebtPaymentId,
    getRemainingBalance,
} from "../../../domain/debt"
import { DistributionMethod } from "../../../domain/distribution-method"
import {
    Payment,
    createPayment,
    paymentRepr,
    toPaymentId,
} from "../../../domain/payment"
import { formatCurrency, formatDateLong, formatPeriod } from "../../../utils"
import { ConfirmDialog, useConfirmDialog } from "../../components/ConfirmDialog"
import { Form } from "../../components/Form"
import { Input } from "../../components/Input"
import { Popup, usePopup } from "../../components/Popup"
import { useValidatedForm, useValidatedInput } from "../../formValidation"
import { inputDecoders } from "../../validationDecoders"
import { PaymentsClipboardLoader } from "../PaymentsClipboardLoader"

type DistributePayments = (
    payment: Payment,
    debts: Debt[],
    method: DistributionMethod
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

function getDebtPaymentsByPayment(
    payment: Payment,
    debts: Debt[]
): Array<{ debt: Debt; debtPayment: DebtPayment }> {
    return debts
        .reduce(
            (acc, debt) =>
                acc.concat(
                    debt.payments
                        .filter(
                            (debtPayment) =>
                                debtPayment.paymentId === payment.id
                        )
                        .map((debtPayment) => ({ debt, debtPayment }))
                ),
            [[]] as Array<{ debt: Debt; debtPayment: DebtPayment }>[]
        )
        .flat()
}

function getTotalAmount(payments: Payment[]): number {
    return payments.reduce((acc, payment) => acc + payment.amount, 0)
}

type PaymentViewProps = {
    payment: Payment
    deletePayment: (payment: Payment) => void
    debts: Debt[]
}

const PaymentView = ({ deletePayment, payment, debts }: PaymentViewProps) => {
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
            confirmText: "Да, удалить!",
        })
        setIsConfirmDeleteOpened(true)
    }

    return (
        <TableRow sx={{ verticalAlign: "baseline" }}>
            <TableCell align="right">
                <Typography variant="body2">{paymentRepr(payment)}</Typography>
            </TableCell>
            <TableCell colSpan={3}>
                <List>
                    {getDebtPaymentsByPayment(payment, debts).map(
                        ({ debt, debtPayment }) =>
                            debtPayment.amount > 0 && (
                                <ListItem
                                    key={generateUniqueDebtPaymentId(
                                        debt,
                                        debtPayment.id
                                    )}
                                    sx={{ padding: 0 }}
                                >
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="baseline"
                                        flexGrow={1}
                                    >
                                        <Typography
                                            variant="body2"
                                            align="right"
                                            flexGrow={0}
                                        >
                                            {formatCurrency(debtPayment.amount)}{" "}
                                            из:
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            flexGrow={1}
                                            align="left"
                                        >
                                            {debtRepr(debt)}
                                        </Typography>
                                    </Stack>
                                </ListItem>
                            )
                    )}
                </List>
            </TableCell>
            <TableCell align="right">
                <IconButton
                    onClick={() => confirmPaymentDeleting(payment)}
                    title={`Удалить оплату от ${formatDateLong(payment.date)}`}
                >
                    <DeleteOutline></DeleteOutline>
                </IconButton>
            </TableCell>
            <ConfirmDialog {...paymentDeleteConfirmDialog} />
        </TableRow>
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
    const [payedPeriod, setPayedPeriod] = useState<Dayjs | null>(null)

    const amountInput = useValidatedInput(
        "",
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

    const [lastDistributeMethod, setLastDistributeMethod] = useState<
        DistributionMethod | undefined
    >(undefined)

    const distribute = (
        date: typeof paymentDate,
        method: DistributionMethod
    ) => {
        if (!date || !amountInput.validatedValue.ok) return

        setDistributedPayments(
            distributePayment(
                createPayment(
                    paymentId,
                    date.toDate(),
                    amountInput.validatedValue.value as Kopek,
                    payedPeriod?.toDate()
                ),
                debts,
                method
            )
        )

        setLastDistributeMethod(method)
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

    const handlePaymentDateChange = (value: typeof paymentDate) => {
        setPaymentDate(() => {
            lastDistributeMethod && distribute(value, lastDistributeMethod)
            return value
        })
    }

    const handlePayedPeriodChange = (value: typeof payedPeriod) => {
        setPayedPeriod(() => {
            lastDistributeMethod && distribute(value, lastDistributeMethod)
            return value
        })
    }

    return (
        <Form {...form} title="Оплата">
            <Stack>
                <Stack direction="row">
                    <DatePicker
                        label="Дата платежа"
                        value={paymentDate}
                        onChange={handlePaymentDateChange}
                    />
                    <DatePicker
                        label="Период (если есть)"
                        value={payedPeriod}
                        onChange={handlePayedPeriodChange}
                        view="month"
                        views={["year", "month"]}
                        openTo="year"
                    />
                </Stack>
                <Input {...amountInput} />
                <Typography variant="h6" align="center">
                    Распределить
                </Typography>
                <Stack direction="row" justifyContent="center">
                    <Button
                        onClick={() => distribute(paymentDate, "fifo")}
                        title="Распределить начиная с самых ранних"
                    >
                        С самых ранних
                    </Button>
                    <Button
                        onClick={() => distribute(paymentDate, "lastIsFirst")}
                        title="Распределить сначала на целевой период, затем с самых ранних"
                    >
                        Сначала целевой
                    </Button>
                </Stack>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow key="AddPaymentForm.head">
                                <TableCell>Период</TableCell>
                                <TableCell>Сумма</TableCell>
                                <TableCell>Остаток</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {distributedPayments.debts.map((debt) => (
                                <TableRow key={debt.period.getTime()}>
                                    <TableCell>
                                        {formatPeriod(debt.period)}
                                    </TableCell>
                                    <TableCell align="right">
                                        {formatCurrency(debt.amount)}
                                    </TableCell>
                                    <TableCell align="right">
                                        {formatCurrency(
                                            getRemainingBalance(debt)
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                {distributedPayments.remainder > 0 && (
                    <Typography align="right">
                        Остаток: {formatCurrency(distributedPayments.remainder)}
                    </Typography>
                )}
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

    // ~~~~~~ add multiple payments form ~~~~~ //

    const [addPaymentsPopupOpened, setAddPaymentsPopupOpened] =
        useState<boolean>(false)

    const addPaymentsPopup = usePopup(addPaymentsPopupOpened, () => {
        setAddPaymentsPopupOpened(false)
    })

    // ~~~~~~~~~~~~~~~ helpers ~~~~~~~~~~~~~~~ //

    const submitMany = (
        distributionMethod: DistributionMethod,
        paymentsList: { date: Date; amount: number; period?: Date }[]
    ) => {
        const newPayments = paymentsList.reduce(
            (acc, { date, amount, period }) =>
                addPayment(
                    acc,
                    createPayment(
                        toPaymentId(
                            `${Date.now().toString(36)}-${Math.random()
                                .toString(36)
                                .slice(2)}`
                        ),
                        date,
                        amount as Kopek,
                        period
                    )
                ),
            [] as Payment[]
        )

        let newDebts = [...debts].map((x) => ({
            ...x,
            payments: [] as DebtPayment[],
        }))

        newPayments.forEach((payment) => {
            const distributedPayment = distributePayment(
                payment,
                newDebts,
                distributionMethod
            )
            newDebts = distributedPayment.debts
        })

        setDebts(newDebts)
        setPayments(newPayments)
    }

    // ~~~~~~~~~~~~~~~~~ jsx ~~~~~~~~~~~~~~~~~ //

    return (
        <>
            <Accordion className="payments" defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                    <Typography component="h2" variant="h6">
                        Оплата
                    </Typography>
                    {payments.length > 0 && (
                        <Typography variant="h6" paddingInlineStart={1}>
                            ({payments.length})
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
                                    setAddPaymentOpened(true)
                                }}
                                sx={{ alignSelf: "flex-start" }}
                                startIcon={<AddOutlined />}
                            >
                                Добавить оплату
                            </Button>
                            <Button
                                title="Загрузить несколько платежей"
                                type="button"
                                onClick={() => {
                                    setAddPaymentsPopupOpened(true)
                                }}
                                startIcon={<PlaylistAddOutlined />}
                            >
                                Загрузить несколько
                            </Button>
                        </Stack>
                        {payments.length > 0 && (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow key={"PaymentsList.head"}>
                                            <TableCell>Оплата</TableCell>
                                            <TableCell colSpan={3}>
                                                Погашает
                                            </TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {payments.map((payment) => (
                                            <PaymentView
                                                key={payment.id}
                                                payment={payment}
                                                deletePayment={() =>
                                                    deletePayment(payment)
                                                }
                                                debts={debts}
                                            />
                                        ))}
                                        <TableRow key="PaymentsList.total">
                                            <TableCell
                                                align="right"
                                                sx={{ border: "none" }}
                                            >
                                                Итого:{" "}
                                                {formatCurrency(
                                                    getTotalAmount(payments)
                                                )}
                                            </TableCell>
                                            <TableCell
                                                colSpan={2}
                                                sx={{ border: "none" }}
                                            ></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
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
            <Popup {...addPaymentsPopup}>
                <PaymentsClipboardLoader
                    submit={submitMany}
                    closePopup={() => {
                        setAddPaymentsPopupOpened(false)
                    }}
                />
            </Popup>
        </>
    )
}

