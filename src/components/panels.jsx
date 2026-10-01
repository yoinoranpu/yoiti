import { useState, useEffect, useRef } from "react"
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

// 客/買い手をクリックして開く会話メニュー。常時表示のボタン列をやめ、
// 話しかける相手をクリックする操作に寄せる。話題を選んでも閉じず、
// 続けて別の話題を選べる(「やめる」か再クリックで閉じる)。
function TalkMenu({ topics, actorName, actorImage, onClose }) {
  const usedTopics = useGameStore((s) => s.usedTopics)
  const talk = useGameStore((s) => s.talk)
  const [failed, setFailed] = useState(false)
  return (
    <div className="talk-menu" onClick={(e) => e.stopPropagation()}>
      <div className="talk-menu-header">
        {actorImage && !failed ? (
          <img
            className="talk-menu-portrait"
            src={assetUrl(`assets/characters/${actorImage}.png`)}
            alt=""
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="talk-menu-portrait-placeholder" aria-hidden="true">
            {actorName?.[0]}
          </div>
        )}
        <p className="talk-menu-title">客との会話</p>
      </div>
      {topics.map((t) => (
        <button
          key={t.id}
          className="talk-menu-item"
          disabled={usedTopics.includes(t.id)}
          onClick={() => talk(t.id)}
        >
          {t.label}
        </button>
      ))}
      <button className="talk-menu-item talk-menu-close" onClick={onClose}>
        やめる
      </button>
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
  topics,
  engaged,
  onEngage,
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
  const [talkOpen, setTalkOpen] = useState(false)
  useEffect(() => setTalkOpen(false), [actorName])

  const backdropStyle = backdropImage
    ? { backgroundImage: `url(${assetUrl(`assets/backgrounds/${backdropImage}.png`)})` }
    : undefined
  const counterStyle = counterImage
    ? { backgroundImage: `url(${assetUrl(`assets/backgrounds/${counterImage}.png`)})` }
    : undefined

  const handleActorClick = () => {
    if (!engaged) {
      onEngage?.()
      return
    }
    if (topics) setTalkOpen((o) => !o)
  }

  return (
    <div className="scene">
      <div className="scene-backdrop" style={backdropStyle} />
      <div
        className={"scene-actor" + (topics || !engaged ? " scene-actor-clickable" : "")}
        onClick={handleActorClick}
      >
        <CharacterFigure key={actorImage || actorName} actorName={actorName} image={actorImage} />
        <IllustrationHotspots illustrationClues={illustrationClues} />
        {engaged && topics && !talkOpen && (
          <img className="talk-hint" src={assetUrl("assets/icons/icon-talk.png")} alt="" />
        )}
      </div>
      {talkOpen && topics && (
        <div className="talk-menu-anchor">
          <TalkMenu
            topics={topics}
            actorName={actorName}
            actorImage={actorImage}
            onClose={() => setTalkOpen(false)}
          />
        </div>
      )}
      <div className="scene-dialogue-anchor">
        <p className="scene-name">{actorName}</p>
        <SpeechBubble />
        {!engaged && <p className="engage-hint">客をクリックして話を聞こう</p>}
      </div>
      <div className="counter" style={counterStyle}>
        {showItemCard && engaged && (
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

// 商品の各部位から線を伸ばしたノードで観察結果を個別に開示する鑑定机。
// ノードの位置はデータにx/yを持たせず、商品を中心に等間隔の角度で自動配置する。
function ObservationNode({ obs, angleDeg, radiusX, radiusY, revealed, disabled, onReveal }) {
  const rad = (angleDeg * Math.PI) / 180
  const left = 50 + radiusX * Math.cos(rad)
  const top = 50 + radiusY * Math.sin(rad)
  return (
    <button
      className={"obs-node" + (revealed ? " obs-node-revealed" : " obs-node-hidden")}
      style={{ left: `${left}%`, top: `${top}%` }}
      disabled={revealed || disabled}
      onClick={() => onReveal(obs.id)}
    >
      <span className="obs-node-label">{obs.label}</span>
      <span className="obs-node-value">{revealed ? obs.text : "???"}</span>
    </button>
  )
}

// 画面下半分そのものを鑑定机にする。商品(左)・そこから伸びる観察ノード・
// 魂判別機(右、hasDetectorの日だけ)を1つの机としてまとめて常時表示する。
// 「鑑定台に置く」という前段操作は廃止し、客と対面した時点から調べられる。
export function InspectionDesk({ item, hasDetector, soulCheckText }) {
  const revealedObservations = useGameStore((s) => s.revealedObservations)
  const revealObservation = useGameStore((s) => s.revealObservation)
  const [failed, setFailed] = useState(false)
  const itemDropRef = useRef(null)

  if (!item) return null
  const observations = item.hiddenObservations || []
  const budget = item.observationBudget ?? observations.length
  const remaining = Math.max(0, budget - revealedObservations.length)
  const total = observations.length
  const count = Math.max(observations.length, 1)

  return (
    <div className="inspection-desk">
      <p className="obs-budget">
        鑑定可能な情報: {total} / 今回確認できる情報: {remaining}
      </p>
      <div className="inspection-desk-row">
        <div className="inspection-desk-stage">
          <svg className="obs-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
            {observations.map((obs, i) => {
              const angleDeg = (360 / count) * i - 90
              const rad = (angleDeg * Math.PI) / 180
              const x2 = 50 + 40 * Math.cos(rad)
              const y2 = 50 + 36 * Math.sin(rad)
              return <line key={obs.id} x1="50" y1="50" x2={x2} y2={y2} />
            })}
          </svg>
          <div ref={itemDropRef} className="inspection-desk-item-dropzone">
            {item.image && !failed ? (
              <img
                className="inspection-desk-item-img"
                src={assetUrl(`assets/items/${item.image}.png`)}
                alt={item.name}
                onError={() => setFailed(true)}
              />
            ) : (
              <div className="inspection-desk-item-placeholder" aria-hidden="true" />
            )}
          </div>
          {observations.map((obs, i) => (
            <ObservationNode
              key={obs.id}
              obs={obs}
              angleDeg={(360 / count) * i - 90}
              radiusX={43}
              radiusY={39}
              revealed={revealedObservations.includes(obs.id)}
              disabled={remaining <= 0}
              onReveal={revealObservation}
            />
          ))}
        </div>
        {hasDetector && (
          <SoulDetectorTool dropZoneRef={itemDropRef} soulCheckText={soulCheckText} />
        )}
      </div>
    </div>
  )
}

// 魂判別機をボタンではなく道具として扱う。アイコンを、鑑定机中央の商品
// (dropZoneRef)に直接ドラッグしてかざす操作にする(ドラッグせずクリック
// しただけでも動作する保険つき)。判別機自体は商品の縮小コピーを持たず、
// 中央の実物だけが対象になるようにする。
export function SoulDetectorTool({ dropZoneRef, soulCheckText }) {
  const soulChecked = useGameStore((s) => s.soulChecked)
  const checkSoul = useGameStore((s) => s.checkSoul)
  const startRef = useRef({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [clonePos, setClonePos] = useState({ x: 0, y: 0 })

  const runCheck = () => {
    if (soulChecked) return
    dropZoneRef?.current?.classList.add("item-drop-flash")
    setTimeout(() => {
      checkSoul()
      dropZoneRef?.current?.classList.remove("item-drop-flash")
    }, 500)
  }

  const onPointerDown = (e) => {
    if (soulChecked) return
    e.currentTarget.setPointerCapture(e.pointerId)
    startRef.current = { x: e.clientX, y: e.clientY }
    setClonePos({ x: e.clientX, y: e.clientY })
    setDragging(true)
    dropZoneRef?.current?.classList.add("item-drop-active")
  }
  const onPointerMove = (e) => {
    if (!dragging) return
    setClonePos({ x: e.clientX, y: e.clientY })
  }
  const onPointerUp = (e) => {
    if (!dragging) return
    setDragging(false)
    dropZoneRef?.current?.classList.remove("item-drop-active")
    const moved = Math.hypot(e.clientX - startRef.current.x, e.clientY - startRef.current.y)
    if (moved < 10) {
      runCheck()
      return
    }
    const rect = dropZoneRef?.current?.getBoundingClientRect()
    if (rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
      runCheck()
    }
  }

  return (
    <div className="soul-tool-wrap">
      <button
        type="button"
        className={"soul-tool-btn" + (soulChecked ? " soul-tool-btn-done" : "")}
        disabled={soulChecked}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <img className="soul-tool-icon" src={assetUrl("assets/icons/icon-soul-detector.png")} alt="魂判別機" />
      </button>
      {dragging && (
        <img
          className="soul-tool-clone"
          style={{ left: clonePos.x, top: clonePos.y }}
          src={assetUrl("assets/icons/icon-soul-detector.png")}
          alt=""
        />
      )}
      <p className="soul-tool-result">{soulChecked ? soulCheckText : "道具を商品にかざして調べる"}</p>
    </div>
  )
}

// 棚に並ぶ買い取り済みの在庫。背景を単なる飾りにせず、7日間営業している
// 感覚を出す。ただし「観察したことしか分からない」原則を守るため、
// 魂反応など未確認の秘匿情報はここには出さない(名前と推定価値のみ)。
function ShelfSlot({ item }) {
  const [hover, setHover] = useState(false)
  const [failed, setFailed] = useState(false)
  return (
    <div
      className="shelf-slot"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {item.image && !failed ? (
        <img
          className="shelf-slot-img"
          src={assetUrl(`assets/items/${item.image}.png`)}
          alt={item.name}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="shelf-slot-placeholder" aria-hidden="true" />
      )}
      {hover && (
        <div className="shelf-tooltip">
          <p className="shelf-tooltip-name">{item.name}</p>
          <p className="shelf-tooltip-text">推定価値: {item.trueValue}G</p>
        </div>
      )}
    </div>
  )
}

export function ShelfDisplay() {
  const inventory = useGameStore((s) => s.inventory)
  if (inventory.length === 0) return null
  return (
    <div className="shelf-display">
      {inventory.map((item) => (
        <ShelfSlot key={item.invId} item={item} />
      ))}
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
