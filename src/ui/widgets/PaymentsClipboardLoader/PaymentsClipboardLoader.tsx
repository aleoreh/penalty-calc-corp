import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
} from "@mui/material"
import Snackbar from "@mui/material/Snackbar"
import Typography from "@mui/material/Typography"
import dayjs from "dayjs"
import * as D from "decoders"
import { useEffect, useState } from "react"
import DataGrid from "react-data-grid"
import { DistributionMethod } from "../../../domain/distribution-method"
import { Form } from "../../components/Form"
import { useValidatedForm } from "../../formValidation"
import { inputDecoders } from "../../validationDecoders"
import Debug from "../../../debug-log.debug"

type TableRowData = {
    date: Date
    amount: number
    period?: Date
}

const columns = [
    { key: "date", name: "Дата*", editable: false },
    { key: "amount", name: "Сумма*", editable: false },
    { key: "period", name: "Период", editable: false },
]

const clipboardToRows = (clipboard: string): D.DecodeResult<TableRowData[]> => {
    const rowDecoder = D.either(
        D.tuple(
            inputDecoders.date,
            inputDecoders.decimal,
            inputDecoders.fullMonth_year
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
        .map((xs) => xs.filter((x) => x.trim().length > 0))

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
    submit: (
        distributionMethod: DistributionMethod,
        rows: TableRowData[]
    ) => void
    closePopup: () => void
}

export const PaymentsClipboardLoader = ({
    submit,
    closePopup,
}: PaymentsClipboardLoaderProps) => {
    const [pasteError, setPasteError] = useState<string | null>(null)
    const [rows, setRows] = useState<TableRowData[]>([])
    const [distributionMethod, setDistributionMethod] =
        useState<DistributionMethod>("fifo")

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

        if (res.ok) {
            setPasteError(null)
            setRows(res.value)
        } else {
            setPasteError("Не удалось вставить данные из буфера обмена")
            console.error(JSON.stringify(res.error, undefined, 2))
            setRows([])
        }
    }

    const form = useValidatedForm(
        [],
        () => submit(distributionMethod, rows),
        closePopup,
        () => setRows([])
    )

    const handleDistributionMethodChange = (
        event: SelectChangeEvent<DistributionMethod>
    ) => {
        setDistributionMethod(event.target.value as DistributionMethod)
    }

    return (
        <Form {...form} title="Загрузить платежи">
            <FormControl fullWidth>
                <InputLabel id="distributionMethodSelect">
                    Способ распределения оплаты
                </InputLabel>
                <Select
                    labelId="distributionMethodSelect"
                    id="demo-simple-select"
                    value={distributionMethod}
                    label="Способ распределения оплаты"
                    onChange={handleDistributionMethodChange}
                >
                    <MenuItem value={"fifo"}>С самого раннего</MenuItem>
                    <MenuItem value={"lastIsFirst"}>Сначала указанный</MenuItem>
                </Select>
            </FormControl>
            <Typography variant="caption">
                Вставьте таблицу (без заголовков) из буфера обмена (Ctrl + V |
                Cmd ⌘ + V)
            </Typography>
            <DataGrid
                columns={columns}
                rows={rows.map((row) => ({
                    ...row,
                    date: dayjs(row.date).format("DD.MM.YYYY"),
                    period: row.period
                        ? dayjs(row.period).format("MMMM YYYY")
                        : undefined,
                }))}
            />
            <Typography variant="caption">* - обязательные поля</Typography>
            <Snackbar
                open={pasteError !== null}
                autoHideDuration={6000}
                message={pasteError}
                onClick={() => setPasteError(null)}
                onClose={() => setPasteError(null)}
            />
        </Form>
    )
}

