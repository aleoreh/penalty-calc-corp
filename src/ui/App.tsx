import { GetCalculatorConfig } from "../app/ports"
import { Home } from "./pages/home"

type AppProps = {
    defaultCalculationDate: Date
    getDefaultConfig: GetCalculatorConfig
}

const App = ({ defaultCalculationDate, getDefaultConfig }: AppProps) => {
    return (
        <Home
            defaultCalculationDate={defaultCalculationDate}
            getDefaultConfig={getDefaultConfig}
        />
    )
}

export default App

