import { GridColDef } from "@mui/x-data-grid"
import { DataGrid } from "@mui/x-data-grid/DataGrid"

import { ResultTable } from "./penalty"

type PenaltyGridProps = {
    resultTable: ResultTable
}

export function PenaltyGrid({ resultTable }: PenaltyGridProps) {
    const columns: GridColDef[] = [
        {
            field: "debtAmount",
            headerName: "Сумма долга",
            valueFormatter: (x) => {
                return new Intl.NumberFormat("ru-RU", {
                    style: "currency",
                    currency: "RUR",
                    maximumFractionDigits: 2,
                }).format(x.value)
            },
            align: "right",
        },
        {
            field: "dateFrom",
            headerName: "Период с",
            width: 200,
            valueFormatter: (x) => x.value.format("L"),
            align: "right",
        },
        {
            field: "dateTo",
            headerName: "Период по",
            width: 200,
            valueFormatter: (x) => x.value.format("L"),
            align: "right",
        },
        {
            field: "daysCount",
            headerName: "Дней",

            align: "right",
        },
        {
            field: "keyRateFraction",
            headerName: "Доля ставки",
            align: "right",
            valueGetter: (x) => x.value.repr,
        },
        { field: "moratorium", headerName: "Действует мораторий" },
        {
            field: "keyRate",
            headerName: "Ставка",
            align: "right",
            valueFormatter: (x) => {
                return new Intl.NumberFormat("ru-RU", {
                    style: "percent",
                    maximumFractionDigits: 3,
                }).format(x.value)
            },
        },
        {
            field: "penaltyAmount",
            headerName: "Сумма пени",
            valueFormatter: (x) => {
                return new Intl.NumberFormat("ru-RU", {
                    style: "currency",
                    currency: "RUR",
                    maximumFractionDigits: 2,
                }).format(x.value)
            },
            align: "right",
        },
        {
            field: "deferredCoef",
            headerName: "Отсрочка",
            valueGetter: (x) => !x.value,
        },
    ]

    return <DataGrid columns={columns} rows={resultTable} />
}
