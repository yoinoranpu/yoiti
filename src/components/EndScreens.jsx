import { useGameStore } from "../store/gameStore"

export function GameOverScreen() {
  const day = useGameStore((s) => s.day)
  const gold = useGameStore((s) => s.gold)
  const quota = useGameStore((s) => s.quota)
  const restart = useGameStore((s) => s.restart)

  return (
    <div className="screen screen-center screen-gameover">
      <h1 className="title">店じまい</h1>
      <p>
        {day}日目、上納金 {quota}G に対し、所持金は {gold}G だった。
      </p>
      <p className="subtitle">夜市の管理者が、静かに店の権利証を回収していった。</p>
      <button className="btn btn-primary" onClick={restart}>
        もう一度
      </button>
    </div>
  )
}

export function RobbedScreen() {
  const advanceDay = useGameStore((s) => s.advanceDay)

  return (
    <div className="screen screen-center screen-gameover">
      <h1 className="title">その晩</h1>
      <p>
        店を閉め、その日の売上を数えようとしたところ、何者かに押し入られ、有り金を
        すべて奪われた。
      </p>
      <p className="subtitle">
        翌朝、夜市の管理者ヴィクターが訪れ、上納金の代わりにと魂判別機を回収して
        いった。
      </p>
      <button className="btn btn-primary" onClick={advanceDay}>
        次の日へ
      </button>
    </div>
  )
}

export function ClearScreen() {
  const day = useGameStore((s) => s.day)
  const gold = useGameStore((s) => s.gold)
  const quota = useGameStore((s) => s.quota)
  const advanceDay = useGameStore((s) => s.advanceDay)

  return (
    <div className="screen screen-center">
      <h1 className="title">夜が明ける</h1>
      <p>
        {day}日目、上納金 {quota}G を納め、{gold}G が手元に残った。
      </p>
      <p className="subtitle">また次の夜、店を開ける。</p>
      <button className="btn btn-primary" onClick={advanceDay}>
        次の日へ
      </button>
    </div>
  )
}

// 教会/夜市の心証と最終的な所持金から4種類に分岐する。「正解」を示すものでは
// なく、積み重ねた選択の結果をひとことで映すだけの締めくくり。
const ENDING_TEXT = {
  church: {
    title: "教会に近づいた商人",
    body: "気づけば、シスター・マレンをはじめ教会の関係者と言葉を交わすことが増えていた。夜市の中では少し浮いた存在になったが、それでいいと思っている。",
  },
  market: {
    title: "夜市に骨を埋めた商人",
    body: "元締めヴィクターに一目置かれるようになった。教会の目にどう映っているかは、あまり考えないようにしている。",
  },
  wealthy: {
    title: "誰よりも稼いだ商人",
    body: "気づけば、この街で指折りの金を持つ商人になっていた。何を扱い、何を見逃してきたかは、あまり思い出したくない。",
  },
  neutral: {
    title: "誰の色にも染まらなかった商人",
    body: "教会にも夜市にも深入りせず、淡々と7日間を乗り切った。それが正しかったのかは、まだわからない。",
  },
}

export function VictoryScreen() {
  const gold = useGameStore((s) => s.gold)
  const ending = useGameStore((s) => s.ending)
  const restart = useGameStore((s) => s.restart)
  const { title, body } = ENDING_TEXT[ending] ?? ENDING_TEXT.neutral

  return (
    <div className="screen screen-center">
      <h1 className="title">7日目の夜が明ける — {title}</h1>
      <p>最後の上納金を納め、{gold}G を手元に残したまま、この週を乗り切った。</p>
      <p className="subtitle">{body}</p>
      <button className="btn btn-primary" onClick={restart}>
        タイトルへ
      </button>
    </div>
  )
}
