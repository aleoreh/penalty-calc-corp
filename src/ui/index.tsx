import "./styles/index.css"

import React from "react"
import ReactDOM from "react-dom/client"

import App from "./App"
import { CalculatorConfig } from "../domain/calculator-config"

export const render = (getDefaultConfig: () => Promise<CalculatorConfig>) => {
    const root = ReactDOM.createRoot(
        document.getElementById("root") as HTMLElement
    )
    root.render(
        <React.StrictMode>
            <App getDefaultConfig={getDefaultConfig} />
        </React.StrictMode>
    )
}

