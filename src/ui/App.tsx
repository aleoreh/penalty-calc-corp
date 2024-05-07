import { type CalculatorConfig } from "../domain/calculator-config"
import { Home } from "./pages/home"

type AppProps = {
    getConfig: () => Promise<CalculatorConfig>
}

const App = ({ getConfig }: AppProps) => {
    return <Home getConfig={getConfig} />
}

export default App

