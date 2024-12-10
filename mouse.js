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
    spawnCounter: 0,    // Counts how many cheeses have been collected since last cherry spawn
    nextSpawn: 0,       // Number of cheeses needed until next cherry spawn
    duration: 5000      // Cherry display duration in milliseconds
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

// Airplane icon object
const airplaneIcon = {
    x: null,
    y: null,
    emoji: '✈️',
    active: false
};

const cheeseSound = new Audio('sounds/picker.wav');
const startSound = new Audio('sounds/start.wav');
const gameOverSound = new Audio('sounds/game_over.wav');

let gameOverSoundPlayed = false;

function playGameOverSound() {
    if (!gameOverSoundPlayed) {
        gameOverSound.play();
        gameOverSoundPlayed = true;
    }
}

// Tracks how many cheeses are collected since last airplane mode ended
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

const airplane = {
    active: false,
    duration: 5000, // Airplane mode duration in ms
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
    airplane.speed = 10; 
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

        // Check if airplane mode duration ended
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
    cat.angle = Math.atan2(cat.y - house.y, cat.x - house.x);
}

function updateCat() {
    if (cat.active) {
        let playerX = airplane.active ? airplane.x : mouse.x;
        let playerY = airplane.active ? airplane.y : mouse.y;

        if (airplane.active) {
            // Cat moves randomly when airplane is active
            //cat.x += (Math.random() - 0.5) * cat.speed;
            //cat.y += (Math.random() - 0.5) * cat.speed;

            // Cat follows the airplane
            let dx = playerX - cat.x;
            let dy = playerY - cat.y;
            let distanceToPlayer = Math.hypot(dx, dy);
            cat.circling = false;
                if (distanceToPlayer > 1) {
                    cat.direction.x = (dx / distanceToPlayer);
                    cat.direction.y = (dy / distanceToPlayer);
                    cat.x += cat.direction.x * cat.speed;
                    cat.y += cat.direction.y * cat.speed;
                }


            // Limit cat position to canvas boundaries
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
                if (distanceToPlayer < 20) {
                    gameOver = true;

                    // Update best score
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
        if (cat.timer > 300) { 
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
    cat.angle += 0.01; 
    cat.x = house.x + Math.cos(cat.angle) * (radius + 20);
    cat.y = house.y + Math.sin(cat.angle) * (radius + 20);
}

function checkCheeseCollision() {
    let playerX = airplane.active ? airplane.x : mouse.x;
    let playerY = airplane.active ? airplane.y : mouse.y;

    let dx = playerX - cheese.x;
    let dy = playerY - cheese.y;
    let distance = Math.hypot(dx, dy);

    if (distance < 20) { 
        // Play the cheese sound
        cheeseSound.currentTime = 0; // Reset to start if needed for rapid replays
        cheeseSound.play();

        // Debugging sound issues
        // cheeseSound.addEventListener('error', function(e) {
        //     console.error('Error playing sound:', e);
        // });
        
        // cheeseSound.play().catch(function(error) {
        //     console.error('Play promise rejected:', error);
        // });

        score++;
        scoreElement.textContent = 'SCORE: ' + score;
        cheese.x = Math.random() * (canvas.width - 40) + 20;
        cheese.y = Math.random() * (canvas.height - 40) + 20;

        // If not in airplane mode and airplane icon not active, count cheeses for airplane icon
        if (!airplane.active && !airplaneIcon.active) {
            cheeseCollectedSinceLastPlane++;
            if (cheeseCollectedSinceLastPlane >= 5) {
                spawnAirplaneIcon();
                cheeseCollectedSinceLastPlane = 0;
            }
        }

        // Cherry logic: if score >= 20, start counting for next cherry
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

    // Check collision with cherry if it's active
    if (cherry.active) {
        dx = playerX - cherry.x;
        dy = playerY - cherry.y;
        distance = Math.hypot(dx, dy);

        if (distance < 20) { 
            score += 3; 
            scoreElement.textContent = 'SCORE: ' + score;
            cherry.active = false; 
            createFloatingText('+3', cherry.x, cherry.y);

            // Check best score
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('bestScore', bestScore);
                bestScoreElement.textContent = 'BEST SCORE: ' + bestScore;

                // Best score animation
                if (!bestScoreAnimated) {
                    bestScoreAnimated = true;
                    bestScoreElement.classList.add('new-best-score');
                    bestScoreElement.addEventListener('animationend', function () {
                        bestScoreElement.classList.remove('new-best-score');
                    }, { once: true });
                }
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
            cheeseCollectedSinceLastPlane = 0; 
        }
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

function drawAirplaneIcon() {
    if (airplaneIcon.active) {
        ctx.fillText(airplaneIcon.emoji, airplaneIcon.x - 15, airplaneIcon.y + 15);
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
        playGameOverSound();
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
    drawAirplaneIcon(); // Draw airplane icon if active
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

// gameLoop();

startButton.addEventListener('click', function() {
    // Unmute and play a tiny portion silently
    startSound.muted = true;
    startSound.play().then(() => {
        // startSound.pause();
        startSound.muted = false;
        startButton.style.display = 'none';
        // Now start the game
        gameLoop();
    });
});