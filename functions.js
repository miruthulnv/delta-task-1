let bulletCurrentDirection;
let gameDB = [
  {
    coins: [
      "ricochet-1",
      "ricochet-2",
      "half-ricochet-1",
      "half-ricochet-2",
      "titan",
      "cannon",
      "tank",
    ],
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
    coins: [
      "ricochet-1",
      "ricochet-2",
      "half-ricochet-1",
      "half-ricochet-2",
      "titan",
      "cannon",
      "tank",
    ],
    teamName: "white",
    teamColor: "#f2f2f2",
    currentTeam: false,
    titan: { location: `8,4` },
    cannon: { location: `8,8` },
    "ricochet-1": { location: `7,2`, rotation: 2 },
    "ricochet-2": { location: `6,2`, rotation: 2 },
    "half-ricochet-1": { location: `7,3`, rotation: 3 },
    "half-ricochet-2": { location: `6,4`, rotation: 3 },
    tank: { location: `7,7` },
    timeLeft: 600,
  },
];
let;
let gameHistory = {};
gameHistory[0] = JSON.parse(JSON.stringify(gameDB));

let ball, timer;

class Bullet {
  constructor(DB) {
    this.DB = DB;
    this.bullet = document.createElement("div");
    bullet.classList.add("ball");
    document.body.append(bullet);
  }
  startBullet(DB) {
    const i = DB.indexOf(DB.find((team) => team.currentTeam === false));
    // Here current player is set to false because it will be switched in the moveCoin function already.
    const loc = DB[i].cannon.location;
    const box = document
      .querySelector(`.index--${loc.at(0)}-${loc.at(2)}`)
      .getBoundingClientRect();

    let x = box.x + (box.width - 8) / 2;
    let y = box.y + (box.height - 8) / 2;
    // console.log(x, y);
    if (DB[i].teamName === "black") {
      moveBullet(x, y, "down", DB, ball);
    } else if (DB[i].teamName === "white") {
      moveBullet(x, y, "up", DB, ball);
    }
  }

  moveBullet(x, y, direction, DB, ball) {
    stopGame();
    ball.style.top = y + "px";
    ball.style.left = x + "px";
    let bullet = new Audio("assets/sounds/bullet.wav");
    bullet.play();
    let request;
    const checkBallWithinBoundary = function () {
      const board = document.querySelector(".board").getBoundingClientRect();
      if (
        x <= board.x ||
        y <= board.y ||
        y >= board.height + board.y ||
        x >= board.width + board.x
      ) {
        console.log("Bullet went out of box !!! 🔥🔥🔥");
        startGame(DB);
        cancelAnimationFrame(request);
        ball.remove();
      }
    };
    const moveBulletDown = function () {
      request = requestAnimationFrame(moveBulletDown);
      y += 5;
      checkBallWithinBoundary();
      detectCollision(DB, x, y, request, ball);
      ball.style.top = Number(y) + "px";
    };
    const moveBulletUp = function () {
      request = requestAnimationFrame(moveBulletUp);
      y -= 5;
      checkBallWithinBoundary();
      detectCollision(DB, x, y, request, ball);
      ball.style.top = Number(y) + "px";
    };
    const moveBulletRight = function () {
      request = requestAnimationFrame(moveBulletRight);
      x += 5;
      checkBallWithinBoundary();
      detectCollision(DB, x, y, request, ball);
      ball.style.left = Number(x) + "px";
    };
    const moveBulletLeft = function () {
      request = requestAnimationFrame(moveBulletLeft);
      x -= 5;
      checkBallWithinBoundary();
      detectCollision(DB, x, y, request, ball);
      ball.style.left = Number(x) + "px";
    };
    bulletCurrentDirection = direction;
    if (direction === "down") {
      request = requestAnimationFrame(moveBulletDown);
      y += 5;
    } else if (direction === "up") {
      request = requestAnimationFrame(moveBulletUp);
      y -= 5;
    } else if (direction === "right") {
      request = requestAnimationFrame(moveBulletRight);
      x += 5;
    } else if (direction === "left") {
      request = requestAnimationFrame(moveBulletLeft);
      x -= 5;
    }
  }
}

function resetLeftAndRightButtons() {
  let newEl = leftBtn.cloneNode(true);
  leftBtn.parentNode.replaceChild(newEl, leftBtn);
  leftBtn = newEl;
  let anothernewEl = rightBtn.cloneNode(true);
  rightBtn.parentNode.replaceChild(anothernewEl, rightBtn);
  rightBtn = anothernewEl;
}

function stopGame() {
  let oldElement = document.querySelector(".board");
  let newElement = oldElement.cloneNode(true);
  oldElement.parentNode.replaceChild(newElement, oldElement);
  clearInterval(timer);
}

function positionCoins(DB) {
  // This function positions the coins in the board with the locations given the positions data
  // structure
  for (let team in DB) {
    for (let coin in DB[team]) {
      const x = DB[team][`${coin}`].location?.at(0);
      const y = DB[team][`${coin}`].location?.at(2);
      let coinImg = coin;
      (coin === "ricochet-1" || coin === "ricochet-2") &&
        (coinImg = "ricochet");
      (coin === "half-ricochet-1" || coin === "half-ricochet-2") &&
        (coinImg = "half-ricochet");
      if (x && y) {
        const el = document.getElementsByClassName(`index--${x}-${y}`);
        const rotateFactor = DB[team][`${coin}`]?.rotation - 1;
        // console.log(coin)
        el[0].insertAdjacentHTML(
          "afterbegin",
          `<div class = 'coin-container'>
          <img src="assets/${coinImg}.svg" alt="" class = "${coin}" height="20px"
          style = "transform: rotate(${rotateFactor * 90}deg)"
          ></div>`
        );
        el[0].firstChild.style.backgroundColor = DB[team].teamColor;
        el[0].firstChild.style.opacity = 0.9;
      }
    }
  }
}

function initializeBoard(DB) {
  // This function creates the grid in the html webpage and calls the PositionCoins to place the Coins
  let location = document.querySelector(`.board`);
  location.remove();
  location = document.createElement("div");
  location.className = "board";
  const parent = document.querySelector(".container");
  parent.insertBefore(location, document.querySelector(".bottom-bar"));
  let boxHtml = " ";
  //Code for Generating boxHtml for all 8 blocks and adding it to HTML
  //(${i},${j})
  for (let i = 1; i <= 8; i++) {
    for (let j = 1; j <= 8; j++) {
      boxHtml += `<div class="box index--${i}-${j}" m=${i} n=${j}></div>`;
    }
  }
  location.insertAdjacentHTML("afterbegin", boxHtml);
  positionCoins(DB);
  // console.log(boxHtml);
}

function resetBackground() {
  // This function is used to reset the background to primary after the highlight valid moves function
  const box = [...document.querySelectorAll(".box")];
  box.forEach((el) => {
    el.style.backgroundColor = "rgba(255, 174, 3, 0.6)";
  });
}

function highlightValidMoves(moves) {
  // This function is used to highlight the possible places in which the coin can be moved.

  resetBackground();
  moves.forEach((move) => {
    // console.log(move);
    const box = document.querySelector(`.index--${move[0]}-${move[1]}`);
    // console.log(`index--${move[0]}-${move[1]}`);
    box.style.backgroundColor = "#35ff69";
  });
}

function validMoves(loc, coin, pos) {
  // This function checks if the particular location has coins in it and returns the possible locations
  // the coins can move.
  const m = Number(loc.at(0));
  const n = Number(loc.at(1));
  let op = [
    [m + 1, n - 1],
    [m + 1, n],
    [m + 1, n + 1],
    [m, n - 1],
    [m, n + 1],
    [m - 1, n - 1],
    [m - 1, n],
    [m - 1, n + 1],
  ];
  if (coin === "cannon") {
    op = [
      [m, n - 1],
      [m, n + 1],
    ];
  }
  const moves = op.filter(
    (el) =>
      1 <= el[0] &&
      1 <= el[1] &&
      el[1] <= 8 &&
      el[0] <= 8 &&
      !pos.includes(`${el[0]},${el[1]}`)
  );
  // console.log(moves);
  highlightValidMoves(moves);
  return moves;
}

function moveCoin(movableLocations, DB, currentPlayer, coin, allBoxes, timer) {
  // This function is responsible for moving the coins and refreshing the screen after it

  movableLocations = movableLocations.map((loc) =>
    document.querySelector(`.index--${loc[0]}-${loc[1]}`)
  );
  const coinClicked = function (e) {
    currentMove += 1;
    console.group(`Coin Movement :${currentMove}`);
    console.log(
      `Coin ${coin} is moved to ${e.target.getAttribute(
        "m"
      )},${e.target.getAttribute("n")}`
    );
    resetLeftAndRightButtons();
    const box = e.target;
    const m = box.getAttribute("m");
    const n = box.getAttribute("n");
    const i = DB.indexOf(currentPlayer);
    DB[i][coin].location = `${m},${n}`;
    DB[i].currentTeam = false;
    DB[Math.abs(i - 1)].currentTeam = true;
    initializeBoard(DB);
    stopGame();
    // console.log(`Timer for ${currentPlayer.teamName} is ended`);
    clearInterval(timer);
    startGame(DB);
    startBullet(DB);

    //If the length of gameHistory is more than current move then delete the extra moves
    if (currentMove < Object.keys(gameHistory).length - 1) {
      const a = Object.keys(gameHistory).length;
      for (let i = currentMove; i < a; i++) {
        console.error(`Deleting gameHistory[${i}]`);
        delete gameHistory[i];
      }
    }
    gameHistory[currentMove] = JSON.parse(JSON.stringify(DB));

    displayGameHistory(gameHistory);
    console.groupEnd();
    // console.log(gameHistory)
  };
  movableLocations.forEach((box) => box.addEventListener("click", coinClicked));
  allBoxes.forEach((box) => {
    box.addEventListener("click", () => {
      movableLocations.forEach((box) => {
        box.removeEventListener("click", coinClicked);
      });
    });
  });
}

function startGame(DB) {
  //******************************************************************//
  // console.log(`Calling start game function`)
  const nodeListOfBoxes = [...document.querySelectorAll(`.box`)];
  const currentPlayer = DB.find((team) => team.currentTeam === true);
  const opponent = DB.find((team) => team.currentTeam === false);
  const locationsOfCurrentPlayer = [
    ...Object.values(currentPlayer)
      .map((el) => el?.location)
      .filter((el) => el !== undefined),
  ];
  const locationsOfOpponentPlayer = [
    ...Object.values(opponent)
      .map((el) => el?.location)
      .filter((el) => el !== undefined),
  ];
  // console.log(`Timer for ${currentPlayer.teamName} is started`);
  timer = runTimer(DB, currentPlayer.teamName);
  //******************************************************************//

  nodeListOfBoxes.forEach((box) => {
    const play = function () {
      //******************************************************************//
      const m = box.getAttribute("m");
      const n = box.getAttribute("n");
      //******************************************************************//
      if (locationsOfCurrentPlayer.includes(`${m},${n}`)) {
        const coin = box.firstChild.lastChild.getAttribute("class");
        leftBtn.style.visibility = "hidden";
        rightBtn.style.visibility = "hidden";
        if (
          coin === "ricochet-1" ||
          coin === "ricochet-2" ||
          coin === "half-ricochet-1" ||
          coin === "half-ricochet-2"
        ) {
          resetLeftAndRightButtons();
          rotate(coin, DB, currentPlayer.teamName);
        }
        // console.log(coin);
        const loc = [m, n];
        const pos = [...locationsOfCurrentPlayer, ...locationsOfOpponentPlayer];
        const highlighted = validMoves(loc, coin, pos);
        moveCoin(highlighted, DB, currentPlayer, coin, nodeListOfBoxes, timer);
      } else {
        resetBackground();
      }
    };
    box.addEventListener(`click`, play);
    // clearInterval(timer)
  });
}

function startBullet(DB) {
  const i = DB.indexOf(DB.find((team) => team.currentTeam === false));
  // Here current player is set to false because it will be switched in the moveCoin function already.
  const loc = DB[i].cannon.location;
  const box = document
    .querySelector(`.index--${loc.at(0)}-${loc.at(2)}`)
    .getBoundingClientRect();
  ball = document.createElement("div");
  ball.classList.add("ball");
  document.body.append(ball);
  let x = box.x + (box.width - 8) / 2;
  let y = box.y + (box.height - 8) / 2;
  // console.log(x, y);
  if (DB[i].teamName === "black") {
    moveBullet(x, y, "down", DB, ball);
  } else if (DB[i].teamName === "white") {
    moveBullet(x, y, "up", DB, ball);
  }
}

function moveBullet(x, y, direction, DB, ball) {
  stopGame();
  ball.style.top = y + "px";
  ball.style.left = x + "px";
  let bullet = new Audio("assets/sounds/bullet.wav");
  bullet.play();
  let request;
  const checkBallWithinBoundary = function () {
    const board = document.querySelector(".board").getBoundingClientRect();
    if (
      x <= board.x ||
      y <= board.y ||
      y >= board.height + board.y ||
      x >= board.width + board.x
    ) {
      console.log("Bullet went out of box !!! 🔥🔥🔥");
      startGame(DB);
      cancelAnimationFrame(request);
      ball.remove();
    }
  };
  const moveBulletDown = function () {
    request = requestAnimationFrame(moveBulletDown);
    y += 5;
    checkBallWithinBoundary();
    detectCollision(DB, x, y, request, ball);
    ball.style.top = Number(y) + "px";
  };
  const moveBulletUp = function () {
    request = requestAnimationFrame(moveBulletUp);
    y -= 5;
    checkBallWithinBoundary();
    detectCollision(DB, x, y, request, ball);
    ball.style.top = Number(y) + "px";
  };
  const moveBulletRight = function () {
    request = requestAnimationFrame(moveBulletRight);
    x += 5;
    checkBallWithinBoundary();
    detectCollision(DB, x, y, request, ball);
    ball.style.left = Number(x) + "px";
  };
  const moveBulletLeft = function () {
    request = requestAnimationFrame(moveBulletLeft);
    x -= 5;
    checkBallWithinBoundary();
    detectCollision(DB, x, y, request, ball);
    ball.style.left = Number(x) + "px";
  };
  bulletCurrentDirection = direction;
  if (direction === "down") {
    request = requestAnimationFrame(moveBulletDown);
    y += 5;
  } else if (direction === "up") {
    request = requestAnimationFrame(moveBulletUp);
    y -= 5;
  } else if (direction === "right") {
    request = requestAnimationFrame(moveBulletRight);
    x += 5;
  } else if (direction === "left") {
    request = requestAnimationFrame(moveBulletLeft);
    x -= 5;
  }
}

function getLocation(box) {
  const obj = box.getBoundingClientRect();
  const xFactor = (obj.width - 8) / 2;
  const x0 = obj.x + xFactor;
  const y0 = obj.y + xFactor;
  const x1 = obj.x + obj.width - xFactor;
  const y1 = obj.y + obj.height - xFactor;

  return [x0, x1, y0, y1];
}

function deleteCoin(DB, coin, teamName) {
  const team = teamName === "black" ? 0 : 1;
  delete DB[team][coin];
  const indexToRemove = DB[team].coins.indexOf(coin);
  DB[team].coins.splice(indexToRemove, 1);
  ball.remove();
  let destroy = new Audio("assets/sounds/half-ricochet-destroy.mp3");
  destroy.play();
  stopGame();
  initializeBoard(gameDB);
  startGame(gameDB);
}

function detectCollision(DB, x, y, request, ball) {
  // currentLocationOfBullet(x,y)
  DB.forEach((team) =>
    team.coins.forEach((coin) => {
      checkCollision(coin, team.teamName, x, y, DB, request, ball);
    })
  );
}

function checkCollision(coin, teamName, x, y, DB, request, ball) {
  const team = teamName === "black" ? 0 : 1;
  const piece = getLocation(
    document.querySelector(
      `.index--${DB[team][coin].location.at(0)}-${DB[team][coin].location.at(
        2
      )}`
    )
  );
  if (x <= piece[1] && y <= piece[3] && x >= piece[0] && y >= piece[2]) {
    console.log(
      `Collided with ${coin} at ${teamName}!! at ${x} and ${y} 🎯🎯🎯`
    );

    if (coin === "tank") {
      // stop the bullet and disappear the bullet
      cancelAnimationFrame(request);
      ball.remove();
      startGame(DB);
    }
    if (coin === "ricochet-1" || coin === "ricochet-2") {
      const loc = DB[team][coin].location;
      //Change the direction of the bullet
      const box = document
        .querySelector(`.index--${loc.at(0)}-${loc.at(2)}`)
        .getBoundingClientRect();
      let x = box.x + (box.width - 8) / 2;
      let y = box.y + (box.height - 8) / 2;
      cancelAnimationFrame(request);
      if (DB[team][coin].rotation === 1 || DB[team][coin].rotation === 3) {
        switch (bulletCurrentDirection) {
          case "down":
            bulletCurrentDirection = "right";
            break;
          case "up":
            bulletCurrentDirection = "left";
            break;
          case "right":
            bulletCurrentDirection = "down";
            break;
          case "left":
            bulletCurrentDirection = "up";
            break;
        }
      }
      if (DB[team][coin].rotation === 2 || DB[team][coin].rotation === 4) {
        switch (bulletCurrentDirection) {
          case "down":
            bulletCurrentDirection = "left";
            break;
          case "up":
            bulletCurrentDirection = "right";
            break;
          case "right":
            bulletCurrentDirection = "up";
            break;
          case "left":
            bulletCurrentDirection = "down";
            break;
        }
      }
      moveBullet(x, y, bulletCurrentDirection, DB, ball);

      // moveBullet(x,y,"right",DB)
    }
    if (coin === "half-ricochet-1" || coin === "half-ricochet-2") {
      const loc = DB[team][coin].location;
      const box = document
        .querySelector(`.index--${loc.at(0)}-${loc.at(2)}`)
        .getBoundingClientRect();
      let x = box.x + (box.width - 8) / 2;
      let y = box.y + (box.height - 8) / 2;
      cancelAnimationFrame(request);
      const destroy = function () {
        deleteCoin(DB, coin, teamName);
        // startGame(DB)
      };
      if (DB[team][coin]?.rotation === 2) {
        switch (bulletCurrentDirection) {
          case "down":
            bulletCurrentDirection = "right";
            break;
          case "up":
            //Destroy
            destroy();

            break;
          case "right":
            //Destroy
            destroy();

            break;
          case "left":
            bulletCurrentDirection = "up";
            break;
        }
      }
      if (DB[team][coin]?.rotation === 3) {
        switch (bulletCurrentDirection) {
          case "down":
            //Destroy
            destroy();

            break;
          case "up":
            bulletCurrentDirection = "right";
            break;
          case "right":
            //down
            destroy();

            break;
          case "left":
            bulletCurrentDirection = "down";
            break;
        }
      }
      if (DB[team][coin]?.rotation === 4) {
        switch (bulletCurrentDirection) {
          case "down":
            //Destroy
            destroy();

            break;
          case "up":
            bulletCurrentDirection = "left";
            break;
          case "right":
            bulletCurrentDirection = "down";
            break;
          case "left":
            //Destroy
            destroy();

            break;
        }
      }
      if (DB[team][coin]?.rotation === 1) {
        switch (bulletCurrentDirection) {
          case "down":
            bulletCurrentDirection = "left";
            break;
          case "up":
            //Destroy
            destroy();

            break;
          case "right":
            bulletCurrentDirection = "up";
            break;
          case "left":
            //Destroy
            destroy();

            break;
        }
      }
      if (DB[team][coin]) {
        moveBullet(x, y, bulletCurrentDirection, DB, ball);
      }
    }
    if (coin === "titan") {
      let gameOver = new Audio("assets/sounds/game-over-2.wav");
      gameOver.play();
      ball.remove();
      if (teamName === "black") {
        console.log("White won the game");
      } else if (teamName === "white") {
        console.log("Black won the game");
      }

      stopGame();
    }
  }
}

function runTimer(DB, currentTeam) {
  currentTeam = currentTeam === "black" ? 0 : 1;
  let timerElement = document.querySelector(
    `.timer-${DB[currentTeam].teamName}`
  );
  // console.log(`${currentTeam} , ${DB[currentTeam].timeLeft}`);
  return setInterval(() => {
    DB[currentTeam].timeLeft--;
    // console.log(`${currentTeam} , ${DB[currentTeam].timeLeft}`);
    let seconds = DB[currentTeam].timeLeft % 60;
    if (seconds < 10) seconds = "0" + seconds;
    let minutes = Math.floor(DB[currentTeam].timeLeft / 60);
    timerElement.innerHTML = `${minutes}:${seconds}`;
  }, 1000);
}

function rotate(coin, DB, teamName) {
  const teamNumber = teamName === "black" ? 0 : 1;
  leftBtn.style.visibility = "visible";
  rightBtn.style.visibility = "visible";

  const finishRotate = function (buttonName) {
    currentMove++;
    stopGame();
    DB[teamNumber].currentTeam = false;
    DB[Math.abs(teamNumber - 1)].currentTeam = true;
    initializeBoard(DB);
    startGame(DB);
    startBullet(DB);
    gameHistory[currentMove] = JSON.parse(JSON.stringify(DB));
    displayGameHistory(gameHistory);
  };

  leftBtn.addEventListener("click", function temp() {
    //Rotate the coin to left
    DB[teamNumber][coin].rotation = DB[teamNumber][coin].rotation - 1;
    if (DB[teamNumber][coin].rotation > 4) DB[teamNumber][coin].rotation %= 4;
    finishRotate(leftBtn);
    resetLeftAndRightButtons();
  });
  rightBtn.addEventListener("click", function temp() {
    //Rotate the coin to left
    DB[teamNumber][coin].rotation = DB[teamNumber][coin].rotation + 1;
    if (DB[teamNumber][coin].rotation > 4) DB[teamNumber][coin].rotation %= 4;
    finishRotate(rightBtn);
    resetLeftAndRightButtons();
  });
}

function initializeButtons() {
  //Undo
  btnUndo.addEventListener("click", () => {
    // console.log('Undo was clicked')
    if (currentMove > 1) {
      stopGame();
      initializeBoard(gameHistory[currentMove - 1]);
      startGame(gameHistory[currentMove - 1]);
      currentMove -= 1;
      console.group(`Undo Move to : ${currentMove}`);
      displayGameHistory(gameHistory);
      console.groupEnd();
    }
  });
  //Redo
  btnRedo.addEventListener("click", () => {
    const len = Object.keys(gameHistory).length;
    if (currentMove < len - 1) {
      stopGame();
      initializeBoard(gameHistory[currentMove + 1]);
      startGame(gameHistory[currentMove + 1]);
      currentMove++;
      console.group(`Redo Move to : ${currentMove}`);
      displayGameHistory(gameHistory);
      console.groupEnd();
    }
  });
  //Reset
  resetBtn.addEventListener("click", () => {
    // console.log('Reset button clicked')
    stopGame();
    gameDB = gameHistory[0];
    gameHistory = { 0: gameDB };
    initializeBoard(gameDB);
    startGame(gameDB);
  });
  //Pause
  pauseBtn.addEventListener("click", () => {
    console.log("Pause button clicked");
    if (pauseBtn.innerHTML === "Pause") {
      stopGame();
      pauseBtn.innerHTML = "Resume";
    } else if (pauseBtn.innerHTML === "Resume") {
      startGame(gameDB);
      pauseBtn.innerHTML = "Pause";
    }
  });
}

function currentLocationOfBullet(x, y) {
  console.log(x, y);
  const box = [502.6458435058594, 510.6458435058594, 233.90625, 241.90625];
  if (x >= box[0] && x <= box[1] && y >= box[2] && y <= box[3]) {
    console.log(
      `${x}>=${box[0]} && ${x}<=${box[1]} && ${y}>=${box[2]} && ${y}<=${box[3]}`
    );
  }
  // allBoxes.filter();
  // console.log(allBoxes);
}

function displayGameHistory(gameHistory1) {
  let gameHistory = JSON.parse(JSON.stringify(gameHistory1));
  Object.values(gameHistory).forEach((DB, i) => {
    console.log(`Move ${i}`);
    DB[0].coins.forEach(
      (coin) =>
        (DB[0][coin] = DB[0][coin].location + " " + DB[0][coin].rotation)
    );
    DB[1].coins.forEach(
      (coin) =>
        (DB[1][coin] = DB[1][coin].location + " " + DB[1][coin].rotation)
    );
    console.table(DB);
  });
}
initializeBoard(gameDB);

startGame(gameDB);

initializeButtons();
