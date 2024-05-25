let bulletCurrentDirection;
let gameDB = [
    {
        coins : ["ricochet-1", "ricochet-2", "half-ricochet-1", "half-ricochet-2","titan","cannon","tank"],
        teamName: "black",
        teamColor: "#e8cb81",
        currentTeam: true,
        titan: { location: `1,4` },
        cannon: { location: `1,6` },
        "ricochet-1": { location: `4,8`, rotation: 3 },
        "ricochet-2": { location: `3,8`, rotation: 2 },
        "half-ricochet-1": { location: `2,2`, rotation: 3 },
        "half-ricochet-2": { location: `3,2`, rotation: 4 },
        tank: { location: `2,7` },
        timeLeft: 600,
    },
    {
        coins : ["ricochet-1", "ricochet-2", "half-ricochet-1", "half-ricochet-2","titan","cannon","tank"],
        teamName: "white",
        teamColor: "#f2f2f2",
        currentTeam: false,
        titan: { location: `8,4` },
        cannon: { location: `8,8` },
        "ricochet-1": { location: `7,2`, rotation: 2 },
        "ricochet-2": { location: `6,2`, rotation: 2 },
        "half-ricochet-1": { location: `7,3`, rotation: 3},
        "half-ricochet-2": { location: `6,4`, rotation: 3 },
        tank: { location: `7,7` },
        timeLeft: 600,
    },
];
let currentMove = 0;
let gameHistory = {};
gameHistory[0] = JSON.parse(JSON.stringify(gameDB));

