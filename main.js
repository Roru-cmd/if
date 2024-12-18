/**
 * This file contains the main game logic.
 */

const startButton = document.getElementById('startButton');

// Floating text array
const floatingTexts = [];

const startSound = new Audio('sounds/start.wav');
const cheeseSound = new Audio('sounds/picker_crunch.wav');
const cherrySound = new Audio('sounds/picker_extra.ogg');
const gameOverSound = new Audio('sounds/game_over.wav');
const airplaneSound = new Audio('sounds/flyby-43.mp3');

let score = 0;
let gameOver = false;
let gameOverSoundPlayed = false;
let cheeseCollectedSinceLastPlane = 0;
let mousePosition = { x: mouse.x, y: mouse.y };

function playGameOverSound() {
    if (!gameOverSoundPlayed) {
        gameOverSound.play();
        gameOverSoundPlayed = true;
    }
}

// Function to spawn the airplane icon
function spawnAirplaneIcon() {
    airplaneIcon.active = true;
    airplaneIcon.x = Math.random() * (canvas.width - 40) + 20;
    airplaneIcon.y = Math.random() * (canvas.height - 40) + 20;
}

// Check if the best score is stored in localStorage
let bestScore = localStorage.getItem('bestScore') || 0;
bestScore = parseInt(bestScore, 10);
bestScoreElement.textContent = 'BEST SCORE: ' + bestScore;

// Returns a random integer between min and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Update mouse position on mousemove
canvas.addEventListener('mousemove', updateMousePosition);

function updateMousePosition(e) {
    const rect = canvas.getBoundingClientRect();
    mousePosition.x = e.clientX - rect.left;
    mousePosition.y = e.clientY - rect.top;
}

function startAirplaneMode() {
    airplaneSound.currentTime = 0;
    airplaneSound.play(); 
    airplane.active = true;
    airplane.startTime = Date.now();
    airplane.x = mouse.x;
    airplane.y = mouse.y;
    airplane.speed = 10; 
}

function endAirplaneMode() {
    airplane.active = false;
    mouse.x = airplane.x;
    mouse.y = airplane.y;
    mousePosition.x = mouse.x;
    mousePosition.y = mouse.y;
}

function spawnCat() {
    cat.active = true;
    cat.x = Math.random() * (canvas.width - 40) + 20;
    cat.y = Math.random() * (canvas.height - 40) + 20;
    cat.angle = Math.atan2(cat.y - house.y, cat.x - house.x);
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
    cat.angle += 0.01; 
    cat.x = house.x + Math.cos(cat.angle) * (radius + 20);
    cat.y = house.y + Math.sin(cat.angle) * (radius + 20);
}

function spawnCherry() {
    cherry.active = true;
    cherry.x = Math.random() * (canvas.width - 40) + 20;
    cherry.y = Math.random() * (canvas.height - 40) + 20;
    cherry.spawnTime = Date.now();
}

function createFloatingText(text, x, y) {
    floatingTexts.push({
        text: text,
        x: x,
        y: y,
        opacity: 1,          
        life: 70,            
        riseSpeed: 1,        
        fadeSpeed: 0.0143    
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

document.addEventListener('keydown', function(e) {
    if (gameOver && e.key.toLowerCase() === 'r') {
        gameOverSound.currentTime = 0;
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

    // Also reset airplane icon
    airplaneIcon.active = false;
    cheeseCollectedSinceLastPlane = 0;
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

        // Cherry duration check
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

startButton.addEventListener('click', function() {
    startSound.muted = true;
    startSound.play().then(() => {
        startSound.muted = false;
        startButton.style.display = 'none';
        gameLoop();
    });
});