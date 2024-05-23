const gameBoard = document.querySelector(".board");

const gameDB = [
  {
    teamName: "black",
    teamColor: "#e8cb81",
    currentTeam: true,
    titan: { location: `1,4` },
    cannon: { location: `1,6` },
    ricochet: { location: `4,8 `,rotation:2 },
    "half-ricochet": { location: `3,2`,rotation:4},
    tank: { location: `2,7` },
    timeLeft: 600,
  },
  {
    teamName: "white",
    teamColor: "#f2f2f2",
    currentTeam: false,
    titan: { location: `8,4` },
    cannon: { location: `8,8` },
    ricochet: { location: `7,2`,rotation:2},
    "half-ricochet": { location: `6,3`,rotation:3},
    tank: { location: `7,7` },
    timeLeft: 600,
  },
];

initializeBoard(gameDB);

startGame(gameDB)

