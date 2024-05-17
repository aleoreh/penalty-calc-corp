import { Box, Container, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { RD, SRD, failure, loading, success } from "srd"

import { calculate } from "../../../app/calculate"
import { GetCalculatorConfig } from "../../../app/ports"
import { CalculatorConfig } from "../../../domain/calculator-config"
import { ErrorView } from "../../components/ErrorView"
import { Loader } from "../../components/Loader"
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
            <Box>
                <Container maxWidth="md">
                    <Typography component="h1" variant="h3" align="center">
                        Калькулятор пеней ЖКХ
                    </Typography>
                </Container>
            </Box>
            <Box>
                <Container maxWidth="md">
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
                </Container>
            </Box>
        </>
    )
}

