#!/usr/bin/env python3
"""Worked example: the HUD heart, full and empty (`ui_heart_full`, `ui_heart_empty`).

Read this before authoring your first asset. It is short on purpose and shows the whole
shape of an asset script: build the silhouette, shade it with hatching or dithering,
carve the outline last, print the preview, save. Every asset script in this project
should be recognisable as a variation of this one.

    python3 example_heart.py --out /tmp/preview
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pixelpng import Canvas  # noqa: E402

SIZE = 32  # HUD icon, per `art-grid-and-scale.md`


def heart_silhouette(tone: str) -> Canvas:
    """Two lobes and a point, drawn directly on the 32 px grid.

    The shape is generated rather than hand-typed as ASCII because a heart is symmetric
    and round: a formula keeps both lobes identical, which a hand-typed grid rarely does.
    Irregular organic shapes (Muri, the thieves) are the opposite case — author those as
    ASCII so the silhouette is visible in the source.
    """
    canvas = Canvas(SIZE, SIZE)
    for y in range(SIZE):
        for x in range(SIZE):
            in_lobe = any(
                (x - cx) ** 2 + (y - cy) ** 2 <= 7 * 7 for cx, cy in ((10, 12), (21, 12))
            )
            in_point = False
            if 13 <= y <= 28:
                t = (y - 13) / 15
                if 3 + t * 12 <= x <= 28 - t * 12:
                    in_point = True
            if in_lobe or in_point:
                canvas.px(x, y, tone)
    return canvas


def build_full() -> Canvas:
    # Light body so the heart reads as "filled" against the dark foreground layer.
    canvas = heart_silhouette("zinc-100")
    # Shadow lives on the lower right, as woodcut hatching — never a gradient.
    canvas.hatch(16, 14, 16, 16, "zinc-500", spacing=3)
    canvas.outline("zinc-950")
    return canvas


def build_empty() -> Canvas:
    # Same silhouette, paper-toned body, no shading: the contrast between the two states
    # is carried by tone, not by opacity.
    canvas = heart_silhouette("zinc-50")
    canvas.outline("zinc-950")
    return canvas


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=Path("src/assets/sprites"))
    args = parser.parse_args()

    for name, canvas in (("ui_heart_full", build_full()), ("ui_heart_empty", build_empty())):
        path = canvas.save(args.out / f"{name}.png")
        print(f"{name}  tones={canvas.tones()}")
        print(canvas.preview())
        print(f"saved {path}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
