import "css.gg/icons/css/pen.css"
import { FormEvent, useState } from "react"

import { CalculatorConfig } from "../../../domain/calculator-config"
import { dayjs } from "../../../domain/dayjs"
import { representKeyRateInPercents } from "../../../domain/key-rate"
import { Form } from "../../components/Form"
import { Popup } from "../../components/Popup"
import { UI } from "../../types"
import style from "./Calculator.module.css"
import Debug from "../../../debug-log.debug"

type SettingsTableProps = {
    calculationDate: Date
    config: CalculatorConfig
}

const SettingsTable = ({ config, calculationDate }: SettingsTableProps) => {
    return (
        <table>
            <caption>Настройки расчета</caption>
            <tbody>
                <tr>
                    <td>Ключевая ставка на дату расчета</td>
                    <td>
                        {representKeyRateInPercents(
                            config.getKeyRate(calculationDate)
                        )}
                    </td>
                </tr>
                <tr>
                    <td>Дней на оплату</td>
                    <td>{config.daysToPay}</td>
                </tr>
                <tr>
                    <td>Дней на отсрочку</td>
                    <td>{config.deferredDaysCount}</td>
                </tr>
                <tr>
                    <td>Действующие моратории</td>
                    <td>
                        {config.moratoriums.map(([start, end]) => (
                            <p>
                                {`${dayjs(start).format("L")} - ${dayjs(
                                    end
                                ).format("L")}`}
                            </p>
                        ))}
                    </td>
                </tr>
            </tbody>
        </table>
    )
}

export const CalculatorSettings: UI.CalculatorSettings = (props) => {
    const { config, setConfig } = props

    const [editFormOpened, setEditFormOpened] = useState<boolean>(false)
    const [inputConfig, setInputConfig] = useState<typeof config>(config)

    const handleKeyRateInput = (evt: FormEvent<HTMLInputElement>) => {
        const keyRate = parseFloat(evt.currentTarget.value) / 100
        setInputConfig({
            ...inputConfig,
            getKeyRate: () => keyRate,
        })
    }

    return (
        <>
            <section className={style.calculator_settings}>
                <SettingsTable {...props} />
                <button
                    title="Редактировать"
                    type="button"
                    onClick={() => setEditFormOpened(true)}
                >
                    <span className="gg-pen"></span>
                </button>
            </section>
            <Popup
                isOpened={editFormOpened}
                close={() => setEditFormOpened(false)}
            >
                <Form
                    close={() => setEditFormOpened(false)}
                    reset={() => {}}
                    submit={{
                        text: "Сохранить",
                        fn: () =>
                            setConfig(Debug.log(inputConfig)(inputConfig)),
                    }}
                >
                    <label>
                        <span>Ключевая ставка, %</span>
                        <input name="keyRate" onInput={handleKeyRateInput} />
                    </label>
                </Form>
            </Popup>
        </>
    )
}
