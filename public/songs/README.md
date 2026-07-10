# 🎵 실제 음원(mp3) 추가하는 법

## 현재 등록된 곡 (실측 BPM 기반)
| 파일 | 곡 이름 | 난이도 | BPM | 오프셋 | chart 타입 |
|---|---|---|---|---|---|
| `swing-button.mp3` | 스윙 버튼 | 보통 | 152.0 | 0.154s | `swingEighth` (1.5박 간격, 가끔 스윙 추가음·연타·홀드) |

BPM·오프셋은 ffmpeg로 mono wav 변환 후 numpy로 온셋 엔벨로프 자기상관(autocorrelation) 분석해 실측한 값입니다.
곡마다 리듬 패턴(chart 타입)이 곡의 실제 그루브에 맞춰 고정되어 있습니다 — 자세한 생성 로직은 `public/index.html`의 `chartSwingEighth` 참고. 스윙 버튼은 1.5박 간격을 기본으로, 약 10% 확률로 1박짜리 ✋ 꾹 누르기(홀드) 노트도 섞여 나옵니다.

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
  bpm:128, offset:0, lengthBeats:140, diffKey:'normal', diffLabel:'보통', stars:'★★☆',
  chart:'swingEighth' }
```
- `id`: 영문/숫자 식별자(랭킹 키 `rhythm:<id>:<diffKey>`에 사용) — 곡마다 고유하게
- `bpm` / `offset`: 실측값. 정확해야 노트가 박자에 맞습니다.
- `lengthBeats`: 채보를 만들 길이(박). `대략 = (곡 길이 − offset) × bpm ÷ 60` 에서 여유(5~10박) 뺀 값
- `chart`: `'swingEighth'`(자동 생성) 또는 `'custom'`(직접 채보 작성, 아래 참고)
- `diffKey`/`diffLabel`/`stars`: 곡에 표시될 난이도 표기 (예: `easy`/`쉬움`/`★☆☆`)

## 채보를 직접 작성하려면 (`chart:'custom'`)

자동 생성 대신 노트를 하나하나 직접 배치하고 싶다면 `chart`를 `'custom'`으로 하고 `notes` 배열을 추가하세요.

```js
{ id:'swingbutton', name:'스윙 버튼', cover:'🎺', kind:'file', src:'songs/swing-button.mp3',
  bpm:152.0, offset:0.154, lengthBeats:400, diffKey:'normal', diffLabel:'보통', stars:'★★☆',
  chart:'custom',
  notes:[
    { b:4,   h:0, c:1 },   // 4번째 박, 0번 구멍(좌상단), 1마리(단타)
    { b:5,   h:2, c:1 },
    { b:6,   h:1, c:2 },   // 2마리 연타 (0.5박 간격씩 자동으로 이어짐)
    { b:6.5, h:3, c:1 },
    { b:8,   h:0, hold:2 }, // 8번째 박부터 2박 동안 꾹 누르기(홀드)
  ]
}
```
- `b`: 팡이가 나타날 박자 번호. 0.5박 단위(스윙 8비트라면 `x.5`)까지 자유롭게 쓸 수 있습니다. 박 = `60 / bpm`초.
- `h`: 구멍 번호 `0`~`3` (2x2 그리드 — 0:좌상단, 1:우상단, 2:좌하단, 3:우하단).
- `c`: 그 자리에 연달아 등장하는 팡이 마리 수(연타). `1`이면 단타, `2`~`3`이면 `MULTI_GAP_BEAT`(0.5박) 간격으로 같은 구멍에 순서대로 등장.
- `hold`: 지정하면 단타/연타 대신 **꾹 누르기 노트**가 됩니다. 값은 눌러야 하는 길이(박). `b` 박에 누르기 시작해서 `b+hold` 박까지 손을 떼면 안 되고, 다 채우면 자동으로 PERFECT 판정됩니다. 일찍 떼면 MISS. `c`와 같이 쓰지 않습니다(한 노트는 연타 또는 홀드 중 하나).
- 배열 순서는 상관없지만 `b` 기준으로 정렬해두면 보기 편합니다.
- 같은 구멍에서 홀드가 끝나기 전에 다른 노트를 배치하면 서로 겹쳐 혼란스러우니, 홀드가 끝나는 박(`b+hold`) 이후로 다음 노트를 배치하세요.
- 곡 길이(초)는 `bpm×lengthBeats÷60`이 대략 맞아야 마지막 노트 이후 곡이 자연스럽게 끝납니다.

## 저작권
본인이 권리를 가졌거나 사용 허락된 음원만 추가하세요. 이 폴더의 mp3는 git에 커밋되지 않습니다(.gitignore).
