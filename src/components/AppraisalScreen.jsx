import { useGameStore } from "../store/gameStore"
import { REFERENCE } from "../data/days"
import { InfoOverlay, ScenePanel, DialogueLog, ResultPanel, IconLabel, InspectionDesk, DecisionMemo, assetUrl } from "./panels"

function TopBar() {
  const day = useGameStore((s) => s.day)
  const gold = useGameStore((s) => s.gold)
  const quota = useGameStore((s) => s.quota)
  const appraisalIndex = useGameStore((s) => s.appraisalIndex)
  const queueCount = useGameStore((s) => s.appraisalQueue.length)
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
      <span>
        査定 {appraisalIndex + 1} / {queueCount}
      </span>
    </div>
  )
}

function SellDialoguePanel({ item }) {
  const engaged = useGameStore((s) => s.engaged)
  const appraisalResolution = useGameStore((s) => s.appraisalResolution)
  const continueAppraisal = useGameStore((s) => s.continueAppraisal)
  const sellAtValue = useGameStore((s) => s.sellAtValue)
  const tryHaggleUp = useGameStore((s) => s.tryHaggleUp)
  const skipSell = useGameStore((s) => s.skipSell)
  const revealedObservations = useGameStore((s) => s.revealedObservations)

  return (
    <div className="dialogue">
      <DialogueLog />

      {appraisalResolution ? (
        <div className="dialogue-center">
          <ResultPanel resolution={appraisalResolution} onContinue={continueAppraisal} />
        </div>
      ) : !engaged ? (
        <div className="dialogue-center">
          <p className="engage-hint">買い手をクリックして話を聞こう。</p>
        </div>
      ) : (
        <div className="actions">
          <InspectionDesk item={item} />

          <div className="action-group decision-plate">
            <p className="action-group-label">十分調べた。さて、どうする？</p>
            <button className="btn btn-trade" onClick={sellAtValue}>
              <IconLabel icon="icon-buy">言い値で売る({item.trueValue}G)</IconLabel>
            </button>
            <button className="btn btn-trade" onClick={tryHaggleUp}>
              <IconLabel icon="icon-haggle">高く売れないか粘る({item.haggleValue}G)</IconLabel>
            </button>
            <button className="btn btn-trade" onClick={skipSell}>
              <IconLabel icon="icon-refuse">やめておく</IconLabel>
            </button>
            <DecisionMemo item={item} revealedObservations={revealedObservations} soulLine={null} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function AppraisalScreen() {
  const day = useGameStore((s) => s.day)
  const forcedEvent = useGameStore((s) => s.currentDayConfig().forcedEvent)
  const gold = useGameStore((s) => s.gold)
  const quota = useGameStore((s) => s.quota)
  const appraisalQueue = useGameStore((s) => s.appraisalQueue)
  const appraisalIndex = useGameStore((s) => s.appraisalIndex)
  const remaining = useGameStore((s) => s.inventory.length)
  const endDay = useGameStore((s) => s.endDay)
  const triggerRobbery = useGameStore((s) => s.triggerRobbery)
  const engaged = useGameStore((s) => s.engaged)
  const engageCustomer = useGameStore((s) => s.engageCustomer)

  const done = appraisalIndex >= appraisalQueue.length

  if (appraisalQueue.length > 0 && !done) {
    const item = appraisalQueue[appraisalIndex]
    return (
      <div className="night">
        <TopBar />
        <div className="night-body">
          <ScenePanel
            actorName={item.buyer.name}
            actorImage={item.buyer.image}
            topics={item.buyer.topics}
            engaged={engaged}
            onEngage={engageCustomer}
            backdropImage="appraisal-room-back"
            illustrationClues={item.buyer.illustrationClues}
          />
          <InfoOverlay reference={REFERENCE} />
        </div>
        <SellDialoguePanel item={item} />
      </div>
    )
  }

  return (
    <div className="screen screen-center">
      <h1 className="title">{day}日目、夜が明ける前に</h1>
      <p className="subtitle">
        {appraisalQueue.length === 0 ? "今夜査定する品はなかった。" : "査定できるだけの品を捌いた。"}
      </p>
      {remaining > 0 && (
        <p className="subtitle">売らなかった品が{remaining}点、店に残っている。翌日以降また売れる。</p>
      )}
      <p>
        所持金 {gold}G / 上納金 {quota}G
      </p>
      {forcedEvent === "robbery" ? (
        <button className="btn btn-primary" onClick={triggerRobbery}>
          店じまいの支度をする
        </button>
      ) : (
        <button className="btn btn-primary" onClick={endDay}>
          上納金を納める
        </button>
      )}
    </div>
  )
}
