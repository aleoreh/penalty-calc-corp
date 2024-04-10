import "./App.css"
import { PenaltyCalc } from "./PenaltyCalc"

function App({ config }: { config: AppConfig }) {
    return (
        <div className="App">
            <PenaltyCalc config={config} />
        </div>
    )
}

export default App
