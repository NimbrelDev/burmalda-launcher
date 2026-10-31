#!/usr/bin/env python3
"""Render a quick visual preview of a 64x64 skin: flat front layout + iso head cube."""
import sys
from PIL import Image

S = 8  # scale for flat view


def crop(img, x, y, w, h):
    return img.crop((x, y, x + w, y + h))


def flat_preview(skin_path, out_path):
    img = Image.open(skin_path).convert("RGBA")
    W = (4 + 8 + 4) * S
    H = (8 + 12 + 12) * S
    canvas = Image.new("RGBA", (W + 2 * S, H + 2 * S), (10, 14, 23, 255))

    def paste(part, dx, dy):
        part = part.resize((part.width * S, part.height * S), Image.NEAREST)
        canvas.alpha_composite(part, (dx * S + S, dy * S + S))

    paste(crop(img, 8, 8, 8, 8), 4, 0)      # head front
    paste(crop(img, 44, 20, 4, 12), 0, 8)   # right arm front
    paste(crop(img, 20, 20, 8, 12), 4, 8)   # body front
    paste(crop(img, 36, 52, 4, 12), 12, 8)  # left arm front
    paste(crop(img, 4, 20, 4, 12), 4, 20)   # right leg front
    paste(crop(img, 20, 52, 4, 12), 8, 20)  # left leg front
    canvas.save(out_path)
    print("saved", out_path)


def blit_face(canvas, face, mapping, s, ox, oy):
    """Draw a texture face as a parallelogram. mapping(u,v)->(x,y) in cube px."""
    px = canvas.load()
    w, h = face.size
    fp = face.load()
    for u in range(w):
        for v in range(h):
            r, g, b, a = fp[u, v]
            if a < 40:
                continue
            x, y = mapping(u, v)
            for dy in range(s):
                for dx in range(s):
                    X, Y = ox + x * s + dx, oy + y * s + dy
                    if 0 <= X < canvas.width and 0 <= Y < canvas.height:
                        px[X, Y] = (r, g, b, 255)


def iso_head(skin_path, out_path):
    img = Image.open(skin_path).convert("RGBA")
    s = 8
    cube = 16 * s          # screen units: cube width = 16 texel-units
    canvas = Image.new("RGBA", (cube * 2, cube * 2), (10, 14, 23, 255))
    # cube corners (in texel units, s applied later):
    # T=(0,0) R=(8,4) F=(0,8) L=(-8,4); faces hang down 8
    top = crop(img, 8, 0, 8, 8)      # head top
    front = crop(img, 8, 8, 8, 8)    # head front
    side = crop(img, 16, 8, 8, 8)    # head left (visible on the right in iso)
    hat_top = crop(img, 40, 0, 8, 8)
    hat_front = crop(img, 40, 8, 8, 8)
    hat_side = crop(img, 48, 8, 8, 8)

    m_top = lambda u, v: (u - v, (u + v) * 0.5)
    m_front = lambda u, v: (-8 + u, 4 + u * 0.5 + v)
    m_side = lambda u, v: (u, 8 - u * 0.5 + v)

    ox, oy = cube, 40
    for face, m in ((hat_top, m_top), (hat_front, m_front), (hat_side, m_side),
                    (top, m_top), (front, m_front), (side, m_side)):
        blit_face(canvas, face, m, s, ox, oy)
    canvas.save(out_path)
    print("saved", out_path)


if __name__ == "__main__":
    skin = sys.argv[1] if len(sys.argv) > 1 else "src/assets/default_skins/burmalda.png"
    base = skin.rsplit(".", 1)[0].split("/")[-1]
    flat_preview(skin, f"/tmp/preview-{base}-flat.png")
    iso_head(skin, f"/tmp/preview-{base}-iso.png")
