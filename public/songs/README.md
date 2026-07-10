# 🎵 실제 음원(mp3) 추가하는 법

## 현재 등록된 곡 (실측 BPM 기반)
| 파일 | 곡 이름 | BPM | 오프셋 | chart 타입 |
|---|---|---|---|---|
| `swing-button.mp3` | 스윙 버튼 | 152.0 | 0.154s | `swingEighth` (1.5박 간격, 가끔 스윙 추가음·연타) |

BPM·오프셋은 ffmpeg로 mono wav 변환 후 numpy로 온셋 엔벨로프 자기상관(autocorrelation) 분석해 실측한 값입니다.
곡마다 리듬 패턴(chart 타입)이 곡의 실제 그루브에 맞춰 고정되어 있습니다 — 자세한 생성 로직은 `public/index.html`의 `chartSwingEighth` 참고.

## 새 곡을 추가하려면

### 1) 파일 넣기
이 폴더(`public/songs/`)에 음원 파일을 넣습니다. 예: `public/songs/mysong.mp3` (mp3/ogg/wav 등 브라우저가 재생 가능한 포맷)

### 2) BPM·오프셋 분석 (선택, 정확도를 위해 권장)
```powershell
ffmpeg -y -i mysong.mp3 -ac 1 -ar 22050 mysong.wav
python tools/analyze_bpm.py mysong.wav
```
직접 분석 없이 곡을 아는 만큼 BPM/오프셋을 손으로 입력해도 됩니다. 틀리면 노트가 박자에서 어긋납니다.

### 3) index.html의 SONGS에 등록
```js
{ id:'mysong', name:'내 노래', cover:'🎵', kind:'file', src:'songs/mysong.mp3',
  bpm:128, offset:0, lengthBeats:140, diffKey:'normal',
  chart:'swingEighth' }
```
- `id`: 영문/숫자 식별자(랭킹 키 `rhythm:<id>:<diffKey>`에 사용) — 곡마다 고유하게
- `bpm` / `offset`: 실측값. 정확해야 노트가 박자에 맞습니다.
- `lengthBeats`: 채보를 만들 길이(박). `대략 = (곡 길이 − offset) × bpm ÷ 60` 에서 여유(5~10박) 뺀 값
- `chart`: `'swingEighth'`(자동 생성) 또는 `'custom'`(직접 채보 작성, 아래 참고)
- `diffKey`: 랭킹 키 구분용 식별자(화면에는 표시되지 않음, 예: `normal`)

## 채보를 직접 작성하려면 (`chart:'custom'`)

자동 생성 대신 노트를 하나하나 직접 배치하고 싶다면 `chart`를 `'custom'`으로 하고 `notes` 배열을 추가하세요.

```js
{ id:'swingbutton', name:'스윙 버튼', cover:'🎺', kind:'file', src:'songs/swing-button.mp3',
  bpm:152.0, offset:0.154, lengthBeats:400, diffKey:'normal',
  chart:'custom',
  notes:[
    { b:4,   h:0, c:1 },   // 4번째 박, 0번 구멍(좌상단), 1마리(단타)
    { b:5,   h:2, c:1 },
    { b:6,   h:1, c:2 },   // 2마리 연타 (같은 구멍에 2번 연달아 눌러야 GOOD)
    { b:6.5, h:3, c:1 },
  ]
}
```
- `b`: 팡이가 나타날 박자 번호. 0.5박 단위(스윙 8비트라면 `x.5`)까지 자유롭게 쓸 수 있습니다. 박 = `60 / bpm`초.
- `h`: 구멍 번호 `0`~`3` (2x2 그리드 — 0:좌상단, 1:우상단, 2:좌하단, 3:우하단).
- `c`: 팡이가 등장한 뒤 그 구멍을 몇 번 눌러야 하는지(연타 수). `1`이면 한 번, `2`~`3`이면 연달아 그만큼 눌러야 GOOD. 등장 후 `REACT_WINDOW`(기본 2.5초, 칸 위에 반올림한 초 단위로 표시) 안에 다 누르지 못하면 MISS.
- 배열 순서는 상관없지만 `b` 기준으로 정렬해두면 보기 편합니다.
- 같은 구멍에서 이전 노트가 아직 판정(성공/MISS) 전이면 다음 노트는 그 구멍이 빌 때까지 자동으로 늦춰서 등장합니다.
- 곡 길이(초)는 `bpm×lengthBeats÷60`이 대략 맞아야 마지막 노트 이후 곡이 자연스럽게 끝납니다.

## 저작권
본인이 권리를 가졌거나 사용 허락된 음원만 추가하세요. 이 폴더의 mp3는 git에 커밋되지 않습니다(.gitignore).
