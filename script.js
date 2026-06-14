const weeklyUrl =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSPJOnhUFFyWx7838ZfQeAY1gemOhCvO_leTg8hwWMePG2kZ08_UnIQE2bHKTU18RkR5P5Ow5oHV5Xf/pub?gid=0&single=true&output=csv";

const yearUrl =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSPJOnhUFFyWx7838ZfQeAY1gemOhCvO_leTg8hwWMePG2kZ08_UnIQE2bHKTU18RkR5P5Ow5oHV5Xf/pub?gid=575136021&single=true&output=csv";

const liveUrl =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSPJOnhUFFyWx7838ZfQeAY1gemOhCvO_leTg8hwWMePG2kZ08_UnIQE2bHKTU18RkR5P5Ow5oHV5Xf/pub?gid=1117584699&single=true&output=csv";

let weeklyData = [];
let yearlyData = [];
let liveData = [];

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
});

function parseCSV(csv) {
    return csv.trim().split("\n").slice(1).map(l => l.split(","));
}

/* Weekly */
function parseWeekly(csv) {
    return parseCSV(csv).map(c => ({
        year: c[0],
        week: c[1],
        minutes: Number(c[2]) || 0,
        topArtist1: c[3],
        topArtist2: c[4],
        topArtist3: c[5]
    }));
}

/* Year */
function parseYear(csv) {
    return parseCSV(csv).map(c => ({
        year: c[0],
        minutes: Number(c[1]) || 0,
        songs: Number(c[2]) || 0
    }));
}

/* Live（YYYY-MM-DD対応） */
function parseLive(csv) {
    return parseCSV(csv).map(c => {
        const date = new Date(c[1]); // ここ重要

        return {
            year: date.getFullYear(),
            date: c[1],
            artist: c[2],
            live: c[3]
        };
    });
}

function renderAll() {
    updateDashboard();
    renderWeekly();
    renderAnnual();
    renderLive();
    renderChart();
}

/* Dashboard */
function updateDashboard() {
    const total =
        yearlyData.reduce((a,b)=>a+b.minutes,0) +
        weeklyData.reduce((a,b)=>a+b.minutes,0);

    document.getElementById("totalMinutes").innerText =
        total.toLocaleString() + "分";

    document.getElementById("weekCount").innerText = weeklyData.length;
    document.getElementById("yearCount").innerText = yearlyData.length;
    document.getElementById("liveCount").innerText = liveData.length;
}

/* Weekly */
function renderWeekly() {
    const el = document.getElementById("weeklyList");

    el.innerHTML = [...weeklyData]
        .reverse()
        .map(w => `
        <div class="card">
            <h3>${w.year} / ${w.week}</h3>
            <p>${w.minutes}分</p>
        </div>
    `).join("");
}

/* Annual */
function renderAnnual() {
    const el = document.getElementById("annualList");

    el.innerHTML = [...yearlyData]
        .reverse()
        .map(y => `
        <div class="card">
            <h3>${y.year}</h3>
            <p>${y.minutes}分 / ${y.songs}曲</p>
        </div>
    `).join("");
}

/* Live */
function renderLive() {
    const el = document.getElementById("liveList");

    el.innerHTML = [...liveData]
        .reverse()
        .map(l => `
        <div class="card">
            <p>${l.date}（${l.year}年）</p>
            <p>${l.artist}</p>
            <p>${l.live}</p>
        </div>
    `).join("");
}

/* グラフ（簡易版） */
function renderChart() {
    const el = document.createElement("div");
    el.className = "hero-card";

    const last10 = weeklyData.slice(-10);

    el.innerHTML = `
        <h2>Weekly Trend</h2>
        ${last10.map(w => `
            <div>${w.week} : ${w.minutes}分</div>
        `).join("")}
    `;

    document.getElementById("dashboard").appendChild(el);
}

/* nav */
function showSection(id) {
    document.querySelectorAll("main section")
        .forEach(s => s.classList.add("hidden"));

    document.getElementById(id).classList.remove("hidden");
}
