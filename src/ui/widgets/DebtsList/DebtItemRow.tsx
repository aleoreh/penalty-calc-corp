import TableRow from "@mui/material/TableRow"

import TableCell from "@mui/material/TableCell"
import dayjs from "dayjs"
import { Debt, getRemainingBalance } from "../../../domain/debt"
import Stack from "@mui/material/Stack"
import Button from "@mui/material/Button"
import {
    CreateOutlined,
    DeleteOutline,
    MoneyOutlined,
} from "@mui/icons-material"

type Props = {
    debt: Debt
    setDebt?: (debt: Debt) => () => void
    deleteDebt?: (debt: Debt) => () => void
}

export const DebtItemRow = ({ debt, setDebt, deleteDebt }: Props) => {
    return (
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
                    <Button>
                        <CreateOutlined></CreateOutlined>
                    </Button>
                    <Button onClick={deleteDebt?.(debt)}>
                        <DeleteOutline></DeleteOutline>
                    </Button>
                </Stack>
            </TableCell>
        </TableRow>
    )
}

