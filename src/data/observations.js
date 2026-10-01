// 商品の「どこを調べるか」を組み立てる。
//
// 個別に書いた手がかり(その品ならではの観察点)だけでは2個程度にしかならず、
// 「限られた回数をどこに使うか」という判断が成立しない。そこで、どの品にも
// ある一般的な調査ポイント(材質/状態/傷/重さ/匂い/魔力)を足して6〜8個にする。
// 大半は空振りだが、その「はずれ」があるからこそ、客の話や見た目から
// 「この品はどこが怪しいか」を考える意味が生まれる。
//
// x/y は商品イラスト上のおおよその位置(0-100%)。鑑定机では、この位置から
// 鑑定札へ線を伸ばして「商品のどこを見ているのか」を見せる。

const PART_ANCHORS = {
  刃: { x: 44, y: 20 },
  切っ先: { x: 50, y: 10 },
  柄: { x: 56, y: 80 },
  柄の刻印: { x: 58, y: 72 },
  刻印: { x: 50, y: 58 },
  内側の刻印: { x: 46, y: 60 },
  刻まれた文字: { x: 52, y: 62 },
  銘: { x: 50, y: 62 },
  傷: { x: 34, y: 44 },
  材質: { x: 66, y: 34 },
  重さ: { x: 50, y: 50 },
  匂い: { x: 70, y: 16 },
  魔力: { x: 50, y: 44 },
  状態: { x: 32, y: 64 },
  裏面: { x: 50, y: 52 },
  裏側: { x: 52, y: 54 },
  底面: { x: 50, y: 86 },
  縫い目: { x: 38, y: 70 },
  織りの目: { x: 36, y: 38 },
  書き込み: { x: 62, y: 56 },
  減り方: { x: 40, y: 76 },
  一枚だけ: { x: 60, y: 30 },
  由来: { x: 50, y: 50 },
}

// 素材の見立ては商品イラストの種類から決める(個別に書かなくて済むように)。
const MATERIAL_TEXT = {
  "item-sword": "鉄と革。ありふれた打ち物だ。",
  "item-dagger": "鉄と革。量産品によくある造り。",
  "item-amulet": "古い木と、何かの石。継ぎ目は固い。",
  "item-ring": "銀。ところどころ黒ずんでいる。",
  "item-candlestick": "真鍮。厚みは薄い。",
  "item-fabric": "羊毛。染めは悪くない。",
  "item-portrait": "木枠と古い紙。",
  "item-doll": "布と木。中身は詰め物らしい。",
  "item-keepsake": "鉄と、変色した革紐。",
  "item-fortune-cards": "厚手の紙。縁が擦り切れている。",
  "item-generic-book": "紙と革。綴じは丁寧だ。",
  "item-generic-jewelry": "銀か、銀に似せた何か。",
  "item-generic-household": "木と鉄。日用の品らしい造り。",
  "item-generic-tool": "鉄と木。実用一点張りの造り。",
}

const standardObservations = (item, idPrefix) => [
  {
    id: `${idPrefix}-std-material`,
    label: "材質",
    text: MATERIAL_TEXT[item.image] || "ありふれた素材。特筆すべき点はない。",
  },
  {
    id: `${idPrefix}-std-condition`,
    label: "状態",
    text: "年相応の使用感。欠けや割れは見当たらない。",
  },
  {
    id: `${idPrefix}-std-scratch`,
    label: "傷",
    text: "細かい擦り傷がいくつか。普通に使われていた品だ。",
  },
  {
    id: `${idPrefix}-std-weight`,
    label: "重さ",
    text: "見た目どおりの重さ。手に持った感触に違和感はない。",
  },
  {
    id: `${idPrefix}-std-smell`,
    label: "匂い",
    text: "埃と、かすかな油の匂い。",
  },
  {
    // 判別機ほど確かではないが、魂入りなら「気のせいかもしれない」程度の
    // 違和感は拾える。判別機を失う4日目以降の代替手段になりすぎないよう、
    // あくまで曖昧な手応えに留める。
    id: `${idPrefix}-std-magic`,
    label: "魔力",
    text: item.hasSoul
      ? "手にすると、指先がかすかに冷える気がする。気のせいかもしれない。"
      : "かざしても何も感じない。ただの品物だ。",
  },
]

let anchorFallbackSeed = 0
const anchorFor = (label) => {
  if (PART_ANCHORS[label]) return PART_ANCHORS[label]
  // 未登録のラベルは商品の中心まわりに散らす(重ならないよう角度をずらす)。
  const angle = (anchorFallbackSeed++ * 137) % 360
  const rad = (angle * Math.PI) / 180
  return { x: 50 + 26 * Math.cos(rad), y: 50 + 26 * Math.sin(rad) }
}

// 個別の手がかり + 一般的な調査ポイント。ラベルが重複する一般ポイントは
// 個別のもの(より具体的な手がかり)を優先して外す。
const buildObservations = (item, idPrefix) => {
  const specific = item.hiddenObservations || []
  const usedLabels = new Set(specific.map((o) => o.label))
  const padded = standardObservations(item, idPrefix).filter((o) => !usedLabels.has(o.label))
  return [...specific, ...padded].map((o) => ({ ...o, ...anchorFor(o.label) }))
}

// 1人の客の商品に調査ポイントを展開する。allowedChecks はその日に
// 1つの商品を調べられる回数(日が進むほど絞って、選択を重くする)。
export const withObservations = (customer, allowedChecks) => {
  const observations = buildObservations(customer.item, customer.id)
  return {
    ...customer,
    item: {
      ...customer.item,
      hiddenObservations: observations,
      observationBudget: Math.min(allowedChecks, observations.length),
    },
  }
}

export const expandDayObservations = (customers, allowedChecks) =>
  customers.map((c) => withObservations(c, allowedChecks))
