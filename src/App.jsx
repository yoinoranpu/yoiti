import { useGameStore } from "./store/gameStore"
import { REFERENCE } from "./data/days"
import TitleScreen from "./components/TitleScreen"
import NightScreen from "./components/NightScreen"
import AppraisalScreen from "./components/AppraisalScreen"
import { GameOverScreen, ClearScreen, RobbedScreen, VictoryScreen } from "./components/EndScreens"

export default function App() {
  const screen = useGameStore((s) => s.screen)

  if (screen === "title") return <TitleScreen />
  if (screen === "night" || screen === "resolved") return <NightScreen reference={REFERENCE} />
  if (screen === "appraisal") return <AppraisalScreen />
  if (screen === "robbed") return <RobbedScreen />
  if (screen === "gameover") return <GameOverScreen />
  if (screen === "clear") return <ClearScreen />
  if (screen === "victory") return <VictoryScreen />
  return null
}
