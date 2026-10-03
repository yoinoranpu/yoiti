import { useGameStore, OWNER } from "../store/gameStore"
import { REFERENCE } from "../data/days"
import { InfoOverlay, ScenePanel, DialogueLog, ResultPanel, IconLabel, InspectionDesk, assetUrl } from "./panels"

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

  return (
    <div className="dialogue">
      <DialogueLog />

      {!engaged ? (
        <div className="dialogue-center">
          <p className="engage-hint">買い手をクリックして話を聞こう。</p>
        </div>
      ) : (
        <div className="actions">
          <InspectionDesk item={item} itemKind={appraisalResolution?.kind} />

          <div className="action-group decision-plate">
            {appraisalResolution ? (
              <ResultPanel resolution={appraisalResolution} onContinue={continueAppraisal} />
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// その日の査定がすべて終わった後、客と同じ「話しかけて向き合う」UIで
// 元締めが上納金を取り立てに来る場面。トピックは持たないので、話しかけたら
// すぐ払う/店じまいの二択だけを出す(買い取り・査定の二択UIより簡素)。
function OwnerPanel({ day, gold, quota, remaining, forcedEvent, engaged, endDay, triggerRobbery }) {
  return (
    <div className="dialogue">
      <DialogueLog />

      {!engaged ? (
        <div className="dialogue-center">
          <p className="engage-hint">元締めをクリックして話を聞こう。</p>
        </div>
      ) : (
        <div className="actions">
          <div className="dialogue-center">
            <div className="action-group decision-plate">
              <p className="action-group-label">
                {day}日目、夜が明ける前に。所持金 {gold}G / 上納金 {quota}G
                {remaining > 0 && `(売らなかった品が${remaining}点、店に残っている)`}
              </p>
              {forcedEvent === "robbery" ? (
                <button className="btn btn-trade" onClick={triggerRobbery}>
                  <IconLabel icon="icon-refuse">店じまいの支度をする</IconLabel>
                </button>
              ) : (
                <button className="btn btn-trade" onClick={endDay}>
                  <IconLabel icon="icon-buy">上納金を納める({quota}G)</IconLabel>
                </button>
              )}
            </div>
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
  const appraisalResolution = useGameStore((s) => s.appraisalResolution)

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
            backdropImage="shop-room-back"
            illustrationClues={item.buyer.illustrationClues}
            leaving={!!appraisalResolution}
          />
          <InfoOverlay reference={REFERENCE} />
        </div>
        <SellDialoguePanel item={item} />
      </div>
    )
  }

  return (
    <div className="night">
      <TopBar />
      <div className="night-body">
        <ScenePanel
          actorName={OWNER.name}
          actorImage={OWNER.image}
          topics={null}
          engaged={engaged}
          onEngage={engageCustomer}
          backdropImage="shop-room-back"
          engageHint="元締めをクリックして話を聞こう"
        />
        <InfoOverlay reference={REFERENCE} />
      </div>
      <OwnerPanel
        day={day}
        gold={gold}
        quota={quota}
        remaining={remaining}
        forcedEvent={forcedEvent}
        engaged={engaged}
        endDay={endDay}
        triggerRobbery={triggerRobbery}
      />
    </div>
  )
}
