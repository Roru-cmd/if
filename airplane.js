// airplane.js

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
