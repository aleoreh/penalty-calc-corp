import { RD, SRD, failure, loading, success } from "srd"
import { calculate } from "../../../app/calculate"
import { ErrorView } from "../../components/ErrorView"
import { Page } from "../../components/Page"
import { AppTitle } from "../../widgets/AppTitle"
import { Calculator } from "../../widgets/Calculator"
import { Loader } from "../../components/Loader"
import { CalculatorConfig } from "../../../domain/calculator-config"
import { useEffect, useState } from "react"

type HomeProps = {
    getDefaultConfig: () => Promise<CalculatorConfig>
}

export const Home = ({ getDefaultConfig }: HomeProps) => {
    const [defaultConfig, setDefaultConfig] = useState<
        RD<string, CalculatorConfig>
    >(loading())

    useEffect(() => {
        getDefaultConfig()
            .then((result) => {
                setDefaultConfig(success(result))
            })
            .catch(() => {
                setDefaultConfig(
                    failure(
                        "Во время загрузки произошла ошибка. Попробуйте обновить страницу"
                    )
                )
            })
    }, [getDefaultConfig])

    return (
        <>
            <Page>
                <Page.Header>
                    <AppTitle />
                </Page.Header>
                <Page.Content>
                    {SRD.match(
                        {
                            notAsked: () => <></>,
                            loading: () => <Loader />,
                            failure: (err) => <ErrorView message={err} />,
                            success: (defaultConfigValue) => (
                                <Calculator
                                    defaultConfig={defaultConfigValue}
                                    calculate={calculate}
                                />
                            ),
                        },
                        defaultConfig
                    )}
                </Page.Content>
            </Page>
        </>
    )
}

