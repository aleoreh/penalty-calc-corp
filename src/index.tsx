import { ThemeProvider, createTheme } from "@mui/material"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import "dayjs/locale/ru"
import React from "react"
import ReactDOM from "react-dom/client"
import { ruRU } from "@mui/x-data-grid"
import { ruRU as pickersRuRU } from "@mui/x-date-pickers"
import { ruRU as coreRuRU } from "@mui/material/locale"

import App from "./App"
import "./index.css"
import reportWebVitals from "./reportWebVitals"

import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"

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

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
    <React.StrictMode>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
            <ThemeProvider theme={theme}>
                <App />
            </ThemeProvider>
        </LocalizationProvider>
    </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()

