// 1晩目(MVP)のコンテンツ定義。数値・セリフは仮。遊んでみてから調整する。
// 参照: memory/decisions.md, memory/game_design.md
//
// illustrationClues: イラスト完成後に使う、見た目だけで気づける手がかりの置き場。
// { id, x, y, label, text } の形を想定(x/yはイラスト上のホットスポット位置を
// 0-100の%で指定)。イラストがまだ無いので今は空配列のまま。中身が入ると
// ScenePanel が自動でクリック可能なホットスポットとして表示する。

export const START_GOLD = 20
export const QUOTA = 60

export const REFERENCE = [
  {
    id: "ref-soul-law",
    title: "禁術「魂入れ」について",
    text: "魂を物に宿す技術は禁術。強い魂を宿した品は通常より高い価値を持つが、\n所持・売買は法で禁じられている。聖なる教会は届け出を推奨しているが、\n夜市では黙認され、高額で取引されている。",
  },
  {
    id: "ref-soul-detector",
    title: "魂判別機について",
    text: "商品にかざすと「魂反応: あり / なし」だけがわかる道具。\n誰の魂か、なぜ宿っているかまでは判別できない。",
  },
  {
    id: "ref-grave-thieves",
    title: "夜市の通達: 「形見」を騙る窃盗団",
    text: "墓を荒らし、盗んだ副葬品を「亡き家族の形見」と偽って売りさばく\n窃盗団がいるという通達が出ている。目印は、持ち主の紋章や刻印を\n削り取ったような跡。",
  },
]

export const CUSTOMERS = [
  {
    id: "c1-daron",
    name: "ダロン",
    image: "c1-daron",
    // guilty: この商品について客が後ろめたさを抱えているか。値切り交渉の反応に影響する。
    guilty: false,
    arrival:
      "傷だらけの手をした男が、安物だが手入れの行き届いた革鎧を着て入ってくる。\n左手首には古い火傷の痕がある。",
    appearance: [
      { id: "c1-a1", label: "手", text: "剣だこと古い傷が多い。戦い慣れた手つき。" },
      { id: "c1-a2", label: "装備", text: "安物だが丁寧に手入れされた革鎧。傭兵崩れか。" },
    ],
    illustrationClues: [],
    item: {
      name: "片手剣",
      askPrice: 20,
      lowballPrice: 12,
      trueValue: 30,
      haggleValue: 38,
      description: "使い込まれた片手剣。柄に小さな刻印がある。",
      image: "item-sword",
      hasSoul: false,
      category: "weapon",
      hiddenObservations: [
        { id: "c1-i1", label: "刃", text: "刃こぼれはあるが、手入れはされている。" },
        { id: "c1-i2", label: "柄の刻印", text: "小隊の紋章らしき刻印。ありふれたものだ。" },
      ],
      buyer: {
        name: "ゲオルグ",
        image: "c1-buyer-georg",
        // wantsCategory: 「普通の剣を探してる」という台詞通り、刃物なら代用がきく。
        wantsCategory: "weapon",
        arrival: "顔なじみの道具商ゲオルグが、いつも通りふらりと店に立ち寄る。",
        appearance: [
          { id: "b1-a1", label: "身なり", text: "使い古した商人の外套。夜市の常連らしい落ち着きがある。" },
        ],
        illustrationClues: [],
        topics: [
          {
            id: "b1-t1",
            label: "何に使うのか聞く",
            line: "「ああ、うちの得意先が普通の剣を探しててね。特に裏の事情はないよ。」",
          },
        ],
      },
    },
    soulCheckText: "判別機の針は動かない — 魂反応: なし。",
    topics: [
      {
        id: "c1-t1",
        label: "この剣の出所を聞く",
        line: "「戦友の形見だ。……そいつはもう戦えない身体になっちまってな。金に困って、代わりに俺が売りに来た。」",
        // hint: この話が本当なら柄に持ち主を示す印があるはず、という推理の誘導。
        hint: "c1-i2",
      },
      {
        id: "c1-t2",
        label: "最近の様子を聞く",
        line: "「最近、東門のあたりに騎士が妙に増えてる。俺らみたいなのには近寄りたくない話だ。」",
        note: "ダロン: 「最近、東門のあたりに騎士が妙に増えている」",
      },
    ],
    negotiation: {
      accept: "「……はぁ、まあいい。急いでるわけじゃないが、それで構わないさ。」",
      reject:
        "「おいおい、足元見るなよ。戦友の形見なんだ、そんな値じゃ売らない。」ダロンは値切りをきっぱり断った。",
    },
    resolution: {
      refuse: {
        text: "「……そうか」とだけ言って、ダロンは剣を鞘に戻し店を出ていった。",
      },
      buyFull: {
        text: "言い値のまま買い取った。ダロンは軽く頭を下げて夜の中に消えていった。",
      },
    },
  },
  {
    id: "c2-ilea",
    name: "イレア",
    image: "c2-ilea",
    guilty: true,
    arrival:
      "強い香水の匂いをまとった女が、指に不釣り合いなほど高価な指輪をはめて入ってくる。",
    appearance: [
      { id: "c2-a1", label: "指輪", text: "指輪だけがやけに上等で、他の身なりと釣り合っていない。" },
      { id: "c2-a2", label: "態度", text: "目を合わせようとせず、早口で話す。" },
    ],
    illustrationClues: [],
    item: {
      name: "小さな護符",
      askPrice: 50,
      lowballPrice: 30,
      trueValue: 90,
      haggleValue: 130,
      description: "古い木片を組んだ護符。中央に何かが埋め込まれている気配がある。",
      image: "item-amulet",
      hasSoul: true,
      category: "amulet",
      hiddenObservations: [
        {
          id: "c2-i1",
          label: "裏面",
          text: "裏に、何か紋章のようなものを削り取った跡がある。",
        },
        { id: "c2-i2", label: "重さ", text: "見た目より重い。中に何かが封じられている感触。" },
      ],
      buyer: {
        name: "フード姿の男",
        image: "c2-buyer-hooded",
        // wantsCategory: この手の護符・呪物を欲しがる客。代用も同系統のみ。
        wantsCategory: "amulet",
        arrival: "顔を隠すようにフードを深く被った男が、音もなく近づいてくる。",
        appearance: [
          { id: "b2-a1", label: "様子", text: "終始、周囲を気にしている。夜市の顔なじみではなさそうだ。" },
        ],
        illustrationClues: [],
        topics: [
          {
            id: "b2-t1",
            label: "何に使うのか聞く",
            line: "「……こういう品を欲しがる客がいる、とだけ言っておこう。」",
          },
          {
            id: "b2-t2",
            label: "運び先を聞く",
            line: "「東門から街を出る。今日中にな。」",
            note: "フード姿の男: 「(護符を)東門から街を出して運ぶ」と話していた",
          },
        ],
      },
    },
    soulCheckText: "判別機の針が大きく揺れ、青白く光る — 魂反応: あり。",
    topics: [
      {
        id: "c2-t1",
        label: "この護符の出所を聞く",
        line: "「亡くなった母の形見です。……生活に困って、手放すことにしました。」",
      },
      {
        id: "c2-t2",
        label: "削り跡について聞く",
        line: "「さ、さあ……昔からこうだったので、私は何も。」目が泳いでいる。",
        // hint: 削り跡の話が出た以上、裏面を実際に調べて確かめる流れを作る。
        hint: "c2-i1",
      },
    ],
    negotiation: {
      accept: "「え……それでも、構いません。すぐに、手放したいので。」目を伏せたまま即座にうなずいた。",
      reject: "",
    },
    resolution: {
      refuse: {
        text: "「そう、ですか……」イレアは護符を懐にしまい、俯いたまま去っていった。",
      },
      buyFull: {
        text: "魂入りの護符ということで言い値のまま買い取った。イレアは逃げるように店を出ていった。",
      },
      report: {
        goldDelta: 10,
        text: "取り乱した様子で、護符を置いたまま彼女は夜の中に消えた。後日、夜市の管理者から通報の礼として10Gを受け取った。彼女が本当に窃盗団の一味だったのかは、結局わからないままだった。",
        favor: { market: 6 },
      },
    },
  },
  {
    id: "c3-noah",
    name: "ノア",
    image: "c3-noah",
    guilty: true,
    arrival:
      "制服の一部を私服の下に隠すようにした若い男が、東門の方角から急ぎ足でやってくる。",
    appearance: [
      { id: "c3-a1", label: "服装", text: "私服の襟元から、衛兵の制服らしき布地がのぞいている。" },
      { id: "c3-a2", label: "様子", text: "何度も後ろを気にしながら店に入ってきた。" },
    ],
    illustrationClues: [],
    item: {
      name: "短剣",
      askPrice: 15,
      lowballPrice: 9,
      trueValue: 22,
      haggleValue: 27,
      description: "量産品らしい短剣。柄に何かの登録番号らしき刻印がある。",
      image: "item-dagger",
      hasSoul: false,
      category: "weapon",
      hiddenObservations: [
        { id: "c3-i1", label: "柄の刻印", text: "衛兵隊の備品によくある管理番号のような刻印。" },
      ],
      buyer: {
        name: "若い鍛冶屋見習い",
        image: "c3-buyer-blacksmith",
        // wantsCategory: 「刃物なら何でも構いません」という台詞通り、完全に代用可能。
        wantsCategory: "weapon",
        arrival: "若い鍛冶屋見習いが、素材にする刃物を探して立ち寄る。",
        appearance: [
          { id: "b3-a1", label: "様子", text: "職人らしい無骨な手をしている。値段交渉には慣れていなさそうだ。" },
        ],
        illustrationClues: [],
        topics: [
          {
            id: "b3-t1",
            label: "何に使うのか聞く",
            line: "「潰して打ち直すんです。刃物なら何でも構いません。」",
          },
        ],
      },
    },
    soulCheckText: "判別機の針は動かない — 魂反応: なし。",
    topics: [
      {
        id: "c3-t1",
        label: "この短剣の出所を聞く",
        line: "「……拾ったんだ。落とし物みたいなもんだろ。」目を合わせない。",
        // hint: 「拾った」という話の真偽を、柄の刻印(持ち主を示す情報)で確かめる流れ。
        hint: "c3-i1",
      },
      {
        id: "c3-t2",
        label: "東門の様子を聞く",
        line: "「東門? 別に、いつも通りだけど。」",
      },
    ],
    negotiation: {
      accept: "「……っ、わかったよ、それでいい。早く終わらせたい。」",
      reject: "",
    },
    resolution: {
      refuse: {
        text: "「そうかよ」ノアは短剣をしまうと、逃げるように出ていった。",
      },
      buyFull: {
        text: "特に問い詰めず、言い値のまま買い取った。ノアは足早に店を後にした。",
      },
      report: {
        goldDelta: -5,
        text: "夜市の管理者を呼んだが、これといった証拠もなく、時間を取らせただけに終わった。",
        favor: { market: -3 },
      },
    },
  },
]
