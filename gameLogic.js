/**
 * Updates the player's position (mouse or airplane) based on the mousePosition.
 * If the airplane is active, it moves according to airplane rules.
 * If not, it moves as the mouse.
 */
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

/**
 * Updates cat position and behavior.
 */
function updateCat() {
    if (cat.active) {
        let playerX = airplane.active ? airplane.x : mouse.x;
        let playerY = airplane.active ? airplane.y : mouse.y;

        if (airplane.active) {
            // Cat moves randomly when airplane is active
            //cat.x += (Math.random() - 0.5) * cat.speed;
            //cat.y += (Math.random() - 0.5) * cat.speed;
            //
            // OR
            //
            // Cat follows the airplane
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

/**
 * Updates cheese position and check for collision with player.
 */
function checkCheeseCollision() {
    let playerX = airplane.active ? airplane.x : mouse.x;
    let playerY = airplane.active ? airplane.y : mouse.y;

    let dx = playerX - cheese.x;
    let dy = playerY - cheese.y;
    let distance = Math.hypot(dx, dy);

    if (distance < 20) { 
        // Play the cheese sound
        cheeseSound.currentTime = 0; // Reset to start if needed for rapid replays
        // cheeseSound.play();

        // Debugging sound issues
        // cheeseSound.addEventListener('error', function(e) {
        //     console.error('=== Error playing sound:', e);
        // });
        
        // cheeseSound.play().catch(function(err) {
        //     console.error('=== Play promise rejected:', err);
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
            cheeseSound.currentTime = 0;
            cherrySound.play();
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

