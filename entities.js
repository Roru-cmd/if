const CAT_SPEED = 2;
const MOUSE_SPEED = 5;
const AIRPLANE_SPEED = 10;
const HOUSE_SIZE = 57;
const CHERRY_DURATION = 5000;
const AIRPLANE_DURATION = 5000;


const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    speed: MOUSE_SPEED,
    emoji: '🐭'
};

const cat = {
    x: Math.random() * (canvas.width - 40) + 20,
    y: Math.random() * (canvas.height - 40) + 20,
    speed: CAT_SPEED,
    active: false,
    timer: 0,
    emoji: '🐱',
    direction: { x: 0, y: 0 },
    angle: 0,
    circling: false
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
    spawnCounter: 0,            // Counts how many cheeses have been collected since last cherry spawn
    nextSpawn: 0,               // Number of cheeses needed until next cherry spawn
    duration: CHERRY_DURATION   
};

const house = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: HOUSE_SIZE,
    emoji: '🏠'
};

const airplane = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    active: false,
    startTime: null,
    speed: AIRPLANE_SPEED,       
    emoji: '✈️',
    duration: AIRPLANE_DURATION
};

const airplaneIcon = {
    x: null,
    y: null,
    emoji: '✈️',
    active: false
};