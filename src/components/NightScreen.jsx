import { useGameStore } from "../store/gameStore"
import { InfoOverlay, ScenePanel, DialogueLog, ResultPanel, IconLabel, InspectionDesk, ShelfDisplay, assetUrl } from "./panels"

function TopBar() {
  const day = useGameStore((s) => s.day)
  const gold = useGameStore((s) => s.gold)
  const quota = useGameStore((s) => s.quota)
  const customerIndex = useGameStore((s) => s.customerIndex)
  const inventoryCount = useGameStore((s) => s.inventory.length)
  const total = useGameStore((s) => s.currentDayConfig().customers.length)
  const moonPhase = Math.min(day, 7)

  return (
    <div className="topbar">
      <span className="topbar-stat">
        <img className="topbar-icon" src={assetUrl(`assets/icons/icon-moon-phase-${moonPhase}.png`)} alt="" />
        {day}日目
      </span>
      <span className="topbar-stat">
        <img className="topbar-icon" src={assetUrl("assets/icons/icon-gold.png")} alt="" />
        {gold}G
      </span>
      <span className="topbar-stat">
        <img className="topbar-icon" src={assetUrl("assets/icons/icon-quota.png")} alt="" />
        {quota}G
      </span>
      <span className="topbar-stat">
        <img className="topbar-icon" src={assetUrl("assets/icons/icon-inventory.png")} alt="" />
        {inventoryCount}点
      </span>
      <span>
        客 {customerIndex + 1} / {total}
      </span>
    </div>
  )
}

function DialoguePanel({ customer }) {
  const hasDetector = useGameStore((s) => s.currentDayConfig().hasDetector)
  const engaged = useGameStore((s) => s.engaged)
  const negotiationFailed = useGameStore((s) => s.negotiationFailed)
  const lastResolution = useGameStore((s) => s.lastResolution)
  const continueToNext = useGameStore((s) => s.continueToNext)
  const buyFull = useGameStore((s) => s.buyFull)
  const tryLowball = useGameStore((s) => s.tryLowball)
  const refuse = useGameStore((s) => s.refuse)
  const report = useGameStore((s) => s.report)

  // 鑑定机を出していない場面(客が声をかけてきた直後・判断の結果表示)でも
  // パネル自体の高さは変えない(engaged切り替えのたびに画面が動いて
  // 落ち着かないため)。その場面では中身を縦方向に中央寄せするだけにする。
  return (
    <div className="dialogue">
      <DialogueLog />

      {lastResolution ? (
        <div className="dialogue-center">
          <ResultPanel resolution={lastResolution} onContinue={continueToNext} />
        </div>
      ) : !engaged ? (
        <div className="dialogue-center">
          <p className="engage-hint">客をクリックして話を聞こう。</p>
        </div>
      ) : (
        <div className="actions">
          <InspectionDesk item={customer.item} hasDetector={hasDetector} soulCheckText={customer.soulCheckText} />

          <div className="action-group decision-plate">
            <p className="action-group-label">十分調べた。さて、どうする？</p>
            <button className="btn btn-trade" onClick={buyFull}>
              <IconLabel icon="icon-buy">言い値で買う({customer.item.askPrice}G)</IconLabel>
            </button>
            <button className="btn btn-trade" disabled={negotiationFailed} onClick={tryLowball}>
              <IconLabel icon="icon-haggle">値切る({customer.item.lowballPrice}G)</IconLabel>
            </button>
            <button className="btn btn-trade" onClick={refuse}>
              <IconLabel icon="icon-refuse">断る</IconLabel>
            </button>
            {/* ボタンの有無で「この客は怪しい」とバレないよう、通報は常に表示する
                (後ろめたさの無い客を通報した場合の結末はgameStore.report側で処理)。 */}
            <button className="btn btn-trade btn-report" onClick={report}>
              <IconLabel icon="icon-report">通報する</IconLabel>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NightScreen({ reference }) {
  const customer = useGameStore((s) => s.currentCustomer())
  const engaged = useGameStore((s) => s.engaged)
  const engageCustomer = useGameStore((s) => s.engageCustomer)

  return (
    <div className="night">
      <TopBar />
      <div className="night-body">
        <ScenePanel
          actorName={customer.name}
          actorImage={customer.image}
          topics={customer.topics}
          engaged={engaged}
          onEngage={engageCustomer}
          backdropImage="shop-room-back"
          illustrationClues={customer.illustrationClues}
        />
        <ShelfDisplay />
        <InfoOverlay reference={reference} />
      </div>
      <DialoguePanel customer={customer} />
    </div>
  )
}
