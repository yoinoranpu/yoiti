"""グリーンバック(#00ff00)のPNGを透過PNGに変換するスクリプト。

使い方:
    python scripts/remove_green_bg.py <入力フォルダ> <出力フォルダ>

入力フォルダ内の全PNGを処理し、緑背景を透過にして出力フォルダへ保存する。
輪郭のにじみ(緑のふちが残る現象)を抑えるスピル除去つき。
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image


def remove_green_screen(
    img: Image.Image,
    key=(0, 255, 0),
    tol_low: float = 60,
    tol_high: float = 120,
) -> Image.Image:
    img = img.convert("RGBA")
    arr = np.array(img).astype(np.float32)
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]

    kr, kg, kb = key
    dist = np.sqrt((r - kr) ** 2 + (g - kg) ** 2 + (b - kb) ** 2)

    # 緑チャンネルが赤・青より明確に強いピクセルだけを「緑背景っぽい」とみなす
    greenness = g - np.maximum(r, b)
    is_greenish = greenness > 20

    # キー色に近いほど透明、遠いほど不透明(境界はなだらかに)
    alpha_mult = np.clip((dist - tol_low) / (tol_high - tol_low), 0.0, 1.0)
    alpha_mult = np.where(is_greenish, alpha_mult, 1.0)
    new_a = a * alpha_mult

    # スピル除去: 半透明になった縁のピクセルから、残った緑成分を軽く引く
    spill = np.clip(greenness, 0, None)
    edge_factor = 1.0 - alpha_mult
    g_fixed = np.clip(g - spill * edge_factor * 0.9, 0, 255)

    out = np.stack([r, g_fixed, b, new_a], axis=-1)
    out = np.clip(out, 0, 255).astype(np.uint8)
    return Image.fromarray(out, mode="RGBA")


def process_folder(src: Path, dst: Path) -> int:
    dst.mkdir(parents=True, exist_ok=True)
    count = 0
    for f in sorted(src.glob("*.png")):
        img = Image.open(f)
        out = remove_green_screen(img)
        out.save(dst / f.name)
        count += 1
    return count


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python remove_green_bg.py <input_folder> <output_folder>")
        sys.exit(1)
    n = process_folder(Path(sys.argv[1]), Path(sys.argv[2]))
    print(f"Processed {n} files -> {sys.argv[2]}")
