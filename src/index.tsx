import reportWebVitals from "./reportWebVitals"
import calculatorConfigService from "./services/calculator-config-service"
import { render } from "./ui"

render(calculatorConfigService.getDefaultConfig)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
