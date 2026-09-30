import { create } from "zustand"
import { DAYS, START_GOLD } from "../data/days"

const currentDayConfig = (state) => DAYS[state.day - 1]

let inventoryUid = 0
const itemToInventory = (item) => ({
  invId: `inv-${inventoryUid++}`,
  name: item.name,
  image: item.image,
  description: item.description,
  trueValue: item.trueValue,
  haggleValue: item.haggleValue,
  hasSoul: item.hasSoul,
  hiddenObservations: item.hiddenObservations,
  observationBudget: item.observationBudget,
  buyer: item.buyer,
})

// soulAutoReveal: 判別機がない日(共鳴)は、客と対面した時点で自動的に
// 「見た情報」に魂反応が追加される。判別機がある日はnullを渡す。
const encounterStateFor = (actor, soulAutoReveal) => {
  const inspection = actor.appearance.map((a) => ({ id: a.id, label: a.label, text: a.text }))
  if (soulAutoReveal) {
    inspection.push({ id: `${actor.id}-resonance`, label: "共鳴", text: soulAutoReveal })
  }
  return {
    inspection,
    dialogueLog: [{ speaker: "narration", text: actor.arrival }],
    usedTopics: [],
    viewedClues: [],
    revealedObservations: [],
  }
}

// 判別機を失った後は「共鳴」で気づく。企画書9章の通り、魂反応がある時だけ
// 青白い文字が浮かび上がる演出にする(判別機の針が動く描写とは分けている)。
const soulRevealFor = (customer, hasDetector) => {
  if (hasDetector || !customer.item?.hasSoul) return null
  return "商品情報の紙に、青白い文字がふっと浮かび上がる — 魂反応: あり。"
}

// 7日目クリア時の心証・所持金から、4種類のうちどのエンディングになるかを決める。
// 「正解」を決めるものではなく、積み重ねた選択の結果を反映するだけの分岐。
const determineEnding = (churchFavor, marketFavor, gold) => {
  if (churchFavor - marketFavor >= 10) return "church"
  if (marketFavor - churchFavor >= 10) return "market"
  if (gold >= 200) return "wealthy"
  return "neutral"
}

// 判断の結果に favor: { church, market } が付いていれば心証に加算する。
// 付いていない(undefined)取引は心証に影響しない — 毎回の取引を評価対象にすると
// ノイズになるので、意味のある選択(通報・シスター・マレン・ヴィクターの取引など)
// にだけ付けてある。
const applyFavor = (state, favor) =>
  favor
    ? {
        churchFavor: state.churchFavor + (favor.church || 0),
        marketFavor: state.marketFavor + (favor.market || 0),
      }
    : {}

export const useGameStore = create((set, get) => ({
  screen: "title", // title | night | resolved | appraisal | robbed | clear | gameover | victory
  day: 1,
  gold: START_GOLD,
  quota: DAYS[0].quota,
  churchFavor: 0,
  marketFavor: 0,
  customerIndex: 0,
  notes: [],
  inspection: [],
  dialogueLog: [],
  usedTopics: [],
  itemRevealed: false,
  soulChecked: false,
  negotiationFailed: false,
  inventory: [], // 週をまたいで持ち越す在庫。売れた品だけ取り除き、やめた品は残す。
  lastResolution: null,
  appraisalIndex: 0,
  appraisalQueue: [], // その日の査定対象のスナップショット(在庫は査定中に減っていくため)
  appraisalResolution: null,
  viewedClues: [],
  revealedObservations: [], // 今回の接客で鑑定机から個別に開示済みの hiddenObservations id
  ending: null,

  startNight: () => {
    const day1 = DAYS[0]
    const customer = day1.customers[0]
    set({
      screen: "night",
      day: 1,
      gold: START_GOLD,
      quota: day1.quota,
      churchFavor: 0,
      marketFavor: 0,
      customerIndex: 0,
      notes: [],
      ...encounterStateFor(customer, soulRevealFor(customer, day1.hasDetector)),
      itemRevealed: false,
      soulChecked: false,
      negotiationFailed: false,
      inventory: [],
      lastResolution: null,
      appraisalIndex: 0,
      appraisalQueue: [],
      appraisalResolution: null,
    })
  },

  currentDayConfig: () => currentDayConfig(get()),
  currentCustomer: () => currentDayConfig(get()).customers[get().customerIndex],
  currentAppraisalItem: () => get().appraisalQueue[get().appraisalIndex],
  currentBuyer: () => get().currentAppraisalItem()?.buyer,
  // 会話パネルは買い(客)・売り(仲買人)の両方で共有する。今どちらの相手と話しているか。
  currentActor: () => (get().screen === "appraisal" ? get().currentBuyer() : get().currentCustomer()),
  // 鑑定机も買い・売り両方で共有する。今調べている商品はどちらか。
  currentItem: () => (get().screen === "appraisal" ? get().currentAppraisalItem() : get().currentCustomer()?.item),

  talk: (topicId) => {
    const actor = get().currentActor()
    if (!actor) return
    const topic = actor.topics.find((t) => t.id === topicId)
    if (!topic || get().usedTopics.includes(topicId)) return
    set((state) => ({
      dialogueLog: [...state.dialogueLog, { speaker: actor.name, text: topic.line }],
      usedTopics: [...state.usedTopics, topicId],
      notes: topic.note ? [...state.notes, { id: topicId, text: topic.note }] : state.notes,
    }))
  },

  // イラスト上のホットスポットをクリックして得る手がかり。イラストが用意でき次第、
  // ScenePanel がactor.illustrationCluesを元にホットスポットを自動表示する。
  inspectIllustrationClue: (clueId) => {
    const actor = get().currentActor()
    if (!actor || get().viewedClues.includes(clueId)) return
    const clue = actor.illustrationClues?.find((c) => c.id === clueId)
    if (!clue) return
    set((state) => ({
      viewedClues: [...state.viewedClues, clueId],
      inspection: [...state.inspection, { id: clue.id, label: clue.label, text: clue.text }],
    }))
  },

  // 商品を鑑定台に置く動作。個々の観察結果はここでは開示せず、鑑定机
  // (revealObservation)で1つずつ選んで調べる。
  inspectItem: () => {
    if (get().itemRevealed) return
    set({ itemRevealed: true })
  },

  // 鑑定机で商品の一部位を調べる。今回の接客で確認できる件数
  // (item.observationBudget、未設定ならhiddenObservations全件)を超えては
  // 調べられない。
  revealObservation: (obsId) => {
    const item = get().currentItem()
    if (!item) return
    const revealed = get().revealedObservations
    if (revealed.includes(obsId)) return
    const budget = item.observationBudget ?? item.hiddenObservations.length
    if (revealed.length >= budget) return
    const obs = item.hiddenObservations.find((o) => o.id === obsId)
    if (!obs) return
    set((state) => ({
      revealedObservations: [...state.revealedObservations, obsId],
      inspection: [...state.inspection, { id: obs.id, label: obs.label, text: obs.text }],
    }))
  },

  // 判別機がある日だけ使う。4日目以降(共鳴)は自動判定なのでこのボタン自体を出さない。
  checkSoul: () => {
    const customer = get().currentCustomer()
    if (get().soulChecked) return
    set((state) => ({
      soulChecked: true,
      inspection: [
        ...state.inspection,
        { id: `${customer.id}-soul`, label: "魂判別機", text: customer.soulCheckText },
      ],
    }))
  },

  // 値切り交渉。後ろめたい客(guilty)はあっさり応じて取引成立、そうでない客は突っぱねて交渉決裂。
  // 決裂した場合は交渉のやり取り自体が「見た情報」に手がかりとして残る。
  tryLowball: () => {
    const customer = get().currentCustomer()
    if (get().negotiationFailed || get().lastResolution) return

    if (customer.guilty) {
      set((state) => ({
        gold: state.gold - customer.item.lowballPrice,
        inventory: [...state.inventory, itemToInventory(customer.item)],
        dialogueLog: [...state.dialogueLog, { speaker: customer.name, text: customer.negotiation.accept }],
        lastResolution: { goldDelta: -customer.item.lowballPrice },
        screen: "resolved",
        ...applyFavor(state, customer.resolution.buyFull?.favor),
      }))
      return
    }

    set((state) => ({
      negotiationFailed: true,
      dialogueLog: [...state.dialogueLog, { speaker: customer.name, text: customer.negotiation.reject }],
      inspection: [
        ...state.inspection,
        { id: `${customer.id}-negotiation`, label: "値切り交渉", text: "強く突っぱねられた。後ろめたい様子はない。" },
      ],
    }))
  },

  buyFull: () => {
    const customer = get().currentCustomer()
    set((state) => ({
      gold: state.gold - customer.item.askPrice,
      inventory: [...state.inventory, itemToInventory(customer.item)],
      dialogueLog: [...state.dialogueLog, { speaker: "narration", text: customer.resolution.buyFull.text }],
      lastResolution: { goldDelta: -customer.item.askPrice },
      screen: "resolved",
      ...applyFavor(state, customer.resolution.buyFull.favor),
    }))
  },

  refuse: () => {
    const customer = get().currentCustomer()
    set((state) => ({
      dialogueLog: [...state.dialogueLog, { speaker: "narration", text: customer.resolution.refuse.text }],
      lastResolution: { goldDelta: 0 },
      screen: "resolved",
      ...applyFavor(state, customer.resolution.refuse.favor),
    }))
  },

  report: () => {
    const customer = get().currentCustomer()
    const resolution = customer.resolution.report
    if (!resolution) return
    set((state) => ({
      gold: state.gold + resolution.goldDelta,
      dialogueLog: [...state.dialogueLog, { speaker: "narration", text: resolution.text }],
      lastResolution: { goldDelta: resolution.goldDelta },
      screen: "resolved",
      ...applyFavor(state, resolution.favor),
    }))
  },

  continueToNext: () => {
    const state = get()
    const config = currentDayConfig(state)
    const nextIndex = state.customerIndex + 1
    if (nextIndex >= config.customers.length) {
      const queue = [...state.inventory]
      const firstItem = queue[0]
      set({
        screen: "appraisal",
        appraisalIndex: 0,
        appraisalQueue: queue,
        appraisalResolution: null,
        ...(firstItem
          ? encounterStateFor(firstItem.buyer, null)
          : { inspection: [], dialogueLog: [], usedTopics: [], revealedObservations: [] }),
      })
      return
    }
    const customer = config.customers[nextIndex]
    set({
      screen: "night",
      customerIndex: nextIndex,
      ...encounterStateFor(customer, soulRevealFor(customer, config.hasDetector)),
      itemRevealed: false,
      soulChecked: false,
      negotiationFailed: false,
      lastResolution: null,
    })
  },

  // 言い値で売る: 確実にtrueValueが手に入る。売れた品は在庫から取り除く。
  sellAtValue: () => {
    const item = get().currentAppraisalItem()
    if (!item || get().appraisalResolution) return
    set((state) => ({
      gold: state.gold + item.trueValue,
      inventory: state.inventory.filter((i) => i.invId !== item.invId),
      dialogueLog: [
        ...state.dialogueLog,
        { speaker: "narration", text: `${item.name}は言い値の${item.trueValue}Gで引き取られた。` },
      ],
      appraisalResolution: { goldDelta: item.trueValue },
    }))
  },

  // 高く売れないか粘る: 魂入りなど危ない品だと買い手が手を引いてしまうことがある。
  // 手を引かれた場合は売れていないので在庫に残す。
  tryHaggleUp: () => {
    const item = get().currentAppraisalItem()
    if (!item || get().appraisalResolution) return
    if (item.hasSoul) {
      set((state) => ({
        dialogueLog: [
          ...state.dialogueLog,
          { speaker: item.buyer.name, text: "「そこまで背負うつもりはない」" },
        ],
        appraisalResolution: { goldDelta: 0 },
      }))
      return
    }
    set((state) => ({
      gold: state.gold + item.haggleValue,
      inventory: state.inventory.filter((i) => i.invId !== item.invId),
      dialogueLog: [
        ...state.dialogueLog,
        { speaker: "narration", text: `粘って${item.name}を${item.haggleValue}Gまで引き上げさせた。` },
      ],
      appraisalResolution: { goldDelta: item.haggleValue },
    }))
  },

  // やめておく: 在庫に残したまま、翌日以降また査定できる。
  skipSell: () => {
    const item = get().currentAppraisalItem()
    if (!item || get().appraisalResolution) return
    set((state) => ({
      dialogueLog: [
        ...state.dialogueLog,
        { speaker: "narration", text: `${item.name}は今夜は売らずに懐にしまった。` },
      ],
      appraisalResolution: { goldDelta: 0 },
    }))
  },

  continueAppraisal: () => {
    const nextIndex = get().appraisalIndex + 1
    const nextItem = get().appraisalQueue[nextIndex]
    set({
      appraisalIndex: nextIndex,
      appraisalResolution: null,
      ...(nextItem ? encounterStateFor(nextItem.buyer, null) : {}),
    })
  },

  // 3日目専用: 査定が終わった後、上納金の判定をする前に強盗に有り金を奪われる。
  // プレイヤーの実力に関係なく必ず発生させ、ゲームオーバーにはせず判別機没収に繋げる。
  triggerRobbery: () => {
    set({ screen: "robbed", gold: 0, inventory: [] })
  },

  endDay: () => {
    const state = get()
    if (state.gold < state.quota) {
      set({ screen: "gameover" })
      return
    }
    const remaining = state.gold - state.quota
    if (state.day >= DAYS.length) {
      set({ gold: remaining, screen: "victory", ending: determineEnding(state.churchFavor, state.marketFavor, remaining) })
      return
    }
    set({ gold: remaining, screen: "clear" })
  },

  // 「次の日へ」共通処理(通常のクリア後・強盗イベント後の両方から呼ぶ)。
  // 在庫(inventory)はあえてリセットしない — 「やめておく」を選んだ品は
  // 翌日以降にも持ち越されて、また査定できる。
  advanceDay: () => {
    const nextDay = get().day + 1
    const nextConfig = DAYS[nextDay - 1]
    const firstCustomer = nextConfig.customers[0]
    set({
      day: nextDay,
      quota: nextConfig.quota,
      customerIndex: 0,
      screen: "night",
      ...encounterStateFor(firstCustomer, soulRevealFor(firstCustomer, nextConfig.hasDetector)),
      itemRevealed: false,
      soulChecked: false,
      negotiationFailed: false,
      lastResolution: null,
      appraisalIndex: 0,
      appraisalQueue: [],
      appraisalResolution: null,
    })
  },

  restart: () => {
    set({ screen: "title" })
  },
}))
