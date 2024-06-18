import dayjs from "dayjs"
import * as D from "decoders"
import { useEffect, useState } from "react"
import DataGrid from "react-data-grid"
import { Form } from "../../components/Form"
import { useValidatedForm } from "../../formValidation"
import { inputDecoders } from "../../validationDecoders"

type TableRowData = {
    date: Date
    amount: number
    period?: Date
}

const columns = [
    { key: "date", name: "Дата", editable: false },
    { key: "amount", name: "Сумма", editable: false },
    { key: "period", name: "Период", editable: false },
]

const clipboardToRows = (clipboard: string): D.DecodeResult<TableRowData[]> => {
    const rowDecoder = D.either(
        D.tuple(
            inputDecoders.date,
            inputDecoders.decimal,
            inputDecoders.monthYear
        ),
        D.tuple(inputDecoders.date, inputDecoders.decimal).transform(
            ([date, amount]) =>
                [date, amount, undefined] as [Date, number, Date | undefined]
        )
    )

    const lines = clipboard
        .trim()
        .split("\n")
        .map((x) => x.trim())
        .map((line) => line.split("\t"))

    return D.array(rowDecoder)
        .transform((xs) =>
            xs.map(([date, amount, period]) => ({
                date,
                amount,
                period,
            }))
        )
        .decode(lines)
}

type PaymentsClipboardLoaderProps = {
    submit: (rows: TableRowData[]) => void
    closePopup: () => void
}

export const PaymentsClipboardLoader = ({
    submit,
    closePopup,
}: PaymentsClipboardLoaderProps) => {
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
        <Form {...form} title="Добавить платежи">
            <DataGrid
                columns={columns}
                rows={rows.map((row) => ({
                    ...row,
                    date: dayjs(row.date).format("DD.MM.YYYY"),
                    period: row.period
                        ? dayjs(row.period).format("YYYY MMMM")
                        : undefined,
                }))}
            />
        </Form>
    )
}
