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
.then(([weeklyCsv, yearCsv, liveCsv]) => {

```
loadWeekly(weeklyCsv);
loadYear(yearCsv);
loadLive(liveCsv);

updateDashboard();

displayWeekly();
displayAnnual();
displayLive();
```

});

function parseCSV(csv){

```
const lines =
    csv.trim().split("\n");

return lines.slice(1).map(
    line => line.split(",")
);
```

}

function loadWeekly(csv){

```
const rows =
    parseCSV(csv);

weeklyData =
    rows.map(cols => ({

        year: cols[0] || "",

        week: cols[1] || "",

        minutes:
            Number(cols[2]) || 0,

        topArtist1: cols[3] || "",
        topArtist2: cols[4] || "",
        topArtist3: cols[5] || "",

        repeat1: cols[6] || "",
        repeatArtist1: cols[7] || "",

        repeat2: cols[8] || "",
        repeatArtist2: cols[9] || "",

        repeat3: cols[10] || "",
        repeatArtist3: cols[11] || ""

    }));
```

}

function loadYear(csv){

```
const rows =
    parseCSV(csv);

yearlyData =
    rows.map(cols => ({

        year: cols[0],

        minutes:
            Number(cols[1]) || 0,

        songCount:
            Number(cols[2]) || 0,

        artist1: cols[3] || "",
        artist2: cols[4] || "",
        artist3: cols[5] || "",
        artist4: cols[6] || "",
        artist5: cols[7] || ""

    }));
```

}

function loadLive(csv){

```
const rows =
    parseCSV(csv);

liveData =
    rows.map(cols => ({

        year: cols[0] || "",

        date: cols[1] || "",

        artist: cols[2] || "",

        live: cols[3] || ""

    }));
```

}

function getMostSeenArtist(){

```
const counts = {};

liveData.forEach(item => {

    counts[item.artist] =
        (counts[item.artist] || 0)
        \+ 1;

});

let artist = "-";
let count = 0;

Object.entries(counts)
    .forEach(([name,num]) => {

        if(num > count){

            artist = name;
            count = num;

        }

    });

return {
    artist,
    count
};
```

}

function updateDashboard(){

```
const yearMinutes =
    yearlyData.reduce(
        (sum,row)=>
            sum + row.minutes,
        0
    );

const weeklyMinutes =
    weeklyData.reduce(
        (sum,row)=>
            sum + row.minutes,
        0
    );

const totalMinutes =
    yearMinutes + weeklyMinutes;

document
    .getElementById("totalMinutes")
    .innerText =
    totalMinutes.toLocaleString() + "分";

const days =
    (totalMinutes / 60 / 24)
    .toFixed(1);

document
    .getElementById("totalDays")
    .innerText =
    `約${days}日`;

document
    .getElementById("weekCount")
    .innerText =
    weeklyData.length;

document
    .getElementById("liveCount")
    .innerText =
    liveData.length;

document
    .getElementById("yearCount")
    .innerText =
    yearlyData.length;

document
    .getElementById("currentMinutes")
    .innerText =
    weeklyMinutes.toLocaleString() + "分";

const mostSeen =
    getMostSeenArtist();

const artistEl =
    document.getElementById(
        "mostSeenArtist"
    );

const countEl =
    document.getElementById(
        "mostSeenCount"
    );

if(artistEl){

    artistEl.innerText =
        mostSeen.artist;

}

if(countEl){

    countEl.innerText =
        `${mostSeen.count}回`;

}

const latest =
    weeklyData[
        weeklyData.length - 1
    ];

const latestEl =
    document.getElementById(
        "latestWeek"
    );

if(latestEl && latest){

    latestEl.innerHTML = `

    <p>${latest.year} / ${latest.week}</p>

    <br>

    <p>
        ⏱️
        ${latest.minutes.toLocaleString()}分
    </p>

    <br>

    <p>
        🥇 ${latest.topArtist1}
    </p>

    <p>
        🎵 ${latest.repeat1}
    </p>

    `;

}
```

}

function displayWeekly(){

```
const area =
    document.getElementById(
        "weeklyList"
    );

area.innerHTML = "";

[...weeklyData]
.reverse()
.forEach(item => {

    area.innerHTML += `

    <div class="card">

        <h3>
            ${item.year}
            /
            ${item.week}
        </h3>

        <p>
            ⏱️
            ${item.minutes.toLocaleString()}分
        </p>

        <br>

        <strong>
            TOP ARTISTS
        </strong>

        <div class="rank">
            🥇 ${item.topArtist1}
        </div>

        <div class="rank">
            🥈 ${item.topArtist2}
        </div>

        <div class="rank">
            🥉 ${item.topArtist3}
        </div>

        <br>

        <strong>
            TOP SONGS
        </strong>

        <div class="rank">
            🥇 ${item.repeat1}
            /
            ${item.repeatArtist1}
        </div>

        <div class="rank">
            🥈 ${item.repeat2}
            /
            ${item.repeatArtist2}
        </div>

        <div class="rank">
            🥉 ${item.repeat3}
            /
            ${item.repeatArtist3}
        </div>

    </div>

    `;
});
```

}

function displayAnnual(){

```
const area =
    document.getElementById(
        "annualList"
    );

area.innerHTML = "";

[...yearlyData]
.reverse()
.forEach(item => {

    area.innerHTML += `

    <div class="card">

        <h3>${item.year}</h3>

        <p>
            ⏱️
            ${item.minutes.toLocaleString()}分
        </p>

        <p>
            🎵
            ${item.songCount.toLocaleString()}曲
        </p>

        <br>

        <strong>
            TOP ARTISTS
        </strong>

        <div class="rank">
            🥇 ${item.artist1}
        </div>

        <div class="rank">
            🥈 ${item.artist2}
        </div>

        <div class="rank">
            🥉 ${item.artist3}
        </div>

        <div class="rank">
            4️⃣ ${item.artist4}
        </div>

        <div class="rank">
            5️⃣ ${item.artist5}
        </div>

    </div>

    `;
});
```

}

function displayLive(){

```
const area =
    document.getElementById(
        "liveList"
    );

area.innerHTML = "";

[...liveData]
.reverse()
.forEach(item => {

    area.innerHTML += `

    <div class="card">

        <h3>${item.date}</h3>

        <p>
            🎫 ${item.artist}
        </p>

        <p>
            ${item.live}
        </p>

    </div>

    `;
});
```

}

function showSection(id){

```
document
    .querySelectorAll("main section")
    .forEach(section => {

        section.classList.add(
            "hidden"
        );

    });

document
    .getElementById(id)
    .classList.remove(
        "hidden"
    );
```

}
