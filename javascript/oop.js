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
    currentTeam: false,
    titan: { location: `1,4`, hitpoints: 534, damage: 267 },
    cannon: { location: `1,6` },
    "ricochet-1": { location: `4,8`, rotation: 3 },
    "ricochet-2": { location: `3,8`, rotation: 2 },
    "half-ricochet-1": {
      location: `2,2`,
      rotation: 3,
      hitpoints: 492,
      damage: 164,
    },
    "half-ricochet-2": {
      location: `3,2`,
      rotation: 4,
      hitpoints: 492,
      damage: 164,
    },
    tank: { location: `2,7`, hitpoints: 555, damage: 37 },
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
    currentTeam: true,
    titan: { location: `8,4`, hitpoints: 534, damage: 267 },
    cannon: { location: `8,8` },
    "ricochet-1": { location: `7,2`, rotation: 2 },
    "ricochet-2": { location: `6,4`, rotation: 2 },
    "half-ricochet-1": {
      location: `7,3`,
      rotation: 3,
      hitpoints: 492,
      damage: 164,
    },
    "half-ricochet-2": {
      location: `6,2`,
      rotation: 3,
      hitpoints: 492,
      damage: 164,
    },
    tank: { location: `7,7`, hitpoints: 555, damage: 37 },
    timeLeft: 600,
  },
];

/**
Attributes:

DB: The database object.
currentMove: The current move number.
gameHistory: An object representing the game history.
timer: A timer variable.
location: The location of the game board.
leftBtn: The left rotate button element.
rightBtn: The right rotate button element.
resetBtn: The reset button element.
pauseBtn: The pause button element.
btnUndo: The undo button element.
btnRedo: The redo button element.
nodeListOfBoxes: A list of box elements representing the game board.
currentPlayer: The current player object.
teamNumber: The team number of the current player.
opponent: The opponent player object.
locationsOfCurrentPlayer: An array of locations of the current player's coins.
locationsOfOpponentPlayer: An array of locations of the opponent player's coins.
occupiedPositions: An array of occupied positions on the game board.

Methods:

constructor(DB): Initializes the game board.
initializeBoard(DB): Initializes the game board with the provided database object.
initializeButtons(): Initializes the buttons and attaches event listeners to them.
displayGameHistory(): Displays the game history in the console.
positionCoins(DB): Positions the coins on the game board based on the provided database object.
refreshBoard(DB): Refreshes the game board with the provided database object.
startGame(DB): Starts the game and initializes the game state.
getLocations(player): Retrieves the locations of the player's elements.
validMoves(loc): Checks if a location has coins and returns the possible locations the coins can move to.
highlightValidMoves(moves): Highlights the valid moves on the game board.
moveCoin(movableLocations): Moves the coins and refreshes the screen after the movement.
highlightCurrentPlayer(): Highlights the current player.
resetBackground(): Resets the background color of all boxes to the primary color.
rotate(): Rotates the coin and updates the game state.
deleteCoin(): Deletes a coin from the game.
resetLeftAndRightButtons(): Resets the left and right buttons.
stopGame(): Stops the game and clears the board.
 */
class GameBoard {
  /**
   * Initializes the game board.
   * @param {DB} DB - The database object.
   */
  constructor(DB) {
    this.DB = DB;
    this.currentMove = 0;
    this.randomizeBoard();
    this.initializeBoard(this.DB);
    this.initializeButtons();
    this.startGame(this.DB);
    this.gameHistory = { 0: JSON.parse(JSON.stringify(this.DB)) };
  }

  /**
   * Initializes the game board.
   * @param {DB} DB - The database object.
   */
  initializeBoard(DB) {
    this.location = document.querySelector(`.board`);
    let boxHtml = " ";
    for (let i = 1; i <= 8; i++) {
      for (let j = 1; j <= 8; j++) {
        boxHtml += `<div class="box index--${i}-${j}" m=${i} n=${j}></div>`;
      }
    }
    this.location.insertAdjacentHTML("afterbegin", boxHtml);
    for (let i = 1; i <= 8; i++) {
      for (let j = 1; j <= 8; j++) {
        if ((i + j) % 2 === 0) {
          document.querySelector(`.index--${i}-${j}`).style.backgroundColor =
            "#ffae03";
        }
      }
    }
    this.positionCoins(DB);
  }

  generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  randomizeBoard() {
    const loc = [];
    const team1 = this.DB[0];
    const team2 = this.DB[1];
    let i = 0;
    while (i < team1.coins.length) {
      let coin = team1.coins[i];

      let x = this.generateRandomNumber(3, 6);
      let y = this.generateRandomNumber(1, 8);
      if (!loc.includes(`${x},${y}`)) {
        if (coin === "cannon" || coin === "titan") {
          if (loc.includes(`${1},${y}`)) continue;
          team1[coin].location = `${1},${y}`;
          loc.push(`${1},${y}`);
        } else team1[coin].location = `${x},${y}`;
        console.log(`${coin}:${x},${y}`);
        loc.push(`${x},${y}`);
        i += 1;
      }
    }
    i = 0;
    while (i < team2.coins.length) {
      let coin = team2.coins[i];

      let x = this.generateRandomNumber(3, 6);
      let y = this.generateRandomNumber(1, 8);
      if (!loc.includes(`${x},${y}`)) {
        if (coin === "cannon" || coin === "titan") {
          if (loc.includes(`${8},${y}`)) continue;
          team2[coin].location = `${8},${y}`;
          loc.push(`${8},${y}`);
        } else team2[coin].location = `${x},${y}`;
        console.log(`${coin}:${x},${y}`);
        loc.push(`${x},${y}`);
        i += 1;
      }
    }
  }
  /**
   * Initializes the buttons and attaches event listeners to them.
   */
  initializeButtons() {
    this.leftBtn = document.querySelector(`.left--rotate-btn`);
    this.rightBtn = document.querySelector(`.right--rotate-btn`);
    this.resetBtn = document.querySelector(`.reset--button`);
    this.pauseBtn = document.querySelector(`.pause--button`);
    this.btnUndo = document.querySelector(".undo--btn");
    this.btnRedo = document.querySelector(".redo--btn");
    //Undo
    this.btnUndo.addEventListener("click", () => {
      // console.log('Undo was clicked')
      if (this.currentMove > 0) {
        this.stopGame();
        this.refreshBoard(this.gameHistory[this.currentMove - 1]);
        this.startGame(this.gameHistory[this.currentMove - 1]);
        this.DB = this.gameHistory[this.currentMove - 1];
        this.currentMove -= 1;
        console.group(`Undo Move to : ${this.currentMove}`);
        this.displayGameHistory(this.gameHistory);
        console.groupEnd();
      }
    });
    //Redo
    this.btnRedo.addEventListener("click", () => {
      const len = Object.keys(this.gameHistory).length;
      if (this.currentMove < len - 1) {
        this.stopGame();
        this.refreshBoard(this.gameHistory[this.currentMove + 1]);
        this.startGame(this.gameHistory[this.currentMove + 1]);
        this.DB = this.gameHistory[this.currentMove + 1];
        this.currentMove++;
        console.group(`Redo Move to : ${this.currentMove}`);
        this.displayGameHistory(this.gameHistory);
        console.groupEnd();
      }
    });
    //Reset
    this.resetBtn.addEventListener("click", () => {
      // console.log('Reset button clicked')
      this.stopGame();
      this.randomizeBoard();
      this.DB.forEach((team) => {
        team.timeLeft = 600;
      });
      this.gameHistory = { 0: JSON.parse(JSON.stringify(this.DB)) };
      this.currentMove = 0;
      this.refreshBoard(this.DB);
      this.startGame(this.DB);
    });
    //Pause
    this.pauseBtn.addEventListener("click", () => {
      console.log("Pause button clicked");
      if (this.pauseBtn.innerHTML === "Pause") {
        this.stopGame();
        this.pauseBtn.innerHTML = "Resume";
      } else if (this.pauseBtn.innerHTML === "Resume") {
        this.startGame(this.DB);
        this.pauseBtn.innerHTML = "Pause";
      }
    });
  }

  /**
   * Displays the game history in the console.
   */
  displayGameHistory(gameHistory) {
    Object.values(gameHistory).forEach((DB, i) => {
      console.log(`Move ${i}`);
      const DB2 = JSON.parse(JSON.stringify(DB));
      DB2[0].coins.forEach((coin) => {
        DB2[0][coin] = Object.values(DB2[0][coin]).join(" ");
        DB2[1][coin] = Object.values(DB2[1][coin]).join(" ");
      });
      console.table(DB2);
    });
  }

  // displayGameHistoryOnScreen(gameHistory) {
  //   this.scrollBox = document.querySelector(".scrollable-box");
  //   Object.values(gameHistory).forEach((DB, i) => {
  //     const move = i % 2 == 0 ? "even" : "odd";

  //   });
  // }
  /**
   * Positions the coins in the board with the locations given the positions data structure.
   *
   * @param {Object} DB - The positions data structure containing the coin locations.
   */
  positionCoins(DB) {
    // This function positions the coins in the board with the locations given the positions data structure
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
            <img src="assets/img/${coinImg}.svg" alt="" class = "${coin}" height="20px"
            style = "transform: rotate(${rotateFactor * 90}deg)"
            ></div>`
          );
          el[0].firstChild.style.backgroundColor = DB[team].teamColor;
          el[0].firstChild.style.opacity = 0.9;
        }
      }
    }
  }

  /**
   * Refreshes the board by removing the existing board element, creating a new board element,
   * and initializing the board with the provided database.
   *
   * @param {Object} DB - The database object containing the board data.
   * @returns {void}
   */
  refreshBoard(DB) {
    document.querySelector(".board").remove();
    this.location = document.createElement("div");
    this.location.className = "board";
    const parent = document.querySelector(".container");
    parent.insertBefore(this.location, document.querySelector(".bottom-bar"));
    this.initializeBoard(DB);
  }

  /**
   * Starts the game and initializes the game state.
   *
   * @param {Array} DB - The array of teams in the game.
   */
  startGame(DB) {
    //******************************************************************//
    // console.log(`Calling start game function`)
    this.nodeListOfBoxes = [...document.querySelectorAll(`.box`)];
    this.currentPlayer = DB.find((team) => team.currentTeam === true);
    this.teamNumber = this.currentPlayer.teamName === "black" ? 0 : 1;
    this.opponent = DB.find((team) => team.currentTeam === false);
    this.locationsOfCurrentPlayer = this.getLocations(this.currentPlayer);
    this.locationsOfOpponentPlayer = this.getLocations(this.opponent);
    this.occupiedPositions = [
      ...this.locationsOfCurrentPlayer,
      ...this.locationsOfOpponentPlayer,
    ];
    this.timer = this.runTimer();
    //******************************************************************//
    this.highlightCurrentPlayer();
    this.nodeListOfBoxes.forEach((box) => {
      const play = () => {
        //******************************************************************//
        const m = box.getAttribute("m");
        const n = box.getAttribute("n");
        //******************************************************************//

        if (this.locationsOfCurrentPlayer.includes(`${m},${n}`)) {
          this.coin = box.firstChild.lastChild.getAttribute("class");
          this.leftBtn.style.visibility = "hidden";
          this.rightBtn.style.visibility = "hidden";
          if (
            this.coin === "ricochet-1" ||
            this.coin === "ricochet-2" ||
            this.coin === "half-ricochet-1" ||
            this.coin === "half-ricochet-2"
          ) {
            this.resetLeftAndRightButtons();
            this.rotate();
          }
          // console.log(coin);
          const loc = [m, n];
          const highlighted = this.validMoves(loc);
          this.moveCoin(highlighted);
        } else {
          this.resetBackground();
        }
      };
      box.addEventListener(`click`, play);
      // clearInterval(timer)
    });
  }

  /**
   * Retrieves the locations of the player's elements.
   * @param {Object} player - The player object.
   * @returns {Array} An array containing the locations of the player's elements.
   */
  getLocations(player) {
    return [
      ...Object.values(player)
        .map((el) => el?.location)
        .filter((el) => el !== undefined),
    ];
  }

  /**
   * Checks if the particular location has coins in it and returns the possible locations
   * the coins can move.
   * @param {string} loc - The location of the coin in the format "m,n".
   * @returns {Array} - An array of possible locations the coin can move to.
   */
  validMoves(loc) {
    // This function checks if the particular location has coins in it and returns the possible locations
    // the coins can move.
    this.loc = loc;
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
    if (this.coin === "cannon") {
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
        !this.occupiedPositions.includes(`${el[0]},${el[1]}`)
    );
    // console.log(moves);
    this.highlightValidMoves(moves);
    return moves;
  }

  /**
   * Highlights the valid moves on the game board.
   * @param {Array<Array<number>>} moves - An array of coordinates representing the valid moves.
   */
  highlightValidMoves(moves) {
    // This function is used to highlight the possible places in which the coin can be moved.
    this.resetBackground();
    moves.forEach((move) => {
      // console.log(move);
      const box = document.querySelector(`.index--${move[0]}-${move[1]}`);
      // console.log(`index--${move[0]}-${move[1]}`);
      box.style.backgroundColor = "#35ff69";
    });
  }

  /**
   * Moves the coins and refreshes the screen after the movement.
   *
   * @param {Array} movableLocations - An array of movable locations.
   */
  moveCoin(movableLocations) {
    // This function is responsible for moving the coins and refreshing the screen after it
    movableLocations = movableLocations.map((loc) =>
      document.querySelector(`.index--${loc[0]}-${loc[1]}`)
    );
    const coinClicked = (e) => {
      this.currentMove += 1;
      console.group(`Coin Movement :${this.currentMove}`);
      console.log(
        `${this.coin} >>> (${this.loc[0]},${
          this.loc[1]
        }) to (${e.target.getAttribute("m")},${e.target.getAttribute("n")})`
      );
      this.resetLeftAndRightButtons();
      const box = e.target;
      const m = box.getAttribute("m");
      const n = box.getAttribute("n");
      const i = this.DB.indexOf(this.currentPlayer);
      this.DB[i][this.coin].location = `${m},${n}`;
      this.DB[i].currentTeam = false;
      this.DB[Math.abs(i - 1)].currentTeam = true;
      this.refreshBoard(this.DB);
      this.stopGame();
      // console.log(`Timer for ${currentPlayer.teamName} is ended`);
      clearInterval(this.timer);
      this.startGame(this.DB);
      const bullet = new Bullet(this.DB);
      // startBullet(this.DB);
      //If the length of gameHistory is more than current move then delete the extra moves
      if (this.currentMove < Object.keys(this.gameHistory).length - 1) {
        const a = Object.keys(this.gameHistory).length;
        for (let i = this.currentMove; i < a; i++) {
          console.error(`Deleting gameHistory[${i}]`);
          delete this.gameHistory[i];
        }
      }
      this.gameHistory[this.currentMove] = JSON.parse(JSON.stringify(this.DB));

      this.displayGameHistory(this.gameHistory);
      console.groupEnd();
      // console.log(gameHistory)
    };
    movableLocations.forEach((box) =>
      box.addEventListener("click", coinClicked)
    );
    this.nodeListOfBoxes.forEach((box) => {
      box.addEventListener("click", () => {
        movableLocations.forEach((box) => {
          box.removeEventListener("click", coinClicked);
        });
      });
    });
  }

  highlightCurrentPlayer() {
    // This function highlights the current player
    document.querySelector(
      `.timer-${this.currentPlayer.teamName}`
    ).parentNode.style.backgroundColor = `#35FF69`;
    document.querySelector(
      `.timer-${this.opponent.teamName}`
    ).parentNode.style.backgroundColor = `#FFAE03`;
  }
  /**
   * Resets the background color of all boxes to the primary color.
   * This function is used to reset the background after the highlight valid moves function.
   */
  resetBackground() {
    const box = [...document.querySelectorAll(".box")];
    box.forEach((el) => {
      el.style.backgroundColor = "rgba(255, 174, 3, 0.6)";
      for (let i = 1; i <= 8; i++) {
        for (let j = 1; j <= 8; j++) {
          if ((i + j) % 2 === 0) {
            document.querySelector(`.index--${i}-${j}`).style.backgroundColor =
              "#ffae03";
          }
        }
      }
    });
  }

  runTimer() {
    let timerElement = document.querySelector(
      `.timer-${this.DB[this.teamNumber].teamName}`
    );
    // console.log(`${currentTeam} , ${DB[currentTeam].timeLeft}`);
    return setInterval(() => {
      this.DB[this.teamNumber].timeLeft--;
      // console.log(`${currentTeam} , ${DB[currentTeam].timeLeft}`);
      let seconds = this.DB[this.teamNumber].timeLeft % 60;
      if (seconds < 10) seconds = "0" + seconds;
      let minutes = Math.floor(this.DB[this.teamNumber].timeLeft / 60);
      timerElement.innerHTML = `${minutes}:${seconds}`;
      if (this.DB[this.teamNumber].timeLeft === 0) {
        this.endGame(this.opponent.teamName.toUpperCase());
      }
    }, 1000);
  }
  /**
   * Rotates the coin and updates the game state.
   */
  rotate() {
    this.leftBtn.style.visibility = "visible";
    this.rightBtn.style.visibility = "visible";

    const finishRotate = () => {
      this.currentMove++;
      this.stopGame();
      this.DB[this.teamNumber].currentTeam = false;
      this.DB[Math.abs(this.teamNumber - 1)].currentTeam = true;
      this.refreshBoard(this.DB);
      this.startGame(this.DB);
      const bullet = new Bullet(this.DB);
      // this.startBullet(DB);
      this.gameHistory[this.currentMove] = JSON.parse(JSON.stringify(this.DB));
      this.displayGameHistory(this.gameHistory);
    };

    this.leftBtn.addEventListener("click", () => {
      //Rotate the coin to left
      console.log(this.teamNumber);
      console.log(this.DB);
      this.DB[this.teamNumber][this.coin].rotation =
        this.DB[this.teamNumber][this.coin].rotation - 1;
      if (this.DB[this.teamNumber][this.coin].rotation > 4)
        this.DB[this.teamNumber][this.coin].rotation %= 4;
      finishRotate();
      this.resetLeftAndRightButtons();
    });
    this.rightBtn.addEventListener("click", () => {
      //Rotate the coin to left
      this.DB[this.teamNumber][this.coin].rotation =
        this.DB[this.teamNumber][this.coin].rotation + 1;
      if (this.DB[this.teamNumber][this.coin].rotation > 4)
        this.DB[this.teamNumber][this.coin].rotation %= 4;
      finishRotate();
      this.resetLeftAndRightButtons();
    });
  }

  /**
   * Deletes a coin from the game.
   */
  deleteCoin(team, coin) {
    this.DB[team][coin].hitpoints -= this.DB[team][coin].damage;
    if (this.DB[team][coin].hitpoints <= 0) {
      delete this.DB[team][coin];
      const indexToRemove = this.DB[team].coins.indexOf(coin);
      this.DB[team].coins.splice(indexToRemove, 1);
      // ball.remove();
      let destroy = new Audio("assets/sounds/half-ricochet-destroy.mp3");
      destroy.play();
      this.stopGame();
      this.refreshBoard(this.DB);
      this.startGame(this.DB);
    }
  }

  /**
   * Resets the left and right buttons by replacing them with cloned nodes.
   */
  resetLeftAndRightButtons() {
    let newEl = this.leftBtn.cloneNode(true);
    this.leftBtn.parentNode.replaceChild(newEl, this.leftBtn);
    this.leftBtn = newEl;
    let anothernewEl = this.rightBtn.cloneNode(true);
    this.rightBtn.parentNode.replaceChild(anothernewEl, this.rightBtn);
    this.rightBtn = anothernewEl;
  }

  /**
   * Stops the game and clears the board.
   */
  stopGame() {
    let oldElement = document.querySelector(".board");
    let newElement = oldElement.cloneNode(true);
    oldElement.parentNode.replaceChild(newElement, oldElement);
    clearInterval(this.timer);
  }

  get locationsOfAllPlayers() {
    return this.occupiedPositions;
  }
  endGame(winner) {
    console.log(`Game Over! ${winner} wins!`);
    this.stopGame();
    let gameOver = new Audio("assets/sounds/game-over-2.wav");
    gameOver.play();
    document.querySelector(".game-screen").style.visibility = "hidden";
    document.querySelector(".modal").style.visibility = "visible";
    document.querySelector(
      ".modal-content"
    ).innerHTML = `<h3>Game Over! ${winner.toUpperCase()} wins!</h3>`;
    this.leftBtn.remove();
    this.rightBtn.remove();
  }
}

const gameBoard = new GameBoard(gameDB);
