class Bullet {
  constructor(DB) {
    this.DB = DB;
    this.currentPlayer = DB.find((team) => team.currentTeam === true);
    this.teamNumber = this.currentPlayer.teamName === "black" ? 0 : 1;
    this.opponent = DB.find((team) => team.currentTeam === false);
    this.locationsOfCurrentPlayer = this.getLocations(this.currentPlayer);
    // console.log(this.locationsOfCurrentPlayer);
    this.locationsOfOpponentPlayer = this.getLocations(this.opponent);
    this.occupiedPositions = [
      ...this.locationsOfCurrentPlayer,
      ...this.locationsOfOpponentPlayer,
    ];
    this.timeDelay = 200;
    this.smoothnessFactor = 13;
    this.startBullet();
  }

  startBullet() {
    gameBoard.stopGame();
    const currentPlayer = this.DB.find((team) => team.currentTeam === false); //It is set to false for a reason. Don't change it
    const teamNumber = currentPlayer.teamName === "black" ? 0 : 1;
    this.bulletinMotion = true;
    const currentPlCannon = this.DB[teamNumber].cannon.location;
    this.x = currentPlCannon[0];
    this.y = currentPlCannon[2];
    this.direction = this.teamNumber === 1 ? "down" : "up";
    let bulletAudio = new Audio("assets/sounds/bullet.wav");
    bulletAudio.play();
    this.moveBullet(this.direction);
  }

  moveBullet(direction) {
    gameBoard.stopGame();
    this.bulletinMotion = true;
    clearInterval(this.interval);
    clearInterval(this.request);
    // console.log(`Starting Bullet at ${direction}`);
    this.bulletContainer = document.createElement("div");
    this.bulletContainer.classList.add("bullet--container");
    this.bulletContainer.innerHTML = `<img src="assets/img/bullet.svg" class="bullet" />`;
    this.bullet = this.bulletContainer.firstChild;
    this.direction = direction;
    this.positionBullet(this.x, this.y);
    let bulletAudio = new Audio("assets/sounds/bullet.wav");
    bulletAudio.play();
    if (this.direction === "up") {
      this.bullet.style.transform = "rotate(0deg)";
      this.up();
      this.request = this.smoothBullets("up");
    } else if (this.direction === "down") {
      this.bullet.style.transform = "rotate(180deg)";
      this.down();
      this.request = this.smoothBullets("down");
    } else if (this.direction === "left") {
      this.bullet.style.transform = "rotate(270deg)";
      this.left();
      this.request = this.smoothBullets("left");
    } else if (this.direction === "right") {
      this.bullet.style.transform = "rotate(90deg)";
      this.right();
      this.request = this.smoothBullets("right");
    }
  }

  positionBullet() {
    // this.checkCollision();
    this.x = Number(this.x);
    this.y = Number(this.y);
    if (this.x >= 1 && this.x <= 8 && this.y >= 1 && this.y <= 8) {
      console.log(this.x, this.y);
      const board = document.querySelector(".board");
      board.appendChild(this.bulletContainer);
      this.getLocationOfBox();
      this.bulletContainer.style.top = `${this.Y}px`;
      this.bulletContainer.style.left = `${this.X}px`;
    }
  }

  down() {
    console.log(this.timeDelay);
    this.interval = setInterval(() => {
      this.x += 1;
      this.checkCollision();
      this.positionBullet();
    }, this.timeDelay);
  }
  up() {
    this.interval = setInterval(() => {
      this.x -= 1;
      this.checkCollision();
      this.positionBullet();
    }, this.timeDelay);
  }
  left() {
    this.interval = setInterval(() => {
      this.y -= 1;
      this.checkCollision();
      this.positionBullet();
    }, this.timeDelay);
  }
  right() {
    this.interval = setInterval(() => {
      this.y += 1;
      this.checkCollision();
      this.positionBullet();
    }, this.timeDelay);
  }

  getLocationOfBox() {
    const box = document.querySelector(`.index--${this.x}-${this.y}`);
    const a = box.getBoundingClientRect();
    const b = this.bulletContainer.getBoundingClientRect();
    const locX = a.x + a.width / 2 - b.width / 2;
    const locY = a.y + a.height / 2 - b.height / 2;
    this.Y = locY;
    this.X = locX;
    this.boxHeight = a.height;
  }
  getLocations(player) {
    return [
      ...Object.values(player)
        .map((el) => el?.location)
        .filter((el) => el !== undefined),
    ];
  }
  removeBullet() {
    console.log("Attempting to remove bullet");
    document.querySelector(".bullet").remove();
    document.querySelector(".bullet--container").remove();
    clearInterval(this.interval);
    this.bulletinMotion = false;
    gameBoard.startGame(this.DB);
  }

  changeDirction() {
    if (!Object.keys(this.transfrom).includes(this.direction)) {
      this.removeBullet();
      gameBoard.deleteCoin(this.collisionTeamNumber, this.coin);
    }
    console.log("Changing Direction...");
    for (const oldDirection in this.transfrom) {
      if (this.direction === oldDirection) {
        console.log(
          `Initial Direction : ${this.direction} Transfrom : ${this.transfrom[oldDirection]}`
        );
        this.direction = this.transfrom[oldDirection];
        this.removeBullet();
        this.moveBullet(this.direction);
        break;
      }
    }
  }

  checkCollision() {
    if (this.x <= 0 || this.x >= 9 || this.y <= 0 || this.y >= 9) {
      this.removeBullet();
    }
    if (gameBoard.occupiedPositions.includes(`${this.x},${this.y}`)) {
      if (this.locationsOfCurrentPlayer.includes(`${this.x},${this.y}`)) {
        this.collisonTeam = this.DB[this.teamNumber];
        this.collisionTeamNumber = this.teamNumber;
      }
      if (this.locationsOfOpponentPlayer.includes(`${this.x},${this.y}`)) {
        this.collisonTeam = this.DB[Math.abs(this.teamNumber - 1)]; //set team to opponent team
        this.collisionTeamNumber = Math.abs(this.teamNumber - 1);
      }
      this.box = document.querySelector(`.index--${this.x}-${this.y}`);
      this.coin = this.box.firstChild.lastChild.getAttribute("class");
      clearInterval(this.request);
      //////////////////////////////////////////////////////////
      if (this.coin === "titan") {
        //Game Over
        this.DB[this.collisionTeamNumber].titan.hitpoints -=
          this.DB[this.collisionTeamNumber].titan.damage;
        if (this.DB[this.collisionTeamNumber].titan.hitpoints <= 0) {
          const looser = this.collisonTeam.teamName;
          const winner = looser === "black" ? "white" : "black";
          gameBoard.endGame(winner);
        }
      }
      if (this.coin === "tank") {
        this.removeBullet();
        gameBoard.deleteCoin(this.collisionTeamNumber, this.coin);
      }
      if (this.coin === "ricochet-1" || this.coin === "ricochet-2") {
        const rotation = this.collisonTeam[this.coin].rotation;
        //console.log(`Collision with Ricochet with rotation ${rotation}`);

        if (rotation === 1 || rotation === 3) {
          //console.log("Rotation 1 or 3");
          this.transfrom = {
            down: "right",
            up: "left",
            right: "down",
            left: "up",
          };
        } else if (rotation === 2 || rotation === 4) {
          console.log("Rotation 2 or 4");
          this.transfrom = {
            down: "left",
            up: "right",
            right: "up",
            left: "down",
          };
        }
        this.changeDirction();
      }
      if (this.coin === "half-ricochet-1" || this.coin === "half-ricochet-2") {
        console.log("Collision with Half Ricochet");
        const rotation = this.collisonTeam[this.coin].rotation;
        //console.log(`Collision with Ricochet with rotation ${rotation}`);

        if (rotation === 1) {
          this.transfrom = { down: "left", right: "up" };
        } else if (rotation === 2) {
          this.transfrom = { down: "right", left: "up" };
        } else if (rotation === 3) {
          this.transfrom = { up: "right", left: "down" };
        } else if (rotation === 4) {
          this.transfrom = { up: "left", right: "down" };
        }
        this.changeDirction();
      }
    }
  }

  smoothBullets(dir) {
    if (dir === "down")
      return setInterval(() => {
        this.Y = Number(this.Y) + this.boxHeight / this.smoothnessFactor;
        this.bulletContainer.style.top = Number(this.Y) + "px";
      }, this.timeDelay / this.smoothnessFactor);
    if (dir === "up")
      return setInterval(() => {
        this.Y = Number(this.Y) - this.boxHeight / this.smoothnessFactor;
        this.bulletContainer.style.top = Number(this.Y) + "px";
      }, this.timeDelay / this.smoothnessFactor);
    if (dir === "right")
      return setInterval(() => {
        this.X = Number(this.X) + this.boxHeight / this.smoothnessFactor;
        this.bulletContainer.style.left = Number(this.X) + "px";
      }, this.timeDelay / this.smoothnessFactor);
    if (dir === "left")
      return setInterval(() => {
        this.X = Number(this.X) - this.boxHeight / this.smoothnessFactor;
        this.bulletContainer.style.left = Number(this.X) + "px";
      }, this.timeDelay / this.smoothnessFactor);
  }
}
