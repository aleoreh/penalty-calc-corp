import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs, { Dayjs } from "dayjs"
import { useState } from "react"
import { CalculatorConfig } from "../../../domain/calculator-config"
import {
    Debt,
    addDebtPayment,
    createDebtPayment,
    getRemainingBalance,
    periodKey,
    removePayment,
    updatePayment,
} from "../../../domain/debt"
import { Payment } from "../../../domain/payment"
import { ConfirmDialog, useConfirmDialog } from "../../components/ConfirmDialog"
import { UI } from "../../types"
import { CalculationResults } from "../CalculationResults"
import { DebtsList } from "../DebtsList/DebtsList"
import {
    PaymentsList,
    deletePayment as deletePaymentFromPayments,
} from "../PaymentsList"
import { CalculatorSettings } from "./CalculatorSettings"

function deletePayment(
    payment: Payment,
    payments: Payment[],
    debts: Debt[]
): [Payment[], Debt[]] {
    const nextPayments = deletePaymentFromPayments(payments, payment)
    const nextDebts = debts.map((debt) => removePayment(payment.id)(debt))
    return [nextPayments, nextDebts]
}

function updateDebt(debts: Debt[], debt: Debt): Debt[] {
    return debts.map((x) =>
        periodKey(x.period) === periodKey(debt.period) ? debt : x
    )
}

function distributePayment(
    payment: Payment,
    debts: Debt[],
    method: "fifo" | "lastIsFirst"
): { debts: Debt[]; remainder: number } {
    if (debts.length === 0) return { debts, remainder: payment.amount }

    const sorter = (d1: Debt, d2: Debt) =>
        d1.period.getTime() - d2.period.getTime()

    const sortedDebts =
        method === "fifo"
            ? [...debts].sort(sorter)
            : debts.slice(-1).concat(debts.slice(0, -1).sort(sorter))

    return sortedDebts.reduce(
        ({ debts, remainder }, debt) => {
            if (remainder === 0) return { debts, remainder }

            const debtRemainingBalance = getRemainingBalance(debt)
            const [debtPaymentAmount, nextRemainder] =
                remainder < debtRemainingBalance
                    ? [remainder, 0 as Kopek]
                    : [
                          debtRemainingBalance as Kopek,
                          (remainder - debtRemainingBalance) as Kopek,
                      ]

            const foundDebtPayment = debt.payments.find(
                (x) => x.paymentId === payment.id
            )

            const updatedDebt =
                foundDebtPayment !== undefined
                    ? updatePayment({
                          ...foundDebtPayment,
                          amount: debtPaymentAmount,
                      })(debt)
                    : addDebtPayment(
                          payment.id,
                          createDebtPayment(payment.date, debtPaymentAmount)
                      )(debt)

            const nextDebts = updateDebt(debts, updatedDebt)

            return { debts: nextDebts, remainder: nextRemainder as Kopek }
        },
        {
            debts,
            remainder: payment.amount,
        }
    )
}

export const Calculator: UI.Calculator = ({
    defaultCalculationDate,
    defaultConfig,
    startCalculation,
    calculationResults,
    clearCalculationResults,
}) => {
    const [calculationDate, setCalculationDate] = useState<Dayjs | null>(
        dayjs(defaultCalculationDate)
    )
    const [config, setConfig] = useState<CalculatorConfig>(defaultConfig)
    const [debts, setDebts] = useState<Debt[]>([])
    const [payments, setPayments] = useState<Payment[]>([])

    // ~~~~~~~~~~~~ clear confirm ~~~~~~~~~~~~ //

    const [clearConfirmOpened, setClearConfirmOpened] = useState(false)

    const clearConfirm = useConfirmDialog({
        id: "clearConfirm",
        open: clearConfirmOpened,
        onClose: (debts?: Debt[]) => {
            setClearConfirmOpened(false)

            if (debts !== undefined) {
                setDebts([])
                setPayments([])
                clearCalculationResults()
            }
        },
    })

    const onCalculationClear = () => {
        clearConfirm.configure({
            value: debts,
            title: "Очистить расчёт?",
            confirmText: "Да, очистить!",
        })
        setClearConfirmOpened(true)
    }

    // ~~~~~~~~~~~~~~~ helpers ~~~~~~~~~~~~~~~ //

    const calculate = () => {
        startCalculation(
            calculationDate?.toDate() || defaultCalculationDate,
            config,
            debts
        )
    }

    const onPaymentDelete = (payment: Payment) => {
        const [newPayments, newDebts] = deletePayment(payment, payments, debts)
        setDebts(newDebts)
        setPayments(newPayments)
    }

    // ~~~~~~~~~~~~~~~~~ jsx ~~~~~~~~~~~~~~~~~ //

    return (
        <Stack className="calculator">
            <CalculatorSettings
                calculationDate={
                    calculationDate?.toDate() || defaultCalculationDate
                }
                config={config}
                setConfig={setConfig}
                defaultConfig={defaultConfig}
            />
            <DatePicker
                label="Дата расчета"
                value={calculationDate}
                onChange={setCalculationDate}
                sx={{ alignSelf: "flex-start" }}
            />
            <DebtsList config={config} debts={debts} setDebts={setDebts} />
            <PaymentsList
                debts={debts}
                setDebts={setDebts}
                payments={payments}
                setPayments={setPayments}
                deletePayment={onPaymentDelete}
                distributePayment={distributePayment}
            />
            <Stack direction="row" justifyContent="space-between">
                <Button variant="outlined" onClick={onCalculationClear}>
                    Очистить расчёт
                </Button>
                <Button variant="contained" onClick={calculate}>
                    Рассчитать
                </Button>
            </Stack>
            {calculationResults.length > 0 && (
                <CalculationResults
                    calculationDate={
                        calculationDate || dayjs(defaultCalculationDate)
                    }
                    calculationResults={calculationResults}
                />
            )}
            <ConfirmDialog {...clearConfirm} />
        </Stack>
    )
}

