const { Sprite } = require("three");

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

platform = new obstacles(cWidth - 900, cHeight - 100, cWidth - 650, cHeight - 100);
platform2 = new obstacles(cWidth - 550, cHeight - 170, cWidth - 400, cHeight - 170);
class player {
	constructor(game) {
		this.health = 100;
		this.gravity = false;
		this.canJump = true;
		this.game = game;
		this.isMoving = false;
		this.ReadyToJump = true;
		this.img = new Image();
		this.img.src = './1b24350acb1c425.png';
		this.frameIndex = 0;
		this.pos = { x: 45, y: cHeight - 100};
		document.addEventListener("keydown", (e) => this.move(e));
	}
	move(e) {
		console.log(e.key);
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


	animate() {
		const spriteWidth = 40;
	}
	Update() {
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
			if (this.pos.y == this.game.ground) {
				this.gravity = false;
				this.canJump = true;
			}
		}

		ctx.drawImage(this.img, this.pos.x, this.pos.y, 100, 100);
	}
}
class Game {
	constructor() {
		this.ground = cHeight - 100;
		this.player = new player(this);
		this.obstaclesList = [];
	}
	Update() {
		this.obstaclesList.push(platform);
		this.obstaclesList.push(platform2);
		for (let i = 0; i < this.obstaclesList.length; i++) {
			let platformName = this.obstaclesList[i];
			if (this.player.pos.x + 100 > platformName.startingPoint.x && this.player.pos.x < platformName.endPoint.x && this.player.pos.y + 90 == platformName.startingPoint.y && this.player.pos.y < platformName.startingPoint.y) {
				this.player.gravity = false;
				this.player.canJump = true;
				if (this.player.pos.x + 45 < platformName.startingPoint.x || this.player.pos.x + 50 > platformName.endPoint.x) {
					this.player.gravity = true;
				}
			}
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
		ctx.drawImage(this.img, this.pos.x, this.pos.y, this.width, this.height);
	}
}

enemy1 = new enemies(100, document.getElementById("batman"), cHeight - 900, cWidth - 100, 100, 100);

function Update() {
	ctx.clearRect(0, 0, cWidth, cHeight);
	Game1.Update();
	platform.Update();
	platform2.Update();
	enemy1.Update();
	console.log(enemy1.pos.y);
	console.log(cHeight);
	requestAnimationFrame(Update);
}

Update();
