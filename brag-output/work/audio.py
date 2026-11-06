"""Soundtrack: the site's own songs and sounds, placed on the video's timeline and mixed.

Writes stems (music.wav, sfx.wav) and mix.wav at 48 kHz stereo.
"""
import json, math, os, subprocess
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SFX = '/Users/dylanjones/lotteryclock/web/public/sfx'
SR = 48000
TL = json.load(open(os.path.join(HERE, 'timeline.json')))
L = TL['lines']; SEC = {s['id']: s for s in TL['sections']}
EV = json.load(open(os.path.join(HERE, 'events.json')))
CL = json.load(open(os.path.join(HERE, 'clips.json')))
TOTAL = TL['total']
N = int(math.ceil((TOTAL + 0.5) * SR))
music = np.zeros((N, 2), np.float32)
sfx = np.zeros((N, 2), np.float32)
st = lambda i: L[i]['start']
en = lambda i: L[i]['end']

_cache = {}
def load(name):
    if name in _cache: return _cache[name]
    path = name if name.startswith('/') else os.path.join(SFX, name + '.mp3')
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    _cache[name] = a
    return a

def place(bus, a, t, gain=1.0, fade_in=0.0, fade_out=0.0, dur=None):
    if dur is not None: a = a[: int(dur * SR)]
    a = a * gain
    n = len(a)
    if fade_in > 0:
        k = min(n, int(fade_in * SR)); a[:k] *= np.linspace(0, 1, k, dtype=np.float32)[:, None]
    if fade_out > 0:
        k = min(n, int(fade_out * SR)); a[n - k:] *= np.linspace(1, 0, k, dtype=np.float32)[:, None]
    i = int(round(t * SR))
    if i < 0: a = a[-i:]; i = 0
    j = min(N, i + len(a))
    bus[i:j] += a[: j - i]

LOOPS = {'classic/loop': 52.189}
def song(name, t0, t1, offset=0.0, gain=0.5, fi=0.4, fo=0.6):
    a = load(name)
    if name in LOOPS:  # seamless loop: tile it to cover the span
        per = int(LOOPS[name] * SR); a = a[:per]
        a = np.concatenate([a] * (int((t1 - t0 + offset) * SR / per) + 2))
    a = a[int(offset * SR):]
    place(music, a, t0, gain, fi, fo, dur=t1 - t0)

FX_GAIN = 0.6
def fx(name, t, gain=0.6, dur=None, fo=0.0, rate=1.0):
    gain *= FX_GAIN
    a = load(name)
    if rate != 1.0:
        idx = np.arange(0, len(a) - 1, rate)
        a = np.stack([np.interp(idx, np.arange(len(a)), a[:, c]) for c in (0, 1)], 1).astype(np.float32)
    place(sfx, a, t, gain, 0.003, fo, dur)

def synth(kind, t, gain=0.3):
    n = int(SR * {'down': 0.5, 'zap': 0.25, 'thud': 0.35, 'thunder': 2.2, 'whoosh': 0.9}[kind])
    x = np.arange(n) / SR
    rng = np.random.default_rng(int(t * 1000))
    if kind == 'down':  # power cut: a falling hum
        y = np.sin(2 * np.pi * (220 * x - 180 * x * x)) * np.exp(-x * 5)
    elif kind == 'zap':  # the clock glitches back
        y = np.sign(np.sin(2 * np.pi * (900 + 600 * np.sin(x * 90)) * x)) * 0.25 * np.exp(-x * 14) + rng.normal(0, 0.15, n) * np.exp(-x * 20)
    elif kind == 'thud':  # the REJECTED stamp
        y = np.sin(2 * np.pi * 70 * x) * np.exp(-x * 16) + rng.normal(0, 0.3, n) * np.exp(-x * 60)
    elif kind == 'thunder':
        noise = rng.normal(0, 1, n)
        # crude low-pass by moving average, rumbling decay
        k = 160; y = np.convolve(noise, np.ones(k) / k, 'same') * 6 * (np.exp(-x * 2.2) * (1 - np.exp(-x * 40)))
    elif kind == 'whoosh':
        noise = rng.normal(0, 1, n); k = 40
        y = np.convolve(noise, np.ones(k) / k, 'same') * 2.5 * np.sin(np.pi * x / x[-1]) ** 2
    y = (y * gain * FX_GAIN).astype(np.float32)
    place(sfx, np.stack([y, y], 1), t, 1.0)

# ---------------- dial notes (the classic marimba, pitched to C major pentatonic) ----------------
BASES = [(1, 60.1), (4, 65.07), (7, 67.05), (9, 73.04)]
PENTA = [55, 57, 60, 62, 64, 67, 69, 72, 74, 76, 79]
def note(v, t, gain=0.28):
    m = PENTA[min(len(PENTA) - 1, round(v / 45 * (len(PENTA) - 1)))]
    f, base = min(BASES, key=lambda b: abs(b[1] - m))
    fx(f'classic/note-{f}', t, gain, rate=2 ** ((m - base) / 12))

def ease(k): return 4 * k ** 3 if k < 0.5 else 1 - (-2 * k + 2) ** 3 / 2
def drag_notes(v0, v1, t0, dur, gain=0.26):
    last, lt = v0, -1
    for i in range(int(dur * 120) + 1):
        tt = t0 + i / 120
        v = round(v0 + (v1 - v0) * ease(min(1, i / 120 / dur)))
        if abs(v - last) >= 3 and tt - lt > 0.07 or (i == int(dur * 120) and v != last):
            note(v, tt, gain); last, lt = v, tt

# ---------------- COLD OPEN ----------------
song('ouija/draw', 0.0, SEC['cold']['end'] + 0.6, 0.0, 0.55, 1.2, 1.2)
for k in range(int(SEC['cold']['end'])):
    if k + 0.0 < en('c2') - 1.6: fx('common/beep', k, 0.16)
synth('zap', en('c2') - 1.55, 0.25); synth('zap', en('c2') - 0.9, 0.2)

# ---------------- STORY ----------------
s0 = SEC['story']['start']
yank = st('s4') + 1.3
back = st('s5') + 1.2
relit = back + 0.35
wrong = st('s6') + 1.9
ringStop = st('s7') + 1.95
song('classic/loop', s0 - 0.2, yank + 0.15, 0.0, 0.5, 0.8, 0.25)
for n in range(int((st('s3') - s0) / 1.15)):
    fx('common/latch', s0 + n * 1.15 + 0.14, 0.3)
synth('down', yank, 0.4); synth('zap', yank, 0.18)
fx('common/latch', back, 0.45)
for k in range(int(wrong - relit) + 1):
    if relit + k < wrong: fx('common/beep', relit + k, 0.2)
synth('zap', wrong, 0.22)
# back from the dead: the eerie bed returns under the blinking clock
song('ouija/draw', relit - 0.2, st('s7') + 0.1, 8.0, 0.42, 0.8, 0.25)
fx('classic/alarm', st('s7') - 0.1, 0.45, dur=ringStop - st('s7') + 0.1, fo=0.06)
song('classic/loop', st('s8') - 0.3, SEC['story']['end'] + 0.3, 6.0, 0.42, 1.2, 0.8)
fx('classic/sunny', st('s10') + 1.6, 0.55)
a6 = st('s11')
for i in range(5): note([0, 9, 18, 27, 36][i], a6 + 0.25 + i * 0.32, 0.3)
fx('classic/buzz', en('s12') - 1.25, 0.45, dur=0.9, fo=0.3)

# ---------------- RESURRECTION ----------------
r0 = SEC['resurrection']['start']
song('ouija/draw', r0 - 0.3, SEC['resurrection']['end'] + 0.2, 20.0, 0.55, 1.2, 0.4)
fx('classic/roll', st('r2') + 2.5 - 1.38, 0.5)
synth('thud', st('r3') + 2.05, 0.6); fx('common/latch', st('r3') + 2.05, 0.5)
synth('thunder', st('r5') + 0.1, 0.55)
rise = st('r5') + 1.05
synth('thunder', rise - 0.05, 0.3); synth('whoosh', rise - 0.1, 0.35)
fx('classic/jackpot', st('r6') + 0.15, 0.5, fo=1.0)

# ---------------- HOW IT WORKS (+ Good Night) ----------------
how = EV['how']
theme_switch = next(a['g'] for a in how['actions'] if a['type'] == 'click' and a['g'] > st('t1'))
song('classic/draw', CL['how']['g0'] + 0.15, theme_switch + 0.35, 0.0, 0.5, 0.5, 0.6)
song('night/draw', theme_switch, CL['how']['g1'] + 0.15, 0.0, 0.55, 0.4, 0.25)

def clicks_and_results(name, set_label_times=()):
    ev = EV[name]
    prev_sel = None
    for a in ev['actions']:
        if a['type'] == 'move': prev_sel = a.get('sel')
        if a['type'] == 'click' and a['g'] >= CL[name]['g0'] - 0.01:
            if prev_sel == 'Set Alarm':
                fx('common/latch', a['g'], 0.55)
                fx('common/beep', a['g'] + 0.38, 0.28); fx('common/beep', a['g'] + 1.38, 0.28)
            else:
                fx('common/latch', a['g'], 0.38)
    for s in ev['status']:
        txt = s['s']
        if 'Roll Again' in txt and s['g'] >= CL[name]['g0'] - 0.01:
            low = txt.lower()
            win = any(w in low for w in ('won', 'more', 'snooze until', 'sleep till', 'rest in peace', 'back to sleep'))
            if win: fx('classic/sunny', s['g'], 0.55)
            else: fx('classic/buzz', s['g'], 0.42, dur=1.4, fo=0.4)

clicks_and_results('how')
# dial notes in the how clip
cur, switched = 10, False
for a in how['actions']:
    if a['type'] == 'drag' and a['dial'] is not None:
        if a['g'] > theme_switch and not switched: cur, switched = 0, True
        drag_notes(cur, a['dial'], a['g'], a['dur']); cur = a['dial']

# ---------------- THEMES ----------------
for name, gain, off in [('muertos', 0.55, 0.0), ('ouija', 0.55, 30.0), ('tarot', 0.55, 0.0), ('wheel', 0.5, 0.0), ('poker', 0.55, 0.0)]:
    g0, g1 = CL[name]['g0'], CL[name]['g1']
    song(f'{name}/draw', g0 - 0.15, g1 + 0.2, off, gain, 0.3, 0.3)
    clicks_and_results(name)
for a in EV['tarot']['actions']:
    if a['type'] == 'drag' and a['dial'] == 45 and a['g'] >= CL['tarot']['g0']:
        drag_notes(15, 45, a['g'], a['dur'], 0.22)

# ---------------- THE APP ----------------
ap = SEC['app']
song('classic/loop', ap['start'] - 0.4, SEC['close']['start'] + 0.3, 12.0, 0.42, 1.0, 1.2)
fx('common/latch', st('a4') + 0.75, 0.5)
fx('common/latch', st('a6') + 0.3, 0.35)
snoozeTap = st('a8') + 1.2
fx('classic/alarm', st('a7') - 0.2, 0.32, dur=snoozeTap - st('a7') + 0.2, fo=0.08)
fx('common/latch', snoozeTap, 0.5)
fx('classic/alarm', st('a9') + 0.9, 0.32, dur=st('a10') - st('a9') - 0.95, fo=0.15)
fx('classic/alarm', st('a10') - 0.15, 0.32, dur=st('a11') - st('a10'), fo=0.15)
fx('classic/buzz', st('a10') + 0.1, 0.3, dur=1.2, fo=0.4)
landAt = st('a11') + 2.4
fx('classic/roll', landAt - 1.38, 0.5)

# ---------------- CLOSE ----------------
night = load('night/draw'); nlen = len(night) / SR
song('night/draw', SEC['close']['start'] - 0.6, TOTAL + 0.4, nlen - (TOTAL - SEC['close']['start'] + 0.6) - 0.3, 0.6, 0.8, 1.6)
note(36, st('x1') + 0.3, 0.3)

# ---------------- mix ----------------
def lowpass(a, k=3):
    if k <= 1: return a
    ker = np.ones(k, np.float32) / k
    return np.stack([np.convolve(a[:, c], ker, 'same') for c in (0, 1)], 1).astype(np.float32)

# effects sit in the same room as the music: a short, soft early-reflection tail
def room(a):
    out = a.copy()
    for d, g in [(0.031, 0.22), (0.047, 0.16), (0.073, 0.11), (0.109, 0.07)]:
        k = int(d * SR); out[k:] += a[:-k] * g
    return out
sfx_r = room(lowpass(sfx, 2))
mix = music + sfx_r

def write(path, a):
    a = np.clip(a, -1, 1)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', path], input=a.astype(np.float32).tobytes(), check=True)

# loudness: measure, then a static gain to about -16 LUFS with a gentle limiter
write(os.path.join(HERE, 'mix-raw.wav'), mix * 0.5)
meas = subprocess.run(['ffmpeg', '-v', 'info', '-i', os.path.join(HERE, 'mix-raw.wav'), '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = float([l for l in meas.splitlines() if l.strip().startswith('I:')][-1].split()[1])
gain_db = -16.0 - I
g = 0.5 * 10 ** (gain_db / 20)
print('integrated', I, 'LUFS raw; gain', round(gain_db, 1), 'dB')
write(os.path.join(HERE, 'music.wav'), music * g)
write(os.path.join(HERE, 'sfx.wav'), sfx_r * g)
write(os.path.join(HERE, 'mix-pre.wav'), mix * g)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(HERE, 'mix-pre.wav'), '-af', 'alimiter=limit=0.89:attack=5:release=60:level=disabled',
                '-c:a', 'pcm_s24le', os.path.join(HERE, 'mix.wav')], check=True)
print('audio done', round(TOTAL, 2), 's')
