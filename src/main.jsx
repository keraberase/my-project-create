import { createRoot } from "react-dom/client";
import GameList from "./GameList";
 
const root = createRoot(document.getElementById("react-root"));
 
export default function App() {

    const token = localStorage.getItem("token");
 
    function handleStatsUpdate(stats) {

        document.getElementById("statTotal").textContent     = stats.total || 0;
        document.getElementById("statPlanned").textContent   = stats.planned || 0;
        document.getElementById("statCompleted").textContent = stats.completed || 0;
        document.getElementById("statHours").textContent     = (stats.total_hours || 0).toFixed(1);
    }
 
    return <GameList authToken={token} onStatsUpdate={handleStatsUpdate} />;
}
 
root.render(<App />);