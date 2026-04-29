"""Strip white background from Denaro character PNGs.

Flood-fills white from each corner so only the *outer* background becomes
transparent — interior white pixels (Denaro's body, hologram glow) stay opaque.
Edges are softened by blurring the alpha channel slightly.
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SRC_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "pic")

# (input filename, output filename)
FILES = [
    ("main character.png",                   "denaro.png"),
    ("main character AWTH.png",              "denaro-login.png"),
    ("main character AWTH verification.png", "denaro-verify.png"),
    ("main character forgetpassword.png",    "denaro-recover.png"),
]

FLOOD_THRESH = 22  # how aggressive the white detection is


def strip(in_path: str, out_path: str) -> None:
    src_rgba = Image.open(in_path).convert("RGBA")
    rgb = src_rgba.convert("RGB").copy()
    w, h = rgb.size

    sentinel = (1, 254, 1)  # an RGB combo that won't naturally appear
    for corner in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        ImageDraw.floodfill(rgb, corner, sentinel, thresh=FLOOD_THRESH)

    work_arr = np.array(rgb)
    is_bg = (
        (work_arr[..., 0] == sentinel[0])
        & (work_arr[..., 1] == sentinel[1])
        & (work_arr[..., 2] == sentinel[2])
    )

    # Build alpha mask, then blur slightly for soft anti-aliased edges.
    alpha = np.where(is_bg, 0, 255).astype(np.uint8)
    alpha_img = Image.fromarray(alpha, mode="L").filter(ImageFilter.GaussianBlur(0.6))

    out = src_rgba.copy()
    out.putalpha(alpha_img)
    out.save(out_path, "PNG", optimize=True)
    kb = os.path.getsize(out_path) // 1024
    print(f"  {os.path.basename(in_path)}  ->  {os.path.basename(out_path)}  ({kb} KB)")


def main() -> None:
    print("Stripping white backgrounds...")
    for src, dst in FILES:
        in_path = os.path.join(SRC_DIR, src)
        out_path = os.path.join(SRC_DIR, dst)
        if not os.path.exists(in_path):
            print(f"  skip (missing): {src}")
            continue
        strip(in_path, out_path)
    print("Done.")


if __name__ == "__main__":
    main()
