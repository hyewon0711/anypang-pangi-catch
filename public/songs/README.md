# 🎵 실제 음원(mp3) 추가하는 법

## 현재 등록된 곡 (실측 BPM 기반)
| 파일 | 곡 이름 | 난이도 | BPM | 오프셋 | chart 타입 |
|---|---|---|---|---|---|
| `jazz-step.mp3` | 재즈 스텝 | 쉬움 | 95.7 | 0.313s | `walk` (2박마다 단타) |
| `swing-of-three.mp3` | 셋의 스윙 | 보통 | 86.1 | 0.098s | `triplet` (2박당 3연음) |
| `swing-button.mp3` | 스윙 버튼 | 어려움 | 152.0 | 0.154s | `swingEighth` (스윙 8비트+연타) |

BPM·오프셋은 ffmpeg로 mono wav 변환 후 numpy로 온셋 엔벨로프 자기상관(autocorrelation) 분석해 실측한 값입니다.
곡마다 리듬 패턴(chart 타입)이 곡의 실제 그루브에 맞춰 고정되어 있습니다 — 자세한 생성 로직은 `public/index.html`의 `chartWalk`/`chartTriplet`/`chartSwingEighth` 참고.

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
  chart:'legacy', ranked:true }
```
- `id`: 영문/숫자 식별자(랭킹 키 `rhythm:<id>:<diffKey>`에 사용) — 곡마다 고유하게
- `bpm` / `offset`: 실측값. 정확해야 노트가 박자에 맞습니다.
- `lengthBeats`: 채보를 만들 길이(박). `대략 = (곡 길이 − offset) × bpm ÷ 60` 에서 여유(5~10박) 뺀 값
- `chart`: `'walk'`/`'triplet'`/`'swingEighth'` 중 곡 느낌에 맞는 것을 고르거나, 전용 패턴이 필요하면 `index.html`에 새 `chartXxx()` 함수를 추가해 연결
- `diffKey`/`diffLabel`/`stars`: 곡에 표시될 난이도 표기 (예: `easy`/`쉬움`/`★☆☆`)
- `ranked`: true면 랭킹 반영

> 참고: 곡 선택 화면의 **＋ 내 MP3** 버튼으로 내 컴퓨터의 음악을 즉석에서 불러와 플레이할 수도 있습니다.
> 단, 업로드 음원은 BPM을 직접 입력해야 하고 **개인 연습용(랭킹 미반영)**입니다.
> 모두가 겨루는 공식 곡으로 만들려면 위처럼 파일+SONGS 등록 방식을 쓰세요.

## 저작권
본인이 권리를 가졌거나 사용 허락된 음원만 추가하세요. 이 폴더의 mp3는 git에 커밋되지 않습니다(.gitignore).
