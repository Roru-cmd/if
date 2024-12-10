/**
 * This file contains game Canvas initialization.
 */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score'); 
let bestScoreAnimated = false;
ctx.font = '30px Arial';