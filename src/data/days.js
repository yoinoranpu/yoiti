// 7日間の週構成。memory/story_outline.md の表に対応する。
// Day1は night1.js の本実装(ダロン/イレア/ノア)をそのまま使う。
// Day2〜7は memory/characters.md・story_outline.md のキャラ案をもとに本文を書いた。
// なお客数は「売り+査定(買い手)で実質倍になる」という指摘を踏まえ、
// story_outline.mdの表よりやや控えめにしてある(調整はプレイして詰める)。

import { CUSTOMERS as DAY1_CUSTOMERS, REFERENCE, START_GOLD } from "./night1"
import { expandDayObservations } from "./observations"

let uid = 0
const nextId = (prefix) => `${prefix}-${uid++}`

// 名前だけの軽い客を組み立てるヘルパー(会話の主役ではない、頭数のための客)。
function fillerCustomer({ name, guilty = false, arrival, itemName, price, itemDesc, soul, image, itemImage }) {
  const id = nextId("filler")
  const lowballPrice = Math.round(price * 0.6)
  const trueValue = Math.round(price * (soul ? 1.8 : 1.4))
  const haggleValue = Math.round(trueValue * (soul ? 1.5 : 1.25))
  return {
    id,
    name,
    image: image || null,
    guilty,
    arrival,
    appearance: [{ id: `${id}-a1`, label: "様子", text: "特に変わった様子はない。" }],
    illustrationClues: [],
    item: {
      name: itemName,
      askPrice: price,
      lowballPrice,
      trueValue,
      haggleValue,
      description: itemDesc,
      image: itemImage || "item-generic-tool",
      hasSoul: !!soul,
      hiddenObservations: [
        { id: `${id}-i1`, label: "状態", text: "とくに変わった点は見当たらない。" },
      ],
      buyer: {
        name: `${name}の買い手`,
        arrival: "少し遅れて、引き取りたいという客が現れる。",
        appearance: [{ id: `${id}-b-a1`, label: "様子", text: "特に変わった様子はない。" }],
        illustrationClues: [],
        topics: [
          { id: `${id}-b-t1`, label: "何に使うのか聞く", line: "「ちょっと入り用でね。」" },
        ],
      },
    },
    soulCheckText: soul
      ? "判別機の針が大きく揺れ、青白く光る — 魂反応: あり。"
      : "判別機の針は動かない — 魂反応: なし。",
    topics: [{ id: `${id}-t1`, label: "出所を聞く", line: "「まあ、色々あってね。」" }],
    negotiation: {
      accept: guilty ? "「……まあ、それでいいよ。」" : "",
      reject: guilty ? "" : "「それはちょっと安すぎるな。」",
    },
    resolution: {
      refuse: { text: `${name}は特に気にする様子もなく、店を出ていった。` },
      buyFull: { text: `言い値のまま買い取った。${name}は静かに立ち去った。` },
    },
  }
}

// --- Day2: 本格的に始まる。「怪しさ」の種類が一様でないことを見せる日。---

const oldMan = {
  id: "d2-c1",
  name: "気弱な老人",
  image: "d2-c1-old-man",
  guilty: true, // 値切りには応じるが、後ろめたさではなく気の弱さから
  arrival: "腰の曲がった老人が、杖をつきながらゆっくりと入ってくる。",
  appearance: [
    { id: "d2-c1-a1", label: "様子", text: "目が悪いのか、店先で何度も立ち止まっていた。" },
    { id: "d2-c1-a2", label: "手", text: "杖を握る手が、かすかに震えている。" },
  ],
  illustrationClues: [],
  item: {
    name: "古びた燭台",
    askPrice: 18,
    lowballPrice: 11,
    trueValue: 26,
    haggleValue: 33,
    description: "先代から譲り受けたという燭台。ろうの跡が古く、長く使われてきたことがわかる。",
    image: "item-candlestick",
    hasSoul: false,
    hiddenObservations: [
      { id: "d2-c1-i1", label: "底面", text: "底に、素人が直したらしい修理の跡がある。" },
    ],
    buyer: {
      name: "近所の女中",
      image: "generic-young-woman",
      arrival: "近所の商家に仕える女中が、日用品を探しに立ち寄る。",
      appearance: [{ id: "d2-c1-b-a1", label: "様子", text: "急いでいる様子で、何度も外を気にしている。" }],
      illustrationClues: [],
      topics: [
        { id: "d2-c1-b-t1", label: "何に使うのか聞く", line: "「奥様に言われて、日用品を見に来ただけです。」" },
      ],
    },
  },
  soulCheckText: "判別機の針は動かない — 魂反応: なし。",
  topics: [
    { id: "d2-c1-t1", label: "出所を聞く", line: "「先代から譲り受けたものでね……もう、自分には使い道もないんだが。」" },
    { id: "d2-c1-t2", label: "暮らし向きを聞く", line: "「なに、年寄りの一人暮らしだ。贅沢は言わんよ。」" },
  ],
  negotiation: {
    accept: "「ああ、それでいいよ。急いでいるわけじゃあないんだが……まあ、いいさ。」",
    reject: "",
  },
  resolution: {
    refuse: { text: "「そうかい」老人は燭台を大事そうに抱え直すと、ゆっくりと出ていった。" },
    buyFull: { text: "言い値のまま買い取った。老人は深々と頭を下げて去っていった。" },
  },
}

const pushyPeddler = {
  id: "d2-c2",
  name: "図々しい行商人",
  image: "d2-c2-peddler",
  guilty: true, // 値切りには応じるが、後ろめたさではなく「元々ふっかけていただけ」だから
  arrival: "恰幅のいい行商人が、自信ありげな笑みを浮かべて入ってくる。",
  appearance: [
    { id: "d2-c2-a1", label: "態度", text: "やけに愛想がいいが、目だけは値踏みするように鋭い。" },
    { id: "d2-c2-a2", label: "荷物", text: "大荷物を抱え、いかにも「掘り出し物がある」という様子。" },
  ],
  illustrationClues: [],
  item: {
    name: "見事な織物",
    askPrice: 40,
    lowballPrice: 22,
    trueValue: 30,
    haggleValue: 34,
    description: "色鮮やかな織物。だが、この街ではよく見る量産品のようにも見える。",
    image: "item-fabric",
    hasSoul: false,
    hiddenObservations: [
      { id: "d2-c2-i1", label: "織りの目", text: "よく見ると織りの目が粗い。量産品にありがちな仕上がりだ。" },
    ],
    buyer: {
      name: "布地屋の主人",
      image: "generic-adult-man",
      arrival: "近所の布地屋の主人が、様子を見に立ち寄る。",
      appearance: [{ id: "d2-c2-b-a1", label: "様子", text: "商品を一目見て、値踏みするような顔をした。" }],
      illustrationClues: [],
      topics: [{ id: "d2-c2-b-t1", label: "何に使うのか聞く", line: "「うちの店に並べるだけですよ。」" }],
    },
  },
  soulCheckText: "判別機の針は動かない — 魂反応: なし。",
  topics: [
    { id: "d2-c2-t1", label: "相場を聞く", line: "「いやあ、これは中々出回らない品でしてね。相場より安いくらいですよ。」" },
    { id: "d2-c2-t2", label: "仕入れ先を聞く", line: "「まあ、色々つてがありましてね」とはぐらかされる。" },
  ],
  negotiation: {
    accept: "「おや、お目が高い。まあ、それでも十分儲けは出ますから、構いませんよ。」",
    reject: "",
  },
  resolution: {
    refuse: { text: "「そうですか、残念だ」行商人はあっさり引き下がり、次の当てを探しに出ていった。" },
    buyFull: { text: "言い値のまま買い取った。行商人はほくほくとした顔で出ていった。" },
  },
}

const daronReturns = {
  id: "d2-c3",
  name: "ダロン",
  image: "c1-daron",
  guilty: false,
  arrival: "見覚えのある傷だらけの手をした男が、また店に顔を出す。ダロンだ。",
  appearance: [
    { id: "d2-c3-a1", label: "様子", text: "前より少し身なりが良くなっている。仕事にありついたのかもしれない。" },
  ],
  illustrationClues: [],
  item: {
    name: "小さな砥石",
    askPrice: 10,
    lowballPrice: 6,
    trueValue: 14,
    haggleValue: 18,
    description: "使い込まれた砥石。ダロン自身が使っていたものだという。",
    image: "item-generic-tool",
    hasSoul: false,
    hiddenObservations: [
      { id: "d2-c3-i1", label: "減り方", text: "片側だけ大きくすり減っている。よほど頻繁に使っていたようだ。" },
    ],
    buyer: {
      name: "顔なじみの職人",
      image: "generic-adult-man",
      arrival: "顔なじみの職人が、道具を探しに立ち寄る。",
      appearance: [{ id: "d2-c3-b-a1", label: "様子", text: "特に変わった様子はない。" }],
      illustrationClues: [],
      topics: [{ id: "d2-c3-b-t1", label: "何に使うのか聞く", line: "「手入れ用にちょうどいいと思ってね。」" }],
    },
  },
  soulCheckText: "判別機の針は動かない — 魂反応: なし。",
  topics: [
    {
      id: "d2-c3-t1",
      label: "最近の様子を聞く",
      line: "「相変わらずだよ。……ああ、そういえば東門の見回りはまだ増えたままらしい。前より物々しくなってるって話だ。」",
      note: "ダロン(2回目): 「東門の見回りは前より物々しくなっている」",
    },
    { id: "d2-c3-t2", label: "前に売った剣について聞く", line: "「ああ、あの剣か。……役に立ってるなら、それでいいさ。」" },
  ],
  negotiation: {
    accept: "",
    reject: "「これは実用品だからな、そう安くはできない。」",
  },
  resolution: {
    refuse: { text: "「そうか」ダロンは砥石をしまうと、軽く手を上げて出ていった。" },
    buyFull: { text: "言い値のまま買い取った。ダロンは「また来る」とだけ言って去っていった。" },
  },
}

const DAY2_CUSTOMERS = [oldMan, pushyPeddler, daronReturns]

// --- Day3: 強制イベントの日。経済的な結果は夜の終わりに強盗で無効化されるので、
// この日は「情報は必ずしも正しくない」を体験させることに使う。---

const contradictingRumor = {
  id: "d3-c2",
  name: "物知り顔の男",
  image: "d3-c2-knowitall",
  guilty: false,
  arrival: "物知り顔の男が、机の上をのぞき込むようにして入ってくる。",
  appearance: [{ id: "d3-c2-a1", label: "様子", text: "やけに自信満々に話す。真偽のほどは怪しい。" }],
  illustrationClues: [],
  item: {
    name: "古い地図",
    askPrice: 20,
    lowballPrice: 12,
    trueValue: 26,
    haggleValue: 32,
    description: "手描きの古い地図。この街の周辺が描かれている。",
    image: "item-generic-book",
    hasSoul: false,
    hiddenObservations: [{ id: "d3-c2-i1", label: "書き込み", text: "端に、誰かの書き込みがいくつかある。" }],
    buyer: {
      name: "地図好きの学生",
      image: "generic-young-man",
      arrival: "地図に目がないという学生が、覗き込むように入ってくる。",
      appearance: [{ id: "d3-c2-b-a1", label: "様子", text: "特に変わった様子はない。" }],
      illustrationClues: [],
      topics: [{ id: "d3-c2-b-t1", label: "何に使うのか聞く", line: "「集めているだけです。特に理由はありません。」" }],
    },
  },
  soulCheckText: "判別機の針は動かない — 魂反応: なし。",
  topics: [
    {
      id: "d3-c2-t1",
      label: "東門の様子を聞く",
      line: "「東門? いやいや、あそこは最近すっかり静かなもんだよ。騎士なんて全然見ないね。」",
      note: "物知り顔の男: 「東門は最近静かで、騎士は見ない」(ダロンの話と食い違う)",
    },
  ],
  negotiation: { accept: "", reject: "「これでも安いくらいだよ」と粘る。" },
  resolution: {
    refuse: { text: "「そうかい、まあいいさ」男は地図を丸めて出ていった。" },
    buyFull: { text: "言い値のまま買い取った。男は満足げに出ていった。" },
  },
}

const DAY3_CUSTOMERS = [
  fillerCustomer({
    name: "疲れた様子の女",
    guilty: false,
    arrival: "疲れた様子の女が、重そうな鞄を提げて入ってくる。",
    itemName: "使い込まれた裁縫道具",
    price: 20,
    itemDesc: "長年使われてきた裁縫道具一式。",
    image: "generic-adult-woman",
    itemImage: "item-generic-tool",
  }),
  contradictingRumor,
  fillerCustomer({
    name: "早口の青年",
    guilty: false,
    arrival: "早口の青年が、せかせかとした様子で入ってくる。",
    itemName: "革の道具袋",
    price: 22,
    itemDesc: "職人が使うような道具袋。",
    image: "generic-young-man",
    itemImage: "item-generic-tool",
  }),
]

// --- Day4: 判別機を失い、共鳴が始まった最初の日。---

const oldRegular = {
  id: "d4-c1",
  name: "夜市の顔なじみ",
  image: "d4-c1-regular",
  guilty: false,
  arrival: "夜市に長くいるという常連客が、慣れた様子で入ってくる。",
  appearance: [{ id: "d4-c1-a1", label: "物腰", text: "夜市のことを知り尽くしているような、落ち着いた態度。" }],
  illustrationClues: [],
  item: {
    name: "使い込まれた煙管",
    askPrice: 16,
    lowballPrice: 10,
    trueValue: 22,
    haggleValue: 27,
    description: "長年使われてきた煙管。手入れは行き届いている。",
    image: "item-generic-tool",
    hasSoul: false,
    hiddenObservations: [{ id: "d4-c1-i1", label: "刻印", text: "小さく、持ち主のものらしい印がある。" }],
    buyer: {
      name: "煙管好きの客",
      image: "generic-adult-man",
      arrival: "煙管を探していたという客が立ち寄る。",
      appearance: [{ id: "d4-c1-b-a1", label: "様子", text: "特に変わった様子はない。" }],
      illustrationClues: [],
      topics: [{ id: "d4-c1-b-t1", label: "何に使うのか聞く", line: "「自分で使うだけですよ。」" }],
    },
  },
  soulCheckText: "判別機の針は動かない — 魂反応: なし。",
  topics: [
    {
      id: "d4-c1-t1",
      label: "夜市について聞く",
      line: "「長くやるコツか? 欲を出しすぎないことだよ。あと……教会の連中には、あまり深入りしないほうがいい。」",
      note: "夜市の顔なじみ: 「教会の連中には深入りしない方がいい」",
    },
  ],
  negotiation: { accept: "", reject: "「これは長年の相棒でね、そう安くは譲れない。」" },
  resolution: {
    refuse: { text: "「そうかい」男は煙管をしまうと、軽く笑って出ていった。" },
    buyFull: { text: "言い値のまま買い取った。男は満足げに出ていった。" },
  },
}

const fortuneTeller = {
  id: "d4-c2",
  name: "占い師風の女",
  image: "d4-c2-fortuneteller",
  guilty: true,
  arrival: "占い師のような装いをした女が、静かに入ってくる。",
  appearance: [{ id: "d4-c2-a1", label: "様子", text: "目を伏せがちで、何かを恐れているようにも見える。" }],
  illustrationClues: [],
  item: {
    name: "古い占いの札",
    askPrice: 40,
    lowballPrice: 24,
    trueValue: 70,
    haggleValue: 95,
    description: "手擦れした札の束。その中の一枚だけ、やけに重く冷たい。",
    image: "item-fortune-cards",
    hasSoul: true,
    hiddenObservations: [
      { id: "d4-c2-i1", label: "一枚だけ", text: "一枚だけ他の札と紙質が違う。裏に小さな染みがある。" },
    ],
    buyer: {
      name: "静かな男",
      image: "d4-c2-buyer-quietman",
      arrival: "静かな身のこなしの男が、値踏みするように近づいてくる。",
      appearance: [{ id: "d4-c2-b-a1", label: "様子", text: "終始、感情の読めない顔をしている。" }],
      illustrationClues: [],
      topics: [
        { id: "d4-c2-b-t1", label: "何に使うのか聞く", line: "「占い師が使っていたものには、独特の価値がある。それだけだ。」" },
        {
          id: "d4-c2-b-t2",
          label: "運び先を聞く",
          line: "「東門からだ。あそこを使う伝手があるのでね。」",
          note: "静かな男: 「東門から運び出す伝手がある」と話していた",
        },
      ],
    },
  },
  soulCheckText: "判別機の針が大きく揺れ、青白く光る — 魂反応: あり。",
  topics: [
    { id: "d4-c2-t1", label: "この札の出所を聞く", line: "「占いに使っていたものです。……もう、視えなくなってしまったので。」" },
    { id: "d4-c2-t2", label: "視えなくなった理由を聞く", line: "「さあ……急に、視えなくなったとしか。」目を伏せる。" },
  ],
  negotiation: { accept: "「……それでも構いません。持っているのが、怖いので。」", reject: "" },
  resolution: {
    refuse: { text: "「そうですか……」女は札を懐にしまうと、逃げるように出ていった。" },
    buyFull: { text: "魂入りの品として言い値のまま買い取った。女はほっとした様子で去っていった。" },
    report: {
      goldDelta: 8,
      text: "落ち着かない様子で、札を置いたまま彼女は去っていった。後日、夜市の管理者から通報の礼として8Gを受け取った。",
      favor: { market: 5 },
    },
  },
}

const DAY4_CUSTOMERS = [
  oldRegular,
  fortuneTeller,
  fillerCustomer({
    name: "商家の使用人",
    guilty: false,
    arrival: "商家の使用人と名乗る男が、丁寧な物腰で入ってくる。",
    itemName: "銅の燭台一式",
    price: 28,
    itemDesc: "商家で使われていたという燭台一式。",
    image: "generic-adult-man",
    itemImage: "item-candlestick",
  }),
]

// --- Day5: シスター・マレン初登場。教会の存在を意識させる日。---

const sisterMaren = {
  id: "d5-c1",
  name: "シスター・マレン",
  image: "d5-c1-maren",
  guilty: false,
  arrival: "見覚えのない若い女性が、控えめな身なりで入ってくる。",
  appearance: [
    { id: "d5-c1-a1", label: "身なり", text: "地味だが清潔な身なり。教会の関係者によく見る格好だ。" },
    { id: "d5-c1-a2", label: "態度", text: "商品よりも、店主であるこちらをよく観察しているように見える。" },
  ],
  illustrationClues: [],
  item: {
    name: "古びた祈祷書",
    askPrice: 15,
    lowballPrice: 9,
    trueValue: 18,
    haggleValue: 22,
    description: "使い込まれた祈祷書。とくに変わった様子はない。",
    image: "item-generic-book",
    hasSoul: false,
    hiddenObservations: [
      { id: "d5-c1-i1", label: "書き込み", text: "余白に几帳面な字で書き込みがある。教会関係者の書き方によく似ている。" },
    ],
    buyer: {
      name: "教会の関係者",
      image: "generic-adult-man",
      arrival: "教会の関係者らしい人物が、古書を探しに立ち寄る。",
      appearance: [{ id: "d5-c1-b-a1", label: "様子", text: "特に変わった様子はない。" }],
      illustrationClues: [],
      topics: [{ id: "d5-c1-b-t1", label: "何に使うのか聞く", line: "「古い祈祷書を集めているだけです。」" }],
    },
  },
  soulCheckText: "判別機の針は動かない — 魂反応: なし。",
  topics: [
    {
      id: "d5-c1-t1",
      label: "何をしに来たのか聞く",
      line: "「……最近、この辺りで妙な品が出回っていると聞いて。少し、見て回っているだけです。」",
    },
    {
      id: "d5-c1-t2",
      label: "教会について聞く",
      line: "「教会は魂を天に還すべきだと教えています。……もっとも、私自身、すべてに納得しているわけではありませんが。」",
    },
  ],
  negotiation: { accept: "", reject: "「これは売り物ではなく、確かめに来ただけなので。」" },
  resolution: {
    refuse: {
      text: "「そう、ですか」マレンは静かに一礼すると、店を後にした。",
      favor: { church: -3 },
    },
    buyFull: {
      text: "言い値のまま買い取った。マレンは礼を言うと、また来ると言って去っていった。",
      favor: { church: 8 },
    },
  },
}

const sicklyMan = {
  id: "d5-c2",
  name: "顔色の悪い男",
  image: "d5-c2-sickly-man",
  guilty: true,
  arrival: "顔色の悪い男が、落ち着かない様子で入ってくる。",
  appearance: [{ id: "d5-c2-a1", label: "様子", text: "始終、手元の包みを気にしている。" }],
  illustrationClues: [],
  item: {
    name: "古い写し絵",
    askPrice: 38,
    lowballPrice: 23,
    trueValue: 65,
    haggleValue: 88,
    description: "誰かの肖像が描かれた写し絵。目のあたりだけ妙に生々しい。",
    image: "item-portrait",
    hasSoul: true,
    hiddenObservations: [{ id: "d5-c2-i1", label: "裏側", text: "裏に、消されたような文字の跡がある。" }],
    buyer: {
      name: "無表情な客",
      image: "generic-adult-man",
      arrival: "無表情な客が、値踏みするように近づいてくる。",
      appearance: [{ id: "d5-c2-b-a1", label: "様子", text: "特に変わった様子はない。" }],
      illustrationClues: [],
      topics: [{ id: "d5-c2-b-t1", label: "何に使うのか聞く", line: "「趣味の一環だ。詮索はしないでくれ。」" }],
    },
  },
  soulCheckText: "判別機の針が大きく揺れ、青白く光る — 魂反応: あり。",
  topics: [{ id: "d5-c2-t1", label: "この写し絵の出所を聞く", line: "「……家族の形見だ。それ以上は、勘弁してくれ。」" }],
  negotiation: { accept: "「……ああ、それでいい。早く手放したいんだ。」", reject: "" },
  resolution: {
    refuse: { text: "「そうかよ」男は写し絵を抱え直すと、逃げるように出ていった。" },
    buyFull: { text: "魂入りの品として言い値のまま買い取った。男は逃げるように立ち去った。" },
    report: {
      goldDelta: 8,
      text: "男は写し絵を置いたまま、夜の中に姿を消した。後日、通報の礼として8Gを受け取った。",
      favor: { market: 5 },
    },
  },
}

const DAY5_CUSTOMERS = [
  sisterMaren,
  sicklyMan,
  fillerCustomer({
    name: "身なりの良い婦人",
    guilty: false,
    arrival: "身なりの良い婦人が、従者を連れずに一人で入ってくる。",
    itemName: "宝飾のついた櫛",
    price: 32,
    itemDesc: "細工の凝った櫛。",
    image: "generic-adult-woman",
    itemImage: "item-generic-jewelry",
  }),
  fillerCustomer({
    name: "旅装の男",
    guilty: false,
    arrival: "旅装の男が、埃をかぶったまま入ってくる。",
    itemName: "旅用の羅針盤",
    price: 26,
    itemDesc: "使い込まれた羅針盤。",
    image: "generic-young-man",
    itemImage: "item-generic-tool",
  }),
]

// --- Day6: 元締めヴィクターが自ら訪れ、裏取引を持ちかける日。---

const viktorsOffer = {
  id: "d6-c1",
  name: "元締め ヴィクター",
  image: "d6-c1-viktor",
  guilty: false,
  arrival: "夜市の元締め、ヴィクターが自ら店に顔を出す。珍しいことだ。",
  appearance: [{ id: "d6-c1-a1", label: "貫禄", text: "多くを見てきた者特有の、落ち着いた佇まい。" }],
  illustrationClues: [],
  item: {
    name: "出所不明の宝飾品",
    askPrice: 60,
    lowballPrice: 40,
    trueValue: 100,
    haggleValue: 130,
    description: "本来なら没収されるはずの品だという。ヴィクターの一存で、先にお前に回された。",
    image: "item-generic-jewelry",
    hasSoul: true,
    hiddenObservations: [
      { id: "d6-c1-i1", label: "由来", text: "詳しい由来は語られない。ヴィクターも深くは触れなかった。" },
    ],
    buyer: {
      name: "裕福そうな客",
      image: "generic-adult-man",
      arrival: "身なりの良い客が、静かに入ってくる。",
      appearance: [{ id: "d6-c1-b-a1", label: "様子", text: "特に変わった様子はない。" }],
      illustrationClues: [],
      topics: [{ id: "d6-c1-b-t1", label: "何に使うのか聞く", line: "「気に入ったので。理由はそれだけです。」" }],
    },
  },
  soulCheckText: "判別機の針が大きく揺れ、青白く光る — 魂反応: あり。",
  topics: [
    {
      id: "d6-c1-t1",
      label: "なぜ自分にくれるのか聞く",
      line: "「見て見ぬふりをしてくれるならな。他の店主より、お前は信用できると思ってる。」",
    },
    {
      id: "d6-c1-t2",
      label: "上納金について聞く",
      line: "「上納金にはうるさく言ってきただろう。……理由はいつか話す。今は、それでいい。」",
    },
  ],
  negotiation: { accept: "", reject: "「値切るのか。……まあ、お前らしいな。」" },
  resolution: {
    refuse: {
      text: "「そうか。まあ、無理にとは言わない」ヴィクターは静かに去っていった。",
      favor: { market: -4 },
    },
    buyFull: {
      text: "言い値のまま買い取った。ヴィクターは「借りができたな」とだけ言って店を出た。",
      favor: { market: 12, church: -6 },
    },
  },
}

const paleGirl = {
  id: "d6-c2",
  name: "青白い顔の少女",
  image: "d6-c2-pale-girl",
  guilty: true,
  arrival: "青白い顔をした少女が、震えながら入ってくる。",
  appearance: [{ id: "d6-c2-a1", label: "様子", text: "終始うつむき、人形を強く抱きしめている。" }],
  illustrationClues: [],
  item: {
    name: "小さな人形",
    askPrice: 42,
    lowballPrice: 25,
    trueValue: 75,
    haggleValue: 100,
    description: "手作りらしい人形。目のあたりだけ妙に生々しい。",
    image: "item-doll",
    hasSoul: true,
    hiddenObservations: [{ id: "d6-c2-i1", label: "縫い目", text: "何度も縫い直された跡がある。大切にされてきたようだ。" }],
    buyer: {
      name: "人形collector風の男",
      image: "generic-adult-man",
      arrival: "人形を集めているという男が、興味深げに近づいてくる。",
      appearance: [{ id: "d6-c2-b-a1", label: "様子", text: "特に変わった様子はない。" }],
      illustrationClues: [],
      topics: [{ id: "d6-c2-b-t1", label: "何に使うのか聞く", line: "「コレクションに加えるだけですよ。」" }],
    },
  },
  soulCheckText: "判別機の針が大きく揺れ、青白く光る — 魂反応: あり。",
  topics: [{ id: "d6-c2-t1", label: "この人形の出所を聞く", line: "「……お姉ちゃんが、作ってくれたの。でも、もう、いらないから。」" }],
  negotiation: { accept: "「……うん、それでいい。」小さくうなずく。", reject: "" },
  resolution: {
    refuse: { text: "少女は人形を抱きしめ直すと、何も言わずに出ていった。" },
    buyFull: { text: "魂入りの品として言い値のまま買い取った。少女は俯いたまま去っていった。" },
    report: {
      goldDelta: 8,
      text: "少女は人形を置いたまま、走るように去っていった。後日、通報の礼として8Gを受け取った。",
      favor: { market: 5 },
    },
  },
}

const DAY6_CUSTOMERS = [
  viktorsOffer,
  paleGirl,
  fillerCustomer({
    name: "夜市の顔役らしい男",
    guilty: false,
    arrival: "夜市の顔役らしい貫禄のある男が、悠然と入ってくる。",
    itemName: "年代物の酒瓶",
    price: 45,
    itemDesc: "封の切られていない年代物の酒。",
    image: "generic-adult-man",
    itemImage: "item-generic-household",
  }),
  fillerCustomer({
    name: "落ち着いた老女",
    guilty: false,
    arrival: "落ち着いた様子の老女が、丁寧にお辞儀をして入ってくる。",
    itemName: "手編みの敷布",
    price: 24,
    itemDesc: "丁寧に編まれた敷布。",
    image: "generic-old-woman",
    itemImage: "item-generic-household",
  }),
]

// --- Day7: 最終日。ダロンが最後の頼みを持ってくる。---

const daronsLastFavor = {
  id: "d7-c1",
  name: "ダロン",
  image: "c1-daron",
  guilty: true,
  arrival: "ダロンが、これまでと違う硬い表情で入ってくる。",
  appearance: [{ id: "d7-c1-a1", label: "様子", text: "いつもの飄々とした感じがなく、思い詰めた顔をしている。" }],
  illustrationClues: [],
  item: {
    name: "戦友の魂が宿ったという形見",
    askPrice: 60,
    lowballPrice: 40,
    trueValue: 140,
    haggleValue: 180,
    description: "ダロンが後生大事に抱えていた品。今夜、初めて店に持ち込んだ。",
    image: "item-keepsake",
    hasSoul: true,
    hiddenObservations: [{ id: "d7-c1-i1", label: "刻まれた文字", text: "小さく、戦友の名前らしき文字が刻まれている。" }],
    buyer: {
      name: "無口な買い手",
      image: "generic-adult-man",
      arrival: "無口な男が、値踏みするように近づいてくる。",
      appearance: [{ id: "d7-c1-b-a1", label: "様子", text: "特に変わった様子はない。" }],
      illustrationClues: [],
      topics: [{ id: "d7-c1-b-t1", label: "何に使うのか聞く", line: "「詮索は無用だ。」" }],
    },
  },
  soulCheckText: "判別機の針が大きく揺れ、青白く光る — 魂反応: あり。",
  topics: [
    {
      id: "d7-c1-t1",
      label: "なぜ今になって売るのか聞く",
      line: "「……金が要るんだ。情けない話だがな。これだけは売りたくなかったが、他に当てがない。」",
    },
    { id: "d7-c1-t2", label: "本当にいいのか聞く", line: "「……いいわけ、ないさ。それでも、頼む。」" },
  ],
  negotiation: { accept: "「……ありがとよ。恩に着る。」", reject: "" },
  resolution: {
    refuse: { text: "「……そうか、すまなかったな」ダロンは肩を落として、それでも品を抱えたまま出ていった。" },
    buyFull: { text: "言い値のまま買い取った。ダロンは深く頭を下げ、何度も礼を言って去っていった。" },
    report: {
      goldDelta: 5,
      text: "ダロンを見送った後、迷った末に夜市の管理者へ伝えた。彼がどうなったかは、わからないままだった。",
      favor: { market: 5 },
    },
  },
}

const lastYoungWoman = {
  id: "d7-c2",
  name: "思い詰めた様子の若い女",
  image: "d7-c2-grieving-woman",
  guilty: true,
  arrival: "思い詰めた様子の若い女が、包みを抱えて入ってくる。",
  appearance: [{ id: "d7-c2-a1", label: "様子", text: "目が赤い。泣いていたのかもしれない。" }],
  illustrationClues: [],
  item: {
    name: "遺品らしい指輪",
    askPrice: 55,
    lowballPrice: 35,
    trueValue: 95,
    haggleValue: 125,
    description: "小さな指輪。内側に何か刻まれている。",
    image: "item-ring",
    hasSoul: true,
    hiddenObservations: [{ id: "d7-c2-i1", label: "内側の刻印", text: "小さく、誰かのイニシャルらしき刻印がある。" }],
    buyer: {
      name: "初老の紳士",
      image: "generic-old-man",
      arrival: "初老の紳士が、丁寧な物腰で近づいてくる。",
      appearance: [{ id: "d7-c2-b-a1", label: "様子", text: "特に変わった様子はない。" }],
      illustrationClues: [],
      topics: [{ id: "d7-c2-b-t1", label: "何に使うのか聞く", line: "「贈り物にと思いましてね。」" }],
    },
  },
  soulCheckText: "判別機の針が大きく揺れ、青白く光る — 魂反応: あり。",
  topics: [{ id: "d7-c2-t1", label: "この指輪の出所を聞く", line: "「……母の形見です。手放したくは、なかったのですが。」" }],
  negotiation: { accept: "「……はい、それで構いません。」", reject: "" },
  resolution: {
    refuse: { text: "女は指輪を握りしめると、一礼して出ていった。" },
    buyFull: { text: "魂入りの品として言い値のまま買い取った。女は涙をこらえながら去っていった。" },
    report: {
      goldDelta: 8,
      text: "女は指輪を置いたまま、逃げるように去っていった。後日、通報の礼として8Gを受け取った。",
      favor: { market: 5 },
    },
  },
}

const DAY7_CUSTOMERS = [
  daronsLastFavor,
  lastYoungWoman,
  fillerCustomer({
    name: "旅の学者",
    guilty: false,
    arrival: "旅の学者を名乗る男が、本の束を抱えて入ってくる。",
    itemName: "古い研究資料",
    price: 40,
    itemDesc: "手書きの研究資料の束。",
    image: "generic-old-man",
    itemImage: "item-generic-book",
  }),
  fillerCustomer({
    name: "寡黙な職人",
    guilty: true,
    arrival: "寡黙な職人が、道具箱を提げて入ってくる。",
    itemName: "銘のある道具一式",
    price: 46,
    itemDesc: "名の知れた職人の銘が入った道具一式。",
    soul: true,
    image: "generic-adult-man",
    itemImage: "item-generic-tool",
  }),
]

export { REFERENCE, START_GOLD }

// allowedChecks: 1つの商品につき、その日に調べられる回数。調査ポイント自体は
// どの品も6〜8個あるので、日が進むほど「どこを見るか」の選択が重くなる。
// 1日目は操作を覚える日なので実質無制限にしてある。
export const DAYS = [
  { day: 1, quota: 60, hasDetector: true, forcedEvent: null, customers: expandDayObservations(DAY1_CUSTOMERS, 99) },
  { day: 2, quota: 75, hasDetector: true, forcedEvent: null, customers: expandDayObservations(DAY2_CUSTOMERS, 5) },
  { day: 3, quota: 80, hasDetector: true, forcedEvent: "robbery", customers: expandDayObservations(DAY3_CUSTOMERS, 5) },
  { day: 4, quota: 70, hasDetector: false, forcedEvent: null, customers: expandDayObservations(DAY4_CUSTOMERS, 4) },
  { day: 5, quota: 90, hasDetector: false, forcedEvent: null, customers: expandDayObservations(DAY5_CUSTOMERS, 4) },
  { day: 6, quota: 110, hasDetector: false, forcedEvent: null, customers: expandDayObservations(DAY6_CUSTOMERS, 4) },
  { day: 7, quota: 130, hasDetector: false, forcedEvent: null, customers: expandDayObservations(DAY7_CUSTOMERS, 4) },
]
