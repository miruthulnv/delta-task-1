const gameBoard = document.querySelector(".board");

const gameDB = [
  {
    teamName: "black",
    teamColor: "#e8cb81",
    currentTeam: true,
    titan: { location: `1,4` },
    cannon: { location: `1,6` },
    ricochet: { location: `2,2` },
    "half-ricochet": { location: `3,2` },
    tank: { location: `2,7` },
  },
  {
    teamName: "white",
    teamColor: "#f2f2f2",
    currentTeam: false,
    titan: { location: `8,4` },
    cannon: { location: `8,8` },
    ricochet: { location: `7,2` },
    "half-ricochet": { location: `6,3` },
    tank: { location: `7,7` },
  },
];

initializeBoard(gameBoard, gameDB);

const boxes = [...document.querySelectorAll(`.box`)];

startGame(boxes, gameDB)

