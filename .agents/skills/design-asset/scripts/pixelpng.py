"""Cordel Arcade pixel canvas and dependency-free PNG writer.

Why this exists: the project has no image library installed (no Pillow, no numpy) and
pixel art for this game is small, indexed and highly constrained. Writing the PNG by
hand with `zlib` is ~40 lines and removes the whole dependency question, so every asset
is produced by a script that is reviewable in a diff.

Authoring model: you describe the sprite as an ASCII grid plus a legend. That keeps the
silhouette readable in the source file, which is the thing the style guide cares about
most, and makes a later tweak a one-character edit instead of a coordinate hunt.

    from pixelpng import Canvas, PALETTE

    ROWS = [
        "..###..",
        ".#ooo#.",
        "#ooOoo#",
    ]
    c = Canvas.from_ascii(ROWS, {"#": "ink", "o": "bone", "O": "sertao"})
    c.save("src/assets/sprites/muri_idle_01.png")

Alpha is strictly binary: a pixel is either fully opaque or fully transparent. The style
guide forbids transparency as a visual effect (`art-linework-and-texture.md`); the alpha
channel exists only to cut the sprite out of its bounding box.
"""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

# Cordel Arcade palette from `.agents/rules/art-palette-cordel.md`, lightest first. No
# other colour may appear in a game asset, so this table is the whole allowed vocabulary.
PALETTE: dict[str, tuple[int, int, int]] = {
    "bone": (0xF4, 0xEE, 0xDD),
    "dust": (0xD2, 0xC3, 0xAF),
    "clay": (0xB0, 0x98, 0x82),
    "sertao": (0x6B, 0x42, 0x26),
    "umber": (0x44, 0x2B, 0x1B),
    "ink": (0x1C, 0x14, 0x10),
}

RGB_TO_TONE: dict[tuple[int, int, int], str] = {v: k for k, v in PALETTE.items()}

TRANSPARENT = (0, 0, 0, 0)


def _rgba(tone: str | None) -> tuple[int, int, int, int]:
    if tone is None:
        return TRANSPARENT
    try:
        r, g, b = PALETTE[tone]
    except KeyError:
        raise ValueError(
            f"{tone!r} is not in the palette. Allowed: {', '.join(PALETTE)}"
        ) from None
    return (r, g, b, 255)


def darkness(tone: str) -> int:
    """Position in the palette, lightest first: `bone` -> 0, `ink` -> 5."""
    return list(PALETTE).index(tone)


class Canvas:
    """A fixed-size grid of binary-alpha palette pixels."""

    def __init__(self, width: int, height: int) -> None:
        if width <= 0 or height <= 0:
            raise ValueError("canvas must have positive dimensions")
        self.width = width
        self.height = height
        self.pixels: list[list[tuple[int, int, int, int]]] = [
            [TRANSPARENT] * width for _ in range(height)
        ]

    # ------------------------------------------------------------------ authoring

    @classmethod
    def from_ascii(cls, rows: list[str], legend: dict[str, str | None]) -> "Canvas":
        """Build a canvas from an ASCII grid.

        `legend` maps each character to a palette tone name, or to None for transparent.
        Every row must be the same length; a ragged grid is almost always a typo that
        would silently shift the silhouette, so it is rejected instead of padded.
        """
        if not rows:
            raise ValueError("ascii grid is empty")
        width = len(rows[0])
        for i, row in enumerate(rows):
            if len(row) != width:
                raise ValueError(
                    f"row {i} has {len(row)} chars, expected {width} — ragged grids "
                    "shift the silhouette; pad the row explicitly"
                )
        canvas = cls(width, len(rows))
        for y, row in enumerate(rows):
            for x, char in enumerate(row):
                if char not in legend:
                    raise ValueError(f"character {char!r} at ({x}, {y}) is not in the legend")
                canvas.pixels[y][x] = _rgba(legend[char])
        return canvas

    def px(self, x: int, y: int, tone: str | None) -> None:
        """Set one pixel. Out-of-bounds writes are ignored so drawing helpers can
        overshoot the edge without the caller clamping every coordinate."""
        if 0 <= x < self.width and 0 <= y < self.height:
            self.pixels[y][x] = _rgba(tone)

    def get(self, x: int, y: int) -> tuple[int, int, int, int]:
        if 0 <= x < self.width and 0 <= y < self.height:
            return self.pixels[y][x]
        return TRANSPARENT

    def rect(self, x: int, y: int, w: int, h: int, tone: str | None) -> None:
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.px(xx, yy, tone)

    def frame(self, x: int, y: int, w: int, h: int, tone: str | None) -> None:
        """Draw a 1 px rectangle border — the carve around tiles, cards and HUD icons."""
        for xx in range(x, x + w):
            self.px(xx, y, tone)
            self.px(xx, y + h - 1, tone)
        for yy in range(y, y + h):
            self.px(x, yy, tone)
            self.px(x + w - 1, yy, tone)

    def line(self, x0: int, y0: int, x1: int, y1: int, tone: str | None) -> None:
        """Bresenham line — the base of hatching."""
        dx, dy = abs(x1 - x0), -abs(y1 - y0)
        sx = 1 if x0 < x1 else -1
        sy = 1 if y0 < y1 else -1
        err = dx + dy
        while True:
            self.px(x0, y0, tone)
            if x0 == x1 and y0 == y1:
                return
            e2 = 2 * err
            if e2 >= dy:
                err += dy
                x0 += sx
            if e2 <= dx:
                err += dx
                y0 += sy

    def dither(
        self,
        x: int,
        y: int,
        w: int,
        h: int,
        tone_a: str,
        tone_b: str,
        density: int = 2,
        only_opaque: bool = True,
    ) -> None:
        """Checkerboard two tones to fake a half-tone.

        This is the only legal way to get a value between two palette tones: the style guide
        forbids gradients, so a mid tone is produced by alternating pixels instead of
        interpolating colour. `density=2` is the classic 50% checker; 3 and 4 give
        progressively sparser `tone_b`.

        With `only_opaque` (the default) the dither is clipped to pixels that are already
        painted, so you can shade an existing silhouette without spilling into the
        transparent background.
        """
        if density < 2:
            raise ValueError("density must be 2 or more")
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                if only_opaque and self.get(xx, yy)[3] == 0:
                    continue
                self.px(xx, yy, tone_b if (xx + yy) % density == 0 else tone_a)

    def hatch(
        self,
        x: int,
        y: int,
        w: int,
        h: int,
        tone: str,
        spacing: int = 3,
        cross: bool = False,
        only_opaque: bool = True,
    ) -> None:
        """Diagonal woodcut hatching over a region — the shading idiom of the game.

        Prefer this to `dither` when the shadow should read as engraved strokes rather
        than as a flat mid tone; both are legal, hatching is closer to the cordel
        reference and survives the fractional display upscale better.
        """
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                if only_opaque and self.get(xx, yy)[3] == 0:
                    continue
                if (xx + yy) % spacing == 0 or (cross and (xx - yy) % spacing == 0):
                    self.px(xx, yy, tone)

    def outline(self, tone: str = "ink") -> None:
        """Wrap the opaque silhouette in a 1 px outline, growing outwards.

        Mandatory on every playable sprite so it reads against any background. Because
        the outline grows outwards, the artwork must leave at least 1 px of transparent
        margin inside the canvas; touching the edge would clip the carve, which is the
        single most common way a sprite ends up half-outlined, so it is an error.
        """
        border: list[tuple[int, int]] = []
        for y in range(self.height):
            for x in range(self.width):
                if self.get(x, y)[3] == 0:
                    continue
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if not (0 <= nx < self.width and 0 <= ny < self.height):
                        raise ValueError(
                            f"opaque pixel at ({x}, {y}) touches the canvas edge; leave "
                            "a 1 px transparent margin so the outline is not clipped"
                        )
                    if self.get(nx, ny)[3] == 0:
                        border.append((nx, ny))
        for x, y in border:
            self.px(x, y, tone)

    def place(self, other: "Canvas", x: int, y: int) -> None:
        """Stamp another canvas on top, skipping its transparent pixels. Useful for
        reusing a body across frames and only redrawing the limb that moves."""
        for yy in range(other.height):
            for xx in range(other.width):
                pixel = other.pixels[yy][xx]
                if pixel[3] != 0:
                    tx, ty = x + xx, y + yy
                    if 0 <= tx < self.width and 0 <= ty < self.height:
                        self.pixels[ty][tx] = pixel

    def copy(self) -> "Canvas":
        clone = Canvas(self.width, self.height)
        clone.pixels = [row[:] for row in self.pixels]
        return clone

    def translated(self, dx: int, dy: int) -> "Canvas":
        """A copy shifted by (dx, dy) — how a breathing idle or a bob loop is made
        without redrawing the body."""
        clone = Canvas(self.width, self.height)
        for y in range(self.height):
            for x in range(self.width):
                pixel = self.pixels[y][x]
                if pixel[3] != 0:
                    tx, ty = x + dx, y + dy
                    if 0 <= tx < self.width and 0 <= ty < self.height:
                        clone.pixels[ty][tx] = pixel
        return clone

    def flipped(self) -> "Canvas":
        """Horizontal mirror. For previewing only — characters ship facing right and
        are mirrored at runtime (`art-asset-naming.md`); do not save the mirror."""
        clone = Canvas(self.width, self.height)
        clone.pixels = [row[::-1] for row in self.pixels]
        return clone

    # ------------------------------------------------------------------ inspection

    def tones(self) -> dict[str, int]:
        """Palette tone -> pixel count, for the opaque pixels only."""
        counts: dict[str, int] = {}
        for row in self.pixels:
            for r, g, b, a in row:
                if a == 0:
                    continue
                name = RGB_TO_TONE.get((r, g, b))
                key = name or f"OFF-PALETTE #{r:02X}{g:02X}{b:02X}"
                counts[key] = counts.get(key, 0) + 1
        return counts

    def preview(self) -> str:
        """Render as text so you can read the silhouette without opening the PNG.
        Darker tones print as heavier characters."""
        ramp = " .:-=+*#%@"
        out = []
        for row in self.pixels:
            line = []
            for r, g, b, a in row:
                if a == 0:
                    line.append(" ")
                else:
                    name = RGB_TO_TONE.get((r, g, b))
                    step = darkness(name) if name else len(PALETTE) - 1
                    idx = min(len(ramp) - 1, max(1, round(step / (len(PALETTE) - 1) * (len(ramp) - 1))))
                    line.append(ramp[idx])
            out.append("".join(line))
        return "\n".join(out)

    # ---------------------------------------------------------------------- output

    def to_png_bytes(self) -> bytes:
        raw = bytearray()
        for row in self.pixels:
            raw.append(0)  # filter type 0 (None) — tiny images, no gain from filtering
            for pixel in row:
                raw.extend(pixel)

        def chunk(kind: bytes, data: bytes) -> bytes:
            return (
                struct.pack(">I", len(data))
                + kind
                + data
                + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
            )

        ihdr = struct.pack(">IIBBBBB", self.width, self.height, 8, 6, 0, 0, 0)
        return (
            b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", ihdr)
            + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
            + chunk(b"IEND", b"")
        )

    def save(self, path: str | Path) -> Path:
        target = Path(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(self.to_png_bytes())
        return target


def save_frames(frames: list[Canvas], directory: str | Path, entity: str, action: str) -> list[Path]:
    """Save an animation as individual files named `<entity>_<action>_<frame>.png`.

    Frames are numbered from 01 with two digits, per `art-asset-naming.md`. Individual
    files (not a packed sheet) are what the naming rule asks for; the atlas is assembled
    later in the load step.
    """
    paths = []
    for index, frame in enumerate(frames, start=1):
        paths.append(frame.save(Path(directory) / f"{entity}_{action}_{index:02d}.png"))
    return paths
