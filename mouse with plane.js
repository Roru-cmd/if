const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score'); 
let bestScoreAnimated = false;

ctx.font = '30px Arial';

// Floating text array
const floatingTexts = [];

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

const cherry = {
    x: null,
    y: null,
    emoji: '🍒',
    active: false,
    spawnCounter: 0,    // Counts how many cheeses have been collected since last cherry
    nextSpawn: 0,       // Number of cheeses required until next cherry spawn
    duration: 5000       // Cherry display duration in milliseconds
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

const airplaneIcon = {
    x: null,
    y: null,
    emoji: '✈️',
    active: false
};

let cheeseCollectedSinceLastPlane = 0;

// Function to spawn the airplane icon
function spawnAirplaneIcon() {
    airplaneIcon.active = true;
    airplaneIcon.x = Math.random() * (canvas.width - 40) + 20;
    airplaneIcon.y = Math.random() * (canvas.height - 40) + 20;
}

let score = 0;
let gameOver = false;

let mousePosition = { x: mouse.x, y: mouse.y };

// Get the best score from localStorage or set it to 0
let bestScore = localStorage.getItem('bestScore') || 0;
bestScore = parseInt(bestScore, 10);
bestScoreElement.textContent = 'BEST SCORE: ' + bestScore;

// Returns a random integer between min and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Update mouse position on mouse move
canvas.addEventListener('mousemove', updateMousePosition);

function updateMousePosition(e) {
    const rect = canvas.getBoundingClientRect();
    mousePosition.x = e.clientX - rect.left;
    mousePosition.y = e.clientY - rect.top;
}

const airplane = {
    active: false,
    duration: 5000, // Airplane mode duration
    startTime: null,
    speed: 10, // Airplane speed
    emoji: '✈️',
    x: canvas.width / 2,
    y: canvas.height / 2
};

function startAirplaneMode() {
    airplane.active = true;
    airplane.startTime = Date.now();
    airplane.x = mouse.x;
    airplane.y = mouse.y;
    airplane.speed = 10; // Airplane speed
}

function endAirplaneMode() {
    airplane.active = false;
    mouse.x = airplane.x;
    mouse.y = airplane.y;
    mousePosition.x = mouse.x;
    mousePosition.y = mouse.y;
}

// Update player (mouse or airplane) position
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

        // Check if airplane mode duration has passed
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
    cat.angle = Math.atan2(cat.y - house.y, cat.x - house.x); // Initial angle
}

function updateCat() {
    if (cat.active) {
        let playerX = airplane.active ? airplane.x : mouse.x;
        let playerY = airplane.active ? airplane.y : mouse.y;

        if (airplane.active) {
            // Cat moves randomly when airplane is active
            cat.x += (Math.random() - 0.5) * cat.speed;
            cat.y += (Math.random() - 0.5) * cat.speed;

            // Limit cat position to the canvas boundaries
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

            // Check collision with player
            if (!isPlayerInHouse()) {
                if (distanceToPlayer < 20) { // Collision with player
                    gameOver = true;

                    // Update best score if needed
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
        if (cat.timer > 300) { // Spawn cat every ~5 seconds at 60 FPS
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

    return distance < (house.size / 2 + 20);
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
    cat.angle += 0.01; // Circular motion speed
    cat.x = house.x + Math.cos(cat.angle) * (radius + 20);
    cat.y = house.y + Math.sin(cat.angle) * (radius + 20);
}

function checkCheeseCollision() {
    let playerX = airplane.active ? airplane.x : mouse.x;
    let playerY = airplane.active ? airplane.y : mouse.y;

    // Check collision with cheese
    let dx = playerX - cheese.x;
    let dy = playerY - cheese.y;
    let distance = Math.hypot(dx, dy);

    if (distance < 20) { // Collision with cheese
        score++;
        scoreElement.textContent = 'SCORE: ' + score;
        cheese.x = Math.random() * (canvas.width - 40) + 20;
        cheese.y = Math.random() * (canvas.height - 40) + 20;

        // If not in airplane mode and airplane icon is not active, count cheeses for airplane icon appearance
        if (!airplane.active && !airplaneIcon.active) {
            cheeseCollectedSinceLastPlane++;
            // If 5 cheeses are collected, spawn the airplane icon
            if (cheeseCollectedSinceLastPlane >= 5) {
                spawnAirplaneIcon();
                cheeseCollectedSinceLastPlane = 0;
            }
        }

        // If score >= 20, handle cherry spawn logic
        if (score >= 20) {
            cherry.spawnCounter++;
            if (cherry.spawnCounter >= cherry.nextSpawn) {
                spawnCherry();
                cherry.spawnCounter = 0;
                cherry.nextSpawn = getRandomInt(7, 17);
            }
        }

        // Check if player beats best score
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore);
            bestScoreElement.textContent = 'BEST SCORE: ' + bestScore;

            // Best score animation
            if (!bestScoreAnimated) {
                bestScoreAnimated = true; 
                bestScoreElement.classList.add('new-best-score');
                bestScoreElement.addEventListener('animationend', function() {
                    bestScoreElement.classList.remove('new-best-score');
                }, { once: true });
            }
        }
    }

    // Check collision with airplane icon
    if (airplaneIcon.active) {
        dx = playerX - airplaneIcon.x;
        dy = playerY - airplaneIcon.y;
        distance = Math.hypot(dx, dy);
        if (distance < 20) {
            // Mouse caught the airplane icon
            airplaneIcon.active = false;
            startAirplaneMode();
            // Reset cheeseCollectedSinceLastPlane since airplane mode started
            cheeseCollectedSinceLastPlane = 0;
        }
    }
}

function drawAirplaneIcon() {
    if (airplaneIcon.active) {
        ctx.fillText(airplaneIcon.emoji, airplaneIcon.x - 15, airplaneIcon.y + 15);
    }
}

function spawnCherry() {
    cherry.active = true;
    cherry.x = Math.random() * (canvas.width - 40) + 20;
    cherry.y = Math.random() * (canvas.height - 40) + 20;
    cherry.spawnTime = Date.now();
}

function drawCherry() {
    if (cherry.active) {
        ctx.fillText(cherry.emoji, cherry.x - 15, cherry.y + 15);
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

function createFloatingText(text, x, y) {
    floatingTexts.push({
        text: text,
        x: x,
        y: y,
        opacity: 1,          // Float text initial opacity
        life: 70,            // Float text lifespan (in frames)
        riseSpeed: 1,        // Float text upward speed
        fadeSpeed: 0.0143    // Float text fade speed (1/life)
    });
}

function updateFloatingTexts() {
    for (let i = 0; i < floatingTexts.length; i++) {
        const ft = floatingTexts[i];
        ft.y -= ft.riseSpeed;         
        ft.opacity -= ft.fadeSpeed;   
        ft.life--;

        if (ft.life <= 0 || ft.opacity <= 0) {
            floatingTexts.splice(i, 1);
            i--; 
        }
    }
}

function drawFloatingTexts() {
    ctx.font = '20px "Azeret Mono"'; 
    for (const ft of floatingTexts) {
        ctx.save();
        ctx.globalAlpha = ft.opacity; 
        ctx.fillStyle = '#de3163';     
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
    }
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

// Restart the game
document.addEventListener('keydown', function(e) {
    if (gameOver && e.key.toLowerCase() === 'r') {
        restartGame();
    }
});

function restartGame() {
    // Reset score
    score = 0;
    scoreElement.textContent = 'SCORE: ' + score;
    gameOver = false;
    bestScoreAnimated = false;

    // Reset airplane mode
    airplane.active = false;
    airplane.startTime = null;

    // Reset mouse position
    mouse.x = canvas.width / 2;
    mouse.y = canvas.height / 2;
    mousePosition.x = mouse.x;
    mousePosition.y = mouse.y;

    // Cherry reset
    cherry.active = false;
    cherry.spawnCounter = 0;
    cherry.nextSpawn = getRandomInt(7, 17);

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
    drawCherry();
    drawAirplaneIcon();
    drawPlayer();
    drawCat();
    drawFloatingTexts();
    drawGameOver();
}

function update() {
    if (!gameOver) {
        updatePlayer();
        checkCheeseCollision();
        updateCat();
        updateFloatingTexts(); 

        // Check cherry duration
        if (cherry.active && Date.now() - cherry.spawnTime >= cherry.duration) {
            cherry.active = false;
        }
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
