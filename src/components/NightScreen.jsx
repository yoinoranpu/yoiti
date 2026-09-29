import { useGameStore } from "../store/gameStore"
import { InfoOverlay, ScenePanel, DialogueLog, TalkGroup, ResultPanel } from "./panels"

function TopBar() {
  const day = useGameStore((s) => s.day)
  const gold = useGameStore((s) => s.gold)
  const quota = useGameStore((s) => s.quota)
  const customerIndex = useGameStore((s) => s.customerIndex)
  const inventoryCount = useGameStore((s) => s.inventory.length)
  const total = useGameStore((s) => s.currentDayConfig().customers.length)

  return (
    <div className="topbar">
      <span>{day}日目</span>
      <span>所持金 {gold}G</span>
      <span>上納金 {quota}G</span>
      <span>在庫 {inventoryCount}点</span>
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
            <p className="action-group-label">調べる</p>
            <button className="btn btn-topic" disabled={itemRevealed} onClick={inspectItem}>
              商品を詳しく調べる
            </button>
            {hasDetector && (
              <button className="btn btn-topic" disabled={soulChecked} onClick={checkSoul}>
                魂判別機を使う
              </button>
            )}
          </div>

          <div className="action-group">
            <p className="action-group-label">判断する</p>
            <button className="btn btn-trade" onClick={buyFull}>
              言い値で買う({customer.item.askPrice}G)
            </button>
            <button className="btn btn-trade" disabled={negotiationFailed} onClick={tryLowball}>
              値切る({customer.item.lowballPrice}G)
            </button>
            <button className="btn btn-trade" onClick={refuse}>
              断る
            </button>
            {customer.resolution.report && (
              <button className="btn btn-trade btn-report" onClick={report}>
                通報する
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
