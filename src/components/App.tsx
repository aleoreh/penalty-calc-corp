import { useEffect, useState } from "react"

import { CalculatorConfig } from "../domain/calculator"
import { RD, remoteData } from "../lib/remote-data"
import Calculator from "./calculator/Calculator"

import "./App.css"

type AppType = (props: {
    getConfig: () => Promise<CalculatorConfig>
}) => JSX.Element

const App: AppType = ({ getConfig }) => {
    const [config, setConfig] = useState<RD<string, CalculatorConfig>>(
        remoteData.notAsked()
    )

    useEffect(() => {
        setConfig(remoteData.loading())
        getConfig().then((result) => {
            setConfig(remoteData.success(result))
        })
    }, [getConfig])

    return (
        <div className="App">
            {/* <PenaltyCalc config={config} /> */}
            {remoteData.SRD.match(
                {
                    notAsked: () => "Приложение загружено",
                    loading: () => "Идёт загрузка...",
                    failure: () => "Настроки не найдены",
                    success: (value) => <Calculator config={value} />,
                },
                config
            )}
        </div>
    )
}

export default App
