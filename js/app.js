const EnemyNums = 4;
const BlockSize = {width: 100, height: 82};
const CanvasSize = {width: 505, height: 606};

/**
 * 这是我们的玩家要躲避的敌人 
 */
var Enemy = function() {
    // 要应用到每个敌人的实例的变量写在这里
    // 我们已经提供了一个来帮助你实现更多

    // 敌人的图片或者雪碧图，用一个我们提供的工具函数来轻松的加载文件
    this.sprite = 'images/enemy-bug.png';

    // 起始位置: 1 <= row <= 3, col = 0
    this.x = getRandomInt(1, 5) * BlockSize.width;
    this.y = getRandomInt(1, 3) * BlockSize.height;

    // 速度（目前只有 x 方向的速度，y 保持不变。
    this.velocityX = getRandomInt(1, 3) * BlockSize.width;

    // 图片大小
    this.width = 50;
    this.height = 85;
};

/**
 * 表示时间间隙。根据 engine 的实现，dt 的单位是秒
 * @param  {} dt 表示时间间隙。根据 engine 的实现，dt 的单位是秒
 */
Enemy.prototype.update = function(dt) {
    // 你应该给每一次的移动都乘以 dt 参数，以此来保证游戏在所有的电脑上
    // 都是以同样的速度运行的
    // enemy 目前只有 x 方向的速度
    const increX = this.velocityX * dt;
    let newX = this.x + increX;

    // 边界检查：如果 x 超过了右边界，返回到 0；重设 y 的值
    if (newX > CanvasSize.width) {
        newX = -this.width;
        this.y = getRandomInt(1, 3) * BlockSize.height;
        this.velocityX = getRandomInt(1, 3) * BlockSize.width;
    }
    this.x = newX;
};

// 此为游戏必须的函数，用来在屏幕上画出敌人，
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Enemy.prototype.offscreen = function() {
    if (this.x < 0 || this.x > CanvasSize.width) return true;
    return false;
}

const PlayerStartPoint = {
    x: 2 * BlockSize.width,
    y: 5 * BlockSize.height
};
Object.freeze(PlayerStartPoint);

// 现在实现你自己的玩家类
// 这个类需要一个 update() 函数， render() 函数和一个 handleInput()函数
var Player = function() {
    this.sprite = 'images/char-cat-girl.png';
    
    // 起始位置
    this.x = PlayerStartPoint.x;
    this.y = PlayerStartPoint.y;

    // 速度：一次恰好向前后或者左右移动一个 block
    // speed 与 velocity 的区别：后者是向量，有方向
    this.speedX = BlockSize.width;
    this.speedY = BlockSize.height;
    this.velocityX = 0;
    this.velocityY = 0;

    // 图片大小
    this.width = 50;
    this.height = 85;
};

Player.prototype.update = function() {
    const increX = this.velocityX;
    const increY = this.velocityY;

    let newX = this.x + increX;
    let newY = this.y + increY;

    if (newX > CanvasSize.width - this.width) {
        newX = 0;
    }
    if (newX < 0) {
        newX = CanvasSize.width - BlockSize.width;
    }
    if (newY > PlayerStartPoint.y) {
        newY = PlayerStartPoint.y;
    }
    if (newY < 0) {
        newY = this.y;
    }

    this.x = newX;
    this.y = newY;
    // 一定要将这两个置零，才能保证移动之后停下来
    this.velocityX = 0;
    this.velocityY = 0;
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function(direction) {
    switch (direction) {
        case 'left':
            this.velocityX = -this.speedX;
            this.velocityY = 0;
            break;
        case 'up':
            this.velocityX = 0;
            this.velocityY = -this.speedY;
            break;
        case 'right':
            this.velocityX = this.speedX;
            this.velocityY = 0;
            break;
        case 'down':
            this.velocityX = 0;
            this.velocityY = this.speedY;
            break;
        default:
            this.velocityX = 0;
            this.velocityY = 0;
            break;
    }
};
/**
 * 碰撞检测，使用 Circle Collision 的方式
 * 更多别的方式可参考：https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
 * @param  {} enemy 检测对象
 */
Player.prototype.collideWith = function(enemy) {
    const circle1 = {radius: this.width / 2, x: this.x, y: this.y};
    const circle2 = {radius: enemy.width / 2, x: enemy.x, y: enemy.y};

    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < circle1.radius + circle2.radius) {
        return true;
    }
    return false;
};

Player.prototype.reset = function() {
    this.x = PlayerStartPoint.x;
    this.y = PlayerStartPoint.y;
};

// 现在实例化你的所有对象
// 把所有敌人的对象都放进一个叫 allEnemies 的数组里面
var allEnemies = [];
for (let i = 0; i < EnemyNums; ++i) {
    allEnemies.push(new Enemy());
}

// 把玩家对象放进一个叫 player 的变量里面
var player = new Player();

// 这段代码监听游戏玩家的键盘点击事件并且代表将按键的关键数字送到 Play.handleInput()
// 方法里面。你不需要再更改这段代码了。
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

/**
 * 由 engine 在 update 的时候调用
 * 将 offscreen 的 enemy 可以直接排除
 */
function checkCollisions() {
    for (const enemy of allEnemies) {
        if (enemy.offscreen()) continue;
        if (player.collideWith(enemy)) {
            player.reset();
        }
    }
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 * https://stackoverflow.com/a/1527820
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}