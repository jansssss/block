class BreakoutGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private paddle: { x: number; width: number; height: number; };
    private ball: { x: number; y: number; dx: number; dy: number; radius: number; };
    private bricks: { x: number; y: number; width: number; height: number; status: boolean; color: string; }[];
    private score: number;
    private gameLoop: number | null;
    private isGameStarted: boolean;
    private particles: { x: number; y: number; dx: number; dy: number; radius: number; color: string; alpha: number; }[];

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

        // 벽돌과 파티클 초기화
        this.bricks = [];
        this.particles = [];
        this.initializeBricks();

        this.score = 0;
        this.gameLoop = null;
        this.isGameStarted = false;

        // 이벤트 리스너 설정
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.getElementById('startButton')?.addEventListener('click', () => this.startGame());
    }

    private getRandomColor(): string {
        const colors = [
            '#FF6B6B', // 빨강
            '#4ECDC4', // 청록
            '#45B7D1', // 하늘
            '#96CEB4', // 민트
            '#FFEEAD', // 노랑
            '#D4A5A5', // 분홍
            '#9B59B6', // 보라
            '#3498DB'  // 파랑
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    private createParticles(x: number, y: number, color: string): void {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            this.particles.push({
                x: x,
                y: y,
                dx: Math.cos(angle) * 3,
                dy: Math.sin(angle) * 3,
                radius: 3,
                color: color,
                alpha: 1
            });
        }
    }

    private updateParticles(): void {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.alpha -= 0.02;

            if (particle.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    private drawParticles(): void {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
            this.ctx.closePath();
            this.ctx.restore();
        });
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
                    status: true,
                    color: this.getRandomColor()
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
                this.ctx.fillStyle = brick.color;
                this.ctx.fill();
                
                // 그라데이션 효과 추가
                const gradient = this.ctx.createLinearGradient(
                    brick.x, brick.y,
                    brick.x, brick.y + brick.height
                );
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
                this.ctx.fillStyle = gradient;
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
                    
                    // 파티클 효과 생성
                    this.createParticles(
                        brick.x + brick.width / 2,
                        brick.y + brick.height / 2,
                        brick.color
                    );

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
        this.updateParticles();
        this.drawParticles();
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
        this.particles = [];
        this.initializeBricks();
    }
}

// 게임 인스턴스 생성
window.onload = () => {
    new BreakoutGame();
}; 