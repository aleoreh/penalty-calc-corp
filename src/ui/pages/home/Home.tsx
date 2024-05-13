import { useEffect, useState } from "react"
import { RD, SRD, failure, loading, success } from "srd"

import { calculate } from "../../../app/calculate"
import { GetCalculatorConfig } from "../../../app/ports"
import { CalculatorConfig } from "../../../domain/calculator-config"
import { ErrorView } from "../../components/ErrorView"
import { Loader } from "../../components/Loader"
import { Page } from "../../components/Page"
import { AppTitle } from "../../widgets/AppTitle"
import { Calculator } from "../../widgets/Calculator"

type HomeProps = {
    defaultCalculationDate: Date
    getDefaultConfig: GetCalculatorConfig
}

export const Home = ({
    defaultCalculationDate,
    getDefaultConfig,
}: HomeProps) => {
    const [defaultConfig, setDefaultConfig] = useState<
        RD<string, CalculatorConfig>
    >(loading())

    useEffect(() => {
        getDefaultConfig(defaultCalculationDate)
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
    }, [defaultCalculationDate, getDefaultConfig])

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
                                    defaultCalculationDate={
                                        defaultCalculationDate
                                    }
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

