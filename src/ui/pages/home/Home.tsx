import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import { useEffect, useState } from "react"
import { RD, SRD, failure, loading, success } from "srd"
import { calculate } from "../../../app/calculate"
import { GetCalculatorConfig } from "../../../app/ports"
import { CalculationResult } from "../../../domain/calculation-result"
import { Calculator } from "../../../domain/calculator"
import { CalculatorConfig } from "../../../domain/calculator-config"
import { Debt } from "../../../domain/debt"
import { ErrorView } from "../../components/ErrorView"
import { Loader } from "../../components/Loader"
import { Calculator as CalculatorView } from "../../widgets/Calculator"
import Toolbar from "@mui/material/Toolbar"

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
        <Box
            className="home"
            display="flex"
            flexDirection="column"
            sx={{ gap: 3 }}
        >
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <Container>
                            <Typography component="h1" variant="h6">
                                Калькулятор пеней ЖКХ
                            </Typography>
                        </Container>
                    </Toolbar>
                </AppBar>
            </Box>
            <Box className="content">
                <Container>
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
                                    clearCalculationResults={() =>
                                        setCalculationResults([])
                                    }
                                />
                            ),
                        },
                        defaultConfig
                    )}
                </Container>
            </Box>
        </Box>
    )
}

