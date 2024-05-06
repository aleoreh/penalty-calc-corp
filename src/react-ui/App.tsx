import { useEffect, useState } from "react"
import { RD, SRD, loading, notAsked, success } from "srd"

import { type CalculatorConfig } from "../domain/calculator-config"
import Calculator from "./Calculator/Calculator"

type AppType = (props: {
    getConfig: () => Promise<CalculatorConfig>
}) => JSX.Element

const App: AppType = ({ getConfig }) => {
    const [config, setConfig] = useState<RD<string, CalculatorConfig>>(
        notAsked()
    )

    useEffect(() => {
        setConfig(loading())
        getConfig().then((result) => {
            setConfig(success(result))
        })
    }, [getConfig])

    return (
        <div className="App">
            {SRD.match(
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
