import { useState } from "react"
import { useGameStore } from "../store/gameStore"

// GitHub Pagesなどサブパス配信(base: "/yoiti/")でも public/assets/ の画像が
// 正しく解決されるように、実行時に BASE_URL を付ける。
export const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`.replace(/\/{2,}/g, "/")

// ボタンやラベルの先頭に小さいアイコンを添える共通部品。読み込み失敗時はアイコン
// なしで文字だけになる(壊れた画像アイコンは出さない)。
export function IconLabel({ icon, children }) {
  const [failed, setFailed] = useState(false)
  return (
    <>
      {icon && !failed && (
        <img
          className="btn-icon"
          src={assetUrl(`assets/icons/${icon}.png`)}
          alt=""
          onError={() => setFailed(true)}
        />
      )}
      <span>{children}</span>
    </>
  )
}

export function ReferencePanel({ reference }) {
  return (
    <div className="panel panel-reference">
      <h2>
        <IconLabel icon="icon-reference">資料</IconLabel>
      </h2>
      <ul className="entry-list">
        {reference.map((r) => (
          <li key={r.id}>
            <p className="entry-title">{r.title}</p>
            <p className="entry-text">{r.text}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function NotesPanel() {
  const notes = useGameStore((s) => s.notes)
  return (
    <div className="panel panel-notes">
      <h2>
        <IconLabel icon="icon-notes">まとめた情報</IconLabel>
      </h2>
      {notes.length === 0 ? (
        <p className="empty">まだ何も聞いていない。</p>
      ) : (
        <ul className="entry-list">
          {notes.map((n) => (
            <li key={n.id}>{n.text}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function InspectionPanel() {
  const inspection = useGameStore((s) => s.inspection)
  return (
    <div className="panel panel-inspection">
      <h2>
        <IconLabel icon="icon-inspection">見た情報</IconLabel>
      </h2>
      <ul className="entry-list">
        {inspection.map((i) => (
          <li key={i.id}>
            <span className="entry-label">{i.label}</span>
            <span className="entry-text">{i.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// 資料/まとめた情報/見た情報を常時表示のカラムにせず、右上のアイコン列から
// 開閉する「壁に貼った紙」のようなドロワーにする(画面の大半をシーンに使うため)。
const INFO_TABS = [
  { key: "reference", label: "資料", icon: "icon-reference" },
  { key: "notes", label: "まとめた情報", icon: "icon-notes" },
  { key: "inspection", label: "見た情報", icon: "icon-inspection" },
]

function InfoIcon({ icon, label }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <span className="info-rail-fallback">{label[0]}</span>
  return <img src={assetUrl(`assets/icons/${icon}.png`)} alt={label} onError={() => setFailed(true)} />
}

export function InfoOverlay({ reference }) {
  const [active, setActive] = useState(null)

  return (
    <>
      <div className="info-rail">
        {INFO_TABS.map((tab) => (
          <button
            key={tab.key}
            className={"info-rail-btn" + (active === tab.key ? " info-rail-btn-active" : "")}
            title={tab.label}
            onClick={() => setActive((cur) => (cur === tab.key ? null : tab.key))}
          >
            <InfoIcon icon={tab.icon} label={tab.label} />
          </button>
        ))}
      </div>
      {active && (
        <div className="info-drawer">
          <div className="info-drawer-pin" />
          {active === "reference" && <ReferencePanel reference={reference} />}
          {active === "notes" && <NotesPanel />}
          {active === "inspection" && <InspectionPanel />}
        </div>
      )}
    </>
  )
}

// イラストがまだ無いので今は丸いプレースホルダーの上にホットスポットを重ねる。
// イラストを用意したら scene-figure を画像に差し替えるだけで、ホットスポットは
// illustrationClues の x/y(%)に従ってそのまま乗る想定。
function IllustrationHotspots({ illustrationClues }) {
  const viewedClues = useGameStore((s) => s.viewedClues)
  const inspectIllustrationClue = useGameStore((s) => s.inspectIllustrationClue)

  if (!illustrationClues || illustrationClues.length === 0) return null

  return (
    <>
      {illustrationClues.map((c) => (
        <button
          key={c.id}
          className={"hotspot" + (viewedClues.includes(c.id) ? " hotspot-viewed" : "")}
          style={{ left: `${c.x}%`, top: `${c.y}%` }}
          title={c.label}
          onClick={() => inspectIllustrationClue(c.id)}
        >
          <span className="sr-only">{c.label}</span>
        </button>
      ))}
    </>
  )
}

// キャラの立ち絵。image があれば public/assets/characters/ の画像を表示し、
// 無い場合・読み込み失敗時は頭文字だけの丸プレースホルダーに戻る。
function CharacterFigure({ actorName, image }) {
  const [failed, setFailed] = useState(false)
  if (image && !failed) {
    return (
      <img
        className="scene-figure-img"
        src={assetUrl(`assets/characters/${image}.png`)}
        alt={actorName}
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <div className="scene-figure" aria-hidden="true">
      {actorName[0]}
    </div>
  )
}

// カウンターに乗る商品アイコン。image が無い・読み込み失敗時は簡素なプレースホルダーに。
function ItemFigure({ name, image }) {
  const [failed, setFailed] = useState(false)
  if (image && !failed) {
    return (
      <img
        className="counter-item-img"
        src={assetUrl(`assets/items/${image}.png`)}
        alt={name}
        onError={() => setFailed(true)}
      />
    )
  }
  return <div className="counter-item-placeholder" aria-hidden="true" />
}

function SpeechBubble() {
  const dialogueLog = useGameStore((s) => s.dialogueLog)
  const last = dialogueLog[dialogueLog.length - 1]
  if (!last) return null
  return (
    <div className="speech-bubble">
      <p>{last.text}</p>
    </div>
  )
}

// シーンは奥から手前へ: 背景 → キャラ(下半身がカウンターの裏に隠れる) →
// カウンター → カウンターに乗る商品、の順で重ねる。キャラが宙に浮かず、
// その場に立っているように見せるための構成。
export function ScenePanel({
  actorName,
  actorImage,
  showItemCard,
  itemName,
  itemImage,
  itemDescription,
  priceLabel,
  price,
  illustrationClues,
  backdropImage,
  counterImage,
}) {
  const backdropStyle = backdropImage
    ? { backgroundImage: `url(${assetUrl(`assets/backgrounds/${backdropImage}.png`)})` }
    : undefined
  const counterStyle = counterImage
    ? { backgroundImage: `url(${assetUrl(`assets/backgrounds/${counterImage}.png`)})` }
    : undefined

  return (
    <div className={"scene" + (showItemCard ? " scene-focus" : "")}>
      <div className="scene-backdrop" style={backdropStyle} />
      <div className="scene-actor">
        <CharacterFigure key={actorImage || actorName} actorName={actorName} image={actorImage} />
        <IllustrationHotspots illustrationClues={illustrationClues} />
      </div>
      <div className="scene-dialogue-anchor">
        <p className="scene-name">{actorName}</p>
        <SpeechBubble />
      </div>
      <div className="counter" style={counterStyle}>
        {showItemCard && (
          <div className="counter-item">
            <ItemFigure name={itemName} image={itemImage} />
            <div className="counter-item-info">
              <p className="counter-item-name">{itemName}</p>
              {itemDescription && <p className="counter-item-desc">{itemDescription}</p>}
              <p className="counter-item-price">
                {priceLabel}: {price}G
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function DialogueLog() {
  const dialogueLog = useGameStore((s) => s.dialogueLog)
  return (
    <div className="dialogue-log">
      {dialogueLog.map((line, i) => (
        <p key={i} className={line.speaker === "narration" ? "line-narration" : "line-speech"}>
          {line.speaker !== "narration" && <span className="speaker">{line.speaker}: </span>}
          {line.text}
        </p>
      ))}
    </div>
  )
}

// 判断の結果はキャラと吹き出しを画面に残したまま、会話エリア内に差し込む形で
// 表示する(全画面ポップアップで覆うと、キャラの反応が見えないまま話が進んでしまう
// ため)。反応の本文はすでに dialogueLog / SpeechBubble 側に流れている前提で、
// ここではその結果(増減額)と「次へ」だけを出す。
export function ResultPanel({ resolution, onContinue }) {
  if (!resolution) return null
  return (
    <div className="result-panel">
      <p className="gold-delta">
        {resolution.goldDelta >= 0 ? "+" : ""}
        {resolution.goldDelta}G
      </p>
      <button className="btn btn-primary" onClick={onContinue}>
        次へ
      </button>
    </div>
  )
}

export function TalkGroup({ topics }) {
  const usedTopics = useGameStore((s) => s.usedTopics)
  const talk = useGameStore((s) => s.talk)
  return (
    <div className="action-group">
      <p className="action-group-label">
        <IconLabel icon="icon-talk">話す</IconLabel>
      </p>
      {topics.map((t) => (
        <button
          key={t.id}
          className="btn btn-topic"
          disabled={usedTopics.includes(t.id)}
          onClick={() => talk(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
