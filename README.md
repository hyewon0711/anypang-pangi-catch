# 🎵 팡이 리듬! — 랭킹 웹게임

먼지 팡이(센과 치히로의 먼지덩이 컨셉)를 소재로 한 리듬 게임입니다.
노래 박자에 맞춰 4칸에서 튀어나오는 팡이를 터치하고, 점수로 랭킹을 겨룹니다.

## 플레이하기
**https://hyewon0711.github.io/anypang-pangi-catch/** — 서버 없이 바로 접속·플레이 가능 (GitHub Pages, 항상 켜짐)

닉네임만 입력하면 바로 시작합니다. 랭킹은 브라우저별로 저장됩니다.

## 구성
```
pangi-web/
├─ server.js            # (선택) 무의존성 Node 서버 — 여러 유저가 랭킹을 공유하고 싶을 때
├─ public/index.html    # 게임 본체 (팡이 리듬)
├─ public/rhythm.html   # 구 URL 호환용 리다이렉트 → index.html
├─ public/songs/        # 실제 음원(mp3) 2곡 + 추가 방법 README (mp3는 git 제외)
├─ tools/analyze_bpm.py # 음원 BPM·오프셋 실측 스크립트 (ffmpeg+numpy)
├─ scores.json          # (서버 사용 시) 점수 저장 파일 (자동 생성, git 제외)
├─ render.yaml          # (선택) Render 배포 설정
└─ .github/workflows/pages.yml  # GitHub Pages 자동 배포
```

## 게임 규칙
- 메인 화면에서 **곡**을 선택하고 플레이 (곡마다 난이도·리듬 패턴이 고정)
- 노래 박자에 맞춰 4칸에서 팡이가 등장, 팡이를 감싼 **접근 링**이 줄어듦
- 링이 팡이에 딱 맞는 순간 터치 → **PERFECT**(±0.085s) / 살짝 어긋나면 **GOOD**(±0.18s) / 놓치면 **MISS**
- **체력 개념 없음** — 미스해도 곡은 끝까지 진행
- 한 칸에 팡이가 여러 마리면 **링도 마리 수만큼** 차례로 닫힘 → 순서대로 연달아 터치
- 콤보 보너스 + 정확도 등급(S/A/B/C/D), 최종 점수가 **곡별 랭킹**에 반영
- 게임 중 **⏸ 일시정지**(계속하기/처음부터/나가기), 홈에서 **🏠 로비로 돌아가기** 가능

### 곡 목록
곡마다 실제 음원의 BPM을 분석해 그 곡의 리듬(그루브)에 맞춘 전용 채보 패턴이 고정 적용됩니다.

| 곡 | 난이도 | BPM | 리듬 패턴 |
|---|---|---|---|
| 🎹 셋의 스윙 | 보통 ★★☆ | 86.1 | `triplet` — 2박을 3등분한 트리플렛(3연음) |
| 🎺 스윙 버튼 | 어려움 ★★★ | 152.0 | `swingEighth` — 매 박 스윙 8비트 + 잦은 연타 |

BPM·오프셋은 `tools/analyze_bpm.py`로 실측(ffmpeg 변환 → numpy 온셋 자기상관 분석)한 값입니다. 자세한 곡 추가 방법은 [public/songs/README.md](public/songs/README.md) 참고.

- 랭킹 키는 곡별로 분리됩니다: `rhythm:<곡id>:<난이도>`

## 랭킹 저장 방식
- **GitHub Pages(기본, 서버 없음)**: 접속한 **브라우저별 localStorage**에 저장. 내 최고점·순위는 유지되지만 다른 사람과는 공유되지 않음.
- **Node 서버 실행 시**: `scores.json`에 저장되어 **접속자 전체가 같은 랭킹판**을 공유. 아래 "직접 서버 실행" 참고.

## 직접 서버 실행하기 (여러 사람이 랭킹을 공유하고 싶을 때)

### 1. Node.js 설치 (최초 1회)
- 공식 설치: https://nodejs.org (LTS 버전 권장)
- 또는 PowerShell에서: `winget install OpenJS.NodeJS.LTS`

### 2. 서버 실행
```powershell
cd C:\Users\STZ541\Downloads\maptool_extracted\pangi-web
node server.js
```
콘솔에 접속 주소가 출력됩니다:
```
로컬:      http://localhost:3000
네트워크:  http://192.168.x.x:3000   (다른 유저는 이 주소로 접속)
```
같은 와이파이/사내망의 다른 유저는 `http://192.168.x.x:3000`로 접속 (안 되면 Windows 방화벽에서 포트 3000 인바운드 허용).

## API (서버 사용 시)
| 메서드 | 경로 | 설명 |
|---|---|---|
| `GET` | `/api/leaderboard?mode=rhythm:<곡id>:<난이도>` | 해당 곡·난이도 상위 100명 랭킹 + 참가자 수 |
| `POST` | `/api/score` | `{nickname, score, mode}` 등록 (모드별 최고점만 갱신) |

## 커스터마이징 포인트
- 판정 윈도우/점수: `public/index.html` 상단 `W_PERFECT`, `W_GOOD`, `SCORE`
- 곡별 채보 패턴: `chartWalk`/`chartTriplet`/`chartSwingEighth` (홀 간격, 연타 확률 등)
- 포트 변경(서버 사용 시): `set PORT=8080 && node server.js`
- 닉네임 중복: 같은 닉네임 = 같은 플레이어(최고점 갱신). 분리하려면 비밀번호/세션 추가 필요.

## GitHub Pages 배포 (현재 사용 중)
`main`에 push하면 `.github/workflows/pages.yml`이 `public/`을 자동 배포합니다.
설정 최초 1회만 필요:
1. 저장소가 **Public**이어야 무료로 동작
2. Settings → Pages → Source가 **GitHub Actions**로 설정돼 있어야 함 (이미 설정됨)

## 그 밖의 배포 옵션
- **Render(서버 필요, 무료 티어)**: 저장소의 `render.yaml`로 Blueprint 배포 가능. 콜드스타트(~50초)와 재배포 시 점수 초기화 있음 — 자세한 내용은 git 히스토리 참고
- **내 PC만 잠깐 공유**: `cloudflared tunnel --url http://localhost:3000` → `https://xxxx.trycloudflare.com` (PC 켜져 있는 동안만)
