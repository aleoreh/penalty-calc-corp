import { dayjs } from "../../../domain/dayjs"
import { representKeyRateInPercents } from "../../../domain/key-rate"
import { UI } from "../../types"

import style from "./Calculator.module.css"

import "css.gg/icons/css/pen.css"

export const CalculatorSettings: UI.CalculatorSettings = ({
    calculationDate,
    config,
    setConfig,
}) => {
    return (
        <section className={style.calculator_settings}>
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
            <button title="Редактировать" type="button">
                <span className="gg-pen"></span>
            </button>
        </section>
    )
}
