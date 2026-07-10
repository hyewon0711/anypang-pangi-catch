# BPM/오프셋 실측 도구 (public/songs/README.md 참고)
#
# 사용법:
#   ffmpeg -y -i song.mp3 -ac 1 -ar 22050 song.wav
#   python tools/analyze_bpm.py song.wav
#
# 의존성: numpy만 필요 (pip install numpy). mp3 디코딩은 ffmpeg로 미리 wav 변환 후 사용.
# 방식: 짧은 구간 RMS 에너지의 상승분(half-wave rectified diff)을 onset envelope로 보고,
#       자기상관(autocorrelation)으로 BPM을, 위상 그리드서치로 첫 박 오프셋을 추정합니다.
import sys, wave, json
import numpy as np

def load_wav_mono(path):
    with wave.open(path, 'rb') as w:
        sr = w.getframerate()
        n = w.getnframes()
        raw = w.readframes(n)
        data = np.frombuffer(raw, dtype=np.int16).astype(np.float64)
    return data, sr

def onset_envelope(sig, sr, hop=256, win=1024):
    n = len(sig)
    n_hops = (n - win) // hop
    energy = np.zeros(n_hops)
    for i in range(n_hops):
        seg = sig[i*hop : i*hop+win]
        energy[i] = np.sqrt(np.mean(seg*seg) + 1e-9)
    d = np.diff(energy)
    d[d < 0] = 0
    if len(d) > 5:
        kernel = np.ones(3) / 3
        d = np.convolve(d, kernel, mode='same')
    return d, sr / hop

def estimate_tempo(env, fps, bpm_min=60, bpm_max=200):
    env = env - env.mean()
    ac = np.correlate(env, env, mode='full')
    mid = len(ac) // 2
    ac = ac[mid:]
    lag_min = int(fps * 60.0 / bpm_max)
    lag_max = int(fps * 60.0 / bpm_min)
    lag_max = min(lag_max, len(ac) - 1)
    if lag_max <= lag_min:
        return 120.0
    seg = ac[lag_min:lag_max]
    best_lag = lag_min + int(np.argmax(seg))
    bpm = 60.0 * fps / best_lag
    for cand in [bpm, bpm*2, bpm/2]:
        if 80 <= cand <= 170:
            bpm = cand
            break
    return float(bpm)

def estimate_phase(env, fps, bpm):
    beat_period_frames = fps * 60.0 / bpm
    best_score = -1
    best_phase = 0.0
    steps = 100
    n = len(env)
    max_beats = int(n / beat_period_frames)
    for s in range(steps):
        phase = s / steps * beat_period_frames
        idx = phase + np.arange(max_beats) * beat_period_frames
        idx = idx[idx < n].astype(int)
        if len(idx) == 0:
            continue
        score = env[idx].sum()
        if score > best_score:
            best_score = score
            best_phase = phase
    return float(best_phase / fps)

def analyze(path):
    sig, sr = load_wav_mono(path)
    duration = len(sig) / sr
    env, fps = onset_envelope(sig, sr)
    bpm = estimate_tempo(env, fps)
    offset = estimate_phase(env, fps, bpm)
    return {"duration": round(duration, 2), "bpm": round(bpm, 1), "offset": round(offset, 3)}

if __name__ == "__main__":
    results = {}
    for path in sys.argv[1:]:
        name = path.split("/")[-1].split("\\")[-1].rsplit(".", 1)[0]
        try:
            results[name] = analyze(path)
        except Exception as e:
            results[name] = {"error": str(e)}
    print(json.dumps(results, indent=2, ensure_ascii=False))
