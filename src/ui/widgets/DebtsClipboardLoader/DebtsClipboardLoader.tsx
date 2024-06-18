import dayjs from "dayjs"
import * as D from "decoders"
import { useEffect, useState } from "react"
import DataGrid from "react-data-grid"
import { Form } from "../../components/Form"
import { useValidatedForm } from "../../formValidation"
import { inputDecoders } from "../../validationDecoders"

type TableRowData = {
    period: Date
    amount: number
}

const columns = [
    { key: "period", name: "Период", editable: false },
    { key: "amount", name: "Сумма", editable: false },
]

const clipboardToRows = (clipboard: string): D.DecodeResult<TableRowData[]> => {
    const rowDecoder = D.tuple(inputDecoders.monthYear, inputDecoders.decimal)

    const lines = clipboard
        .trim()
        .split("\n")
        .map((x) => x.trim())
        .map((line) => line.split("\t"))

    return D.array(rowDecoder)
        .transform((xs) =>
            xs.map(([period, amount]) => ({
                period,
                amount,
            }))
        )
        .decode(lines)
}

type DebtsClipboardLoaderProps = {
    submit: (rows: TableRowData[]) => void
    closePopup: () => void
}

export const DebtsClipboardLoader = ({
    submit,
    closePopup,
}: DebtsClipboardLoaderProps) => {
    const [rows, setRows] = useState<TableRowData[]>([])

    useEffect(() => {
        document.addEventListener("paste", handlePaste)
        return () => {
            document.removeEventListener("paste", handlePaste)
        }
    }, [])

    const handlePaste = (evt: ClipboardEvent) => {
        evt.preventDefault()

        const clipboard = evt.clipboardData?.getData("text/plain")

        if (!clipboard) return

        const res = clipboardToRows(clipboard)

        res.ok && setRows(res.value)
    }

    const form = useValidatedForm(
        [],
        () => submit(rows),
        closePopup,
        () => setRows([])
    )

    return (
        <Form {...form} title="Добавить несколько долгов">
            <DataGrid
                columns={columns}
                rows={rows.map((row) => ({
                    ...row,
                    period: dayjs(row.period).format("YYYY MMMM"),
                }))}
            />
        </Form>
    )
}
