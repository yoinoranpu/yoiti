import { useGameStore } from "../store/gameStore"
import { assetUrl } from "./panels"

export default function TitleScreen() {
  const startNight = useGameStore((s) => s.startNight)

  return (
    <div className="screen screen-center screen-title">
      <div
        className="screen-title-backdrop"
        style={{ backgroundImage: `url(${assetUrl("assets/backgrounds/title-screen.png")})` }}
      />
      <h1 className="title">夜市</h1>
      <p className="subtitle">客の話を聞き、商品を見て、自分で判断する。</p>
      <button className="btn btn-primary" onClick={startNight}>
        店を開ける
      </button>
    </div>
  )
}
