const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score'); 
let bestScoreAnimated = false;

// Emoji font size
ctx.font = '30px Arial';

const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    speed: 5,
    emoji: '🐭'
};

const cheese = {
    x: Math.random() * (canvas.width - 40) + 20,
    y: Math.random() * (canvas.height - 40) + 20,
    emoji: '🧀'
};

const cat = {
    x: Math.random() * (canvas.width - 40) + 20,
    y: Math.random() * (canvas.height - 40) + 20,
    speed: 2,
    active: false,
    timer: 0,
    emoji: '🐱',
    direction: { x: 0, y: 0 },
    angle: 0,
    circling: false
};

const house = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 57,
    emoji: '🏠'
};

let score = 0;
let gameOver = false;

let mousePosition = { x: mouse.x, y: mouse.y };

// Получаем лучший счёт из localStorage или устанавливаем 0
let bestScore = localStorage.getItem('bestScore') || 0;
bestScore = parseInt(bestScore, 10);
bestScoreElement.textContent = 'BEST SCORE: ' + bestScore;

// Добавляем обработчик событий мыши
canvas.addEventListener('mousemove', updateMousePosition);

function updateMousePosition(e) {
    const rect = canvas.getBoundingClientRect();
    mousePosition.x = e.clientX - rect.left;
    mousePosition.y = e.clientY - rect.top;
}

// airplane.js (код перенесён сюда)

// Объект самолёта
var airplane = {
    active: false,
    duration: 5000, // Продолжительность полёта в миллисекундах
    startTime: null,
    speed: 7, // Скорость самолёта
    emoji: '✈️',
    x: canvas.width / 2,
    y: canvas.height / 2
};

function startAirplaneMode() {
    airplane.active = true;
    airplane.startTime = Date.now();
    // Устанавливаем позицию самолёта равной текущей позиции мышки
    airplane.x = mouse.x;
    airplane.y = mouse.y;
    // Увеличиваем скорость игрока
    airplane.speed = 7; // Можно настроить скорость самолёта
}

function endAirplaneMode() {
    airplane.active = false;
    // Возвращаем мышку на позицию самолёта
    mouse.x = airplane.x;
    mouse.y = airplane.y;
    mousePosition.x = mouse.x;
    mousePosition.y = mouse.y;
}

function updatePlayer() {
    if (airplane.active) {
        let dx = mousePosition.x - airplane.x;
        let dy = mousePosition.y - airplane.y;
        let distance = Math.hypot(dx, dy);

        if (distance > airplane.speed) {
            airplane.x += (dx / distance) * airplane.speed;
            airplane.y += (dy / distance) * airplane.speed;
        } else {
            airplane.x = mousePosition.x;
            airplane.y = mousePosition.y;
        }

        // Проверяем, истекло ли время полёта
        if (Date.now() - airplane.startTime >= airplane.duration) {
            endAirplaneMode();
        }
    } else {
        let dx = mousePosition.x - mouse.x;
        let dy = mousePosition.y - mouse.y;
        let distance = Math.hypot(dx, dy);

        if (distance > mouse.speed) {
            mouse.x += (dx / distance) * mouse.speed;
            mouse.y += (dy / distance) * mouse.speed;
        } else {
            mouse.x = mousePosition.x;
            mouse.y = mousePosition.y;
        }
    }
}

function spawnCat() {
    cat.active = true;
    cat.x = Math.random() * (canvas.width - 40) + 20;
    cat.y = Math.random() * (canvas.height - 40) + 20;
    cat.angle = Math.atan2(cat.y - house.y, cat.x - house.x); // Начальный угол
}

function updateCat() {
    if (cat.active) {
        let playerX = airplane.active ? airplane.x : mouse.x;
        let playerY = airplane.active ? airplane.y : mouse.y;

        if (airplane.active) {
            // Кошка бродит случайно
            cat.x += (Math.random() - 0.5) * cat.speed;
            cat.y += (Math.random() - 0.5) * cat.speed;

            // Ограничиваем передвижение кошки границами поля
            cat.x = Math.max(0, Math.min(canvas.width, cat.x));
            cat.y = Math.max(0, Math.min(canvas.height, cat.y));
        } else {
            let dx = playerX - cat.x;
            let dy = playerY - cat.y;
            let distanceToPlayer = Math.hypot(dx, dy);

            if (isCatNearHouse()) {
                avoidHouse();
            } else if (isPlayerInHouse()) {
                cat.circling = true;
                circleAroundHouse();
            } else {
                cat.circling = false;
                if (distanceToPlayer > 1) {
                    cat.direction.x = (dx / distanceToPlayer);
                    cat.direction.y = (dy / distanceToPlayer);
                    cat.x += cat.direction.x * cat.speed;
                    cat.y += cat.direction.y * cat.speed;
                }
            }

            // Проверка столкновения с игроком
            if (!isPlayerInHouse()) {
                if (distanceToPlayer < 20) { // Столкновение
                    gameOver = true;

                    // Обновляем лучший счёт
                    if (score > bestScore) {
                        bestScore = score;
                        localStorage.setItem('bestScore', bestScore);
                        bestScoreElement.textContent = 'BEST SCORE: ' + bestScore;
                    }
                }
            }
        }
    } else {
        cat.timer++;
        if (cat.timer > 300) { // Каждые ~5 секунд
            spawnCat();
            cat.timer = 0;
        }
    }
}

function isPlayerInHouse() {
    let playerX = airplane.active ? airplane.x : mouse.x;
    let playerY = airplane.active ? airplane.y : mouse.y;

    let dx = playerX - house.x;
    let dy = playerY - house.y;
    let distance = Math.hypot(dx, dy);

    return distance < house.size / 2;
}

function isCatNearHouse() {
    let dx = cat.x - house.x;
    let dy = cat.y - house.y;
    let distance = Math.hypot(dx, dy);

    return distance < (house.size / 2 + 20); // Дополнительное пространство вокруг домика
}

function avoidHouse() {
    let dx = cat.x - house.x;
    let dy = cat.y - house.y;
    let distance = Math.hypot(dx, dy);

    if (distance > 0) {
        cat.direction.x = (dx / distance);
        cat.direction.y = (dy / distance);
        cat.x += cat.direction.x * cat.speed;
        cat.y += cat.direction.y * cat.speed;
    } else {
        cat.x += (Math.random() - 0.5) * cat.speed * 2;
        cat.y += (Math.random() - 0.5) * cat.speed * 2;
    }
}

function circleAroundHouse() {
    const radius = house.size;
    cat.angle += 0.01; // Скорость кружения (настраиваемая)
    cat.x = house.x + Math.cos(cat.angle) * (radius + 20);
    cat.y = house.y + Math.sin(cat.angle) * (radius + 20);
}

function checkCheeseCollision() {
    let playerX = airplane.active ? airplane.x : mouse.x;
    let playerY = airplane.active ? airplane.y : mouse.y;

    let dx = playerX - cheese.x;
    let dy = playerY - cheese.y;
    let distance = Math.hypot(dx, dy);

    if (distance < 20) { // Проверка столкновения с сыром
        score++;
        scoreElement.textContent = 'SCORE: ' + score;
        cheese.x = Math.random() * (canvas.width - 40) + 20;
        cheese.y = Math.random() * (canvas.height - 40) + 20;

        // Проверяем, является ли текущий счёт лучшим
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore);
            bestScoreElement.textContent = 'BEST SCORE: ' + bestScore;

            // Анимация лучшего счёта
            if (!bestScoreAnimated) {
                bestScoreAnimated = true; 
                bestScoreElement.classList.add('new-best-score');
                bestScoreElement.addEventListener('animationend', function() {
                    bestScoreElement.classList.remove('new-best-score');
                }, { once: true });
            }
        }
    }

    // Проверяем, набрано ли 5 сыров и игрок в домике
    if (score >= 5 && isPlayerInHouse() && !airplane.active) {
        startAirplaneMode();
    }
}

function drawPlayer() {
    if (airplane.active) {
        ctx.fillText(airplane.emoji, airplane.x - 15, airplane.y + 15);
    } else {
        ctx.fillText(mouse.emoji, mouse.x - 15, mouse.y + 15);
    }
}

function drawCheese() {
    ctx.fillText(cheese.emoji, cheese.x - 15, cheese.y + 15);
}

function drawCat() {
    if (cat.active) {
        ctx.fillText(cat.emoji, cat.x - 15, cat.y + 15);
    }
}

function drawHouse() {
    ctx.fillText(house.emoji, house.x - 25, house.y + 25);
}

function drawGameOver() {
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        const xPosition = canvas.width / 2 - 150;

        ctx.font = 'bold 48px "Montserrat BoldItalic"';
        ctx.fillText('GAME OVER', xPosition, canvas.height / 2.7);

        ctx.font = '32px "Azeret Mono"';
        let text = 'YOUR SCORE: ' + score;
        let textWidth = ctx.measureText(text).width;
        ctx.fillText(text, xPosition, canvas.height / 2.5 + 70);

        text = 'BEST SCORE: ' + bestScore;
        textWidth = ctx.measureText(text).width;
        ctx.fillText(text, xPosition, canvas.height / 2.5 + 130);

        ctx.font = '22px "Azeret Mono"';
        text = 'To restart, press R';
        textWidth = ctx.measureText(text).width;
        ctx.fillText(text, (canvas.width - textWidth) / 2, canvas.height / 2.5 + 190);

        ctx.font = '30px Arial';
    }
}

// Перезапуск игры при нажатии клавиши 'R'
document.addEventListener('keydown', function(e) {
    if (gameOver && e.key.toLowerCase() === 'r') {
        restartGame();
    }
});

function restartGame() {
    // Сброс счёта
    score = 0;
    scoreElement.textContent = 'SCORE: ' + score;
    gameOver = false;
    bestScoreAnimated = false;

    // Сброс состояния самолёта
    airplane.active = false;
    airplane.startTime = null;

    // Сброс позиции мышки
    mouse.x = canvas.width / 2;
    mouse.y = canvas.height / 2;
    mousePosition.x = mouse.x;
    mousePosition.y = mouse.y;

    cat.active = false;
    cat.timer = 0;
    cat.x = Math.random() * (canvas.width - 40) + 20;
    cat.y = Math.random() * (canvas.height - 40) + 20;

    cheese.x = Math.random() * (canvas.width - 40) + 20;
    cheese.y = Math.random() * (canvas.height - 40) + 20;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '30px Arial';
    drawHouse();
    drawCheese();
    drawPlayer();
    drawCat();
    drawGameOver();
}

function update() {
    if (!gameOver) {
        updatePlayer();
        checkCheeseCollision();
        updateCat();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
