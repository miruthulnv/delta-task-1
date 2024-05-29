class Bullet {
  constructor(DB) {
    this.DB = DB;
    this.currentPlayer = DB.find((team) => team.currentTeam === true);
    this.teamNumber = this.currentPlayer.teamName === "black" ? 0 : 1;
    this.x = 1;
    this.y = 4;
    this.timeDelay = 1000;
    this.startBullet("down");
  }

  startBullet(direction) {
    console.log(`Starting Bullet at ${direction}`);
    this.bulletContainer = document.createElement("div");
    this.bulletContainer.classList.add("bullet--container");
    this.bulletContainer.innerHTML = `<img src="assets/bullet.svg" class="bullet" />`;
    this.bullet = this.bulletContainer.firstChild;
    this.direction = direction;
    this.positionBullet(this.x, this.y);
    if (this.direction === "up") {
      this.bullet.style.transform = "rotate(0deg)";
      // this.request = requestAnimationFrame(this.smoothBullets("up"));
      this.up();
    } else if (this.direction === "down") {
      this.bullet.style.transform = "rotate(180deg)";
      this.down();
      this.request = requestAnimationFrame(smoothBulletsDown);
    } else if (this.direction === "left") {
      this.bullet.style.transform = "rotate(270deg)";
      this.left();
    } else if (this.direction === "right") {
      this.bullet.style.transform = "rotate(90deg)";
      this.right();
    }
  }

  positionBullet() {
    this.checkCollision();
    if (this.x >= 1 && this.x <= 8 && this.y >= 1 && this.y <= 8) {
      console.log(this.x, this.y);
      const board = document.querySelector(".board");
      board.appendChild(this.bulletContainer);
      this.getLocation();
      this.bulletContainer.style.top = `${this.Y}px`;
      this.bulletContainer.style.left = `${this.X}px`;
    }
  }

  down() {
    this.interval = setInterval(() => {
      this.x += 1;
      this.checkCollision();
    }, 180);
  }
  up() {
    this.interval = setInterval(() => {
      this.positionBullet();
      this.x -= 1;
    }, 1000);
  }
  left() {
    this.interval = setInterval(() => {
      this.y -= 1;
      this.positionBullet();
    }, 1000);
  }
  right() {
    this.interval = setInterval(() => {
      this.y += 1;
      this.positionBullet();
    }, 1000);
  }

  getLocation() {
    const box = document.querySelector(`.index--${this.x}-${this.y}`);
    const a = box.getBoundingClientRect();
    const b = this.bulletContainer.getBoundingClientRect();
    const locX = a.x + a.width / 2 - b.width / 2;
    const locY = a.y + a.height / 2 - b.height / 2;
    this.Y = locY;
    this.X = locX;
    return [locX, locY, a.width];
  }
  removeBullet() {
    console.log("Attempting to remove bullet");
    document.querySelector(".bullet").remove();
    document.querySelector(".bullet--container").remove();
    clearInterval(this.interval);
  }

  changeDirction() {
    // if (!Object.keys(this.transfrom).includes(this.direction)) {
    //   this.removeBullet();
    //   //Destroy the coin
    // }
    for (const oldDirection in this.transfrom) {
      if (this.direction === oldDirection) {
        console.log(
          `Initial Direction : ${this.direction} Transfrom : ${this.transfrom[oldDirection]}`
        );
        this.direction = this.transfrom[oldDirection];
        this.removeBullet();
        this.startBullet(this.direction);
        break;
      }
    }
  }

  checkCollision() {
    if (this.x === 0 || this.x === 9 || this.y === 0 || this.y === 9) {
      this.removeBullet();
    }
    if (gameBoard.occupiedPositions.includes(`${this.x},${this.y}`)) {
      this.box = document.querySelector(`.index--${this.x}-${this.y}`);
      this.coin = this.box.firstChild.lastChild.getAttribute("class");
      cancelAnimationFrame(this.request);
      if (this.coin === "titan") {
        //Game Over
        // console.log("Collision with Titan");
      } else if (this.coin === "tank") {
        // console.log("Collision with Tank");
        this.removeBullet();
      } else if (this.coin === "ricochet-1" || this.coin === "ricochet-2") {
        console.log("Collision with Ricochet");
        const rotation = this.DB[this.teamNumber][this.coin].rotation;
        if (rotation === 1 || rotation === 3) {
          this.transfrom = {
            down: "right",
            up: "left",
            right: "down",
            left: "up",
          };
        } else if (rotation === 2 || rotation === 4) {
          this.transfrom = {
            down: "left",
            up: "right",
            right: "up",
            left: "down",
          };
        }
        this.changeDirction();
        // this.removeBullet();
        // this.startBullet("left");
      } else if (
        this.coin === "half-ricochet-1" ||
        this.coin === "half-ricochet-2"
      ) {
        // console.log("Collision with Half Half Ricochet");
        const rotation = this.DB[this.teamNumber][this.coin].rotation;
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
    if (dir === "down") return NaN;
    if (dir === "up")
      return () => {
        this.request = requestAnimationFrame(this.smoothBullets("up"));
        let y = this.location[1];
        y -= this.location[2] / 5;
        this.bulletContainer.style.top = Number(y) + "px";
      };
    if (dir === "right")
      return () => {
        this.request = requestAnimationFrame(this.smoothBullets("right"));
        let x = this.location[0];
        x += this.location[2] / 5;
        this.bulletContainer.style.left = Number(x) + "px";
      };
    if (dir === "left")
      return () => {
        this.request = requestAnimationFrame(this.smoothBullets("left"));
        let x = this.location[0];
        x -= this.location[2] / 5;
        this.bulletContainer.style.left = Number(x) + "px";
      };
  }
}

const bul = new Bullet(gameDB);

function smoothBulletsDown() {
  bul.request = requestAnimationFrame(smoothBulletsDown);
  bul.Y = Number(bul.Y) + 5;
  bul.bulletContainer.style.top = Number(bul.Y) + "px";
}
