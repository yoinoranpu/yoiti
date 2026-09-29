"""raw_illustrations/ の .jfif 一式を、public/assets/ 配下へ振り分けて取り込む。

- 切り抜きが必要な素材(キャラ・アイテム・UIアイコン・枠・カウンター/机の前景帯)は
  グリーンバック(#00ff00)を透過に変換してから保存する。
- 背景シーン・イベント一枚絵はそのままPNGに変換して保存する(切り抜き不要)。

使い方:
    python scripts/import_illustrations.py
"""

from pathlib import Path

from PIL import Image

from remove_green_bg import remove_green_screen

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw_illustrations"
ASSETS = ROOT / "public" / "assets"

# (ファイル名(拡張子なし), 保存先フォルダ, 切り抜きが必要か)
FILES = [
    # backgrounds
    ("shop-room-back", "backgrounds", False),
    ("shop-counter-front", "backgrounds", True),
    ("appraisal-room-back", "backgrounds", False),
    ("appraisal-desk-front", "backgrounds", True),
    ("title-screen", "backgrounds", False),
    # characters
    ("c1-daron", "characters", True),
    ("c2-ilea", "characters", True),
    ("c3-noah", "characters", True),
    ("c1-buyer-georg", "characters", True),
    ("c2-buyer-hooded", "characters", True),
    ("c3-buyer-blacksmith", "characters", True),
    ("d2-c1-old-man", "characters", True),
    ("d2-c2-peddler", "characters", True),
    ("d3-c2-knowitall", "characters", True),
    ("d4-c1-regular", "characters", True),
    ("d4-c2-fortuneteller", "characters", True),
    ("d4-c2-buyer-quietman", "characters", True),
    ("d5-c1-maren", "characters", True),
    ("d5-c2-sickly-man", "characters", True),
    ("d6-c1-viktor", "characters", True),
    ("d6-c2-pale-girl", "characters", True),
    ("d7-c2-grieving-woman", "characters", True),
    ("generic-old-man", "characters", True),
    ("generic-old-woman", "characters", True),
    ("generic-adult-man", "characters", True),
    ("generic-adult-woman", "characters", True),
    ("generic-young-man", "characters", True),
    ("generic-young-woman", "characters", True),
    # items
    ("item-sword", "items", True),
    ("item-amulet", "items", True),
    ("item-dagger", "items", True),
    ("item-candlestick", "items", True),
    ("item-fabric", "items", True),
    ("item-fortune-cards", "items", True),
    ("item-portrait", "items", True),
    ("item-doll", "items", True),
    ("item-ring", "items", True),
    ("item-keepsake", "items", True),
    ("soul-glow-overlay", "items", True),
    ("item-generic-tool", "items", True),
    ("item-generic-jewelry", "items", True),
    ("item-generic-book", "items", True),
    ("item-generic-household", "items", True),
    # icons
    ("icon-talk", "icons", True),
    ("icon-inspect", "icons", True),
    ("icon-soul-detector", "icons", True),
    ("icon-resonance", "icons", True),
    ("icon-decide", "icons", True),
    ("icon-buy", "icons", True),
    ("icon-haggle", "icons", True),
    ("icon-refuse", "icons", True),
    ("icon-report", "icons", True),
    ("icon-gold", "icons", True),
    ("icon-quota", "icons", True),
    ("icon-inventory", "icons", True),
    ("icon-reference", "icons", True),
    ("icon-notes", "icons", True),
    ("icon-inspection", "icons", True),
    ("icon-moon-phase-1", "icons", True),
    ("icon-moon-phase-2", "icons", True),
    ("icon-moon-phase-3", "icons", True),
    ("icon-moon-phase-4", "icons", True),
    ("icon-moon-phase-5", "icons", True),
    ("icon-moon-phase-6", "icons", True),
    ("icon-moon-phase-7", "icons", True),
    # frames
    ("button-frame", "frames", True),
    ("panel-frame", "frames", True),
    ("speech-bubble-frame", "frames", True),
    ("title-logo", "frames", True),
    # events
    ("event-robbery", "events", False),
    ("event-detector-confiscated", "events", False),
    ("ending-church", "events", False),
    ("ending-market", "events", False),
    ("ending-wealthy", "events", False),
    ("ending-neutral", "events", False),
]


def main():
    done, missing = [], []
    for name, folder, cutout in FILES:
        src = RAW / f"{name}.jfif"
        if not src.exists():
            # 他の拡張子で来ている可能性もチェック
            alt = next((p for p in RAW.glob(f"{name}.*")), None)
            if alt is None:
                missing.append(name)
                continue
            src = alt

        img = Image.open(src)
        if cutout:
            img = remove_green_screen(img)
        else:
            img = img.convert("RGBA")

        out_dir = ASSETS / folder
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / f"{name}.png"
        img.save(out_path)
        done.append(str(out_path.relative_to(ROOT)))

    print(f"done: {len(done)}")
    for d in done:
        print("  ", d)
    if missing:
        print(f"missing: {len(missing)}")
        for m in missing:
            print("  ", m)


if __name__ == "__main__":
    main()
