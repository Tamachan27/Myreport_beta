const weeklyUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSPJOnhUFFyWx7838ZfQeAY1gemOhCvO_leTg8hwWMePG2kZ08_UnIQE2bHKTU18RkR5P5Ow5oHV5Xf/pub?gid=0&single=true&output=csv";
const yearUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSPJOnhUFFyWx7838ZfQeAY1gemOhCvO_leTg8hwWMePG2kZ08_UnIQE2bHKTU18RkR5P5Ow5oHV5Xf/pub?gid=575136021&single=true&output=csv";
const liveUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSPJOnhUFFyWx7838ZfQeAY1gemOhCvO_leTg8hwWMePG2kZ08_UnIQE2bHKTU18RkR5P5Ow5oHV5Xf/pub?gid=1117584699&single=true&output=csv";

let weeklyData = [];
let yearlyData = [];
let liveData   = [];
let chartInst  = null;

/* ---- FETCH ---- */
Promise.all([
  fetch(weeklyUrl).then(r => r.text()),
  fetch(yearUrl).then(r => r.text()),
  fetch(liveUrl).then(r => r.text())
]).then(([w, y, l]) => {
  weeklyData = parseWeekly(w);
  yearlyData = parseYear(y);
  liveData   = parseLive(l);
  renderAll();
}).catch(err => console.error("データ取得エラー:", err));

/* ---- PARSE ---- */
function parseCSV(csv) {
  return csv.trim().split("\n").slice(1).map(l => l.split(","));
}

// ① 全フィールドに .trim() を追加して空白・改行ズレを防ぐ
function parseWeekly(csv) {
  return parseCSV(csv).map(c => ({
    year: (c[0]||"").trim(), week: (c[1]||"").trim(),
    minutes: Number((c[2]||"").trim()) || 0,
    topArtist1: (c[3]||"").trim(), topArtist2: (c[4]||"").trim(), topArtist3: (c[5]||"").trim(),
    repeat1: (c[6]||"").trim(),  repeatArtist1: (c[7]||"").trim(),
    repeat2: (c[8]||"").trim(),  repeatArtist2: (c[9]||"").trim(),
    repeat3: (c[10]||"").trim(), repeatArtist3: (c[11]||"").trim()
  }));
}
function parseYear(csv) {
  return parseCSV(csv).map(c => ({
    year: (c[0]||"").trim(), minutes: Number((c[1]||"").trim()) || 0, songs: Number((c[2]||"").trim()) || 0,
    artist1: (c[3]||"").trim(), artist2: (c[4]||"").trim(), artist3: (c[5]||"").trim(),
    artist4: (c[6]||"").trim(), artist5: (c[7]||"").trim()
  }));
}
function parseLive(csv) {
  return parseCSV(csv).map(c => ({
    year: (c[0]||"").trim(), date: (c[1]||"").trim(),
    artist: (c[2]||"").trim(), live: (c[3]||"").trim()
  }));
}

/* ---- RENDER ALL ---- */
function renderAll() {
  updateDashboard();
  renderWeekly();
  renderAnnual();
  renderLive();
  renderChart();
  populateLiveFilter();
}

/* ---- ARTIST RANKING ----
   週次TOP1=3pt, TOP2=2pt, TOP3=1pt
   年間1位=5pt, 2位=4pt, 3位=3pt, 4位=2pt, 5位=1pt
   ライブ参戦=+1pt/回
   週次リピートTOP1〜3のアーティスト=+1pt/回
---------------------------------------- */
function calcArtistRanking() {
  const scores = {};
  const add = (name, pt) => {
    const n = (name||"").trim();
    if (n) scores[n] = (scores[n] || 0) + pt;
  };

  weeklyData.forEach(w => {
    add(w.topArtist1, 3); add(w.topArtist2, 2); add(w.topArtist3, 1);
    add(w.repeatArtist1, 1); add(w.repeatArtist2, 1); add(w.repeatArtist3, 1);
  });
  yearlyData.forEach(y => {
    add(y.artist1, 5); add(y.artist2, 4); add(y.artist3, 3);
    add(y.artist4, 2); add(y.artist5, 1);
  });
  liveData.forEach(l => add(l.artist, 1));

  return Object.entries(scores)
    .filter(([name]) => name.length > 0)  // ① 空文字を完全除外
    .sort((a,b) => b[1]-a[1])
    .slice(0, 10);
}

/* ---- DASHBOARD ---- */
function updateDashboard() {
  const totalMin =
    yearlyData.reduce((a,b) => a+b.minutes, 0) +
    weeklyData.reduce((a,b) => a+b.minutes, 0);
  document.getElementById("totalMinutes").innerText = totalMin.toLocaleString() + " 分";
  const days  = Math.floor(totalMin / 60 / 24);
  const hours = Math.floor((totalMin / 60) % 24);
  document.getElementById("totalDays").innerText = `約 ${days} 日 ${hours} 時間`;

  /* 2026年合計（週次データから集計） */
  const min2026 = weeklyData
    .filter(w => w.year === "2026")
    .reduce((a,b) => a+b.minutes, 0);
  const el2026 = document.getElementById("year2026Minutes");
  if (min2026 > 0) {
    el2026.innerText = min2026.toLocaleString() + " 分";
  } else {
    el2026.innerText = "—";
    el2026.closest(".stat-block").querySelector(".stat-block-sub").innerText = "まだ記録なし";
  }

  /* Most Seen Artist */
  const counts = {};
  liveData.forEach(l => { if (l.artist) counts[l.artist] = (counts[l.artist]||0)+1; });
  let best="-", max=0;
  Object.entries(counts).forEach(([name,num]) => { if(num>max){best=name;max=num;} });
  document.getElementById("mostSeenArtist").innerText = best;
  document.getElementById("mostSeenCount").innerText  = max + " 回";

  /* Artist Ranking */
  const ranking  = calcArtistRanking();
  const topScore = ranking[0]?.[1] || 1;
  const medals   = ["🥇","🥈","🥉"];
  document.getElementById("artistRanking").innerHTML = ranking.map(([name,score],i) => {
    const pct  = Math.round((score/topScore)*100);
    const icon = medals[i] ?? `<span class="rank-num">${i+1}</span>`;
    return `
      <div class="ranking-row">
        <span class="ranking-medal">${icon}</span>
        <div class="ranking-name-wrap">
          <span class="ranking-name">${name}</span>
          <div class="ranking-bar-wrap"><div class="ranking-bar" style="width:${pct}%"></div></div>
        </div>
        <span class="ranking-score">${score}pt</span>
      </div>`;
  }).join("");

  /* Latest Week */
  const latest = weeklyData[weeklyData.length - 1];
  if (latest) {
    const artists = [latest.topArtist1, latest.topArtist2, latest.topArtist3].filter(Boolean);
    document.getElementById("latestWeek").innerHTML = `
      <div class="latest-inner">
        <div>
          <div class="latest-time">${latest.minutes.toLocaleString()}<span style="font-size:0.4em;opacity:.6;"> 分</span></div>
          <div class="latest-meta">${latest.year} / ${latest.week}</div>
        </div>
        <div class="latest-artists">
          ${artists.map((a,i) => `
            <div class="latest-artist-row">
              <span class="rank-badge">#${i+1}</span>
              <span>${a}</span>
            </div>`).join("")}
        </div>
        ${latest.repeatArtist1 ? `
          <div class="latest-repeat">
            🔁 ${latest.repeat1} — ${latest.repeatArtist1}
          </div>` : ""}
      </div>`;
  }
}

/* ---- WEEKLY ---- */
function renderWeekly() {
  const el = document.getElementById("weeklyList");
  el.innerHTML = [...weeklyData].reverse().map(w => {
    // ② リピートは「曲名 — アーティスト」の順で表示
    const repeats = [
      w.repeat1 && w.repeatArtist1 ? `${w.repeat1} — ${w.repeatArtist1}` : null,
      w.repeat2 && w.repeatArtist2 ? `${w.repeat2} — ${w.repeatArtist2}` : null,
      w.repeat3 && w.repeatArtist3 ? `${w.repeat3} — ${w.repeatArtist3}` : null,
    ].filter(Boolean);

    return `
    <div class="data-card">
      <div class="data-card-eyebrow">WEEKLY</div>
      <div class="data-card-title">${w.year} / ${w.week}</div>
      <div class="data-card-time">⏱ ${w.minutes.toLocaleString()} 分</div>
      <hr class="data-card-divider">
      <div class="data-card-section">TOP ARTISTS</div>
      <div class="artist-list">
        ${[w.topArtist1, w.topArtist2, w.topArtist3].filter(Boolean).map((a,i) => `
          <div class="artist-row"><span class="artist-rank">#${i+1}</span><span>${a}</span></div>`).join("")}
      </div>
      ${repeats.length ? `
        <hr class="data-card-divider">
        <div class="data-card-section">REPEAT TRACKS</div>
        <div class="artist-list">
          ${repeats.map((r,i) => `
            <div class="artist-row"><span class="artist-rank">#${i+1}</span><span>${r}</span></div>`).join("")}
        </div>` : ""}
    </div>`;
  }).join("");
}

/* ---- ANNUAL ---- */
function renderAnnual() {
  const medals = ["🥇","🥈","🥉","4️⃣","5️⃣"];
  const el = document.getElementById("annualList");
  el.innerHTML = [...yearlyData].reverse().map(y => `
    <div class="data-card">
      <div class="data-card-eyebrow">ANNUAL</div>
      <div class="data-card-title">${y.year}</div>
      <div class="data-card-time">⏱ ${y.minutes.toLocaleString()} 分 · ${y.songs.toLocaleString()} 曲</div>
      <hr class="data-card-divider">
      <div class="data-card-section">TOP ARTISTS</div>
      <div class="artist-list">
        ${[y.artist1,y.artist2,y.artist3,y.artist4,y.artist5].filter(Boolean).map((a,i) => `
          <div class="artist-row"><span class="artist-rank">${medals[i]}</span><span>${a}</span></div>`).join("")}
      </div>
    </div>`).join("");
}

/* ---- LIVE ---- */
function renderLive(filtered = null) {
  const data = filtered ?? [...liveData].reverse();
  document.getElementById("liveList").innerHTML =
    `<div class="live-grid">` +
    data.map(l => `
      <div class="live-card">
        <div class="live-card-left">
          <div class="live-card-year">${l.year}</div>
          <div class="live-card-date">${l.date}</div>
        </div>
        <div>
          <div class="live-card-artist">🎤 ${l.artist}</div>
          <div class="live-card-name">${l.live}</div>
        </div>
        <div class="live-card-icon">🎫</div>
      </div>`).join("") +
    `</div>`;
}

function populateLiveFilter() {
  const select = document.getElementById("liveYearFilter");
  [...new Set(liveData.map(l=>l.year))].sort((a,b)=>b-a).forEach(y => {
    const opt = document.createElement("option");
    opt.value = y; opt.textContent = y + "年";
    select.appendChild(opt);
  });
}

function filterLive() {
  const val = document.getElementById("liveYearFilter").value;
  renderLive(val === "all" ? [...liveData].reverse() : [...liveData].filter(l=>String(l.year)===val).reverse());
}

/* ---- CHART ---- */
function renderChart() {
  // ③ 直近5週に変更
  const last5 = weeklyData.slice(-5);
  const ctx = document.getElementById("weeklyChart").getContext("2d");
  if (chartInst) chartInst.destroy();

  const isDark = document.body.classList.contains("dark");
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const textColor = isDark ? "#8880aa" : "#7a7090";

  const grad = ctx.createLinearGradient(0,0,400,0);
  grad.addColorStop(0, "#a78bfa");
  grad.addColorStop(1, "#38bdf8");

  const gradBg = ctx.createLinearGradient(0,0,0,220);
  gradBg.addColorStop(0, "rgba(167,139,250,0.25)");
  gradBg.addColorStop(1, "rgba(56,189,248,0.02)");

  chartInst = new Chart(ctx, {
    type: "bar",
    data: {
      labels: last5.map(w => `${w.year}/${w.week}`),
      datasets: [{
        data: last5.map(w => w.minutes),
        backgroundColor: gradBg,
        borderColor: grad,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => `${c.parsed.y.toLocaleString()} 分` } }
      },
      scales: {
        x: { grid:{color:gridColor}, ticks:{color:textColor, font:{family:"'Space Mono'", size:11}} },
        y: { grid:{color:gridColor}, ticks:{color:textColor, font:{family:"'Space Mono'"}, callback: v=>v.toLocaleString()} }
      }
    }
  });
}

/* ---- THEME ---- */
function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  document.querySelector(".theme-btn").textContent = isDark ? "🌙" : "☀";
  renderChart();
}

/* ---- NAV ---- */
function showSection(id, btn) {
  document.querySelectorAll("main section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  document.querySelectorAll(".nav-pill").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
}
