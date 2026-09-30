import { useGameStore } from "../store/gameStore"
import { InfoOverlay, ScenePanel, DialogueLog, TalkGroup, ResultPanel, IconLabel, InspectionDesk, assetUrl } from "./panels"

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
  const itemRevealed = useGameStore((s) => s.itemRevealed)
  const soulChecked = useGameStore((s) => s.soulChecked)
  const negotiationFailed = useGameStore((s) => s.negotiationFailed)
  const lastResolution = useGameStore((s) => s.lastResolution)
  const continueToNext = useGameStore((s) => s.continueToNext)
  const inspectItem = useGameStore((s) => s.inspectItem)
  const checkSoul = useGameStore((s) => s.checkSoul)
  const buyFull = useGameStore((s) => s.buyFull)
  const tryLowball = useGameStore((s) => s.tryLowball)
  const refuse = useGameStore((s) => s.refuse)
  const report = useGameStore((s) => s.report)

  return (
    <div className="dialogue">
      <DialogueLog />

      {lastResolution ? (
        <ResultPanel resolution={lastResolution} onContinue={continueToNext} />
      ) : (
        <div className="actions">
          <TalkGroup topics={customer.topics} />

          <div className="action-group">
            <p className="action-group-label">
              <IconLabel icon="icon-inspect">調べる</IconLabel>
            </p>
            <button className="btn btn-topic" disabled={itemRevealed} onClick={inspectItem}>
              <IconLabel icon="icon-inspect">商品を鑑定台に置く</IconLabel>
            </button>
            {hasDetector && (
              <button className="btn btn-topic" disabled={soulChecked} onClick={checkSoul}>
                <IconLabel icon="icon-soul-detector">魂判別機を使う</IconLabel>
              </button>
            )}
          </div>

          {itemRevealed && <InspectionDesk item={customer.item} />}

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
            {customer.resolution.report && (
              <button className="btn btn-trade btn-report" onClick={report}>
                <IconLabel icon="icon-report">通報する</IconLabel>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function NightScreen({ reference }) {
  const customer = useGameStore((s) => s.currentCustomer())
  const itemRevealed = useGameStore((s) => s.itemRevealed)

  return (
    <div className="night">
      <TopBar />
      <div className="night-body">
        <ScenePanel
          actorName={customer.name}
          actorImage={customer.image}
          backdropImage="shop-room-back"
          counterImage="shop-counter-front"
          showItemCard={itemRevealed}
          itemName={customer.item.name}
          itemImage={customer.item.image}
          itemDescription={customer.item.description}
          priceLabel="言い値"
          price={customer.item.askPrice}
          illustrationClues={customer.illustrationClues}
        />
        <InfoOverlay reference={reference} />
      </div>
      <DialoguePanel customer={customer} />
    </div>
  )
}
