const weeklyUrl =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSPJOnhUFFyWx7838ZfQeAY1gemOhCvO_leTg8hwWMePG2kZ08_UnIQE2bHKTU18RkR5P5Ow5oHV5Xf/pub?output=csv";

let weeklyData = [];

fetch(weeklyUrl)
.then(r=>r.text())
.then(csv=>{

    const lines =
    csv.trim().split("\n");

    weeklyData =
    lines.slice(1).map(line=>{

        const cols =
        line.split(",");

        return{

    week: cols[0],
    minutes: Number(cols[1]),

    artist1: cols[2],
    artist2: cols[3],
    artist3: cols[4],

    song1: cols[5],
    song2: cols[6],
    song3: cols[7]
};
    });

    showWeekly();
    showStats();
});

function showWeekly(){

    const area =
    document.getElementById(
    "weeklyLog"
    );

    weeklyData
    .reverse()
    .forEach(item=>{

        area.innerHTML +=`

        <div class="log">

        <h3>${item.week}</h3>

        <p>
        ⏱️ ${item.minutes}分
        </p>

       <h4>TOP SONGS</h4>

<p>
🥇 ${item.song1}
 / ${item.artist1}
</p>

<p>
🥈 ${item.song2}
 / ${item.artist2}
</p>

<p>
🥉 ${item.song3}
 / ${item.artist3}
</p>

        </div>

        `;
    });
}

function showStats(){

    const totalMinutes =
    weeklyData.reduce(
        (sum,item)=>
        sum+item.minutes,
        0
    );

    document
    .getElementById(
    "totalMinutes"
    )
    .innerText=
    totalMinutes;

    document
    .getElementById(
    "totalWeeks"
    )
    .innerText=
    weeklyData.length;
}
