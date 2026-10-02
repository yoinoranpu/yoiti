import { useState, useEffect, useRef, useMemo } from "react"
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

// シーンは奥から手前へ: 背景 → キャラ、の順で重ねる。商品の情報は鑑定机に
// 一本化したので、カウンター越しに商品カードを浮かべる表現は廃止した。
export function ScenePanel({ actorName, actorImage, topics, engaged, onEngage, illustrationClues, backdropImage }) {
  const [talkOpen, setTalkOpen] = useState(false)
  useEffect(() => setTalkOpen(false), [actorName])

  const backdropStyle = backdropImage
    ? { backgroundImage: `url(${assetUrl(`assets/backgrounds/${backdropImage}.png`)})` }
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
          <div className="talk-hint-bubble" aria-hidden="true">
            <img className="talk-hint-icon" src={assetUrl("assets/icons/icon-talk.png")} alt="" />
          </div>
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
    </div>
  )
}

// 商品の各部位から線を伸ばした鑑定札。未鑑定は古い紙札風の「???」、
// 鑑定した瞬間にインクが乗るような小さな演出(obs-node-revealed)を入れる。
// ホバー中は「ここがクリックできる」とすぐ分かるよう、対応する線を
// 明るくし札を少し持ち上げる(onHoverはInspectionDesk側でクラス切り替え)。
function ObservationNode({ obs, left, top, revealed, suggested, disabled, onReveal, onHoverChange }) {
  return (
    <button
      className={
        "obs-node" +
        (revealed ? " obs-node-revealed" : " obs-node-hidden") +
        (suggested ? " obs-node-suggested" : "")
      }
      style={{ left: `${left}%`, top: `${top}%` }}
      disabled={revealed || disabled}
      onClick={() => onReveal(obs.id)}
      onMouseEnter={() => onHoverChange?.(obs.id)}
      onMouseLeave={() => onHoverChange?.(null)}
    >
      <span className="obs-node-label">{obs.label}</span>
      {revealed ? (
        <span className="obs-node-value">{obs.text}</span>
      ) : (
        <span className="obs-node-mark">？</span>
      )}
    </button>
  )
}

// 鑑定札は商品の左右2列に振り分ける。机が横長なので、放射状に並べるより
// 札が切れにくく、商品のどの部位から線が伸びているかも追いやすい。
// 振り分けは部位の位置そのもの(左寄りの部位は左の列)に従い、列の中でも
// 上下の順に並べる — 線が交差しにくくなり、図として読めるようになる。
// itemSpanX/Yは商品イラストの実際の占有範囲(机全体に対する割合)に合わせて
// あるので、線の始点が「本当にその部位の位置」から伸びて見える。
const layoutObservations = (observations, itemSpanX, itemSpanY) => {
  const entries = observations.map((obs) => ({
    obs,
    // 部位の位置(商品ローカルの0-100%、50が商品の中心)を机全体の座標に変換する。
    anchorX: 50 + ((obs.x ?? 50) - 50) * itemSpanX,
    anchorY: 50 + ((obs.y ?? 50) - 50) * itemSpanY,
    partX: obs.x ?? 50,
    partY: obs.y ?? 50,
  }))

  const byPartX = [...entries].sort((a, b) => a.partX - b.partX)
  const leftIds = new Set(byPartX.slice(0, Math.ceil(entries.length / 2)).map((e) => e.obs.id))
  const columns = { left: [], right: [] }
  entries.forEach((e) => columns[leftIds.has(e.obs.id) ? "left" : "right"].push(e))

  return ["left", "right"].flatMap((side) => {
    const column = columns[side].sort((a, b) => a.partY - b.partY)
    const step = column.length > 1 ? 76 / (column.length - 1) : 0
    return column.map((e, i) => ({
      ...e,
      left: side === "left" ? 14 : 86,
      top: column.length > 1 ? 12 + step * i : 50,
    }))
  })
}


// 画面下半分そのものを鑑定机にする。商品(左)・そこから伸びる観察ノード・
// 魂判別機(右、hasDetectorの日だけ)を1つの机としてまとめて常時表示する。
// 「鑑定台に置く」という前段操作は廃止し、客と対面した時点から調べられる。
export function InspectionDesk({ item, hasDetector, soulCheckText }) {
  const revealedObservations = useGameStore((s) => s.revealedObservations)
  const revealObservation = useGameStore((s) => s.revealObservation)
  const usedTopics = useGameStore((s) => s.usedTopics)
  const actor = useGameStore((s) => s.currentActor())
  // 会話で聞いた話題のうちhint付きのものを既に聞いていれば、その観察ポイントを
  // 「調べてみる価値がありそう」として示す(会話→推理→鑑定の橋渡し)。
  // hintは今のところ一部の客のtopicsにしか付けていないので、無ければ
  // 自然に何も示されない。filter/mapの結果をそのままZustandセレクタの
  // 戻り値にすると毎回新しい配列になり無限ループするため、ここでuseMemoする。
  const suggestedIds = useMemo(() => {
    if (!actor?.topics) return []
    return actor.topics.filter((t) => t.hint && usedTopics.includes(t.id)).map((t) => t.hint)
  }, [actor, usedTopics])
  const [failed, setFailed] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)
  const itemDropRef = useRef(null)

  if (!item) return null
  const observations = item.hiddenObservations || []
  const budget = item.observationBudget ?? observations.length
  const used = revealedObservations.length
  const remaining = Math.max(0, budget - used)
  const total = observations.length
  // 商品イラストが机の中心でどれくらいの幅/高さを占めるか(机全体に対する比率)。
  // ここに合わせて部位の位置を変換するので、線が本当に商品の上のその場所から
  // 伸びているように見える(商品を拡大したので、ここも合わせて大きくした)。
  const placed = layoutObservations(observations, 0.6, 0.6)

  return (
    <div
      className="inspection-desk-row"
      style={{ backgroundImage: `url(${assetUrl("assets/backgrounds/inspection-desk-back.png")})` }}
    >
      <div className="inspection-desk-stage">
        <div className="inspection-desk-stage-dim" aria-hidden="true" />
        {/* 残り回数は独立した帯にせず、机の隅に小さな札として置く。 */}
        <span className="obs-budget-badge">
          🔎 {remaining}/{total}
        </span>
        <svg className="obs-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
            {placed.map(({ obs, left, top, anchorX, anchorY }) => (
              <line
                key={obs.id}
                className={
                  "obs-line" +
                  (revealedObservations.includes(obs.id) ? " obs-line-revealed" : "") +
                  (hoveredId === obs.id ? " obs-line-hovered" : "") +
                  (!revealedObservations.includes(obs.id) && suggestedIds.includes(obs.id)
                    ? " obs-line-suggested"
                    : "")
                }
                x1={anchorX}
                y1={anchorY}
                x2={left}
                y2={top}
              />
            ))}
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
          {placed.map(({ obs, anchorX, anchorY }) => (
            <span
              key={`anchor-${obs.id}`}
              className={
                "obs-anchor" +
                (revealedObservations.includes(obs.id) ? " obs-anchor-revealed" : "") +
                (hoveredId === obs.id ? " obs-anchor-hovered" : "")
              }
              style={{ left: `${anchorX}%`, top: `${anchorY}%` }}
              aria-hidden="true"
            />
          ))}
          {placed.map(({ obs, left, top }) => (
            <ObservationNode
              key={obs.id}
              obs={obs}
              left={left}
              top={top}
              revealed={revealedObservations.includes(obs.id)}
              suggested={!revealedObservations.includes(obs.id) && suggestedIds.includes(obs.id)}
              disabled={remaining <= 0}
              onReveal={revealObservation}
              onHoverChange={setHoveredId}
            />
          ))}
        </div>
        {hasDetector ? (
          <SoulDetectorTool dropZoneRef={itemDropRef} soulCheckText={soulCheckText} />
        ) : (
          // 判別機が無い場面でも机の割り付け(左=羊皮紙/右=台座)は変えない。
          // 商品が羊皮紙の中央から外れてしまうのを防ぐため、台座側は空けておく。
          <div className="soul-tool-wrap" aria-hidden="true" />
        )}
      </div>
  )
}

// 魂判別機をボタンではなく道具として扱う。アイコンを、鑑定机中央の商品
// (dropZoneRef)に直接ドラッグしてかざす操作にする(ドラッグせずクリック
// しただけでも動作する保険つき)。判別機自体は商品の縮小コピーを持たず、
// 中央の実物だけが対象になるようにする。
// 判別機をドラッグしている間、先端から商品へ向かって魔力の光が伸びている
// ように見せる。「どうやって商品にかざすのか」を説明文に頼らず伝えるための
// 視覚的な導線。
// intensity(0〜1)は商品への近さ。近づくほど太く・明るくなり、「実際に
// かざして反応を強めている」感覚を出す。
function SoulBeam({ from, targetRef, intensity }) {
  const rect = targetRef?.current?.getBoundingClientRect()
  if (!rect) return null
  const tx = rect.left + rect.width / 2
  const ty = rect.top + rect.height / 2
  return (
    <svg className="soul-beam" style={{ "--soul-beam-intensity": intensity }}>
      <line x1={from.x} y1={from.y} x2={tx} y2={ty} />
    </svg>
  )
}

export function SoulDetectorTool({ dropZoneRef, soulCheckText }) {
  const soulChecked = useGameStore((s) => s.soulChecked)
  const checkSoul = useGameStore((s) => s.checkSoul)
  const startRef = useRef({ x: 0, y: 0 })
  // ドラッグ中かどうかは ref でも持つ。pointerdown→pointerup が同じタスク内で
  // 連続して届いた場合(自動操作など)に、state の反映待ちで取りこぼさないため。
  const draggingRef = useRef(false)
  const [dragging, setDragging] = useState(false)
  const [clonePos, setClonePos] = useState({ x: 0, y: 0 })
  const [proximity, setProximity] = useState(0)

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
    draggingRef.current = true
    setDragging(true)
  }
  // ドラッグ中、商品への距離に応じて「近づける→弱く光る→かざす」の段階を
  // つける。離れている間はclassを外し、近づくほど強い紫の光に切り替わる。
  const onPointerMove = (e) => {
    if (!draggingRef.current) return
    setClonePos({ x: e.clientX, y: e.clientY })
    const rect = dropZoneRef?.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy)
    const over =
      e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
    const nearRange = Math.max(rect.width, rect.height) * 1.6
    const near = dist < nearRange
    dropZoneRef.current.classList.toggle("item-drop-active", over)
    dropZoneRef.current.classList.toggle("item-drop-near", near && !over)
    // ビームの強さは距離の逆数。遠いほど弱く、かざしている間は最大になる。
    setProximity(over ? 1 : Math.max(0, 1 - dist / (nearRange * 2.2)))
  }
  const onPointerUp = (e) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    setDragging(false)
    dropZoneRef?.current?.classList.remove("item-drop-active", "item-drop-near")
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
        <>
          <SoulBeam from={clonePos} targetRef={dropZoneRef} intensity={proximity} />
          <img
            className="soul-tool-clone"
            style={{ left: clonePos.x, top: clonePos.y }}
            src={assetUrl("assets/icons/icon-soul-detector.png")}
            alt=""
          />
        </>
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
          <p className="shelf-tooltip-text">買取価格: {item.paidPrice ?? 0}G</p>
          <p className="shelf-tooltip-text">推定価値: {item.trueValue}G</p>
          {item.hiddenObservations && (
            <p className="shelf-tooltip-text">
              鑑定済み: {item.observedCount ?? 0}/{item.hiddenObservations.length}
            </p>
          )}
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

// 直近の1行はキャラの吹き出し(SpeechBubble)に出ているので、ここでは
// 重複させずそれより前の履歴だけを並べる。
export function DialogueLog() {
  const dialogueLog = useGameStore((s) => s.dialogueLog)
  const history = dialogueLog.slice(0, -1)
  return (
    <div className="dialogue-log">
      {history.map((line, i) => (
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
