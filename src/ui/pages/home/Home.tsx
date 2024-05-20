import { Box, Container, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { RD, SRD, failure, loading, success } from "srd"

import { GetCalculatorConfig } from "../../../app/ports"
import { CalculationResult } from "../../../domain/calculation-result"
import { CalculatorConfig } from "../../../domain/calculator-config"
import { ErrorView } from "../../components/ErrorView"
import { Loader } from "../../components/Loader"
import { Calculator as CalculatorView } from "../../widgets/Calculator"
import { Debt } from "../../../domain/debt"
import { calculate } from "../../../app/calculate"
import { Calculator } from "../../../domain/calculator"

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
    const [calculationResults, setCalculationResults] = useState<
        CalculationResult[]
    >([])
    // установка параметров запускает расчет в useEffect
    const [calculationParameters, setCalculationParameters] = useState<
        { calculator: Calculator; debts: Debt[] } | undefined
    >(undefined)

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

    useEffect(() => {
        async function executeCalculation(
            params: Exclude<typeof calculationParameters, undefined>
        ) {
            Promise.all(
                params.debts.map(async (debt) => {
                    return await calculate(params.calculator, debt)
                })
            ).then(setCalculationResults)
        }

        calculationParameters && executeCalculation(calculationParameters)

        setCalculationParameters(undefined)
    }, [calculationParameters])

    const startCalculation = (
        calculationDate: Date,
        config: CalculatorConfig,
        debts: Debt[]
    ) => {
        setCalculationParameters({
            calculator: { calculationDate, config },
            debts,
        })
    }

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
                                <CalculatorView
                                    defaultCalculationDate={
                                        defaultCalculationDate
                                    }
                                    defaultConfig={defaultConfigValue}
                                    startCalculation={startCalculation}
                                    calculationResults={calculationResults}
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

