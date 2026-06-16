/**
 * 팡이를 잡아라! — 랭킹 웹게임 서버
 * 무의존성(Node 기본 모듈만 사용). 점수는 scores.json 파일에 저장.
 *
 * 실행:  node server.js
 * 접속:  http://localhost:3000  (같은 네트워크의 다른 유저는 http://<내IP>:3000)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DB_FILE = path.join(__dirname, 'scores.json');

/* ---------- 간단 파일 DB ---------- */
function loadDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return { scores: {} }; } // scores: { nickname: {score, plays, updatedAt} }
}
function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}
let db = loadDB();

/* ---------- 랭킹 계산 ---------- */
function leaderboard(limit = 100) {
  return Object.entries(db.scores)
    .map(([nickname, v]) => ({ nickname, score: v.score, plays: v.plays || 1, updatedAt: v.updatedAt }))
    .sort((a, b) => b.score - a.score || a.updatedAt - b.updatedAt)
    .slice(0, limit)
    .map((r, i) => ({ rank: i + 1, ...r }));
}

/* ---------- 입력 검증 ---------- */
function cleanNick(n) {
  return String(n || '').trim().slice(0, 12).replace(/[<>"'`\\]/g, '');
}

/* ---------- 정적 파일 ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(PUBLIC_DIR, path.normalize(urlPath));
  if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

/* ---------- JSON 응답 ---------- */
function sendJSON(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

/* ---------- 서버 ---------- */
const server = http.createServer((req, res) => {
  // 랭킹 조회
  if (req.method === 'GET' && req.url.startsWith('/api/leaderboard')) {
    return sendJSON(res, 200, { ok: true, leaderboard: leaderboard(100), total: Object.keys(db.scores).length });
  }

  // 점수 등록 (최고점만 갱신)
  if (req.method === 'POST' && req.url === '/api/score') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 1e4) req.destroy(); });
    req.on('end', () => {
      let data; try { data = JSON.parse(body); } catch { return sendJSON(res, 400, { ok: false, error: 'bad json' }); }
      const nickname = cleanNick(data.nickname);
      const score = Math.max(0, Math.min(99999999, Math.floor(Number(data.score) || 0)));
      if (!nickname) return sendJSON(res, 400, { ok: false, error: '닉네임이 필요합니다' });

      const cur = db.scores[nickname] || { score: 0, plays: 0 };
      const isBest = score > cur.score;
      db.scores[nickname] = {
        score: isBest ? score : cur.score,
        plays: (cur.plays || 0) + 1,
        updatedAt: Date.now(),
      };
      saveDB(db);

      const lb = leaderboard(100);
      const myRank = lb.find(r => r.nickname === nickname)?.rank || null;
      return sendJSON(res, 200, { ok: true, isBest, best: db.scores[nickname].score, myRank, leaderboard: lb });
    });
    return;
  }

  // 정적 파일
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`\n🕳️  팡이를 잡아라! 서버 실행 중`);
  console.log(`   로컬:      http://localhost:${PORT}`);
  // 사내/동일 네트워크 접속용 IP 안내
  const os = require('os');
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`   네트워크:  http://${net.address}:${PORT}   (다른 유저는 이 주소로 접속)`);
      }
    }
  }
  console.log('');
});
