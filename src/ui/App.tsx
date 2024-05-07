import { useEffect, useState } from "react"
import { RD, SRD, failure, loading, success } from "srd"

import { calculate } from "../app/calculate.port"
import { type CalculatorConfig } from "../domain/calculator-config"
import { AppTitle } from "./widgets/AppTitle"
import { Calculator } from "./widgets/Calculator"
import { ErrorView } from "./components/ErrorView"
import { Loader } from "./components/Loader"
import { Page } from "./components/Page"

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
                <AppTitle />
            </Page.Header>
            <Page.Content>
                {SRD.match(
                    {
                        notAsked: () => <></>,
                        loading: () => <Loader />,
                        failure: (err) => <ErrorView message={err} />,
                        success: (value) => (
                            <Calculator config={value} calculate={calculate} />
                        ),
                    },
                    config
                )}
            </Page.Content>
        </Page>
    )
}

export default App

