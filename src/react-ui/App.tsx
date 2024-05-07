import { useEffect, useState } from "react"
import { RD, SRD, failure, loading, success } from "srd"

import { type CalculatorConfig } from "../domain/calculator-config"
import { Calculator } from "./Calculator"
import { ErrorView } from "./ErrorView"
import { Layout } from "./Layout/Layout"

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
        <Layout className="App">
            <Layout.Header>
                <h1>HEADER</h1>
            </Layout.Header>
            <Layout.Content>
                {SRD.match(
                    {
                        notAsked: () => <></>,
                        loading: () => <>"Идёт загрузка..."</>,
                        failure: (err) => <ErrorView message={err} />,
                        success: (value) => <Calculator config={value} />,
                    },
                    config
                )}
            </Layout.Content>
        </Layout>
    )
}

export default App

