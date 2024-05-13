import { type CalculatorConfig } from "../domain/calculator-config"
import { Home } from "./pages/home"

type AppProps = {
    getDefaultConfig: () => Promise<CalculatorConfig>
}

const App = ({ getDefaultConfig }: AppProps) => {
    return <Home getDefaultConfig={getDefaultConfig} />
}

export default App

