"""Compositor: hero captures + scene frames -> camera moves, transitions, captions -> H.264.

python compose.py [--parts N] [--only a:b]   (seconds)  -> parts/*.mp4, then concat.
"""
import json, math, os, subprocess, sys
from multiprocessing import Pool
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, 'timeline.json')))
L = TL['lines']
SEC = {s['id']: s for s in TL['sections']}
FPS = 30
TOTAL = TL['total']
W, H = 1920, 1080
DSF = 1.5
SET_TO_LAND = 0.38 + 1.4 + 2.825 + 0.3
ROLL_TO_LAND = 2.825 + 0.22

clips = json.load(open(os.path.join(HERE, 'clips.json')))
def st(i): return L[i]['start']
def en(i): return L[i]['end']

# ---------- camera keyframes (global time, scale, cx, cy in 1920x1080 "wide" coords) ----------
WIDE = (1.0, 960, 540)
TIGHT = (1.5, 960, 600)
def drift(a, b, s0=1.5, s1=1.5): return [(a, s0, 960, 600), (b, s1, 960, 600)]

set1 = st('h7') + 0.2 - SET_TO_LAND
set4 = st('t2') + 3.75 - SET_TO_LAND
CAM = {
    'how': [(clips['how']['g0'], *WIDE), (set1 + 0.15, *WIDE), (set1 + 1.05, *TIGHT), (st('h11') - 0.2, 1.56, 960, 600),
            (st('h11') + 1.0, *WIDE), (set4 + 0.15, *WIDE), (set4 + 1.05, *TIGHT), (clips['how']['g1'], 1.5, 960, 600)],
    'muertos': drift(clips['muertos']['g0'], clips['muertos']['g1']),
    'ouija': drift(clips['ouija']['g0'], clips['ouija']['g1']),
    'tarot': [(clips['tarot']['g0'], *WIDE), (st('t7') + 1.65 - SET_TO_LAND + 0.15, *WIDE), (st('t7') + 1.65 - SET_TO_LAND + 1.05, *TIGHT), (clips['tarot']['g1'], 1.5, 960, 600)],
    'wheel': drift(clips['wheel']['g0'], clips['wheel']['g1']),
    'poker': drift(clips['poker']['g0'], clips['poker']['g1']),
}

def ease(k): return 4 * k ** 3 if k < 0.5 else 1 - (-2 * k + 2) ** 3 / 2

def camera(name, t):
    kf = CAM[name]
    if t <= kf[0][0]: return kf[0][1:]
    for a, b in zip(kf, kf[1:]):
        if t <= b[0]:
            k = (t - a[0]) / max(1e-6, b[0] - a[0])
            # slow drifts are linear; real moves are eased
            k = k if abs(a[1] - b[1]) < 0.1 else ease(k)
            return tuple(a[i] + (b[i] - a[i]) * k for i in (1, 2, 3))
    return kf[-1][1:]

# ---------- edit decision list ----------
SCENES = 'scenes'
EDL = [
    (SCENES, 0.0, clips['how']['g0'], None),
    ('how', clips['how']['g0'], clips['muertos']['g0'], ('white', 0.5)),
    ('muertos', clips['muertos']['g0'], clips['ouija']['g0'], ('fade', 0.3)),
    ('ouija', clips['ouija']['g0'], clips['tarot']['g0'], ('fade', 0.3)),
    ('tarot', clips['tarot']['g0'], clips['wheel']['g0'], ('dip', 0.4)),
    ('wheel', clips['wheel']['g0'], clips['poker']['g0'], ('fade', 0.22)),
    ('poker', clips['poker']['g0'], SEC['themes']['end'], ('fade', 0.22)),
    (SCENES, SEC['themes']['end'], TOTAL, ('fade', 0.6)),
]

_cache = {}
def load(path):
    if path in _cache: return _cache[path]
    if len(_cache) > 8: _cache.clear()
    im = Image.open(path).convert('RGB')
    _cache[path] = im
    return im

def src_frame(src, t):
    if src == SCENES:
        n = max(0, round(t * FPS))
        return load(os.path.join(HERE, 'scenes', 'frames', f'g{n:05d}.jpg'))
    c = clips[src]
    k = round((t - c['g0']) * FPS)
    k = max(0, min(c['frames'] - 1, k))
    im = load(os.path.join(HERE, 'clips', src, f'f{k:05d}.jpg'))
    s, cx, cy = camera(src, t)
    hw, hh = W / 2 / s, H / 2 / s
    box = ((cx - hw) * DSF, (cy - hh) * DSF, (cx + hw) * DSF, (cy + hh) * DSF)
    return im.resize((W, H), Image.LANCZOS, box=box)

WHITE = Image.new('RGB', (W, H), (255, 255, 255))

def frame_dip_out(cur, t, na, d):
    wash = Image.new('RGB', (W, H), (246, 238, 246))
    return Image.blend(cur, wash, max(0, min(1, (t - (na - d / 2)) / (d / 2))))

def frame(t):
    # active segment
    idx = max(i for i, seg in enumerate(EDL) if t >= seg[1] - 1e-9) if t >= 0 else 0
    src, a, b, trans = EDL[idx]
    cur = src_frame(src, t)
    if trans and t < a + trans[1] / 2 and idx > 0:
        kind, d = trans
        prev = EDL[idx - 1][0]
        k = (t - (a - d / 2)) / d  # 0.5 at the cut
        if kind == 'fade':
            return Image.blend(src_frame(prev, t), cur, max(0, min(1, k)))
        if kind == 'dip':  # old out to a pale wash, then new in: no double exposure
            wash = Image.new('RGB', (W, H), (246, 238, 246))
            if t < a: return Image.blend(src_frame(prev, t), wash, max(0, min(1, (t - (a - d / 2)) / (d / 2))))
            return Image.blend(wash, cur, max(0, min(1, (t - a) / (d / 2))))
        if kind == 'white':
            return Image.blend(cur, WHITE, max(0, min(1, 1 - (t - a) / (d / 2))) if t >= a else 1)
    if trans and idx + 1 < len(EDL):
        pass
    # the fade-out half of the next segment's transition
    if idx + 1 < len(EDL):
        nsrc, na, nb, ntrans = EDL[idx + 1]
        if ntrans and ntrans[0] == 'dip' and t > na - ntrans[1] / 2:
            return frame_dip_out(cur, t, na, ntrans[1])
        if ntrans and ntrans[0] == 'fade' and t > na - ntrans[1] / 2:
            k = (t - (na - ntrans[1] / 2)) / ntrans[1]
            return Image.blend(cur, src_frame(nsrc, t), max(0, min(1, k)))
    return cur

# ---------- captions ----------
CAPDIR = os.path.join(HERE, 'captions')
CAPMETA = json.load(open(os.path.join(CAPDIR, 'meta.json')))
NO_BURN = {'x1', 'x2'}  # already on screen as the end card
order = sorted(L.values(), key=lambda l: l['start'])
CAPS = []
for i, l in enumerate(order):
    if l['id'] in NO_BURN: continue
    a = l['start'] - 0.05
    b = l['end'] + 0.2
    if i + 1 < len(order): b = min(b, order[i + 1]['start'] - 0.04)
    CAPS.append((a, b, l['id']))
_capimg = {}
def cap(id_):
    if id_ not in _capimg: _capimg[id_] = Image.open(os.path.join(CAPDIR, f'{id_}.png')).convert('RGBA')
    return _capimg[id_]

def add_caption(img, t):
    for a, b, id_ in CAPS:
        if a <= t <= b:
            c = cap(id_)
            k = min(1, (t - a) / 0.12, (b - t) / 0.12)
            if k < 1:
                c = c.copy(); alpha = c.getchannel('A').point(lambda v: int(v * k)); c.putalpha(alpha)
            m = CAPMETA[id_]
            img = img.copy(); img.paste(c, (m['x'], m['y']), c)
            return img
    return img

def ffmpeg(path):
    return subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                             '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', str(FPS), path], stdin=subprocess.PIPE)

def render_part(args):
    i, f0, f1 = args
    os.makedirs(os.path.join(HERE, 'parts'), exist_ok=True)
    pc = ffmpeg(os.path.join(HERE, 'parts', f'cap{i:02d}.mp4'))
    pn = ffmpeg(os.path.join(HERE, 'parts', f'clean{i:02d}.mp4'))
    poster = os.path.join(HERE, '..', 'brag.jpg')
    for f in range(f0, f1):
        t = f / FPS
        if f == 0 and os.path.exists(poster):
            img = Image.open(poster).convert('RGB').resize((W, H))
            pn.stdin.write(img.tobytes()); pc.stdin.write(img.tobytes())
            continue
        img = frame(t)
        pn.stdin.write(img.tobytes())
        pc.stdin.write(add_caption(img, t).tobytes())
    for p in (pc, pn):
        p.stdin.close(); p.wait()
    return i

def stills(times, out):
    os.makedirs(out, exist_ok=True)
    for t in times:
        add_caption(frame(t), t).save(os.path.join(out, f'still-{t:07.2f}.jpg'), quality=88)

if __name__ == '__main__':
    if '--poster' in sys.argv:
        t = float(sys.argv[sys.argv.index('--poster') + 1])
        frame(t).save(os.path.join(HERE, '..', 'brag.jpg'), quality=94)
        sys.exit()
    if '--stills' in sys.argv:
        ts = [float(x) for x in sys.argv[sys.argv.index('--stills') + 1].split(',')]
        stills(ts, os.path.join(HERE, 'review', 'stills'))
        sys.exit()
    n = int(sys.argv[sys.argv.index('--parts') + 1]) if '--parts' in sys.argv else 6
    total_f = round(TOTAL * FPS)
    bounds = [round(total_f * i / n) for i in range(n + 1)]
    only = [int(x) for x in sys.argv[sys.argv.index('--only') + 1].split(',')] if '--only' in sys.argv else list(range(n))
    with Pool(len(only)) as pool:
        for i in pool.imap_unordered(render_part, [(i, bounds[i], bounds[i + 1]) for i in only]):
            print('part', i, 'done', flush=True)
    for kind in ('cap', 'clean'):
        lst = os.path.join(HERE, 'parts', f'{kind}.txt')
        with open(lst, 'w') as fh:
            for i in range(n): fh.write(f"file '{kind}{i:02d}.mp4'\n")
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', os.path.join(HERE, f'video-{kind}.mp4')], check=True)
    print('video done')
