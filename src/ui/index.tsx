import "./styles/index.css"

import { createTheme, ThemeProvider } from "@mui/material/styles"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { ruRU } from "@mui/x-date-pickers/locales"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import React from "react"
import ReactDOM from "react-dom/client"

import { GetCalculatorConfig } from "../app/ports"
import App from "./App"

const theme = createTheme(
    {
        spacing: 8,
        palette: {
            primary: { main: "#1976d2" },
        },
        components: {
            MuiStack: {
                defaultProps: {
                    useFlexGap: true,
                    spacing: 1,
                },
            },
        },
    },
    ruRU
)

export const render = (
    defaultCalculationDate: Date,
    getDefaultConfig: GetCalculatorConfig
) => {
    const root = ReactDOM.createRoot(
        document.getElementById("root") as HTMLElement
    )
    root.render(
        <React.StrictMode>
            <ThemeProvider theme={theme}>
                <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="ru"
                >
                    <App
                        defaultCalculationDate={defaultCalculationDate}
                        getDefaultConfig={getDefaultConfig}
                    />
                </LocalizationProvider>
            </ThemeProvider>
        </React.StrictMode>
    )
}

