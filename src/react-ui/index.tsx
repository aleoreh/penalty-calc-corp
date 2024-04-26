import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"
import "./index.css"

import { ThemeProvider, createTheme } from "@mui/material"
import { ruRU as coreRuRU } from "@mui/material/locale"
import { ruRU } from "@mui/x-data-grid"
import { ruRU as pickersRuRU } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import React from "react"
import ReactDOM from "react-dom/client"

import { type CalculatorConfig } from "../domain/calculator"
import App from "./App"

const theme = createTheme(
    {
        components: {
            MuiContainer: {
                defaultProps: {
                    maxWidth: "md",
                },
            },
            MuiStack: {
                defaultProps: {
                    spacing: 2,
                },
            },
            MuiButton: {
                defaultProps: {
                    variant: "outlined",
                    size: "large",
                },
            },
        },
    },
    ruRU,
    pickersRuRU,
    coreRuRU
)

export const render = (getConfig: () => Promise<CalculatorConfig>) => {
    const root = ReactDOM.createRoot(
        document.getElementById("root") as HTMLElement
    )
    root.render(
        <React.StrictMode>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
                <ThemeProvider theme={theme}>
                    <App getConfig={getConfig} />
                </ThemeProvider>
            </LocalizationProvider>
        </React.StrictMode>
    )
}
