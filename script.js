const weeklyUrl =
"ここにWeeklyLogのCSV";

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

            week:cols[0],
            minutes:Number(cols[1]),

            repeatSong:cols[2],

            favoriteSong:cols[3],

            memo:cols[4]
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

        <p>
        🔁 ${item.repeatSong}
        </p>

        <p>
        💗 ${item.favoriteSong}
        </p>

        <p>
        📝 ${item.memo}
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
