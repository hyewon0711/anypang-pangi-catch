# 🕳️ 팡이를 잡아라! — 랭킹 웹게임

먼지 팡이(센과 치히로의 먼지덩이 컨셉)를 잡아 점수를 겨루는 웹게임입니다.
닉네임만 입력하면 누구나 접속해서 플레이하고, **공유 실시간 랭킹**에 점수가 반영됩니다.

## 구성
```
pangi-web/
├─ server.js          # 무의존성 Node 서버 (정적 파일 + 랭킹 API)
├─ public/index.html  # 게임 클라이언트 (단일 파일)
├─ scores.json        # 점수 저장 파일 (자동 생성)
└─ package.json
```
- **추가 패키지 설치(npm install) 불필요** — Node 기본 모듈만 사용합니다.

## 실행 방법

### 1. Node.js 설치 (최초 1회)
이 PC에는 Node가 설치돼 있지 않습니다. 아래 중 하나로 설치하세요.
- 공식 설치: https://nodejs.org (LTS 버전 권장)
- 또는 PowerShell에서: `winget install OpenJS.NodeJS.LTS`

설치 후 새 터미널에서 `node --version` 이 찍히면 완료입니다.

### 2. 서버 실행
```powershell
cd C:\Users\STZ541\Downloads\maptool_extracted\pangi-web
node server.js
```
실행하면 콘솔에 접속 주소가 출력됩니다:
```
로컬:      http://localhost:3000
네트워크:  http://192.168.x.x:3000   (다른 유저는 이 주소로 접속)
```

### 3. 접속
- **나**: 브라우저에서 `http://localhost:3000`
- **같은 와이파이/사내망의 다른 유저**: 콘솔에 찍힌 `http://192.168.x.x:3000` 주소로 접속
  - 접속이 안 되면 Windows 방화벽에서 Node.js의 인바운드(포트 3000)를 허용하세요.

## 게임 규칙
- 닉네임 입력 후 입장 → `팡이 잡기 시작`
- 9개 구멍 중 5곳에서 팡이가 무작위로 튀어나옴 → **순서 무관, 모두 터치**
- 한 구멍에서 2~3마리가 함께 나오기도 함 (점수 변수)
- 팡이 점수: **하양 10 / 검정 20 / 황금 40**
- 제한시간 10초, 모두 잡으면 슬롯이 돌며 점수 공개
- **최고 점수**가 닉네임별로 저장되어 실시간 랭킹에 반영

## API
| 메서드 | 경로 | 설명 |
|---|---|---|
| `GET` | `/api/leaderboard` | 상위 100명 랭킹 + 참가자 수 |
| `POST` | `/api/score` | `{nickname, score}` 등록 (최고점만 갱신) |

## 커스터마이징 포인트
- 점수/제한시간/등장 확률: `public/index.html` 상단 `PANGI`, `spawnPangi()` 의 `10.0`, `0.25`
- 포트 변경: `set PORT=8080 && node server.js`
- 닉네임 중복: 현재 같은 닉네임 = 같은 플레이어(최고점 갱신). 분리하려면 비밀번호/세션 추가 필요.

## 외부 공개(인터넷 전체)로 확장하려면
- 클라우드(예: Render, Railway, Fly.io)에 배포하거나
- `ngrok http 3000` 으로 임시 공개 URL 생성
