"""Generate a multi-size ICO for susubuddy from scratch using Pillow.
Simple mochi-inspired rounded blob with cheeks + eyes + tiny mouth."""
from PIL import Image, ImageDraw
import os

SIZES = [16, 24, 32, 48, 64, 128, 256]
HERE = os.path.dirname(__file__)
OUT_ICO = os.path.join(HERE, 'icon.ico')
OUT_PNG = os.path.join(HERE, 'icon.png')          # 512 — electron-builder converts to .icns on mac
OUT_TRAY = os.path.join(HERE, 'trayIcon.png')     # 32 — macOS/Linux tray

def draw_mochi(size: int) -> Image.Image:
    # Render at 4x then downscale for smooth edges
    s = size * 4
    img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # body (rounded blob, slightly wider than tall) — lilac palette
    body_color = (226, 212, 240, 255)
    body_deep  = (191, 167, 216, 255)
    cheek      = (228, 166, 197, 220)
    eye        = (46, 36, 56, 255)
    mouth      = (90, 63, 94, 255)

    # drop shadow (soft ellipse below the body)
    shadow = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    ds = ImageDraw.Draw(shadow)
    ds.ellipse([s*0.18, s*0.85, s*0.82, s*0.95], fill=(150, 120, 190, 70))

    # body outline
    pad = s * 0.08
    bbox = [pad, pad + s*0.02, s - pad, s - pad - s*0.06]
    d.ellipse(bbox, fill=body_deep)
    # slightly smaller highlight body on top
    d.ellipse([bbox[0]+s*0.012, bbox[1]+s*0.012, bbox[2]-s*0.012, bbox[3]-s*0.012], fill=body_color)
    # highlight patch (upper-left)
    hl = [s*0.22, s*0.20, s*0.48, s*0.34]
    d.ellipse(hl, fill=(255, 255, 255, 90))

    # cheeks
    cy = s * 0.58
    d.ellipse([s*0.18, cy, s*0.32, cy + s*0.09], fill=cheek)
    d.ellipse([s*0.68, cy, s*0.82, cy + s*0.09], fill=cheek)

    # eyes
    ey = s * 0.48
    er_x = s * 0.055
    er_y = s * 0.075
    # left eye
    d.ellipse([s*0.36 - er_x, ey - er_y, s*0.36 + er_x, ey + er_y], fill=eye)
    # right eye
    d.ellipse([s*0.64 - er_x, ey - er_y, s*0.64 + er_x, ey + er_y], fill=eye)
    # eye shines
    sh_r = s * 0.02
    d.ellipse([s*0.37, ey - s*0.05, s*0.37 + sh_r*2, ey - s*0.05 + sh_r*2], fill=(255,255,255,255))
    d.ellipse([s*0.65, ey - s*0.05, s*0.65 + sh_r*2, ey - s*0.05 + sh_r*2], fill=(255,255,255,255))

    # mouth (tiny w)
    mx = s * 0.50
    my = s * 0.66
    mw = s * 0.05
    d.arc([mx - mw, my - mw*0.5, mx + mw, my + mw*0.5], start=0, end=180, fill=mouth, width=max(2, int(s*0.015)))

    # composite shadow under body
    out = Image.alpha_composite(shadow, img)
    out = out.resize((size, size), Image.LANCZOS)
    return out

# Render the largest size, let Pillow downsample to all listed sizes.
main = draw_mochi(256)
main.save(OUT_ICO, format='ICO', sizes=[(s, s) for s in SIZES])
print(f'wrote {OUT_ICO}')

# 512 PNG — electron-builder converts this to .icns for macOS app icon.
draw_mochi(512).save(OUT_PNG, format='PNG')
print(f'wrote {OUT_PNG}')

# 32 PNG — used directly for tray icon on non-Windows platforms.
draw_mochi(32).save(OUT_TRAY, format='PNG')
print(f'wrote {OUT_TRAY}')
