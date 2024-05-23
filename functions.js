let bulletCurrentDirection;

function stopGame(){
  let oldElement = document.querySelector('.board');
  let newElement = oldElement.cloneNode(true);
  oldElement.parentNode.replaceChild(newElement, oldElement);
}

function positionCoins(DB) {
  // This function positions the coins in the board with the locations given the positions data
  // structure
  for (let team in DB) {

    for (let coin in DB[team]) {
      const x = DB[team][`${coin}`].location?.at(0);
      const y = DB[team][`${coin}`].location?.at(2);
      if (x && y) {
        const el = document.getElementsByClassName(`index--${x}-${y}`);
        const rotateFactor = DB[team][`${coin}`]?.rotation -1
        console.log(rotateFactor)
        el[0].insertAdjacentHTML(
          "afterbegin",
          `<div class = 'coin-container'>
          <img src="assets/${coin}.svg" alt="" class = "${coin}" height="20px"
          style = "transform: rotate(${(rotateFactor*90)}deg)"
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
  parent.insertBefore(location,document.querySelector(".bottom-bar"));
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
    el.style.backgroundColor = "#FFAE03";
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

function validMoves(loc, coin,pos) {
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

function moveCoin(movableLocations, DB, currentPlayer, coin, allBoxes,timer) {
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
    initializeBoard(DB);
    stopGame();
    // console.log(`Timer for ${currentPlayer.teamName} is ended`);
    clearInterval(timer)
    startGame(DB);
    startBullet(DB);
  };
  movableLocations.forEach((box) => box.addEventListener("click", coinClicked));
  allBoxes.forEach((box) => {box.addEventListener("click", ()=>{
    movableLocations.forEach((box) => {box.removeEventListener("click",coinClicked)})
  });});

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
  const timer = runTimer(DB,currentPlayer.teamName);
  //******************************************************************//

  nodeListOfBoxes.forEach((box) => {
    const play = function () {
      //******************************************************************//
      const m = box.getAttribute("m");
      const n = box.getAttribute("n");
      //******************************************************************//
      if (locationsOfCurrentPlayer.includes(`${m},${n}`)) {
        const coin = box.firstChild.lastChild.getAttribute("class");
        if (coin==="ricochet" || coin === "half-ricochet"){
          rotateCoin();
        }
        // console.log(coin);
        const loc = [m,n];
        const pos = [...locationsOfCurrentPlayer, ...locationsOfOpponentPlayer]
        const highlighted = validMoves(loc, coin, pos);
        moveCoin(highlighted, DB, currentPlayer, coin, nodeListOfBoxes,timer);
        // nodeListOfBoxes.forEach((box) =>
        //   box.removeEventListener("click", play)
        // );
        // return startGame(DB);
      } else {
        resetBackground();
        // nodeListOfBoxes.forEach((box) =>
        //   box.removeEventListener("click", play)
        // );
        // return startGame(DB);
      }
    }
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
  const ball = document.createElement("div");
  ball.classList.add("ball");
  document.body.append(ball);
  let x = box.x + (box.width-8)/2;
  let y = box.y + (box.height-8)/2;
  // console.log(x, y);
  if ((DB[i].teamName === "black")){
    moveBullet(x,y,"down",DB,ball)
  }
  else if ((DB[i].teamName === "white")){
    moveBullet(x,y,"up",DB,ball);
  }
}

function moveBullet(x,y,direction,DB,ball){

  ball.style.top = y  + "px";
  ball.style.left = x + "px";
  let bullet = new Audio('assets/sounds/bullet.wav');
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
      cancelAnimationFrame(request);
      ball.remove();
    }
  };
  const moveBulletDown = function () {
    request = requestAnimationFrame(moveBulletDown);
    y += 5;
    checkBallWithinBoundary();
    detectCollision(DB, x, y,request,ball);
    ball.style.top = Number(y) + "px";
  };
  const moveBulletUp = function () {
    request = requestAnimationFrame(moveBulletUp);
    y -= 5;
    checkBallWithinBoundary();
    detectCollision(DB, x, y,request,ball);
    ball.style.top = Number(y) + "px";
  };
  const moveBulletRight = function () {
    request = requestAnimationFrame(moveBulletRight);
    x += 5;
    checkBallWithinBoundary();
    detectCollision(DB, x, y,request,ball);
    ball.style.left = Number(x) + "px";
  };
  const moveBulletLeft = function () {
    request = requestAnimationFrame(moveBulletLeft);
    x -= 5;
    checkBallWithinBoundary();
    detectCollision(DB, x, y,request,ball);
    ball.style.left = Number(x) + "px";
  };
  bulletCurrentDirection = direction;

  if (direction === "down"){
    request = requestAnimationFrame(moveBulletDown);

  y+=5;
  }
  else if (direction === "up"){
    request = requestAnimationFrame(moveBulletUp);
    y-=5;
  }
  else if (direction === "right"){
    request = requestAnimationFrame(moveBulletRight);
    x+=5
  }

  else if (direction === "left") {
    request = requestAnimationFrame(moveBulletLeft);
    x-=5
  }
}
function getLocation(box) {
  const obj = box.getBoundingClientRect();
  const xFactor = (obj.width-8)/2;
  const x0 = obj.x + xFactor;
  const y0 = obj.y  + xFactor;
  const x1 = obj.x + obj.width - xFactor;
  const y1 = obj.y +obj.height- xFactor;

  return [x0, x1, y0, y1];
}

function detectCollision(DB, x, y,request,ball) {
  checkCollision("titan", "white", x, y, DB,request,ball);
  checkCollision("titan", "black", x, y, DB,request,ball);
  checkCollision("ricochet", "white", x, y, DB,request,ball);
  checkCollision("ricochet", "black", x, y, DB,request,ball);
  checkCollision("half-ricochet", "white", x, y, DB,request,ball);
  checkCollision("half-ricochet", "black", x, y, DB,request,ball);
  checkCollision("tank", "white", x, y, DB,request,ball);
  checkCollision("tank", "black", x, y, DB,request,ball);
}

function checkCollision(coin, teamName, x, y, DB,request,ball) {
  const team = teamName === "black" ? 0 : 1;
  const piece = getLocation(document.querySelector(
      `.index--${DB[team][coin].
      location.at(0)}-${DB[team][coin].location.at(2)}`));
  // console.log(piece)
  if (x <= piece[1] && y <= piece[3] && x >= piece[0] && y >= piece[2]) {
    console.log(
      `Collided with ${coin} at ${teamName}!! at ${x} and ${y} 🎯🎯🎯`
    );

  if (coin === "tank") {
    // stop the bullet and disappear the bullet
    cancelAnimationFrame(request);
    ball.remove();
  }
  if (coin === "ricochet") {
    const loc = DB[team].ricochet.location
    //Change the direction of the bullet
    const box = document
        .querySelector(`.index--${loc.at(0)}-${loc.at(2)}`)
        .getBoundingClientRect();
    let x = box.x + (box.width-8)/2;
    let y = box.y + (box.height-8)/2;
    cancelAnimationFrame(request);
    if (DB[team].ricochet.rotation === 1) {
      switch(bulletCurrentDirection){
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
      }}

      if (DB[team].ricochet.rotation === 2) {
        switch(bulletCurrentDirection){
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
      moveBullet(x,y,bulletCurrentDirection,DB,ball);

    // moveBullet(x,y,"right",DB)

  }
  if (coin === "half-ricochet") {
    const loc = DB[team]['half-ricochet'].location
    const box = document
        .querySelector(`.index--${loc.at(0)}-${loc.at(2)}`)
        .getBoundingClientRect();
    let x = box.x + (box.width-8)/2;
    let y = box.y + (box.height-8)/2;
    cancelAnimationFrame(request);
    if (DB[team]['half-ricochet'].rotation === 1) {
      switch(bulletCurrentDirection){
        case "down":
          bulletCurrentDirection = "right";
          break;
        case "up":
          //Destroy
          break;
        case "right":
          //Destroy
          break;
        case "left":
          bulletCurrentDirection = "up";
          break;
      }}

    if (DB[team]['half-ricochet'].rotation === 2) {
      switch(bulletCurrentDirection){
        case "down":
          //Destroy
          break;
        case "up":
          bulletCurrentDirection = "right"
          break;
        case "right":
          //down
          break;
        case "left":
          bulletCurrentDirection = "down";
          break;
      }
    }
    if (DB[team]['half-ricochet'].rotation === 3) {
      switch(bulletCurrentDirection){
        case "down":
          //Destroy
          break;
        case "up":
          bulletCurrentDirection = "left";
          break;
        case "right":
          bulletCurrentDirection = "down";
          break;
        case "left":
          //Destroy
          break;
      }
    }
    if (DB[team]['half-ricochet'].rotation === 4) {
      switch(bulletCurrentDirection){
        case "down":
          bulletCurrentDirection = "left";
          break;
        case "up":
          //Destroy
          break;
        case "right":
          bulletCurrentDirection = "up";
          break;
        case "left":
          //Destroy
          break;
      }
    }
  }
  if (coin === "titan") {
    ball.remove()
    if (teamName === "black") {
      console.log("White won the game")
    }
    else if (teamName === "white"){
      console.log("Black won the game")
    }
    let gameOver = new Audio('assets/sounds/game-over-2.wav')
    gameOver.play();
    stopGame()
  }}
}

function runTimer(DB,currentTeam){
  currentTeam = (currentTeam==="black" ? 0 : 1);
  let timerElement = document.querySelector(`.timer-${DB[currentTeam].teamName}`);
  console.log(`${currentTeam} , ${DB[currentTeam].timeLeft}`)
  return setInterval(() => {
    DB[currentTeam].timeLeft--;
    // console.log(`${currentTeam} , ${DB[currentTeam].timeLeft}`);
    let seconds = DB[currentTeam].timeLeft%60;
    let minutes = Math.floor(DB[currentTeam].timeLeft/60);
    timerElement.innerHTML = `${minutes}:${seconds}`;
  }, 1000);

}

function rotate(coin,DB,teamName){

}