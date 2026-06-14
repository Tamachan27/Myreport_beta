const weeklyUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSPJOnhUFFyWx7838ZfQeAY1gemOhCvO_leTg8hwWMePG2kZ08_UnIQE2bHKTU18RkR5P5Ow5oHV5Xf/pub?gid=0&single=true&output=csv";

const yearUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSPJOnhUFFyWx7838ZfQeAY1gemOhCvO_leTg8hwWMePG2kZ08_UnIQE2bHKTU18RkR5P5Ow5oHV5Xf/pub?gid=575136021&single=true&output=csv";

const liveUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSPJOnhUFFyWx7838ZfQeAY1gemOhCvO_leTg8hwWMePG2kZ08_UnIQE2bHKTU18RkR5P5Ow5oHV5Xf/pub?gid=1117584699&single=true&output=csv";

let weeklyData = [];
let yearlyData = [];
let liveData = [];
let weeklyChartInstance = null;

/* =========================
   FETCH & INIT
========================= */
Promise.all([
  fetch(weeklyUrl).then(r => r.text()),
  fetch(yearUrl).then(r => r.text()),
  fetch(liveUrl).then(r => r.text())
])
  .then(([w, y, l]) => {
    weeklyData = parseWeekly(w);
    yearlyData = parseYear(y);
    liveData = parseLive(l);
    renderAll();
  })
  .catch(err => console.error("データ取得エラー:", err));

/* =========================
   CSV PARSE
========================= */
function parseCSV(csv) {
  return csv.trim().split("\n").slice(1).map(l => l.split(","));
}

function parseWeekly(csv) {
  return parseCSV(csv).map(c => ({
    year: c[0] || "",
    week: c[1] || "",
    minutes: Number(c[2]) || 0,
    topArtist1: c[3] || "",
    topArtist2: c[4] || "",
    topArtist3: c[5] || "",
    repeat1: c[6] || "",
    repeatArtist1: c[7] || ""
  }));
}

function parseYear(csv) {
  return parseCSV(csv).map(c => ({
    year: c[0] || "",
    minutes: Number(c[1]) || 0,
    songs: Number(c[2]) || 0,
    artist1: c[3] || "",
    artist2: c[4] || "",
    artist3: c[5] || "",
    artist4: c[6] || "",
    artist5: c[7] || ""
  }));
}

/* ② years列(c[0])から年を取得 */
function parseLive(csv) {
  return parseCSV(csv).map(c => ({
    year: c[0] || "",   // ② スプレッドシートの Years 列
    date: c[1] || "",
    artist: c[2] || "",
    live: c[3] || ""
  }));
}

/* =========================
   RENDER ALL
========================= */
function renderAll() {
  updateDashboard();
  renderWeekly();
  renderAnnual();
  renderLive();
  renderChart();
  populateLiveFilter();
}

/* =========================
   DASHBOARD
========================= */
function updateDashboard() {
  const totalMin =
    yearlyData.reduce((a, b) => a + b.minutes, 0) +
    weeklyData.reduce((a, b) => a + b.minutes, 0);

  document.getElementById("totalMinutes").innerText =
    totalMin.toLocaleString() + " 分";

  const days = Math.floor(totalMin / 60 / 24);
  const hours = Math.floor((totalMin / 60) % 24);
  document.getElementById("totalDays").innerText =
    `約 ${days} 日 ${hours} 時間`;

  document.getElementById("weekCount").innerText = weeklyData.length;
  document.getElementById("yearCount").innerText = yearlyData.length;
  document.getElementById("liveCount").innerText = liveData.length;

  // Most Seen Artist
  const counts = {};
  liveData.forEach(l => {
    if (l.artist) counts[l.artist] = (counts[l.artist] || 0) + 1;
  });
  let best = "-", max = 0;
  Object.entries(counts).forEach(([name, num]) => {
    if (num > max) { best = name; max = num; }
  });
  document.getElementById("mostSeenArtist").innerText = best;
  document.getElementById("mostSeenCount").innerText = max + " 回";

  // 今年の再生時間
  const currentYear = new Date().getFullYear().toString();
  const thisYear = yearlyData.find(y => y.year === currentYear);
  document.getElementById("currentMinutes").innerText = thisYear
    ? thisYear.minutes.toLocaleString() + " 分"
    : "記録なし";

  // Latest Week
  const latest = weeklyData[weeklyData.length - 1];
  if (latest) {
    const artists = [latest.topArtist1, latest.topArtist2, latest.topArtist3].filter(Boolean);
    document.getElementById("latestWeek").innerHTML = `
      <div class="latest-week-content">
        <div class="latest-week-time">${latest.minutes.toLocaleString()} 分</div>
        <div class="latest-week-label">${latest.year} / ${latest.week}</div>
        <div class="latest-artists">
          ${artists.map((a, i) => `
            <div class="latest-artist-row">
              <span class="rank-badge">#${i + 1}</span>
              <span>${a}</span>
            </div>
          `).join("")}
        </div>
        ${latest.repeatArtist1 ? `
          <div style="margin-top:10px;font-size:12px;color:var(--text-muted);">
            🔁 リピート : <strong>${latest.repeatArtist1}</strong>（${latest.repeat1}）
          </div>
        ` : ""}
      </div>
    `;
  }
}

/* =========================
   WEEKLY
========================= */
function renderWeekly() {
  const el = document.getElementById("weeklyList");
  el.innerHTML = [...weeklyData].reverse().map(w => `
    <div class="card">
      <div class="card-eyebrow">WEEKLY</div>
      <div class="card-title">${w.year} / ${w.week}</div>
      <div class="card-time">⏱ ${w.minutes.toLocaleString()} 分</div>

      <hr class="card-divider">
      <div class="card-section-label">TOP ARTISTS</div>
      <div class="artist-list">
        ${[w.topArtist1, w.topArtist2, w.topArtist3]
          .filter(Boolean)
          .map((a, i) => `
            <div class="artist-row">
              <span class="artist-rank">#${i + 1}</span>
              <span>${a}</span>
            </div>
          `).join("")}
      </div>

      ${w.repeatArtist1 ? `
        <div class="card-repeat">
          🔁 ${w.repeatArtist1} <span style="opacity:0.6;">— ${w.repeat1}</span>
        </div>
      ` : ""}
    </div>
  `).join("");
}

/* =========================
   ANNUAL
========================= */
function renderAnnual() {
  const el = document.getElementById("annualList");
  const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
  el.innerHTML = [...yearlyData].reverse().map(y => `
    <div class="card">
      <div class="card-eyebrow">ANNUAL</div>
      <div class="card-title">${y.year}</div>
      <div class="card-time">⏱ ${y.minutes.toLocaleString()} 分 · ${y.songs.toLocaleString()} 曲</div>

      <hr class="card-divider">
      <div class="card-section-label">TOP ARTISTS</div>
      <div class="artist-list">
        ${[y.artist1, y.artist2, y.artist3, y.artist4, y.artist5]
          .filter(Boolean)
          .map((a, i) => `
            <div class="artist-row">
              <span class="artist-rank">${medals[i]}</span>
              <span>${a}</span>
            </div>
          `).join("")}
      </div>
    </div>
  `).join("");
}

/* =========================
   LIVE（③ 見やすいリスト形式）
========================= */
function renderLive(filtered = null) {
  const el = document.getElementById("liveList");
  const data = filtered ?? [...liveData].reverse();

  el.innerHTML = `<div class="live-grid">` + data.map(l => `
    <div class="live-card">
      <div class="live-card-date">
        <div class="live-card-year">${l.year}</div>
        ${l.date}
      </div>
      <div>
        <div class="live-card-artist">🎤 ${l.artist}</div>
        <div class="live-card-name">${l.live}</div>
      </div>
      <div class="live-card-icon">🎫</div>
    </div>
  `).join("") + `</div>`;
}

function populateLiveFilter() {
  const select = document.getElementById("liveYearFilter");
  const years = [...new Set(liveData.map(l => l.year))].sort((a, b) => b - a);
  years.forEach(y => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y + "年";
    select.appendChild(opt);
  });
}

function filterLive() {
  const val = document.getElementById("liveYearFilter").value;
  if (val === "all") {
    renderLive([...liveData].reverse());
  } else {
    renderLive([...liveData].filter(l => String(l.year) === val).reverse());
  }
}

/* =========================
   CHART (Chart.js)
========================= */
function renderChart() {
  const last10 = weeklyData.slice(-10);
  const labels = last10.map(w => `${w.week}`);
  const values = last10.map(w => w.minutes);

  const ctx = document.getElementById("weeklyChart").getContext("2d");
  if (weeklyChartInstance) weeklyChartInstance.destroy();

  const isDark = document.body.classList.contains("dark");
  const accentColor = isDark ? "#7c6aff" : "#5b48e8";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const textColor = isDark ? "#7a7890" : "#6b6882";

  weeklyChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: accentColor + "55",
        borderColor: accentColor,
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.y.toLocaleString()} 分`
          }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { family: "'Space Mono'" } }
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            font: { family: "'Space Mono'" },
            callback: v => v.toLocaleString()
          }
        }
      }
    }
  });
}

/* =========================
   DARK MODE TOGGLE（① デフォルトはライト）
========================= */
function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  document.getElementById("themeIcon").textContent = isDark ? "☀️" : "🌙";
  document.querySelector(".theme-toggle").childNodes[1].textContent =
    isDark ? " Light Mode" : " Dark Mode";
  renderChart();
}

/* =========================
   NAV
========================= */
function showSection(id, btn) {
  document.querySelectorAll("main section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
}
