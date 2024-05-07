import { useEffect, useState } from "react"
import { RD, SRD, failure, loading, success } from "srd"

import { type CalculatorConfig } from "../domain/calculator-config"
import { Calculator } from "./Calculator"
import { ErrorView } from "./ErrorView"
import { Page } from "./Page"

type AppType = (props: {
    getConfig: () => Promise<CalculatorConfig>
}) => JSX.Element

const App: AppType = ({ getConfig }) => {
    const [config, setConfig] = useState<RD<string, CalculatorConfig>>(
        loading()
    )

    useEffect(() => {
        getConfig()
            .then((result) => {
                setConfig(success(result))
            })
            .catch(() => {
                setConfig(
                    failure(
                        "Во время загрузки произошла ошибка. Попробуйте обновить страницу"
                    )
                )
            })
    }, [getConfig])

    return (
        <Page className="App">
            <Page.Header>
                <h1>HEADER</h1>
            </Page.Header>
            <Page.Content>
                {SRD.match(
                    {
                        notAsked: () => <></>,
                        loading: () => <>"Идёт загрузка..."</>,
                        failure: (err) => <ErrorView message={err} />,
                        success: (value) => <Calculator config={value} />,
                    },
                    config
                )}
            </Page.Content>
        </Page>
    )
}

export default App

