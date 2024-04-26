import { useState } from "react"
import { RD, SRD, loading, notAsked, success } from "srd"

import { calculate } from "../../app/calculate"
import { CalculationResult } from "../../domain/calculation-result"
import { CalculatorConfig } from "../../domain/calculator"

type CalculatorType = (props: { config: CalculatorConfig }) => JSX.Element

const Calculator: CalculatorType = ({ config }) => {
    const [calculation, setCalculation] = useState<
        RD<string, CalculationResult>
    >(notAsked())

    const handleClick = () => {
        setCalculation(loading())
        calculate({
            config,
            calculationDate: new Date(),
            debt: {
                amount: 1000,
                period: new Date("2000-05-01"),
                payments: [{ date: new Date("2020-01-01"), amount: 100 }],
            },
            dueDate: new Date("2019-06-11"),
        }).then((result) => setCalculation(success(result)))
    }

    return (
        <div>
            <button onClick={handleClick}>Нажми меня</button>
            <p>
                {SRD.match(
                    {
                        notAsked: () => "Нажмите кнопку",
                        loading: () => "Вычисляю...",
                        failure: (err) => JSON.stringify(err),
                        success: (value) => JSON.stringify(value),
                    },
                    calculation
                )}
            </p>
        </div>
    )
}

export default Calculator
