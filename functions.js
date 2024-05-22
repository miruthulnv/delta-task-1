function positionCoins(positions) {
  // This function positions the coins in the board with the locations given the positions data
  // structure

  for (let team in positions) {
    for (let coin in positions[team]) {
      const x = positions[team][`${coin}`].location?.at(0);
      const y = positions[team][`${coin}`].location?.at(2);
      if (x && y) {
        const el = document.getElementsByClassName(`index--${x}-${y}`);
        el[0].insertAdjacentHTML(
          "afterbegin",
          `<div class = 'coin-container'>
          <img src="assets/${coin}.svg" alt="" class = "${coin}" height=40px></div>`
        );
        el[0].firstChild.style.backgroundColor = positions[team].teamColor;
        el[0].firstChild.style.opacity = 0.9;
      }
    }
  }
};

function initializeBoard(location, coinsData) {
  // This function creates the grid in the html webpage and calls the PositionCoins to place the Coins
  location.remove();
  location = document.createElement("div");
  location.className = "board";
  document.body.append(location);
  let boxHtml = " ";
  //Code for Generating boxHtml for all 8 blocks and adding it to HTML
  //(${i},${j})
  for (let i = 1; i <= 8; i++) {
    for (let j = 1; j <= 8; j++) {
      boxHtml += `<div class="box index--${i}-${j}" m=${i} n=${j}></div>`;
    }
  }
  location.insertAdjacentHTML("afterbegin", boxHtml);
  positionCoins(coinsData);
  // console.log(boxHtml);
};

function resetBackground(DB){
  // This function is used to reset the background to primary after the highlight valid moves function
  const box = [...document.querySelectorAll(".box")];
  box.forEach((el) => {
    el.style.backgroundColor = "#FFAE03";
  });
};

function highlightValidMoves(moves, DB) {
  // This function is used to highlight the possible places in which the coin can be moved.

  resetBackground(DB);
  moves.forEach((move) => {
    // console.log(move);
    const box = document.querySelector(`.index--${move[0]}-${move[1]}`);
    // console.log(`index--${move[0]}-${move[1]}`);
    box.style.backgroundColor = "#35ff69";
  });
};

function validMoves(m, n, coin, playerPositions, opponentPositions, DB) {
  // This function checks if the particular location has coins in it and returns the possible locations
  // the coins can move.

  m = Number(m);
  n = Number(n);
  let op = [[m + 1, n - 1], [m + 1, n], [m + 1, n + 1], [m, n - 1], [m, n + 1], [m - 1, n - 1], [m - 1, n], [m - 1, n + 1],];
  if (coin === "cannon") {
    op = [[m, n - 1], [m, n + 1],];
  }
  const moves = op.filter(
    (el) =>
      1 <= el[0] &&
      1 <= el[1] &&
      el[1] <= 8 &&
      el[0] <= 8 &&
      !playerPositions.includes(`${el[0]},${el[1]}`) &&
      !opponentPositions.includes(`${el[0]},${el[1]}`)
  );
  // console.log(moves);
  highlightValidMoves(moves, DB);
  return moves;
};

function moveCoin(movableLocations, DB, currentPlayer, coin, allBoxes) {
  // This function is responsible for moving the coins and refreshing the screen after it

  movableLocations = movableLocations.map((loc) =>
    document.querySelector(`.index--${loc[0]}-${loc[1]}`)
  );
  const coinClicked = function (e) {
    const box = e.target;
    const m = box.getAttribute("m");
    const n = box.getAttribute("n");
    const i = DB.indexOf(currentPlayer);
    DB[i][coin].location = `${m},${n}`;
    DB[i].currentTeam = false;
    DB[Math.abs(i - 1)].currentTeam = true;
    initializeBoard(document.querySelector(".board"), DB);
    startGame([...document.querySelectorAll(`.box`)], DB);
    moveBullet(DB)
  };
  // console.log(movableLocations);
  movableLocations.forEach((box) => box.addEventListener("click", coinClicked));

  allBoxes.forEach((box) =>
    box.addEventListener("click", () => {
      allBoxes.forEach((box) => box.removeEventListener("click", coinClicked));
    })
  );
};

function startGame(nodeListOfBoxes, DB) {
  nodeListOfBoxes.forEach((box) => {
    const play = function (el) {
      const currentPlayer = DB.find((team) => team.currentTeam === true);
      const opponent = DB.find((team) => team.currentTeam === false);
      const m = box.getAttribute("m");
      const n = box.getAttribute("n");
      // console.log(m, n);
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
      // console.log(occupiedPlaces);
      if (locationsOfCurrentPlayer.includes(`${m},${n}`)) {
        const coin = box.firstChild.lastChild.getAttribute("class");
        // console.log(coin);
        const highlighted = validMoves(
          m,
          n,
          coin,
          locationsOfCurrentPlayer,
          locationsOfOpponentPlayer
        );
        moveCoin(highlighted, DB, currentPlayer, coin, nodeListOfBoxes);
        nodeListOfBoxes.forEach((box) =>
          box.removeEventListener("click", play)
        );
        return startGame(nodeListOfBoxes, DB);
      } else {
        resetBackground();
        nodeListOfBoxes.forEach((box) =>
          box.removeEventListener("click", play)
        );
        return startGame(nodeListOfBoxes, DB);
      }
    };
    box.addEventListener(`click`, play);
  });
}

function moveBullet(DB) {
  const i = DB.indexOf(DB.find((team) => team.currentTeam === false));
  // Here current player is set to false because it will be switched in the moveCoin function already.
  const loc = DB[i].cannon.location;
  const box = document
      .querySelector(`.index--${loc.at(0)}-${loc.at(2)}`)
      .getBoundingClientRect();
  const board = document.querySelector('.board').getBoundingClientRect();
  let x = box.x + 33;
  let y = box.y +33 ;
  // console.log(x, y);
  const ball = document.createElement("div");
  ball.classList.add("ball");
  document.body.append(ball);
  ball.style.top = (y-100) +'px';
  ball.style.left = x +'px';
  let request;
  const checkBallWithinBoundary = function(){
    if(x<=board.x ||
        y<=board.y ||
        y>=board.height+board.y ||
        x>=board.width+board.x
    ){
      console.log('Bullet went out of box !!! 🔥🔥🔥')
      cancelAnimationFrame(request)
      ball.remove()
    }
  }
  const moveBulletDown = function () {
    request = requestAnimationFrame(moveBulletDown);
    y+=10;
    checkBallWithinBoundary()
    detectCollision(DB,x,y)
    ball.style.top = Number(y) +'px';
  }
  const moveBulletUp = function () {
    request = requestAnimationFrame(moveBulletUp);
    y-=10;
    checkBallWithinBoundary()
    detectCollision(DB,x,y)
    ball.style.top = Number(y) +'px';

    }
  if (DB[i].teamName === "black") request = requestAnimationFrame(moveBulletDown)
  else if (DB[i].teamName === "white") request = requestAnimationFrame(moveBulletUp)
}

function getLocation(box) {
  const obj = box.getBoundingClientRect();
  const xFactor = 30
  const x0 = obj.x +xFactor;
  const y0 = obj.y - obj.height+xFactor;
  const x1 = obj.x + obj.width-xFactor;
  const y1 = obj.y -xFactor;
  return [x0,x1,y0,y1];
}

function detectCollision(DB,x,y){
  //Titan:
  checkCollision("titan", "white",x,y,DB);
  checkCollision("titan", "black",x,y,DB);
  checkCollision("ricochet", "white",x,y,DB);
  checkCollision("ricochet", "black",x,y,DB);
  checkCollision("half-ricochet", "white",x,y,DB);
  checkCollision("half-ricochet", "black",x,y,DB);
  checkCollision("tank", "white",x,y,DB);
  checkCollision("tank", "black",x,y,DB);

}

function checkCollision(coin, teamName,x,y,DB){
  const team = (teamName==="black") ? 0 : 1;
  const piece = getLocation(document.querySelector(
      `.index--${DB[team][coin].location.at(0)}-${DB[team][coin].location.at(2)}`))
  if (x<=piece[1] &&
      y<=piece[3] &&
      x>=piece[0] &&
      y>=piece[2]
  ){
    console.log(`Collided with ${coin} at ${teamName}!! at ${x} and ${y} 🎯🎯🎯`);
  }
  if (coin ==="tank"){
    // stop the bullet and disappear the coin
  }
  if (coin ==="ricochet"){
    //Change the direction of the bullet
  }
  if (coin === "half-ricochet"){
    //Change the direction of the bullet
  }
  if (coin === "titan"){
    //End the game
    if (teamName === "black"){
      alert("White won the game")

    }
  }
}
