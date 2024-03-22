import { Done } from "@mui/icons-material"
import {
    GridColDef,
    GridToolbarContainer,
    GridToolbarExport,
} from "@mui/x-data-grid"
import { DataGrid } from "@mui/x-data-grid/DataGrid"
import { Dayjs } from "dayjs"

import { CustomGridColDef } from "../../shared/helpers"
import { ResultTable } from "./penalty"

type PenaltyGridProps = {
    calcDate: Dayjs
    table: ResultTable
}

function CustomToolbar(fileName: string) {
    return () => (
        <GridToolbarContainer>
            <GridToolbarExport csvOptions={{ fileName }} />
        </GridToolbarContainer>
    )
}

export function PenaltyGrid({ calcDate, table }: PenaltyGridProps) {
    const fileName = () => {
        const [periodRepr, debtAmountRepr] =
            table.length > 0
                ? [
                      table[0].period.format("YYYY-MMM"),
                      `${table[0].debtAmount}`
                          .replace(/[^a-z0-9]/gi, "-")
                          .toLowerCase(),
                  ]
                : ["", ""]
        return `Пеня_${calcDate.format(
            "YYYY-MM-DD"
        )}_${periodRepr}_${debtAmountRepr}`
    }

    const columns: GridColDef[] = [
        {
            field: "debtAmount",
            headerName: "Сумма долга",
            valueFormatter: (x) => {
                return new Intl.NumberFormat("ru-RU", {
                    style: "decimal",
                    minimumFractionDigits: 2,
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
            headerName: "Всего дней",

            align: "right",
        },
        {
            field: "keyRateFraction",
            headerName: "Доля ставки",
            align: "right",
            valueGetter: (x) => x.value.repr,
        },
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
            field: "moratorium",
            align: "center",
            headerName: "Мораторий",
            renderCell: (params) => (params.value ? <Done /> : <></>),
        },
        {
            field: "deferredCoef",
            align: "center",
            headerName: "Отсрочка",
            valueGetter: (x) => !x.value,
            renderCell: (params) => (params.value ? <Done /> : <></>),
        },
        {
            field: "penaltyAmount",
            headerName: "Сумма пени",
            valueFormatter: (x) => {
                return new Intl.NumberFormat("ru-RU", {
                    style: "decimal",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(x.value)
            },
            align: "right",
        },
    ]

    return (
        <DataGrid
            columns={columns
                .map(CustomGridColDef.staticCol)
                .map(CustomGridColDef.stretch)}
            rows={table}
            slots={{ toolbar: CustomToolbar(fileName()) }}
        />
    )
}
