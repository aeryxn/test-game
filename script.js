var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
const cHeight = window.innerHeight - 20;
const cWidth = window.innerWidth - 20;

c.height = cHeight;
c.width = cWidth;

function lerp(start, end, t, easingFunc) {
	return start * (1 - easingFunc(t)) + end * easingFunc(t);
}

class obstacles {
	constructor(sx, sy, ex, ey) {
		this.startingPoint = { x: sx, y: sy };
		this.endPoint = { x: ex, y: ey };
	}
	Update() {
		ctx.moveTo(this.startingPoint.x, this.startingPoint.y);
		ctx.lineTo(this.endPoint.x, this.endPoint.y);
		ctx.stroke();
	}
}

class levels {
	constructor(level) {
		this.level = level;
		this.obstaclesList = [];
	}
	levelSwitch() {
		if (this.level == 1) {
			let platform = new obstacles(cWidth - 900, cHeight - 100, cWidth - 650, cHeight - 100);
			let platform2 = new obstacles(cWidth - 550, cHeight - 170, cWidth - 400, cHeight - 170);
			if (this.obstaclesList.length !== 2) {
				this.obstaclesList.push(platform);
				this.obstaclesList.push(platform2);
			}
		}
	}
	Update() {
		this.levelSwitch();
	}
}

level = new levels(1);

class player {
	constructor(game) {
		this.gameOver1 = false;
		this.timer = null;
		this.enemyOnPlayer = false;
		this.heartImg = document.getElementById("mcHeart");
		this.health = 3;
		this.gravity = false;
		this.canJump = true;
		this.game = game;
		this.isMoving = false;
		this.ReadyToJump = true;
		this.img = document.getElementById("stickman");
		this.pos = { x: 45, y: cHeight - 100 };
		document.addEventListener("keydown", (e) => this.move(e));
	}
	gameOver() {
		ctx.font = "60px Arial";
		ctx.fillText("Game Over", cWidth / 2, cHeight / 2);
		this.isMoving = false;
	}
	startTimer() {
		if (this.gameOver1 == false) {
			this.timer = setInterval(() => {
				if (this.enemyOnPlayer) {
					this.health--;
				}
			}, 250);
		}
	}

	stopTimer() {
		clearInterval(this.timer);
		this.timer = null;
	}
	move(e) {
		if (this.health <= 0) {
			return;
		}
		if (e.key == "m") {
			console.log("test");
			this.img = document.getElementById("superman");
		}

		if (e.key == "d" || e.key == "ArrowRight") {
			this.isMoving = true;
			this.dx = 1;
		}
		if (e.key == "a" || e.key == "ArrowLeft") {
			this.isMoving = true;
			this.dx = -1;
		}

		if (e.key == " " || e.key == "ArrowUp" || e.key == "w") {
			if (this.canJump && this.ReadyToJump) {
				var startPos = this.pos.y;
				var endPos = this.pos.y - 120;
				var duration = 0.3; // 300ms
				var interval = 1; // 16ms
				var easingFunc = function (t) {
					return 0.5 - 0.5 * Math.cos(Math.PI * t);
				}; // or any other easing function
				this.ReadyToJump = false;
				var t = 0;
				var startTime = performance.now();

				var jumpInterval = setInterval(
					function () {
						var currentTime = performance.now();
						var deltaTime = currentTime - startTime;
						t = deltaTime / (duration * 1000);

						if (t >= 1) {
							t = 1;
							clearInterval(jumpInterval);
							this.gravity = true;
							this.canJump = false;
						}

						var newPos = lerp(startPos, endPos, t, easingFunc);
						this.pos.y = newPos;
					}.bind(this),
					interval
				);

				this.gravity = false;
				setTimeout(() => {
					this.ReadyToJump = true;
				}, 500);
			}
		}
	}
	Update() {
		console.log(this.gameOver1);
		if (this.enemyOnPlayer && !this.timer) {
			this.startTimer();
		} else if (!this.enemyOnPlayer && this.timer) {
			this.stopTimer();
		}
		if (this.pos.x > cWidth) {
			this.pos.x = -50;
		}
		if (this.pos.x < -50) {
			this.pos.x = cWidth;
		}

		if (this.isMoving) {
			if (this.dx == 1) {
				this.pos.x += 5;
			}
			if (this.dx == -1) {
				this.pos.x -= 5;
			}
		}

		if (this.gravity == true) {
			this.pos.y += 10;
			this.canJump = false;
			if (this.pos.y >= this.game.ground) {
				this.gravity = false;
				this.canJump = true;
				this.pos.y = this.game.ground;
			}
		}
		if (this.health == 3) {
			ctx.drawImage(this.heartImg, this.pos.x + 60, this.pos.y - 20, 20, 20);
			ctx.drawImage(this.heartImg, this.pos.x + 40, this.pos.y - 20, 20, 20);
			ctx.drawImage(this.heartImg, this.pos.x + 20, this.pos.y - 20, 20, 20);
		} else if (this.health == 2) {
			ctx.drawImage(this.heartImg, this.pos.x + 40, this.pos.y - 20, 20, 20);
			ctx.drawImage(this.heartImg, this.pos.x + 20, this.pos.y - 20, 20, 20);
		} else if (this.health == 1) {
			ctx.drawImage(this.heartImg, this.pos.x + 20, this.pos.y - 20, 20, 20);
		} else if (this.health <= 0) {
			this.gameOver1 = true;
			this.gameOver();
		}

		ctx.drawImage(this.img, this.pos.x, this.pos.y, 100, 100);
	}
}
class Game {
	constructor() {
		this.ground = cHeight - 100;
		this.player = new player(this);
	}
	Update() {
		let platformName;
		for (let i = 0; i < level.obstaclesList.length; i++) {
			platformName = level.obstaclesList[i];
			if (this.player.pos.x + 100 > platformName.startingPoint.x && this.player.pos.x < platformName.endPoint.x && this.player.pos.y + 90 == platformName.startingPoint.y && this.player.pos.y < platformName.startingPoint.y) {
				this.player.gravity = false;
				this.player.canJump = true;
				if (this.player.pos.x + 45 < platformName.startingPoint.x || this.player.pos.x + 50 > platformName.endPoint.x) {
					this.player.gravity = true;
				}
			}
			platformName.Update();
		}
		this.player.Update();
	}
}

Game1 = new Game();

class enemies {
	constructor(health, img, emx, emy, w, h) {
		this.health = health;
		this.img = img;
		this.pos = { x: emx, y: emy };
		this.width = w;
		this.height = h;
	}
	Update() {
		const startX = this.pos.x;
		const endX = Game1.player.pos.x;
		const t = 0.05; // adjust this value to control the speed of the enemy's movement
		function easeInOutQuad(t) {
			return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
		}
		const newX = lerp(startX, endX, t, easeInOutQuad);

		// update the enemy's position
		this.pos.x = newX;
		if (this.pos.x - 45 <= Game1.player.pos.x && this.pos.x + 45 > Game1.player.pos.x && this.pos.y <= Game1.player.pos.y + 70) {
			Game1.player.enemyOnPlayer = true;
		} else {
			Game1.player.enemyOnPlayer = false;
		}
		ctx.drawImage(this.img, this.pos.x, this.pos.y, this.width, this.height);
	}
}

enemy1 = new enemies(100, document.getElementById("batman"), cWidth - 20, cHeight - 100, 100, 100);

function Update() {
	requestAnimationFrame(Update);
	ctx.clearRect(0, 0, cWidth, cHeight);
	Game1.Update();
	enemy1.Update();
	level.Update();
}

Update();
