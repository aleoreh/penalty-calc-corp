import { GridColDef } from "@mui/x-data-grid"
import React from "react"
import { NumericFormat, NumericFormatProps } from "react-number-format"

export interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void
    name: string
}

export const NumericFormatCustom = React.forwardRef<
    NumericFormatProps,
    CustomProps
>(function NumericFormatCustom(props, ref) {
    const { onChange, ...other } = props

    return (
        <NumericFormat
            {...other}
            getInputRef={ref}
            onValueChange={(values) => {
                onChange({
                    target: {
                        name: props.name,
                        value: values.value,
                    },
                })
            }}
            thousandSeparator=" "
            decimalSeparator=","
            decimalScale={2}
            valueIsNumericString
        />
    )
})

export const CustomGridColDef = {
    staticCol(gridColDef: GridColDef) {
        return {
            ...gridColDef,
            filterable: false,
            sortable: false,
            hideable: false,
            disableColumnMenu: true,
        }
    },
    stretch(gridColDef: GridColDef) {
        return gridColDef.flex === undefined
            ? {
                  ...gridColDef,
                  flex: 1,
              }
            : gridColDef
    },
}
