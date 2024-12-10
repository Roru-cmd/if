/**
 * This file contains all the functions that are responsible for rendering the game elements on the canvas.
 */

/**
 * Draws the score on the canvas.
 */
function drawCherry() {
    if (cherry.active) {
        ctx.fillText(cherry.emoji, cherry.x - 15, cherry.y + 15);
    }
}

/**
 * Draws the airplane icon on the canvas.
 */
function drawAirplaneIcon() {
    if (airplaneIcon.active) {
        ctx.fillText(airplaneIcon.emoji, airplaneIcon.x - 15, airplaneIcon.y + 15);
    }
}

/**
 * Draws the player on the canvas.
 */
function drawPlayer() {
    if (airplane.active) {
        ctx.fillText(airplane.emoji, airplane.x - 15, airplane.y + 15);
    } else {
        ctx.fillText(mouse.emoji, mouse.x - 15, mouse.y + 15);
    }
}

/**
 * Draws the cheese on the canvas.
 */
function drawCheese() {
    ctx.fillText(cheese.emoji, cheese.x - 15, cheese.y + 15);
}

/**
 * Draws the cat on the canvas.
 */
function drawCat() {
    if (cat.active) {
        ctx.fillText(cat.emoji, cat.x - 15, cat.y + 15);
    }
}

/**
 * Draws the house on the canvas.
 */
function drawHouse() {
    ctx.fillText(house.emoji, house.x - 25, house.y + 25);
}

/**
 * Draws the floating texts on the canvas.
 */
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

/**
 * Draws the game over screen on the canvas.
 */
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