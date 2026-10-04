import { create } from "zustand"
import { DAYS, START_GOLD } from "../data/days"

const currentDayConfig = (state) => DAYS[state.day - 1]

// その夜の客の来店順に軽い運要素を持たせる(Fisher-Yates)。元の配列は
// 書き換えずコピーを返す。Day1はチュートリアルなので呼び出し側で素通し
// にする(固定順のまま)。
const shuffled = (arr) => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// 再販リスク判定(運要素)。item.riskyResaleがある品(後ろめたい経緯で
// 仕入れた品など)を売るとき、買い手がその場で何かに気づくかどうかを運で
// 決める。気づかれた場合はその場で少し値切られて完結する(尾を引かない)。
// 気づかれなかった場合は満額のまま、代わりに後から静かに評判が落ちる
// (marketFavorのみ変動。所持金には影響しないため、運が悪くても上納金が
// 払えなくなることはなく、エンディングの色が変わるだけに留める)。
const RISKY_NOTICE_CUT = 0.8
const applyRiskyResale = (item, buyer, baseGold) => {
  if (!item.riskyResale) return { gold: baseGold, extraLine: null, favor: null }
  if (Math.random() < 0.5) {
    return {
      gold: Math.round(baseGold * RISKY_NOTICE_CUT),
      extraLine: {
        speaker: buyer.name,
        text: "品を検めていた手が、ふと止まった。「……まあ、この値なら目をつぶろう」",
      },
      favor: null,
    }
  }
  return {
    gold: baseGold,
    extraLine: {
      speaker: "narration",
      text: "そのときは何も言われなかった。だが後日、この取引について妙な噂が立っていると耳にした。",
    },
    favor: { market: -5 },
  }
}

let inventoryUid = 0
const itemToInventory = (item, revealedCount = 0, paidPrice = 0) => ({
  invId: `inv-${inventoryUid++}`,
  name: item.name,
  image: item.image,
  description: item.description,
  trueValue: item.trueValue,
  haggleValue: item.haggleValue,
  hasSoul: item.hasSoul,
  hiddenObservations: item.hiddenObservations,
  observationBudget: item.observationBudget,
  observedCount: revealedCount, // 購入時点までに鑑定机で開示できていた件数(棚のツールチップ表示用)
  paidPrice, // 実際に支払った額(棚で「いくらで買った品か」を確認できるように)
  category: item.category, // 査定時、買い手のwantsCategoryと照合して代用可否を判定する
  riskyResale: item.riskyResale, // trueなら再販時に買い手が気づくかどうかの判定が入る(運要素)
  buyer: item.buyer,
})

// soulAutoReveal: 判別機がない日(共鳴)は、客と対面した時点で自動的に
// 「見た情報」に魂反応が追加される。判別機がある日はnullを渡す。
// requestLine: 客が最初に声をかけてくる一言(「これを買い取ってほしい」等)。
// arrival(見た目の描写)はセリフではなく観察情報なので「見た情報」に入れる。
const encounterStateFor = (actor, soulAutoReveal, requestLine) => {
  const inspection = actor.appearance.map((a) => ({ id: a.id, label: a.label, text: a.text }))
  inspection.push({ id: `${actor.id}-arrival`, label: "第一印象", text: actor.arrival })
  if (soulAutoReveal) {
    inspection.push({ id: `${actor.id}-resonance`, label: "共鳴", text: soulAutoReveal })
  }
  return {
    inspection,
    dialogueLog: requestLine ? [{ speaker: actor.name, text: requestLine }] : [],
    usedTopics: [],
    viewedClues: [],
    revealedObservations: [],
    engaged: false,
  }
}

// 客が最初に声をかけてくる一言。会話トピックのような作り込みはせず、
// 既存データ(商品名)だけから自動生成する(客ターン新設にあたり、
// 個別の客データを書き足さずに済むようにするための割り切り)。
const nightRequestLine = (customer) => `この${customer.item.name}を買い取ってほしいんだが……`
const appraisalRequestLine = (item) => `そこの${item.name}を売ってもらえないか？`

// その日の査定がすべて終わったら、客と同じ「話しかけて向き合う」UIで
// 元締めが上納金を取り立てに来る。買い手側のencounterStateForと違い
// 会話トピックは持たせず、第一声だけを置く最小構成。
export const OWNER = { name: "元締め", image: "owner" }
const ownerRequestLine = (quota) => `${quota}G、耳を揃えて用意はできているな？`
const ownerEncounterState = (quota) => ({
  inspection: [],
  dialogueLog: [{ speaker: OWNER.name, text: ownerRequestLine(quota) }],
  usedTopics: [],
  viewedClues: [],
  revealedObservations: [],
  engaged: false,
})

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
  dayCustomers: [], // その夜の客の並び(Day2以降はshuffledで順番を入れ替えたコピー)
  notes: [],
  inspection: [],
  dialogueLog: [],
  usedTopics: [],
  soulChecked: false,
  negotiationFailed: false,
  inventory: [], // 週をまたいで持ち越す在庫。売れた品だけ取り除き、やめた品は残す。
  lastResolution: null,
  appraisalIndex: 0,
  appraisalQueue: [], // その日の査定対象のスナップショット(在庫は査定中に減っていくため)
  appraisalResolution: null,
  offeredItemId: null, // 査定机に今置いている在庫のinvId(棚からドラッグして置く)
  viewedClues: [],
  revealedObservations: [], // 今回の接客で鑑定机から個別に開示済みの hiddenObservations id
  engaged: false, // 客が声をかけてきた段階(false)か、クリックして接客を始めた段階(true)か
  ending: null,

  startNight: () => {
    const day1 = DAYS[0]
    // Day1はチュートリアルなので、操作を覚える間は客の順番を変えない。
    const customer = day1.customers[0]
    set({
      screen: "night",
      day: 1,
      gold: START_GOLD,
      quota: day1.quota,
      churchFavor: 0,
      marketFavor: 0,
      customerIndex: 0,
      dayCustomers: day1.customers,
      notes: [],
      ...encounterStateFor(customer, soulRevealFor(customer, day1.hasDetector), nightRequestLine(customer)),
      soulChecked: false,
      negotiationFailed: false,
      inventory: [],
      lastResolution: null,
      appraisalIndex: 0,
      appraisalQueue: [],
      appraisalResolution: null,
      offeredItemId: null,
    })
  },

  currentDayConfig: () => currentDayConfig(get()),
  currentCustomer: () => get().dayCustomers[get().customerIndex],
  currentAppraisalItem: () => get().appraisalQueue[get().appraisalIndex],
  currentBuyer: () => get().currentAppraisalItem()?.buyer,
  // 査定机に今置いている在庫(ドラッグして置いた品)。何も置いていなければnull。
  currentOfferedItem: () => get().inventory.find((i) => i.invId === get().offeredItemId) ?? null,
  // 会話パネルは買い(客)・売り(仲買人)の両方で共有する。今どちらの相手と話しているか。
  currentActor: () => (get().screen === "appraisal" ? get().currentBuyer() : get().currentCustomer()),
  // 鑑定机も買い・売り両方で共有する。今調べている商品はどちらか
  // (査定側は「机に置いた品」。まだ何も置いていなければnullのまま)。
  currentItem: () => (get().screen === "appraisal" ? get().currentOfferedItem() : get().currentCustomer()?.item),

  // 客が声をかけてきた段階から、クリックして接客(鑑定机)を始める段階に移る。
  engageCustomer: () => set({ engaged: true }),

  // 棚(在庫)から査定机に品物をドラッグして置く。買い手のwantsCategoryと
  // 合わない場合は置けず、代わりに「興味を示さなかった」という一言だけ残す
  // (完全に無関係な品を渡して交渉が始まってしまうのを防ぐため)。
  // wantsCategoryが設定されていない買い手(データ未移行の日)には常に置ける。
  placeItemOnDesk: (invId) => {
    const state = get()
    const buyer = state.currentBuyer()
    const item = state.inventory.find((i) => i.invId === invId)
    if (!buyer || !item) return
    if (buyer.wantsCategory && item.category !== buyer.wantsCategory) {
      set((s) => ({
        dialogueLog: [
          ...s.dialogueLog,
          { speaker: "narration", text: `${buyer.name}は${item.name}には興味を示さなかった。` },
        ],
      }))
      return
    }
    set({ offeredItemId: invId })
  },
  clearOfferedItem: () => set({ offeredItemId: null }),

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
        inventory: [...state.inventory, itemToInventory(customer.item, state.revealedObservations.length, customer.item.lowballPrice)],
        dialogueLog: [...state.dialogueLog, { speaker: customer.name, text: customer.negotiation.accept }],
        lastResolution: { goldDelta: -customer.item.lowballPrice, kind: "acquired" },
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
      inventory: [...state.inventory, itemToInventory(customer.item, state.revealedObservations.length, customer.item.askPrice)],
      dialogueLog: [...state.dialogueLog, { speaker: "narration", text: customer.resolution.buyFull.text }],
      lastResolution: { goldDelta: -customer.item.askPrice, kind: "acquired" },
      screen: "resolved",
      ...applyFavor(state, customer.resolution.buyFull.favor),
    }))
  },

  refuse: () => {
    const customer = get().currentCustomer()
    set((state) => ({
      dialogueLog: [...state.dialogueLog, { speaker: "narration", text: customer.resolution.refuse.text }],
      lastResolution: { goldDelta: 0, kind: "declined" },
      screen: "resolved",
      ...applyFavor(state, customer.resolution.refuse.favor),
    }))
  },

  report: () => {
    const customer = get().currentCustomer()
    // customer.resolution.reportが無い(=後ろめたさの無い客)場合でも、ボタンの
    // 有無が「この客は怪しい」というネタバレにならないよう、通報ボタン自体は
    // 常に表示する。その代わりデータの無い客を通報すると、空振りで心証を
    // 損なう汎用の結末を返す。
    const resolution = customer.resolution.report ?? {
      goldDelta: 0,
      text: `${customer.name}の様子に特に怪しい点は見つからず、ただの言いがかりで終わった。気分を害した${customer.name}は、何も売らずに店を出ていった。`,
      favor: { market: -4 },
    }
    set((state) => ({
      gold: state.gold + resolution.goldDelta,
      dialogueLog: [...state.dialogueLog, { speaker: "narration", text: resolution.text }],
      lastResolution: { goldDelta: resolution.goldDelta, kind: "declined" },
      screen: "resolved",
      ...applyFavor(state, resolution.favor),
    }))
  },

  continueToNext: () => {
    const state = get()
    const config = currentDayConfig(state)
    const nextIndex = state.customerIndex + 1
    if (nextIndex >= state.dayCustomers.length) {
      const queue = [...state.inventory]
      const firstItem = queue[0]
      set({
        screen: "appraisal",
        appraisalIndex: 0,
        appraisalQueue: queue,
        appraisalResolution: null,
        offeredItemId: null,
        ...(firstItem
          ? encounterStateFor(firstItem.buyer, null, appraisalRequestLine(firstItem))
          : ownerEncounterState(state.quota)),
      })
      return
    }
    const customer = state.dayCustomers[nextIndex]
    set({
      screen: "night",
      customerIndex: nextIndex,
      ...encounterStateFor(customer, soulRevealFor(customer, config.hasDetector), nightRequestLine(customer)),
      soulChecked: false,
      negotiationFailed: false,
      lastResolution: null,
    })
  },

  // 言い値で売る: 確実にtrueValueが手に入る。売れた品は在庫から取り除く。
  sellAtValue: () => {
    const item = get().currentOfferedItem()
    if (!item || get().appraisalResolution) return
    const buyer = get().currentBuyer()
    const { gold: saleGold, extraLine, favor } = applyRiskyResale(item, buyer, item.trueValue)
    set((state) => ({
      gold: state.gold + saleGold,
      inventory: state.inventory.filter((i) => i.invId !== item.invId),
      dialogueLog: [
        ...state.dialogueLog,
        { speaker: "narration", text: `${item.name}は${saleGold}Gで引き取られた。` },
        ...(extraLine ? [extraLine] : []),
      ],
      appraisalResolution: { goldDelta: saleGold, kind: "acquired" },
      ...applyFavor(state, favor),
    }))
  },

  // 高く売れないか粘る: 魂入りなど危ない品だと買い手が手を引いてしまうことがある。
  // 手を引かれた場合は売れていないので在庫に残す。
  tryHaggleUp: () => {
    const item = get().currentOfferedItem()
    if (!item || get().appraisalResolution) return
    const buyer = get().currentBuyer()
    if (item.hasSoul) {
      set((state) => ({
        dialogueLog: [
          ...state.dialogueLog,
          { speaker: buyer.name, text: "「そこまで背負うつもりはない」" },
        ],
        appraisalResolution: { goldDelta: 0, kind: "declined" },
      }))
      return
    }
    const { gold: saleGold, extraLine, favor } = applyRiskyResale(item, buyer, item.haggleValue)
    set((state) => ({
      gold: state.gold + saleGold,
      inventory: state.inventory.filter((i) => i.invId !== item.invId),
      dialogueLog: [
        ...state.dialogueLog,
        { speaker: "narration", text: `粘って${item.name}を${saleGold}Gまで引き上げさせた。` },
        ...(extraLine ? [extraLine] : []),
      ],
      appraisalResolution: { goldDelta: saleGold, kind: "acquired" },
      ...applyFavor(state, favor),
    }))
  },

  // やめておく: 商品を渡していればそれは在庫に残したまま、買い手には声をかけず見送る。
  // 何も置いていなくても(品を渡さないまま)見送れる。
  skipSell: () => {
    if (get().appraisalResolution) return
    const item = get().currentOfferedItem()
    const buyer = get().currentBuyer()
    set((state) => ({
      dialogueLog: [
        ...state.dialogueLog,
        {
          speaker: "narration",
          text: item
            ? `${item.name}は今夜は売らずに懐にしまった。`
            : `欲しい物が見当たらなかったのか、${buyer?.name ?? "客"}は何も買わずに出ていった。`,
        },
      ],
      appraisalResolution: { goldDelta: 0, kind: "declined" },
    }))
  },

  continueAppraisal: () => {
    const nextIndex = get().appraisalIndex + 1
    const nextItem = get().appraisalQueue[nextIndex]
    set({
      appraisalIndex: nextIndex,
      appraisalResolution: null,
      offeredItemId: null,
      ...(nextItem ? encounterStateFor(nextItem.buyer, null, appraisalRequestLine(nextItem)) : ownerEncounterState(get().quota)),
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
  // 客の来店順には軽い運要素を持たせるため、Day2以降は毎回シャッフルした
  // コピーを使う(元のDAYSデータ自体は書き換えない)。
  advanceDay: () => {
    const nextDay = get().day + 1
    const nextConfig = DAYS[nextDay - 1]
    const nextDayCustomers = shuffled(nextConfig.customers)
    const firstCustomer = nextDayCustomers[0]
    set({
      day: nextDay,
      quota: nextConfig.quota,
      customerIndex: 0,
      dayCustomers: nextDayCustomers,
      screen: "night",
      ...encounterStateFor(firstCustomer, soulRevealFor(firstCustomer, nextConfig.hasDetector), nightRequestLine(firstCustomer)),
      soulChecked: false,
      negotiationFailed: false,
      lastResolution: null,
      appraisalIndex: 0,
      appraisalQueue: [],
      appraisalResolution: null,
      offeredItemId: null,
    })
  },

  restart: () => {
    set({ screen: "title" })
  },
}))
