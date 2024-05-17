import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableContainer from "@mui/material/TableContainer"
import TableRow from "@mui/material/TableRow"

import { Debt, getRemainingBalance } from "../../../domain/debt"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import dayjs from "dayjs"

type Props = {
    debt: Debt
}

export const DebtItem = ({ debt }: Props) => {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Период</TableCell>
                        <TableCell>Начало просрочки</TableCell>
                        <TableCell>Долг</TableCell>
                        <TableCell>Остаток</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            {dayjs(debt.period).format("MMMM YYYY")}
                        </TableCell>
                        <TableCell>{dayjs(debt.dueDate).format("L")}</TableCell>
                        <TableCell>{debt.amount}</TableCell>
                        <TableCell>{getRemainingBalance(debt)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}
