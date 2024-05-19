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
import { Debt, getRemainingBalance } from "../../../domain/debt"

import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { Form } from "../../components/Form"
import { Input } from "../../components/Input"
import { Popup, usePopup } from "../../components/Popup"
import { useValidatedForm, useValidatedInput } from "../../formValidation"
import { inputDecoders } from "../../validationDecoders"

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
                amount: (debtAmountInput.validatedValue.value) as Kopek,
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

    return (
        <>
            <TableRow className="debt-item-row">
                <TableCell>{dayjs(debt.period).format("MMMM YYYY")}</TableCell>
                <TableCell>{dayjs(debt.dueDate).format("L")}</TableCell>
                <TableCell>{debt.amount}</TableCell>
                <TableCell>{getRemainingBalance(debt)}</TableCell>
                <TableCell>
                    <Stack direction="row">
                        <Button>
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
            <Popup {...editDebtPopup}>
                <DebtEditForm
                    debt={debt}
                    setDebt={setDebt}
                    close={editDebtPopup.close}
                />
            </Popup>
        </>
    )
}

