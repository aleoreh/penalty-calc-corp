import "./styles/index.css"

import React from "react"
import ReactDOM from "react-dom/client"

import { GetCalculatorConfig } from "../app/ports"
import App from "./App"

export const render = (
    defaultCalculationDate: Date,
    getDefaultConfig: GetCalculatorConfig
) => {
    const root = ReactDOM.createRoot(
        document.getElementById("root") as HTMLElement
    )
    root.render(
        <React.StrictMode>
            <App
                defaultCalculationDate={defaultCalculationDate}
                getDefaultConfig={getDefaultConfig}
            />
        </React.StrictMode>
    )
}

