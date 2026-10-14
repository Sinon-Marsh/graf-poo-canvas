// Configuración del Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Clase Ball (Pelota)
class Ball {
    constructor(x, y, radius, speedX, speedY, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = color;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    move() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Colisión con la parte superior e inferior
        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
            this.speedY = -this.speedY;
        }
    }

    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.speedX = -this.speedX; // Cambia de dirección al reiniciar
    }
}

// Clase Paddle (Paleta)
class Paddle {
    constructor(x, y, width, height, color, isPlayerControlled = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.isPlayerControlled = isPlayerControlled;
        this.speed = 6;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move(direction) {
        if (direction === 'up' && this.y > 0) {
            this.y -= this.speed;
        } else if (direction === 'down' && this.y + this.height < canvas.height) {
            this.y += this.speed;
        }
    }

    // Movimiento automático de la IA siguiendo a la pelota más cercana
    autoMove(balls) {
        if (balls.length === 0) return;
        
        // Busca la pelota más cercana a la paleta de la CPU
        let closestBall = balls[0];
        let minDistance = Math.abs(canvas.width - balls[0].x);

        for (let i = 1; i < balls.length; i++) {
            let dist = Math.abs(canvas.width - balls[i].x);
            if (dist < minDistance) {
                minDistance = dist;
                closestBall = balls[i];
            }
        }

        if (closestBall.y < this.y + this.height / 2) {
            this.y -= this.speed * 0.7; // Velocidad ajustada para balancear
        } else if (closestBall.y > this.y + this.height / 2) {
            this.y += this.speed * 0.7;
        }
    }
}

// Clase Game (Controlador del juego)
class Game {
    constructor() {
        // Generar 5 pelotas con diferente tamaño, velocidad y color
        this.balls = [
            new Ball(canvas.width / 2, canvas.height / 2, 8, 4, 3, '#FF5733'),   // Rojo Naranja
            new Ball(canvas.width / 2, canvas.height / 2, 12, -5, 4, '#33FF57'),  // Verde
            new Ball(canvas.width / 2, canvas.height / 2, 6, 6, -3, '#3357FF'),   // Azul
            new Ball(canvas.width / 2, canvas.height / 2, 10, -4, -5, '#F3FF33'), // Amarillo
            new Ball(canvas.width / 2, canvas.height / 2, 15, 3, 5, '#FF33F3')    // Magenta
        ];

        // Paleta Jugador (Doble de alto: 200px, Color Cyan)
        this.paddle1 = new Paddle(10, canvas.height / 2 - 100, 15, 200, '#00FFFF', true);

        // Paleta CPU (Alto normal: 100px, Color Naranja)
        this.paddle2 = new Paddle(canvas.width - 25, canvas.height / 2 - 50, 15, 100, '#FFA500', false);

        this.keys = {};
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar pelotas
        this.balls.forEach(ball => ball.draw());

        // Dibujar paletas
        this.paddle1.draw();
        this.paddle2.draw();
    }

    update() {
        // Control de teclado para el jugador
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
            this.paddle1.move('up');
        }
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
            this.paddle1.move('down');
        }

        // Movimiento automático de la CPU
        this.paddle2.autoMove(this.balls);

        // Actualizar cada pelota y evaluar colisiones
        this.balls.forEach(ball => {
            ball.move();

            // Colisión con Paleta 1 (Jugador)
            if (
                ball.x - ball.radius <= this.paddle1.x + this.paddle1.width &&
                ball.x + ball.radius >= this.paddle1.x &&
                ball.y >= this.paddle1.y &&
                ball.y <= this.paddle1.y + this.paddle1.height
            ) {
                ball.speedX = Math.abs(ball.speedX); // Rebota hacia la derecha
            }

            // Colisión con Paleta 2 (CPU)
            if (
                ball.x + ball.radius >= this.paddle2.x &&
                ball.x - ball.radius <= this.paddle2.x + this.paddle2.width &&
                ball.y >= this.paddle2.y &&
                ball.y <= this.paddle2.y + this.paddle2.height
            ) {
                ball.speedX = -Math.abs(ball.speedX); // Rebota hacia la izquierda
            }

            // Reiniciar pelota si sale de las fronteras laterales
            if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
                ball.reset();
            }
        });
    }

    handleInput() {
        window.addEventListener('keydown', (event) => {
            this.keys[event.key] = true;
        });

        window.addEventListener('keyup', (event) => {
            this.keys[event.key] = false;
        });
    }

    run() {
        this.handleInput();
        const gameLoop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
}

// Inicializar y ejecutar
const game = new Game();
game.run();