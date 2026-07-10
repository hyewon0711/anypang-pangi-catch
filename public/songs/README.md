# 🎵 실제 음원(mp3) 추가하는 법

이 폴더(`public/songs/`)에 음원 파일을 넣고, `public/index.html`의 `SONGS` 배열에 한 줄 추가하면
곡 선택 화면에 새 곡이 나타나고 **곡·난이도별 랭킹**에 반영됩니다.

## 1) 파일 넣기
예: `public/songs/mysong.mp3` (mp3/ogg/wav 등 브라우저가 재생 가능한 포맷)

## 2) index.html의 SONGS에 등록
```js
const SONGS = [
  { id:'pangibeat', name:'팡이 비트', cover:'🎶', kind:'synth', bpm:120, offset:0, lengthBeats:64, ranked:true },
  { id:'mysong', name:'내 노래', cover:'🎵', kind:'file', src:'songs/mysong.mp3',
    bpm:128, offset:0, lengthBeats:140, ranked:true },
];
```
- `id`: 영문/숫자 식별자(랭킹 키에 사용) — 곡마다 고유하게
- `bpm`: 곡 빠르기. **정확해야 노트가 박자에 맞습니다.**
- `offset`: 음원 시작부터 첫 박(beat 0)까지의 시간(초). 박자가 밀리면 조절
- `lengthBeats`: 채보를 만들 길이(박). `대략 = 곡 길이(초) × bpm ÷ 60`
- `ranked`: true면 랭킹 반영

> 참고: 곡 선택 화면의 **＋ 내 MP3** 버튼으로 내 컴퓨터의 음악을 즉석에서 불러와 플레이할 수도 있습니다.
> 단, 업로드 음원은 사람마다 BPM/채보가 달라 **개인 연습용(랭킹 미반영)**입니다.
> 모두가 겨루는 공식 곡으로 만들려면 위처럼 파일+SONGS 등록 방식을 쓰세요.

## 저작권
본인이 권리를 가졌거나 사용 허락된 음원만 추가하세요. 이 폴더의 mp3는 git에 커밋되지 않습니다(.gitignore).
