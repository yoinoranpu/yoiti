# イラスト依頼リスト(v4・切り抜き用グリーンバック対応)

ドット絵路線。各アイテムにつき、そのままコピペで使える完成したプロンプトを1つずつ
用意している。

**v4での変更点**: キャラクター/アイテム/UIアイコン/枠は、黒背景だと髪や暗い服・
暗いパーツと同化して切り抜きにくいという指摘を受け、**クロマキー用のグリーンバック
(`#00ff00`)** に統一した。ドット絵は輪郭がはっきりしている(アンチエイリアスなし)
ので、この単色だけを透過に置き換えれば綺麗に切り抜ける。背景シーン・イベント
一枚絵は切り抜き不要(そのまま使う絵)なので、暗い夜市の色調のままにしてある。

参考にした作品: **Moonlighter**(ドット絵の店番UI)、**Stardew Valley**(小さい
ドット絵でも伝わるNPC立ち絵)、**Papers, Please**(ブロッキーな人物描写と事務的な
UIの空気感)。

保存先フォルダ構成:
```
public/assets/
  characters/   キャラクターの立ち絵・バストアップ
  backgrounds/  背景
  items/        アイテムアイコン
  icons/        UIアイコン
  frames/       枠・装飾
  events/       イベント一枚絵(任意)
```

パレット基準(キャラクター本体・アイテム本体の配色): パネル`#201a28`、縁
`#3a2f40`、アクセント(灯り・金)`#c9a24a`、危険色`#a84f4f`。魂入り演出はパレット
`#00ff00`。魂入り演出は淡い青白(`pale blue-white`)。背景シーン・イベント一枚絵は
暗紫`#0e0b12`〜`#1a1520`。

---

## 1. 背景(`public/assets/backgrounds/`、320×180目安)

**方針変更(2026-09-28)**: 「接客カウンター」を1枚の合成背景として作ると、
そこにキャラを差し込めない(カウンターの位置・遠近感が固定されてしまい、どの
キャラを乗せても不自然になる)ことが判明。今の画面構造は元々「奥の背景」
(`.scene-backdrop`)と「手前のカウンター」(`.counter`)が別レイヤーなので、
それに合わせて **奥の背景素材** と **手前に重ねるカウンター/机の帯素材** を
分けて作る。カウンター/机の帯は、キャラの手前(画面下部)に重ねる横長の
帯状パーツで、こちらは**切り抜き用グリーンバック**にする(帯の上の空間は
透過にして奥の背景とキャラが透けて見えるようにするため)。

### `shop-room-back.png` — 接客シーンの奥の背景(カウンターなし)
切り抜き不要。暗い夜市の色調のまま。
```
Pixel art, no anti-aliasing, crisp pixel edges, limited dark color palette
(near-black purple #0e0b12 to #1a1520 background, warm amber lantern light
#c9a24a as the dominant highlight). Wide scene, no characters, no counter
or furniture in the foreground.
The back wall and shelves of a dim night market shop interior, lanterns
hanging overhead casting warm pools of light, cluttered shelves of vague
goods fading into shadow toward the back of the frame, leaving the
lower-middle area open and empty so a character and a counter can be
composited in front of it later.
```

### `shop-counter-front.png` — 接客シーンの手前に重ねるカウンター
背景は切り抜き用グリーンバック(`#00ff00`)。カウンターの天板から上は透過にする。
```
Pixel art, no anti-aliasing, crisp pixel edges. Wide horizontal foreground
strip, on a flat solid chroma-key green background (#00ff00) above the
counter surface — easy to cut out and overlay in front of a character.
A close-up view of a worn wooden shop counter top and its front edge
panel, seen from the customer's side, a few small vague trinkets and a
lantern resting on the surface, warm amber highlight #c9a24a.
```

### `inspection-desk-back.png` — 鑑定机エリア(画面下半分)の背景(2026-10-01追加)
切り抜き不要。商品を置く鑑定机と魂判別機の台をまとめて覆う、横長1枚のパネル背景。
UI改修で「枠(CSSのボーダー)が煩わしい」という指摘があり、CSSの箱組みを実イラスト
で置き換えるために追加した。商品アイコン・観察ノードのラベル・判別機アイコンは
すべてこの背景の上にUI側で重ねて表示するので、中央〜左側は過度に描き込まず
空けておくこと。
```
Pixel art, no anti-aliasing, crisp pixel edges, limited dark color palette
(near-black purple #0e0b12 background, warm worn-wood browns, amber lantern
highlight #c9a24a as the dominant light). Very wide, short panoramic strip
(roughly 5:1 width to height), no characters.
A worn wooden examination desk seen from slightly above. The left
three-quarters of the frame is dominated by an open sheet of parchment or a
loosely rolled-out map lying flat on the wood — keep the center of this
parchment visually quiet and uncluttered, with no large objects drawn on
it, so a prop and small labels can be overlaid on top of it digitally
afterward. On the right quarter of the frame, the wood gives way to a
small inset stone or tarnished brass pedestal built into the desktop,
carved with faint occult markings and a shallow empty depression as if
meant to cradle a hand-held device — do not draw any tool or device sitting
in it, leave that space empty. A few incidental clutter items (an inkwell,
a magnifying glass, a loose coin or two) only near the far edges of the
frame, away from the center and away from the pedestal.
```

### `title-screen.png` — タイトル画面背景
```
Pixel art, no anti-aliasing, crisp pixel edges, limited dark color palette
(near-black purple #0e0b12 to #1a1520 background, warm amber lantern light
#c9a24a as the dominant highlight). Wide scene, no characters.
A narrow night market street seen from a distance, rows of hanging paper
lanterns and cloth-covered stalls, low fog near the ground, a few
silhouetted rooftops against a dark purple night sky, quiet and mysterious
mood.
```

### `appraisal-room-back.png` — 査定シーンの奥の背景(机なし)
切り抜き不要。暗い夜市の色調のまま。
```
Pixel art, no anti-aliasing, crisp pixel edges, limited dark color palette
(near-black purple #0e0b12 to #1a1520 background, warm amber lantern light
#c9a24a as the dominant highlight). Wide scene, no characters, no desk or
furniture in the foreground.
The back wall of a small back-room inside the same night market shop, a
single lantern light, sacks of goods stacked in the shadows toward the
back of the frame, leaving the lower-middle area open and empty so a
character and a desk can be composited in front of it later.
```

### `appraisal-desk-front.png` — 査定シーンの手前に重ねる帳場机
背景は切り抜き用グリーンバック(`#00ff00`)。机の天板から上は透過にする。
```
Pixel art, no anti-aliasing, crisp pixel edges. Wide horizontal foreground
strip, on a flat solid chroma-key green background (#00ff00) above the
desk surface — easy to cut out and overlay in front of a character.
A close-up view of a cluttered wooden ledger desk top and its front edge
panel, seen from across the desk, a scale, a ledger book, and a few coins
resting on the surface, warm amber highlight #c9a24a.
```

---

## 2. キャラクター(`public/assets/characters/`、320×320目安、バストアップ)

背景は切り抜き用グリーンバック(`#00ff00`)。キャラ本体の配色(服・肌・小物)は
暗めでよい — グリーンとは別の色なので問題なく切り抜ける。

### `c1-daron.png` — ダロン
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
three-quarter view, on a flat solid chroma-key green background
(#00ff00), no gradients, no texture — easy to cut out. Warm amber
highlight #c9a24a for any light source on the character.
A weathered mercenary-looking man in his 30s, scarred hands, wearing cheap
but well-maintained leather armor, an old burn scar on his left wrist,
tired but honest eyes, short rough hair.
```

### `c2-ilea.png` — イレア
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
three-quarter view, on a flat solid chroma-key green background
(#00ff00), no gradients, no texture — easy to cut out. Warm amber
highlight #c9a24a for any light source on the character.
A nervous woman in her late 20s, modest clothing paired with one
unusually expensive ring, avoiding eye contact, faint dark circles under
her eyes, tense posture.
```

### `c3-noah.png` — ノア
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
three-quarter view, on a flat solid chroma-key green background
(#00ff00), no gradients, no texture — easy to cut out. Warm amber
highlight #c9a24a for any light source on the character.
A young man in his early 20s wearing plain clothes with a hint of a
guard's uniform collar visible underneath, glancing sideways nervously,
short practical haircut.
```

### `c1-buyer-georg.png` — ゲオルグ(片手剣の買い手)
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
three-quarter view, on a flat solid chroma-key green background
(#00ff00), no gradients, no texture — easy to cut out. Warm amber
highlight #c9a24a for any light source on the character.
A calm middle-aged merchant wearing a worn traveling coat, relaxed and
familiar demeanor, faint smile, the look of a market regular.
```

### `c2-buyer-hooded.png` — フード姿の男(護符の買い手)
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
three-quarter view, on a flat solid chroma-key green background
(#00ff00), no gradients, no texture — easy to cut out. Warm amber
highlight #c9a24a for any light source on the character.
A man with his face mostly hidden under a deep hood, only the lower jaw
and a sliver of his eyes visible, cautious posture, glancing to the side.
```

### `c3-buyer-blacksmith.png` — 若い鍛冶屋見習い(短剣の買い手)
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
three-quarter view, on a flat solid chroma-key green background
(#00ff00), no gradients, no texture — easy to cut out. Warm amber
highlight #c9a24a for any light source on the character.
A young blacksmith's apprentice, soot-smudged cheeks, calloused hands,
simple leather apron straps visible at the shoulders, earnest awkward
expression.
```

### `d2-c1-old-man.png` — 気弱な老人
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
three-quarter view, on a flat solid chroma-key green background
(#00ff00), no gradients, no texture — easy to cut out. Warm amber
highlight #c9a24a for any light source on the character.
A frail elderly man with a hunched back, patched worn clothing, a
trembling hand near a cane, gentle timid expression, thinning white hair.
```

### `d2-c2-peddler.png` — 図々しい行商人
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
three-quarter view, on a flat solid chroma-key green background
(#00ff00), no gradients, no texture — easy to cut out. Warm amber
highlight #c9a24a for any light source on the character.
A stout jovial traveling peddler, wide confident grin, sharp calculating
eyes, colorful but slightly gaudy clothing, a large pack strap over one
shoulder.
```

### `d3-c2-knowitall.png` — 物知り顔の男
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
three-quarter view, on a flat solid chroma-key green background
(#00ff00), no gradients, no texture — easy to cut out. Warm amber
highlight #c9a24a for any light source on the character.
A smug middle-aged man with a self-satisfied smirk, one raised eyebrow,
gesturing as if sharing a secret, slightly disheveled traveling clothes.
```

### `d4-c1-regular.png` — 夜市の顔なじみ
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
three-quarter view, on a flat solid chroma-key green background
(#00ff00), no gradients, no texture — easy to cut out. Warm amber
highlight #c9a24a for any light source on the character.
A composed older market regular, calm knowing expression, weathered but
neat clothing, a small pipe resting near his lips, at ease in the shadows.
```

### `d4-c2-fortuneteller.png` — 占い師風の女
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
three-quarter view, on a flat solid chroma-key green background
(#00ff00), no gradients, no texture — easy to cut out. Warm amber
highlight #c9a24a for any light source on the character.
A woman in fortune-teller-like layered dark robes and a beaded headscarf,
downcast eyes, a faintly fearful expression, hands clasped near her chest.
```

### `d4-c2-buyer-quietman.png` — 静かな男(占いの札の買い手)
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
three-quarter view, on a flat solid chroma-key green background
(#00ff00), no gradients, no texture — easy to cut out. Warm amber
highlight #c9a24a for any light source on the character.
A stern expressionless man in dark plain clothing, unreadable calm gaze,
still posture, a faint shadow across half his face.
```

### `d5-c1-maren.png` — シスター・マレン
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
three-quarter view, on a flat solid chroma-key green background
(#00ff00), no gradients, no texture — easy to cut out. Warm amber
highlight #c9a24a for any light source on the character.
A young woman in modest clean church robes, a small holy symbol at her
collar, composed observant expression, quietly studying whatever she
looks at.
```

### `d5-c2-sickly-man.png` — 顔色の悪い男
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
three-quarter view, on a flat solid chroma-key green background
(#00ff00), no gradients, no texture — easy to cut out. Warm amber
highlight #c9a24a for any light source on the character.
A pale sickly-looking man, sunken eyes, nervously clutching a wrapped
bundle close to his chest, sweat visible on his brow.
```

### `d6-c1-viktor.png` — 元締めヴィクター
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
three-quarter view, on a flat solid chroma-key green background
(#00ff00), no gradients, no texture — easy to cut out. Warm amber
highlight #c9a24a for any light source on the character.
A weathered authoritative older man, sharp knowing eyes, an expensive but
understated dark coat, the quiet confidence of someone who has run this
market for decades, a faint old scar near one eyebrow.
```

### `d6-c2-pale-girl.png` — 青白い顔の少女
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
three-quarter view, on a flat solid chroma-key green background
(#00ff00), no gradients, no texture — easy to cut out. Warm amber
highlight #c9a24a for any light source on the character.
A pale trembling young girl, wide frightened eyes, clutching a small
handmade doll close to her chest, disheveled hair.
```

### `d7-c2-grieving-woman.png` — 思い詰めた様子の若い女
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
three-quarter view, on a flat solid chroma-key green background
(#00ff00), no gradients, no texture — easy to cut out. Warm amber
highlight #c9a24a for any light source on the character.
A young woman with red-rimmed eyes as if she has been crying, holding a
small wrapped bundle tightly, a resolute but sorrowful expression.
```

### `generic-old-man.png` — 汎用モブ・老年男性
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
front-facing, on a flat solid chroma-key green background (#00ff00), no
gradients, no texture — easy to cut out.
An ordinary elderly man, neutral calm expression, plain traveling
clothes, no distinctive features.
```

### `generic-old-woman.png` — 汎用モブ・老年女性
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
front-facing, on a flat solid chroma-key green background (#00ff00), no
gradients, no texture — easy to cut out.
An ordinary elderly woman, neutral calm expression, plain traveling
clothes, no distinctive features.
```

### `generic-adult-man.png` — 汎用モブ・中年男性
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
front-facing, on a flat solid chroma-key green background (#00ff00), no
gradients, no texture — easy to cut out.
An ordinary middle-aged man, neutral calm expression, plain traveling
clothes, no distinctive features.
```

### `generic-adult-woman.png` — 汎用モブ・中年女性
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
front-facing, on a flat solid chroma-key green background (#00ff00), no
gradients, no texture — easy to cut out.
An ordinary middle-aged woman, neutral calm expression, plain traveling
clothes, no distinctive features.
```

### `generic-young-man.png` — 汎用モブ・若年男性
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
front-facing, on a flat solid chroma-key green background (#00ff00), no
gradients, no texture — easy to cut out.
An ordinary young man, neutral calm expression, plain traveling clothes,
no distinctive features.
```

### `generic-young-woman.png` — 汎用モブ・若年女性
```
Pixel art, no anti-aliasing, crisp pixel edges. Bust-up portrait,
front-facing, on a flat solid chroma-key green background (#00ff00), no
gradients, no texture — easy to cut out.
An ordinary young woman, neutral calm expression, plain traveling
clothes, no distinctive features.
```

---

## 3. アイテムアイコン(`public/assets/items/`、64〜128px目安、正方形)

背景は切り抜き用グリーンバック(`#00ff00`)。

### `item-sword.png` — 片手剣(ダロン)
```
Pixel art, no anti-aliasing, crisp pixel edges. Icon centered on a flat
solid chroma-key green background (#00ff00), no gradients, no texture —
easy to cut out. Small readable silhouette, warm amber rim-light accent
#c9a24a.
A worn one-handed sword with a small emblem engraved on the crossguard,
simple leather-wrapped hilt.
```

### `item-amulet.png` — 小さな護符(イレア・魂入り)
```
Pixel art, no anti-aliasing, crisp pixel edges. Icon centered on a flat
solid chroma-key green background (#00ff00), no gradients, no texture —
easy to cut out. Small readable silhouette, warm amber rim-light accent
#c9a24a.
A small wooden amulet carved with faint symbols, something faintly glowing
pale blue-white embedded at its center.
```

### `item-dagger.png` — 短剣(ノア)
```
Pixel art, no anti-aliasing, crisp pixel edges. Icon centered on a flat
solid chroma-key green background (#00ff00), no gradients, no texture —
easy to cut out. Small readable silhouette, warm amber rim-light accent
#c9a24a.
A plain mass-produced dagger with a small stamped serial mark on the
hilt.
```

### `item-candlestick.png` — 古びた燭台
```
Pixel art, no anti-aliasing, crisp pixel edges. Icon centered on a flat
solid chroma-key green background (#00ff00), no gradients, no texture —
easy to cut out. Small readable silhouette, warm amber rim-light accent
#c9a24a.
An old brass candlestick with heavy wax drippings and a small
hand-repaired base.
```

### `item-fabric.png` — 見事な織物
```
Pixel art, no anti-aliasing, crisp pixel edges. Icon centered on a flat
solid chroma-key green background (#00ff00), no gradients, no texture —
easy to cut out. Small readable silhouette, warm amber rim-light accent
#c9a24a.
A folded bolt of colorful woven fabric, slightly uneven weave visible up
close.
```

### `item-fortune-cards.png` — 古い占いの札(魂入り)
```
Pixel art, no anti-aliasing, crisp pixel edges. Icon centered on a flat
solid chroma-key green background (#00ff00), no gradients, no texture —
easy to cut out. Small readable silhouette, warm amber rim-light accent
#c9a24a.
A small bundle of worn fortune-telling cards tied together, one card
subtly different in texture and faintly glowing pale blue-white.
```

### `item-portrait.png` — 古い写し絵(魂入り)
```
Pixel art, no anti-aliasing, crisp pixel edges. Icon centered on a flat
solid chroma-key green background (#00ff00), no gradients, no texture —
easy to cut out. Small readable silhouette, warm amber rim-light accent
#c9a24a.
A small framed portrait sketch of a person's face, a faint pale
blue-white glow around the eyes.
```

### `item-doll.png` — 小さな人形(魂入り)
```
Pixel art, no anti-aliasing, crisp pixel edges. Icon centered on a flat
solid chroma-key green background (#00ff00), no gradients, no texture —
easy to cut out. Small readable silhouette, warm amber rim-light accent
#c9a24a.
A small handmade cloth doll with stitched features, faintly glowing pale
blue-white eyes.
```

### `item-ring.png` — 遺品らしい指輪(魂入り)
```
Pixel art, no anti-aliasing, crisp pixel edges. Icon centered on a flat
solid chroma-key green background (#00ff00), no gradients, no texture —
easy to cut out. Small readable silhouette, warm amber rim-light accent
#c9a24a.
A small engraved ring with a faint pale blue-white glow from its inner
surface.
```

### `item-keepsake.png` — 戦友の魂が宿ったという形見(魂入り・ダロン最終日)
```
Pixel art, no anti-aliasing, crisp pixel edges. Icon centered on a flat
solid chroma-key green background (#00ff00), no gradients, no texture —
easy to cut out. Small readable silhouette, warm amber rim-light accent
#c9a24a.
A small worn military keepsake token engraved with a name, faintly
glowing pale blue-white.
```

### `soul-glow-overlay.png` — 魂入りアイテム共通の発光オーバーレイ
```
Pixel art, no anti-aliasing, crisp pixel edges, on a flat solid
chroma-key green background (#00ff00) — easy to cut out. A soft
semi-transparent-looking pale blue-white radial glow effect with a
slightly flickering uneven edge, designed to be layered on top of another
item icon to indicate a soul is bound inside it. No object itself, just
the glow effect.
```

### `item-generic-tool.png` — 汎用・道具類
```
Pixel art, no anti-aliasing, crisp pixel edges. Icon centered on a flat
solid chroma-key green background (#00ff00), no gradients, no texture —
easy to cut out. Small readable silhouette, warm amber rim-light accent
#c9a24a.
A simple generic hand tool, worn wooden handle, no distinctive markings.
```

### `item-generic-jewelry.png` — 汎用・装飾品類
```
Pixel art, no anti-aliasing, crisp pixel edges. Icon centered on a flat
solid chroma-key green background (#00ff00), no gradients, no texture —
easy to cut out. Small readable silhouette, warm amber rim-light accent
#c9a24a.
A simple generic piece of jewelry, small gem accent, no distinctive
markings.
```

### `item-generic-book.png` — 汎用・書籍・紙類
```
Pixel art, no anti-aliasing, crisp pixel edges. Icon centered on a flat
solid chroma-key green background (#00ff00), no gradients, no texture —
easy to cut out. Small readable silhouette, warm amber rim-light accent
#c9a24a.
A simple generic old book or bundle of tied papers, no distinctive
markings.
```

### `item-generic-household.png` — 汎用・日用品類
```
Pixel art, no anti-aliasing, crisp pixel edges. Icon centered on a flat
solid chroma-key green background (#00ff00), no gradients, no texture —
easy to cut out. Small readable silhouette, warm amber rim-light accent
#c9a24a.
A simple generic household item such as a cup or folded cloth, no
distinctive markings.
```

---

## 4. UIアイコン(`public/assets/icons/`、32〜48px目安、正方形)

背景は切り抜き用グリーンバック(`#00ff00`)。小さいサイズなので、なるべく単純な
シルエットにしてください。

### `icon-talk.png` — 「話す」見出し
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Warm amber accent #c9a24a matching a dark fantasy UI theme.
A simple speech bubble icon.
```

### `icon-inspect.png` — 「調べる」見出し・商品を詳しく調べる
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Warm amber accent #c9a24a matching a dark fantasy UI theme.
A simple magnifying glass icon.
```

### `icon-soul-detector.png` — 魂判別機を使う
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Warm amber accent #c9a24a matching a dark fantasy UI theme.
A small handheld dowsing-rod-like device icon with a tiny dial and
needle.
```

### `icon-resonance.png` — 共鳴(4日目以降の自動判定に添える印)
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Pale blue-white glow accent instead of amber.
A small glowing eye or rune symbol icon with a faint pale blue-white
glow.
```

### `icon-decide.png` — 「判断する」見出し
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Warm amber accent #c9a24a matching a dark fantasy UI theme.
A simple balance scale icon.
```

### `icon-buy.png` — 言い値で買う/売る
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Warm amber accent #c9a24a matching a dark fantasy UI theme.
A simple tied coin pouch icon.
```

### `icon-haggle.png` — 値切る/高く売れないか粘る
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Warm amber accent #c9a24a matching a dark fantasy UI theme.
A simple coin icon with a small pair of back-and-forth arrows beside it,
representing price negotiation.
```

### `icon-refuse.png` — 断る/やめておく
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Warm amber accent #c9a24a matching a dark fantasy UI theme.
A simple open hand held up in a stopping gesture icon.
```

### `icon-report.png` — 通報する
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Warm amber accent #c9a24a matching a dark fantasy UI theme.
A simple small bell icon.
```

### `icon-gold.png` — 所持金
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Warm amber accent #c9a24a matching a dark fantasy UI theme.
A single glinting gold coin icon.
```

### `icon-quota.png` — 上納金
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Warm amber accent #c9a24a matching a dark fantasy UI theme.
A heavy tied money sack icon with a small coin symbol embossed on it.
```

### `icon-inventory.png` — 在庫
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Warm amber accent #c9a24a matching a dark fantasy UI theme.
A small cloth merchant satchel icon.
```

### `icon-reference.png` — 「資料」パネル見出し
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Warm amber accent #c9a24a matching a dark fantasy UI theme.
A small closed book icon.
```

### `icon-notes.png` — 「まとめた情報」パネル見出し
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Warm amber accent #c9a24a matching a dark fantasy UI theme.
A small rolled parchment note icon, tied with a thin cord.
```

### `icon-inspection.png` — 「見た情報」パネル見出し
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Warm amber accent #c9a24a matching a dark fantasy UI theme.
A small stylized single eye icon.
```

### 月相アイコン(1〜7日目、`icon-moon-phase-1.png`〜`icon-moon-phase-7.png`)

### `icon-moon-phase-1.png` — 1日目
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Pale silver-white moon.
A thin new moon crescent icon, mostly dark with only a sliver lit.
```

### `icon-moon-phase-2.png` — 2日目
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Pale silver-white moon.
A waxing crescent moon icon, about a quarter lit.
```

### `icon-moon-phase-3.png` — 3日目
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Pale silver-white moon.
A first quarter moon icon, exactly half lit.
```

### `icon-moon-phase-4.png` — 4日目
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Pale silver-white moon.
A waxing gibbous moon icon, about three-quarters lit.
```

### `icon-moon-phase-5.png` — 5日目
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Pale silver-white moon.
An almost full moon icon, nearly fully lit with a thin dark sliver
remaining.
```

### `icon-moon-phase-6.png` — 6日目
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Pale silver-white moon.
A fully lit full moon icon, bright and round.
```

### `icon-moon-phase-7.png` — 7日目(最終日)
```
Pixel art, no anti-aliasing, crisp pixel edges, small and highly readable
at 32px, on a flat solid chroma-key green background (#00ff00) — easy to
cut out. Pale silver-white moon.
A full moon icon with a faint additional glowing halo ring around it,
marking the final climactic day.
```

---

## 5. 枠・装飾(`public/assets/frames/`、あれば良い・優先度中)

背景・枠の内側もグリーンバック(`#00ff00`)にしてください。外周も内側の「穴」の
部分も同じ緑にしておけば、切り抜いたときにどちらも透過になります。

### `button-frame.png` — ボタン枠(9-slice用)
```
Pixel art, no anti-aliasing, crisp pixel edges, decorative UI frame
element designed for 9-slice scaling with distinct corner, edge, and
center regions. The frame's border uses warm amber #c9a24a and dark
purple #3a2f40 tones; the background and the frame's inner hole are both
a flat solid chroma-key green (#00ff00) — easy to cut out.
A simple ornate rectangular button border frame with subtle corner
flourishes.
```

### `panel-frame.png` — パネル枠(9-slice用)
```
Pixel art, no anti-aliasing, crisp pixel edges, decorative UI frame
element designed for 9-slice scaling with distinct corner, edge, and
center regions. The frame's border uses warm amber #c9a24a and dark
purple #3a2f40 tones; the background and the frame's inner hole are both
a flat solid chroma-key green (#00ff00) — easy to cut out.
A larger ornate rectangular panel border frame with subtle corner
flourishes, slightly more decorative than a simple button frame.
```

### `speech-bubble-frame.png` — 会話吹き出しの枠(9-slice用)
```
Pixel art, no anti-aliasing, crisp pixel edges, decorative UI frame
element designed for 9-slice scaling. The frame's border uses warm amber
#c9a24a and dark purple #3a2f40 tones; the background and the frame's
inner hole are both a flat solid chroma-key green (#00ff00) — easy to
cut out.
A rectangular speech bubble frame with a small pointed tail at the top
center, thin ornate border.
```

### `title-logo.png` — タイトルロゴ
```
Pixel art, no anti-aliasing, crisp pixel edges, warm amber #c9a24a glow
lettering, on a flat solid chroma-key green background (#00ff00) — easy
to cut out.
Decorative pixel art lettering treatment reading "夜市" in bold
dark-fantasy stylized Japanese characters, with a subtle lantern-light
glow and a thin ornamental border flourish around the characters.
```

---

## 6. イベント一枚絵(`public/assets/events/`、320×180目安、完全に後回しでよい)

切り抜き不要(そのまま使う一枚絵)。暗い夜市の色調のまま。

### `event-robbery.png` — 3日目、強盗イベント
```
Pixel art, no anti-aliasing, crisp pixel edges, limited dark color
palette (near-black purple #0e0b12 background, warm amber highlight
#c9a24a), wide cinematic scene.
A dim shop interior at night, an overturned money box, a shadowy
intruder's silhouette slipping out through a doorway, papers scattered
on the floor.
```

### `event-detector-confiscated.png` — 判別機没収シーン
```
Pixel art, no anti-aliasing, crisp pixel edges, limited dark color
palette (near-black purple #0e0b12 background, warm amber highlight
#c9a24a), wide cinematic scene.
A stern older man's silhouette holding a small dowsing device, taking it
away from a shop counter, a solemn quiet mood.
```

### `ending-church.png` — 教会寄りエンディング
```
Pixel art, no anti-aliasing, crisp pixel edges, limited dark color
palette (near-black purple #0e0b12 background, warm amber highlight
#c9a24a), wide cinematic scene.
A quiet church interior corner lit by warm candlelight, a merchant's
silhouette standing respectfully near a robed figure.
```

### `ending-market.png` — 夜市寄りエンディング
```
Pixel art, no anti-aliasing, crisp pixel edges, limited dark color
palette (near-black purple #0e0b12 background, warm amber highlight
#c9a24a), wide cinematic scene.
The night market at its busiest, a merchant's silhouette shaking hands
with an older authoritative figure under lantern light.
```

### `ending-wealthy.png` — 大金持ちエンディング
```
Pixel art, no anti-aliasing, crisp pixel edges, limited dark color
palette (near-black purple #0e0b12 background, warm amber highlight
#c9a24a), wide cinematic scene.
A small shop counter piled high with coins and goods, a merchant's
silhouette counting money by lantern light, a slightly isolated mood.
```

### `ending-neutral.png` — 中立エンディング
```
Pixel art, no anti-aliasing, crisp pixel edges, limited dark color
palette (near-black purple #0e0b12 background, warm amber highlight
#c9a24a), wide cinematic scene.
A quiet empty night market street at dawn, a single merchant's
silhouette walking alone, calm and undramatic.
```

---

## 優先度まとめ

1. **必須**: 背景3枚、主要キャラ17体、個別アイテム10枚+魂の発光演出1枚、
   UIアイコン(行動9種+資源・進行3種+月相7種+パネル見出し3種=22種)
2. **あれば良い**: 汎用モブ6体、汎用アイテム4枚、枠・装飾4枚
3. **後回しでよい**: イベント一枚絵6枚

## 進め方

量が多いので、届いたものから順に`public/assets/`配下の対応フォルダに置いてください。
ファイルが増えてきたタイミングで、CSSに`image-rendering: pixelated`を追加し、
各コンポーネントを「画像があれば表示、なければ今のプレースホルダー」という形に
切り替えます。
