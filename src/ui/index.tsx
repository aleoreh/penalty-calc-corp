import "react-data-grid/lib/styles.css"
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
        palette: {
            primary: { main: "#1976d2" },
        },
        components: {
            MuiContainer: {
                defaultProps: {
                    maxWidth: "md",
                },
            },
            MuiStack: {
                defaultProps: {
                    useFlexGap: true,
                    gap: 2,
                },
            },
            MuiTableCell: {
                defaultProps: {
                    size: "small",
                },
            },
            MuiAccordion: {
                defaultProps: {
                    variant: "outlined",
                },
            },
        },
    },
    ruRU
)

theme.spacing(2)

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

