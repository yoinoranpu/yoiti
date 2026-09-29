# 夜市 開発ログ

## 進行中

- **ChatGPT完成イメージ図をもとにUIへアイコンを配線**(2026-09-30)。
  ChatGPTに現状のゲーム画面を見せて描いてもらった完成イメージ図
  (タイトル画面/メイン画面、`memory/chatgpt_concept_mockup_prompts.md`)と
  見比べ、取り込み済みだが未使用だったアイコン素材を実装。
  - 上部ステータス(日数=月の満ち欠けアイコン/所持金/上納金/在庫)、
    「話す/調べる/判断する」の各ボタン・見出し、資料/まとめた情報/見た情報の
    見出しにアイコンを追加(`IconLabel`共通コンポーネント、
    `src/components/panels.jsx`/`NightScreen.jsx`/`AppraisalScreen.jsx`/
    `index.css`)。ブラウザで全アイコンが404なく表示されることを確認済み。
  - `button-frame.png`は自動クロップして小ボタンへの適用を試したが、
    手描き装飾が不均一で9-slice向きではないと判断し見送り(大きいパネル用に
    転用予定)。`title-logo.png`はglow効果がグリーンバックと衝突し緑の縁が
    残る不具合が判明(要作り直し、未使用のまま)。詳細は
    [decisions.md](memory/decisions.md)参照。
- **7日間ループを実装・動作確認済み**。`src/data/days.js` にDay1〜7の構成
  (客リスト/上納金/判別機の有無/強制イベント)をまとめ、`src/store/gameStore.js`
  をDay対応にリファクタした。
  - Day1(実装済みのダロン/イレア/ノア、判別機あり) → Day2(判別機あり) →
    Day3(強制イベント: 査定後に強盗に有り金を奪われ、判別機没収。ゲームオーバーには
    ならない) → Day4以降(判別機なし。代わりに客と対面した時点で魂反応があれば
    自動で「共鳴」の描写が見た情報に追加される) → Day7クリアで
    VictoryScreen(最終エンディング仮)。
  - JS直接実行でDay1→7の状態遷移を検証し、実際のクリック操作でもDay1〜4の画面
    表示(判別機ボタンの出し分け、共鳴の自動表示、強盗イベント画面)を確認済み。
  - **Day2〜7の客の中身をstory_outline.md/characters.mdのキャラ案に沿って本文まで
    書いた**(2026-09-25)。気弱な老人・図々しい行商人(Day2)、ダロン再登場×2
    (Day2/Day7、東門の噂を補強)、矛盾した噂を持つ客(Day3)、夜市の顔なじみ
    (Day4)、シスター・マレン初登場(Day5)、元締めヴィクターの裏取引の誘い
    (Day6)、ダロンの最後の頼み(Day7)など。頭数合わせの軽いモブだけ
    `fillerCustomer`ヘルパーを使用。
  - 「言い値で買う」だけで全客を買うとDay2で資金不足になったが、値切り・査定の
    使い分け(後ろめたい客は値切る、魂なしは強気に売る、魂入りは安全に売る)を
    する「賢いプレイ」ではDay1〜7を無事故でクリアできることをブラウザ上の自動
    プレイスクリプトで確認済み(最終所持金158G)。
- **教会/夜市の心証システムとエンディング分岐を実装**。プレイ中は非表示の隠し
  パラメータ`churchFavor`/`marketFavor`を追加し、シスター・マレン/元締めヴィクター
  との取引・各種の通報にだけ`favor`を仕込んだ(全取引を評価対象にはしていない)。
  7日目クリア時に心証と最終所持金から4種類のエンディング(教会寄り/夜市寄り/
  大金持ち/中立)に分岐する。ブラウザで4エンディングの判定とfavor加算の両方を
  確認済み(`src/store/gameStore.js` の applyFavor/determineEnding、
  `src/components/EndScreens.jsx` の VictoryScreen)。
- UI/UX改善: 取引の判断結果を全画面ポップアップではなく、キャラ・吹き出しを
  画面に残したままインライン表示するように変更(`ResultPanel`)。「反応を見ずに
  即決してしまう」というユーザー指摘への対応。動作確認済み。
- **未売却品の持ち越しを実装**。在庫は週を通して持ち越し、査定は「その日の
  在庫スナップショット」(`appraisalQueue`)に対して行う。売れた品だけ`invId`で
  在庫から除去し、やめた品・買い手に逃げられた品は残って翌日以降また売れる。
  これで「客数が実質倍」問題も、査定を毎日やりきる必要がなくなったことで解消した。
- **GitHub Pagesで公開**: https://yoinoranpu.github.io/yoiti/ 。GitHub Actions
  (`.github/workflows/deploy.yml`)でmasterへのpush時に自動ビルド・デプロイされる。
  `vite.config.js`でビルド時のみ`base: "/yoiti/"`にし、`src/components/panels.jsx`の
  `assetUrl()`ヘルパーで`public/assets/`への参照をすべて`import.meta.env.BASE_URL`
  基準に統一した(サブパス配信でも画像が正しく解決されるように)。リポジトリ:
  https://github.com/yoinoranpu/yoiti (public)。
- **UIレイアウト大幅改修**: シーンを背景→キャラ(下半身がカウンターの裏)→
  カウンター→アイテム(カウンター上に表示)の重なりに再構成し、キャラが宙に
  浮いて見える問題を解消(`panels.jsx`の`ScenePanel`/`ItemFigure`、
  `index.css`の`.scene-actor`/`.counter`/`.counter-item`)。アイテムにも
  `image`フィールドを追加(`night1.js`/`days.js`/`itemToInventory`)。
  資料/まとめた情報/見た情報は常時表示の3カラムをやめ、右上アイコン列
  (`InfoOverlay`)から開閉する「壁に貼った紙」風ドロワーに変更。
  ブラウザで接客・査定両シーンの表示とドロワー開閉を確認済み。既知の軽微な
  課題として`appraisal-desk-front.png`の天秤小道具に緑の縁がわずかに残る
  (細い線状の小道具はグリーンバック自動除去が苦手なケース、保留)。
- **画像表示への切り替えを実装**: 客・買い手データ(`night1.js`/`days.js`)に
  `image`フィールドを追加(named 17体 + ダロン再利用 + 汎用9箇所)。
  `ScenePanel`(`panels.jsx`)に`CharacterFigure`を追加し、画像があれば
  `/assets/characters/{image}.png`を表示、無い・読み込み失敗時は従来の
  頭文字プレースホルダーに自動で戻る(`onError`+`key`でキャラ切り替え時に
  状態リセット)。背景(`shop-room-back`/`shop-counter-front`、査定側は
  `appraisal-room-back`/`appraisal-desk-front`)、タイトル画面
  (`title-screen.png`)もCSS背景画像化し、`image-rendering: pixelated`を追加。
  ブラウザで実際のプレイを通し、named客・買い手・汎用テンプレート客の全パターンで
  正しく表示されることを確認済み。
- **イラスト取り込み完了**: ユーザーが75点中74点を用意。
  `scripts/remove_green_bg.py`(グリーンバック除去)+
  `scripts/import_illustrations.py`(一括変換・振り分け)で
  `public/assets/{characters,backgrounds,items,icons,frames,events}/` に配置済み。
  マゼンタ背景合成で透過が正しく機能していることを確認済み。残り1点は
  `panel-frame`のみ。次はコード側(`ScenePanel`等)を「画像があれば表示、なければ
  プレースホルダー」に切り替える実装(未着手)。
- **イラスト方針をドット絵に変更し、依頼リストをv2に全面改訂**
  ([memory/illustration_requests.md](memory/illustration_requests.md))。
  参考: Moonlighter/Stardew Valley/Papers, Please。ポートレートだけでなく
  背景・アイテムアイコン・UIアイコン・枠装飾・イベント一枚絵まで洗い出し、
  `public/assets/{characters,backgrounds,items,icons,frames,events}/` に
  フォルダを分ける構成にした。画像が揃い次第、`image-rendering: pixelated`を
  CSSに追加し、各コンポーネントを「画像があれば表示、なければプレースホルダー」
  に切り替える(未着手)。

- ゲーム全体の構成が確定した: **7日間、7日目クリアでエンディング**。Day1は
  チュートリアル(実装済みのダロン/イレア/ノアがそのまま使える)、Day3は上納金を
  必ず払えなくなる強制イベント(強盗で売上を奪われる)、Day4から判別機を失い
  「共鳴」で自動判定に切り替わる。客数・上納金はDayを追うごとに増加。詳細は
  [memory/story_outline.md](memory/story_outline.md) の表を参照。
- 次にやること: 現状「1晩使い切り」の実装を、**日をまたぐループ**(Day管理、
  所持金・まとめた情報を週を通して持ち越す、Day3強制イベント、Day4判別機喪失/
  共鳴演出)に拡張する必要がある。まだ未着手。
- 世界観資料・キャラクター一覧は下書き済み([memory/worldbuilding.md](memory/worldbuilding.md)、
  [memory/characters.md](memory/characters.md))。ストーリーはおまけ要素・世界観の
  定規として扱う方針(ユーザー指摘、2026-09-25)。
- 1晩分(客3人: ダロン/イレア/ノア → 仕入れ→査定売却→上納金判定)の縦串が一通り
  動く状態(プレイ可能)。内容(セリフ・数値バランス)は仮なので、遊びながら調整
  していくフェーズ。
- 経済モデルは「仕入れ(支払い、在庫に追加)→夜の終わりに査定して売る(収入)」の
  2段階。買取交渉は3択(言い値で買う/値切る/断る)。値切りへの反応(あっさり応じる/
  突っぱねる)が客の後ろめたさの手がかりとして「見た情報」に残る。
- 査定(売り)側も買いと対称の3択(言い値で売る/高く売れないか粘る/やめておく)に
  変更。魂入りなど危ない品で強気に出ると買い手が去って0Gになるリスクを実装
  (`src/store/gameStore.js` の sellAtValue/tryHaggleUp/skipSell、
  `src/components/AppraisalScreen.jsx`)。
- 査定画面を買い画面と完全に同じUI(資料/まとめた情報/見た情報+会話+判断)に統一。
  共通パネルを `src/components/panels.jsx` に切り出し(ReferencePanel/NotesPanel/
  InspectionPanel/ScenePanel/DialogueLog/TalkGroup)、NightScreenとAppraisalScreen
  の両方から使う形にリファクタ。仕入れた品ごとに専用の「買い手」キャラクター
  (`item.buyer`)を持たせ、話しかけて情報を得られるようにした。1人目の客の噂と
  護符の買い手の証言が「まとめた情報」上で符合するようにして、買い⇄売りをまたいだ
  推理が最初から機能するサンプルにした。ストア側は `currentActor()` で買い(客)/
  売り(買い手)どちらの相手と話しているかを判定し、`talk()` を共通化。
- イラスト実装後の「見た目からの手がかり」用の受け皿(`illustrationClues`、
  `inspectIllustrationClue`、`ScenePanel`内のホットスポット表示)を用意。中身は
  まだ空。発言を人物の下に吹き出し表示する`SpeechBubble`を追加
  (`src/components/panels.jsx`)。
- 客・商品のビジュアルは仮(頭文字だけの丸アイコン)。後でイラストに差し替え予定。
- 次にやること候補: 所持金マイナス許容のままでいいかの検討、客の人数やバランス
  調整、資料/まとめた情報の見せ方の改善、客2人目以降の追加、判別機没収からの
  「共鳴」展開など。[memory/decisions.md](memory/decisions.md) の「未確定・要相談」
  を参照。

## 履歴

### 2026-09-24
- ユーザーが企画書『夜市』を持ち込み、`C:\Users\hamak\APP\yoiti` で新規プロジェクトと
  して開発開始することに決定。
- 企画書原本を [memory/game_design.md](memory/game_design.md) に保存。
- ユーザー・Claude双方が編集できる相談メモとして [memory/decisions.md](memory/decisions.md)
  を作成。
- 技術スタックを React + Vite + Zustand に決定。プロジェクト雛形を作成
  (`npm create vite@latest` → 一時フォルダ経由でルートに配置)。
- 画面UIを「That's Not My Neighbor」風の詮索UI(資料/まとめた情報/見た情報の3パネル
  + 中央にシーン+会話)に決定。
- MVP(1晩分、客3人+上納金判定)を実装:
  - `src/data/night1.js`: 客(ダロン/イレア/ノア)・商品・資料の仮データ
  - `src/store/gameStore.js`: 夜のゲームループの状態管理(zustand)
  - `src/components/`: TitleScreen / NightScreen / EndScreens
  - ダロンの証言(東門の噂)を「まとめた情報」に記録し、後の客の判断材料にする
    導線を実装(企画書13章の「情報を組み合わせる」を体現する最初の例)
  - ブラウザで一通りプレイし、正常動作を確認(通報・買い取り・断る・ゲームオーバー
    ・タイトルへ戻る、まですべて確認済み)
- 軽微な不具合修正: 取引結果オーバーレイが商品カードの背後に隠れる z-index の
  問題を修正。
