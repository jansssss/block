class BreakoutGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private paddle: { x: number; width: number; height: number; };
    private ball: { x: number; y: number; dx: number; dy: number; radius: number; };
    private bricks: { x: number; y: number; width: number; height: number; status: boolean; }[];
    private score: number;
    private gameLoop: number | null;
    private isGameStarted: boolean;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        
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
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.getElementById('startButton')?.addEventListener('click', () => this.startGame());
    }

    private initializeBricks(): void {
        const brickRowCount = 5;
        const brickColumnCount = 8;
        const brickWidth = 80;
        const brickHeight = 20;
        const brickPadding = 10;
        const brickOffsetTop = 30;
        const brickOffsetLeft = 35;

        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                this.bricks.push({
                    x: c * (brickWidth + brickPadding) + brickOffsetLeft,
                    y: r * (brickHeight + brickPadding) + brickOffsetTop,
                    width: brickWidth,
                    height: brickHeight,
                    status: true
                });
            }
        }
    }

    private handleMouseMove(e: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        
        if (relativeX > 0 && relativeX < this.canvas.width) {
            this.paddle.x = relativeX - this.paddle.width / 2;
        }
    }

    private drawBall(): void {
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#0095DD';
        this.ctx.fill();
        this.ctx.closePath();
    }

    private drawPaddle(): void {
        this.ctx.beginPath();
        this.ctx.rect(this.paddle.x, this.canvas.height - this.paddle.height, this.paddle.width, this.paddle.height);
        this.ctx.fillStyle = '#0095DD';
        this.ctx.fill();
        this.ctx.closePath();
    }

    private drawBricks(): void {
        this.bricks.forEach(brick => {
            if (brick.status) {
                this.ctx.beginPath();
                this.ctx.rect(brick.x, brick.y, brick.width, brick.height);
                this.ctx.fillStyle = '#0095DD';
                this.ctx.fill();
                this.ctx.closePath();
            }
        });
    }

    private collisionDetection(): void {
        this.bricks.forEach(brick => {
            if (brick.status) {
                if (this.ball.x > brick.x && 
                    this.ball.x < brick.x + brick.width && 
                    this.ball.y > brick.y && 
                    this.ball.y < brick.y + brick.height) {
                    this.ball.dy = -this.ball.dy;
                    brick.status = false;
                    this.score += 10;
                    this.updateScore();
                    
                    if (this.bricks.every(b => !b.status)) {
                        alert('축하합니다! 게임을 클리어하셨습니다!');
                        this.resetGame();
                    }
                }
            }
        });
    }

    private updateScore(): void {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = `점수: ${this.score}`;
        }
    }

    private draw(): void {
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
        } else if (this.ball.y + this.ball.dy > this.canvas.height - this.ball.radius) {
            // 패들에 맞았는지 확인
            if (this.ball.x > this.paddle.x && 
                this.ball.x < this.paddle.x + this.paddle.width) {
                this.ball.dy = -this.ball.dy;
            } else {
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
            requestAnimationFrame(() => this.draw());
        }
    }

    public startGame(): void {
        if (!this.isGameStarted) {
            this.isGameStarted = true;
            this.draw();
        }
    }

    private resetGame(): void {
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
    }
}

// 게임 인스턴스 생성
window.onload = () => {
    new BreakoutGame();
}; 