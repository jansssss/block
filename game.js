var BreakoutGame = /** @class */ (function () {
    function BreakoutGame() {
        var _this = this;
        var _a;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        // 패들 초기화
        this.paddle = {
            x: this.canvas.width / 2 - 50,
            width: 100,
            height: 10
        };
        // 공 초기화
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 30,
            dx: 4,
            dy: -4,
            radius: 8
        };
        // 벽돌 초기화
        this.bricks = [];
        this.initializeBricks();
        this.score = 0;
        this.gameLoop = null;
        this.isGameStarted = false;
        // 이벤트 리스너 설정
        this.canvas.addEventListener('mousemove', function (e) { return _this.handleMouseMove(e); });
        (_a = document.getElementById('startButton')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () { return _this.startGame(); });
    }
    BreakoutGame.prototype.initializeBricks = function () {
        var brickRowCount = 5;
        var brickColumnCount = 8;
        var brickWidth = 80;
        var brickHeight = 20;
        var brickPadding = 10;
        var brickOffsetTop = 30;
        var brickOffsetLeft = 35;
        for (var c = 0; c < brickColumnCount; c++) {
            for (var r = 0; r < brickRowCount; r++) {
                this.bricks.push({
                    x: c * (brickWidth + brickPadding) + brickOffsetLeft,
                    y: r * (brickHeight + brickPadding) + brickOffsetTop,
                    width: brickWidth,
                    height: brickHeight,
                    status: true
                });
            }
        }
    };
    BreakoutGame.prototype.handleMouseMove = function (e) {
        var rect = this.canvas.getBoundingClientRect();
        var relativeX = e.clientX - rect.left;
        if (relativeX > 0 && relativeX < this.canvas.width) {
            this.paddle.x = relativeX - this.paddle.width / 2;
        }
    };
    BreakoutGame.prototype.drawBall = function () {
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#0095DD';
        this.ctx.fill();
        this.ctx.closePath();
    };
    BreakoutGame.prototype.drawPaddle = function () {
        this.ctx.beginPath();
        this.ctx.rect(this.paddle.x, this.canvas.height - this.paddle.height, this.paddle.width, this.paddle.height);
        this.ctx.fillStyle = '#0095DD';
        this.ctx.fill();
        this.ctx.closePath();
    };
    BreakoutGame.prototype.drawBricks = function () {
        var _this = this;
        this.bricks.forEach(function (brick) {
            if (brick.status) {
                _this.ctx.beginPath();
                _this.ctx.rect(brick.x, brick.y, brick.width, brick.height);
                _this.ctx.fillStyle = '#0095DD';
                _this.ctx.fill();
                _this.ctx.closePath();
            }
        });
    };
    BreakoutGame.prototype.collisionDetection = function () {
        var _this = this;
        this.bricks.forEach(function (brick) {
            if (brick.status) {
                if (_this.ball.x > brick.x &&
                    _this.ball.x < brick.x + brick.width &&
                    _this.ball.y > brick.y &&
                    _this.ball.y < brick.y + brick.height) {
                    _this.ball.dy = -_this.ball.dy;
                    brick.status = false;
                    _this.score += 10;
                    _this.updateScore();
                    if (_this.bricks.every(function (b) { return !b.status; })) {
                        alert('축하합니다! 게임을 클리어하셨습니다!');
                        _this.resetGame();
                    }
                }
            }
        });
    };
    BreakoutGame.prototype.updateScore = function () {
        var scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = "\uC810\uC218: ".concat(this.score);
        }
    };
    BreakoutGame.prototype.draw = function () {
        var _this = this;
        // 캔버스 클리어
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBricks();
        this.drawBall();
        this.drawPaddle();
        this.collisionDetection();
        // 벽 충돌 감지
        if (this.ball.x + this.ball.dx > this.canvas.width - this.ball.radius ||
            this.ball.x + this.ball.dx < this.ball.radius) {
            this.ball.dx = -this.ball.dx;
        }
        if (this.ball.y + this.ball.dy < this.ball.radius) {
            this.ball.dy = -this.ball.dy;
        }
        else if (this.ball.y + this.ball.dy > this.canvas.height - this.ball.radius) {
            // 패들에 맞았는지 확인
            if (this.ball.x > this.paddle.x &&
                this.ball.x < this.paddle.x + this.paddle.width) {
                this.ball.dy = -this.ball.dy;
            }
            else {
                // 게임 오버
                alert('게임 오버!');
                this.resetGame();
                return;
            }
        }
        // 공 이동
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        if (this.isGameStarted) {
            requestAnimationFrame(function () { return _this.draw(); });
        }
    };
    BreakoutGame.prototype.startGame = function () {
        if (!this.isGameStarted) {
            this.isGameStarted = true;
            this.draw();
        }
    };
    BreakoutGame.prototype.resetGame = function () {
        this.isGameStarted = false;
        this.score = 0;
        this.updateScore();
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height - 30;
        this.ball.dx = 4;
        this.ball.dy = -4;
        this.paddle.x = this.canvas.width / 2 - 50;
        this.bricks = [];
        this.initializeBricks();
    };
    return BreakoutGame;
}());
// 게임 인스턴스 생성
window.onload = function () {
    new BreakoutGame();
};
