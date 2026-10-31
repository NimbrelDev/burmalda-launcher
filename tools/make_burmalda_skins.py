#!/usr/bin/env python3
"""Generate original Burmalda Launcher skins (64x64, classic model).

Palette follows the launcher: deep navy blue + orange accents.
Layout: modern 64x64 skin format with left-limb and overlay regions.
"""
import random
from PIL import Image

OUT_DIR = "src/assets/default_skins"

# ---------- palette ----------
SKIN   = (234, 176, 142)
SKIN_D = (214, 154, 118)
SKIN_DD= (192, 131, 99)
HAIR   = (32, 35, 46)
HAIR_D = (24, 26, 35)
HAIR_L = (43, 47, 61)
EYE_W  = (244, 246, 250)
EYE_B  = (59, 130, 246)   # launcher blue
MOUTH  = (176, 113, 79)

NAVY   = (31, 42, 68)     # hoodie base
NAVY_D = (24, 32, 51)
NAVY_DD= (18, 24, 40)
NAVY_L = (42, 56, 96)
ORANGE = (249, 115, 22)
ORANGE_D = (201, 87, 12)
ORANGE_L = (251, 146, 60)

PANTS  = (43, 48, 64)
PANTS_D= (34, 38, 52)
SHOE   = (216, 220, 230)
SHOE_D = (26, 29, 38)

# ember variant
EMBER   = (234, 106, 18)
EMBER_D = (193, 85, 10)
EMBER_L = (251, 146, 60)
EMBER_HAIR = (181, 92, 46)
EMBER_HAIR_D = (143, 70, 34)
EMBER_HAIR_L = (206, 113, 62)


def shade(c, k):
    return (max(0, min(255, int(c[0] * k))),
            max(0, min(255, int(c[1] * k))),
            max(0, min(255, int(c[2] * k))))


def fill_face(px, rect, color, rng, kind="side"):
    """Fill a face rect with base color + subtle per-column noise + edge shading."""
    x0, y0, w, h = rect
    col_noise = [rng.uniform(-0.035, 0.035) for _ in range(w)]
    for j in range(h):
        for i in range(w):
            k = 1.0 + col_noise[i]
            if kind == "top":
                k *= 1.10
            elif kind == "bottom":
                k *= 0.62
            elif kind == "back":
                k *= 0.88
            elif kind == "left" or kind == "right":
                k *= 0.95
            if j == h - 1 and kind not in ("top", "bottom"):
                k *= 0.9          # soft bottom edge
            px[x0 + i, y0 + j] = shade(color, k)


def head(px, rng, hair=HAIR, hair_d=HAIR_D, hair_l=HAIR_L):
    # face rects: right, front, left, back (y=8), top (8,0), bottom (16,0)
    fill_face(px, (0, 8, 8, 8), SKIN, rng)                 # right side of head
    fill_face(px, (8, 8, 8, 8), SKIN, rng, "front")        # front
    fill_face(px, (16, 8, 8, 8), SKIN, rng)                # left side
    fill_face(px, (24, 8, 8, 8), hair, rng, "back")        # back = hair
    fill_face(px, (8, 0, 8, 8), hair, rng, "top")
    fill_face(px, (16, 0, 8, 8), SKIN_DD, rng, "bottom")

    # --- front face details (abs coords) ---
    F = lambda x, y: (8 + x, 8 + y)
    # hair fringe
    for x in range(8):
        px[F(x, 0)] = shade(hair, 1.0 + rng.uniform(-0.04, 0.04))
    fringe = [1] * 8   # full fringe row
    for x in range(8):
        if fringe[x]:
            px[F(x, 1)] = shade(hair, 0.96 + rng.uniform(-0.04, 0.04))
        else:
            px[F(x, 1)] = shade(SKIN, 1.0)
    # sideburns
    px[F(0, 2)] = hair
    px[F(0, 3)] = hair
    px[F(7, 2)] = shade(hair, 0.9)
    # eyebrows
    px[F(1, 2)] = hair_d
    px[F(2, 2)] = hair_d
    px[F(5, 2)] = hair_d
    px[F(6, 2)] = hair_d
    # eyes on row 4
    px[F(1, 4)] = EYE_W
    px[F(2, 4)] = EYE_B
    px[F(5, 4)] = EYE_B
    px[F(6, 4)] = EYE_W
    # eye top shading
    px[F(1, 3)] = shade(SKIN, 0.93)
    px[F(2, 3)] = shade(SKIN, 0.93)
    px[F(5, 3)] = shade(SKIN, 0.93)
    px[F(6, 3)] = shade(SKIN, 0.93)
    # nose shadow
    px[F(3, 5)] = SKIN_D
    px[F(4, 5)] = SKIN_D
    # mouth
    px[F(3, 6)] = MOUTH
    px[F(4, 6)] = MOUTH
    # jaw shading
    for x in range(8):
        px[F(x, 7)] = shade(SKIN, 0.94)
    px[F(0, 5)] = SKIN_D
    px[F(0, 6)] = SKIN_D
    px[F(7, 5)] = SKIN_D
    px[F(7, 6)] = SKIN_D

    # --- side heads: hair on top 3 rows ---
    for rect in ((0, 8, 8, 8), (16, 8, 8, 8)):
        x0, y0, _, _ = rect
        for x in range(8):
            for y in range(3):
                px[x0 + x, y0 + y] = shade(hair, 0.92 + rng.uniform(-0.04, 0.04))
        # ear
        px[x0 + 3, y0 + 4] = SKIN_D
        px[x0 + 4, y0 + 4] = SKIN_D

    # --- back head: hair with streaks ---
    for x in range(8):
        for y in range(8):
            c = hair
            if x % 3 == 1:
                c = hair_l
            px[24 + x, 8 + y] = shade(c, 0.9 + rng.uniform(-0.03, 0.03))

    # --- hair top streaks ---
    for x in range(8):
        for y in range(8):
            c = hair
            if (x + y) % 4 == 0:
                c = hair_l
            px[8 + x, 0 + y] = shade(c, 1.05 + rng.uniform(-0.03, 0.03))

    # --- hat (overlay) layer: hair volume ---
    # 64x64 hat layout: top (40,0) bottom (48,0) right (32,8) front (40,8) left (48,8) back (56,8)
    O = lambda x, y: (32 + x, 0 + y)
    # clear the whole hat block first
    for x in range(32, 64):
        for y in range(16):
            px[x, y] = (0, 0, 0, 0)
    # hair shell: top rows all around + full back + full top
    for x in range(8):
        for y in range(8):
            px[32 + 8 + x, y] = shade(hair_d, 1.05 + rng.uniform(-0.03, 0.03))   # overlay top
    for rx, kind in ((32, "r"), (40, "f"), (48, "l"), (56, "b")):
        for x in range(8):
            for y in range(3):
                if kind == "f" and y == 2:
                    continue   # let the fringe breathe on the face
                px[rx + x, 8 + y] = shade(hair_d, 0.95 + rng.uniform(-0.03, 0.03))
    for x in range(8):
        for y in range(8):
            px[56 + x, 8 + y] = shade(hair_d, 0.85 + rng.uniform(-0.03, 0.03))   # full back hair


def body(px, rng, base=NAVY, dark=NAVY_D, darker=NAVY_DD, light=NAVY_L,
         accent=ORANGE, accent_d=ORANGE_D, pants=PANTS, shoe=SHOE, logo=True):
    # body: right(16,20) front(20,20) left(28,20) back(32,20) 8x12; top(20,16) bottom(28,16)
    fill_face(px, (16, 20, 8, 12), dark, rng)
    fill_face(px, (20, 20, 8, 12), base, rng, "front")
    fill_face(px, (28, 20, 8, 12), dark, rng)
    fill_face(px, (32, 20, 8, 12), dark, rng, "back")
    fill_face(px, (20, 16, 8, 4), darker, rng, "top")
    fill_face(px, (28, 16, 8, 4), darker, rng, "bottom")

    B = lambda x, y: (20 + x, 20 + y)
    # collar (hoodie V)
    for x in range(8):
        px[B(x, 0)] = shade(darker, 1.0 + rng.uniform(-0.03, 0.03))
    px[B(2, 1)] = shade(darker, 0.95)
    px[B(5, 1)] = shade(darker, 0.95)
    px[B(3, 1)] = shade(base, 1.08)
    px[B(4, 1)] = shade(base, 1.08)
    # chest diamond logo (launcher mark), 4x4 centered
    if logo:
        for dx in (3, 4):
            px[B(dx, 3)] = shade(accent, 1.12)
        for dx in (2, 3, 4, 5):
            px[B(dx, 4)] = accent
            px[B(dx, 5)] = shade(accent, 0.94)
        for dx in (3, 4):
            px[B(dx, 6)] = shade(accent_d, 1.0)
        px[B(3, 4)] = shade(accent, 1.06)
        px[B(4, 5)] = shade(accent_d, 0.9)
    # hem
    for x in range(8):
        px[B(x, 11)] = shade(dark, 0.92)
    # hood on the back
    K = lambda x, y: (32 + x, 20 + y)
    hood = [
        (2, 1), (3, 1), (4, 1), (5, 1),
        (1, 2), (2, 2), (3, 2), (4, 2), (5, 2), (6, 2),
        (1, 3), (2, 3), (3, 3), (4, 3), (5, 3), (6, 3),
        (2, 4), (3, 4), (4, 4), (5, 4),
        (2, 5), (3, 5), (4, 5), (5, 5),
        (3, 6), (4, 6),
    ]
    for (hx, hy) in hood:
        px[K(hx, hy)] = shade(darker, 0.95 + rng.uniform(-0.03, 0.03))

    # ---- arms (4x12): right at (40..56, 16..32) ----
    def arm(x_face, y_face, top, flip=False):
        # faces: right, front, left, back each 4x12
        fill_face(px, (x_face - 4, y_face, 4, 12), base, rng)
        fill_face(px, (x_face, y_face, 4, 12), base, rng, "front")
        fill_face(px, (x_face + 4, y_face, 4, 12), dark, rng)
        fill_face(px, (x_face + 8, y_face, 4, 12), dark, rng, "back")
        fill_face(px, (x_face, y_face - 4, 4, 4), dark, rng, "top")
        fill_face(px, (x_face + 4, y_face - 4, 4, 4), SKIN_DD, rng, "bottom")
        A = lambda x, y: (x_face + x, y_face + y)
        for x in range(4):
            for y in range(12):
                pass
        # hand
        for x in range(4):
            for y in (10, 11):
                px[A(x, y)] = shade(SKIN, 0.97 + rng.uniform(-0.03, 0.03))
        px[A(0, 11)] = SKIN_D
        # cuff
        for x in range(4):
            px[A(x, 9)] = shade(accent, 0.95 + rng.uniform(-0.04, 0.04))
        # shoulder seam
        for x in range(4):
            px[A(x, 0)] = shade(darker, 1.0)

    arm(44, 20, base)     # right arm
    arm(36, 52, base)     # left arm

    # ---- legs (4x12): right at (0..16, 16..32) ----
    def leg(x_face, y_face):
        fill_face(px, (x_face - 4, y_face, 4, 12), pants, rng)
        fill_face(px, (x_face, y_face, 4, 12), pants, rng, "front")
        fill_face(px, (x_face + 4, y_face, 4, 12), PANTS_D, rng)
        fill_face(px, (x_face + 8, y_face, 4, 12), PANTS_D, rng, "back")
        fill_face(px, (x_face, y_face - 4, 4, 4), PANTS_D, rng, "top")
        fill_face(px, (x_face + 4, y_face - 4, 4, 4), SHOE_D, rng, "bottom")
        L = lambda x, y: (x_face + x, y_face + y)
        # shoes
        for x in range(4):
            for y in (9, 10, 11):
                px[L(x, y)] = shade(shoe, 0.97 + rng.uniform(-0.03, 0.03))
        for x in range(4):
            px[L(x, 11)] = shade(SHOE_D, 1.0)      # sole
        px[L(0, 9)] = shade(shoe, 1.05)
        # knee crease
        for x in range(4):
            px[L(x, 5)] = shade(PANTS_D, 1.0)

    leg(4, 20)      # right leg
    leg(20, 52)     # left leg


def overlays(px, rng, base=NAVY, dark=NAVY_D, darker=NAVY_DD):
    # Clear all overlay regions first (they may carry garbage from defaults)
    regions = [
        (16, 32, 40, 48),   # body overlay block
        (0, 32, 16, 48),    # right leg overlay
        (40, 32, 56, 48),   # right arm overlay
        (0, 48, 16, 64),    # left leg overlay
        (48, 48, 64, 64),   # left arm overlay
    ]
    for (x0, y0, x1, y1) in regions:
        for x in range(x0, x1):
            for y in range(y0, y1):
                px[x, y] = (0, 0, 0, 0)

    # body overlay faces at y=36: right(16) front(20) left(28) back(32)
    B = lambda x, y: (20 + x, 36 + y)
    for x in range(8):
        px[B(x, 0)] = shade(darker, 1.0)
    px[B(0, 1)] = shade(darker, 0.98)
    px[B(7, 1)] = shade(darker, 0.98)
    # pocket lines
    px[B(1, 9)] = shade(dark, 0.9)
    px[B(2, 9)] = shade(dark, 0.9)
    px[B(5, 9)] = shade(dark, 0.9)
    px[B(6, 9)] = shade(dark, 0.9)
    # (arm/leg overlays stay transparent — clean silhouette)


def clear_all(img):
    empty = Image.new("RGBA", img.size, (0, 0, 0, 0))
    img.paste(empty, (0, 0))


def make_burmalda():
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    px = img.load()
    rng = random.Random(42)
    head(px, rng)
    body(px, rng)
    overlays(px, rng)
    img.save(f"{OUT_DIR}/burmalda.png")
    print("saved burmalda.png")


def make_ember():
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    px = img.load()
    rng = random.Random(7)
    head(px, rng, hair=EMBER_HAIR, hair_d=EMBER_HAIR_D, hair_l=EMBER_HAIR_L)
    body(px, rng,
         base=EMBER, dark=EMBER_D, darker=(150, 66, 8), light=EMBER_L,
         accent=NAVY, accent_d=NAVY_D,
         pants=PANTS, shoe=NAVY, logo=False)
    overlays(px, rng, base=EMBER, dark=EMBER_D, darker=(150, 66, 8))
    img.save(f"{OUT_DIR}/burmalda-ember.png")
    print("saved burmalda-ember.png")


if __name__ == "__main__":
    make_burmalda()
    make_ember()
