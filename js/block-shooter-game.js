// js/block-shooter-game.js
const gameScreen = document.getElementById('gameScreen');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const bossWall = document.getElementById('bossWallFinal');

const btnMoveLeft = document.getElementById('btnMoveLeft');
const btnMoveRight = document.getElementById('btnMoveRight');
const btnShootMobile = document.getElementById('btnShootMobile');
const btnJumpMobile = document.getElementById('btnJumpMobileShooter');

const backgroundMusic = document.getElementById('backgroundGameMusic');

// --- Game Variables ---
let playerX = 50;
const playerWidth = 40;
const playerHeight = 40;
const playerMoveSpeed = 5;

const entityBottomY = 10;
let playerY = entityBottomY;
let playerVelocityY = 0;
const gravity = 1;
const jumpStrength = -16;
let isJumping = false;

let bullets = [];
const bulletWidth = 15;
const bulletHeight = 8;
const bulletSpeed = 10;
const bulletCooldown = 220;
let lastShotTime = 0;

let enemies = [];
const enemyWidth = 35;
const enemyHeight = 35;
const enemySpeedBase = 1.8;
let currentEnemySpeed = enemySpeedBase;
const enemySpawnIntervalStart = 2000;
const enemySpawnIntervalMin = 700; // Giới hạn thời gian spawn tối thiểu
const enemySpawnIntervalDecrementPerKill = 10; // Giảm thời gian spawn sau mỗi kill
let currentEnemySpawnInterval = enemySpawnIntervalStart;
let lastEnemySpawnTime = 0;

let score = 0;
const targetScoreToWin = 330;
const pointsPerKill = 30;

let gameActive = true;
let firstInteractionDone = false; // Cho nhạc nền
const bossWallWidth = 60;

// --- Setup ---
player.style.left = playerX + 'px';
player.style.bottom = playerY + 'px';
player.style.width = playerWidth + 'px';
player.style.height = playerHeight + 'px';

bossWall.style.display = 'block';
bossWall.style.right = '0px';
bossWall.style.width = bossWallWidth + 'px';
bossWall.style.height = '100%';

// --- Functions ---

function tryPlayBackgroundMusic() {
    if (backgroundMusic && backgroundMusic.paused && !firstInteractionDone) {
        const playPromise = backgroundMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log("Nhạc nền đã bắt đầu phát.");
                firstInteractionDone = true;
                removeFirstInteractionListeners();
            }).catch(error => {
                console.warn("Không thể tự động phát nhạc nền:", error);
                firstInteractionDone = true; 
                removeFirstInteractionListeners();
            });
        }
    } else if (backgroundMusic && !backgroundMusic.paused) {
        firstInteractionDone = true;
        removeFirstInteractionListeners();
    }
}

function handleFirstInteraction() {
    if (!firstInteractionDone) {
        tryPlayBackgroundMusic();
    }
}

function removeFirstInteractionListeners() {
    document.removeEventListener('keydown', handleFirstInteractionOnKey);
    document.removeEventListener('mousedown', handleFirstInteraction);
    document.removeEventListener('touchstart', handleFirstInteraction, { capture: true });
    
    if (btnMoveLeft) btnMoveLeft.removeEventListener('touchstart', handleFirstInteractionForButton);
    if (btnMoveRight) btnMoveRight.removeEventListener('touchstart', handleFirstInteractionForButton);
    if (btnShootMobile) btnShootMobile.removeEventListener('touchstart', handleFirstInteractionForButton);
    if (btnJumpMobile) btnJumpMobile.removeEventListener('touchstart', handleFirstInteractionForButton);
}

function handleFirstInteractionOnKey(e) {
    handleFirstInteraction();
}

function handleFirstInteractionForButton(e) {
    handleFirstInteraction();
}


function createBullet() {
    const currentTime = performance.now();
    if (currentTime - lastShotTime < bulletCooldown || !gameActive) return;

    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.width = bulletWidth + 'px';
    bullet.style.height = bulletHeight + 'px';
    bullet.style.left = (playerX + playerWidth) + 'px';
    bullet.style.bottom = (playerY + playerHeight / 2 - bulletHeight / 2) + 'px';
    gameScreen.appendChild(bullet);
    bullets.push(bullet);
    lastShotTime = currentTime;
}

function createEnemy() {
    if (!gameActive) return;

    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    enemy.style.width = enemyWidth + 'px';
    enemy.style.height = enemyHeight + 'px';
    enemy.style.left = (gameScreen.offsetWidth - bossWallWidth - enemyWidth - 5) + 'px';
    enemy.style.bottom = entityBottomY + 'px';
    
    gameScreen.appendChild(enemy);
    enemies.push(enemy);
}

function handlePlayerJump() {
    if (!isJumping && gameActive && playerY === entityBottomY) {
        isJumping = true;
        playerVelocityY = jumpStrength;
    }
}

function updateGame(timestamp) {
    if (!gameActive) return;

    // 1. Player Movement (Horizontal)
    if (keysPressed['a'] || keysPressed['arrowleft']) {
        playerX -= playerMoveSpeed;
    }
    if (keysPressed['d'] || keysPressed['arrowright']) {
        playerX += playerMoveSpeed;
    }
    playerX = Math.max(0, Math.min(playerX, gameScreen.offsetWidth - playerWidth - bossWallWidth - 5));
    player.style.left = playerX + 'px';

    // 2. Player Movement (Vertical - Jump)
    if (isJumping) {
        playerVelocityY += gravity;
        playerY -= playerVelocityY;
        if (playerY <= entityBottomY) {
            playerY = entityBottomY;
            isJumping = false;
            playerVelocityY = 0;
        }
        player.style.bottom = playerY + 'px';
    }

    // 3. Bullet Movement and Collision
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        let bulletX = parseFloat(bullet.style.left);
        bulletX += bulletSpeed;
        bullet.style.left = bulletX + 'px';

        if (bulletX > gameScreen.offsetWidth) {
            bullet.remove();
            bullets.splice(i, 1);
            continue;
        }
        for (let j = enemies.length - 1; j >= 0; j--) {
            let enemy = enemies[j];
            if (isColliding(bullet, enemy)) {
                enemy.remove();
                enemies.splice(j, 1);
                bullet.remove();
                bullets.splice(i, 1);
                
                score += pointsPerKill;
                scoreDisplay.textContent = "Điểm: " + score;

                // Tăng độ khó sau mỗi kill
                if (currentEnemySpawnInterval > enemySpawnIntervalMin) {
                    currentEnemySpawnInterval -= enemySpawnIntervalDecrementPerKill;
                }
                if (score % (pointsPerKill * 2) === 0) { // Ví dụ tăng tốc độ quái sau mỗi 2 kill (60 điểm)
                    currentEnemySpeed += 0.05;
                }


                if (score >= targetScoreToWin) {
                    winGame();
                    return;
                }
                break; 
            }
        }
    }

    // 4. Enemy Spawning
    if (timestamp - lastEnemySpawnTime > currentEnemySpawnInterval) {
        createEnemy();
        lastEnemySpawnTime = timestamp;
    }

    // 5. Enemy Movement and Collision with Player
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        let enemyX = parseFloat(enemy.style.left);
        enemyX -= currentEnemySpeed;
        enemy.style.left = enemyX + 'px';

        if (isColliding(player, enemy)) {
            gameOver("Bạn đã bị quái chạm!");
            return;
        }
        if (enemyX + enemyWidth < 0) {
            enemy.remove();
            enemies.splice(i, 1);
        }
    }
    
    requestAnimationFrame(updateGame);
}

function isColliding(el1, el2) {
    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
}

function gameOver(message = "GAME OVER!") {
    gameActive = false;
    if (backgroundMusic && !backgroundMusic.paused) backgroundMusic.pause();
    gameOverScreen.style.display = 'block';
    gameOverScreen.querySelector('p:first-child').textContent = message;
    finalScoreDisplay.textContent = "Điểm cuối: " + score;
    setTimeout(() => resetGame(), 3000);
}

function winGame(message = "XUẤT SẮC!") { // Thay đổi thông báo thắng
    gameActive = false;
    if (backgroundMusic && !backgroundMusic.paused) backgroundMusic.pause();
    gameOverScreen.style.display = 'block';
    gameOverScreen.querySelector('p:first-child').textContent = message;
    finalScoreDisplay.textContent = "Bạn đạt: " + score + " điểm!";
     setTimeout(() => {
        window.location.href = 'confession.html'; // Chuyển sang trang tỏ tình
    }, 2500);
}

function resetGame() {
    bullets.forEach(b => { if(b.parentNode) b.remove(); });
    bullets = [];
    enemies.forEach(e => { if(e.parentNode) e.remove(); });
    enemies = [];

    playerX = 50;
    playerY = entityBottomY;
    player.style.left = playerX + 'px';
    player.style.bottom = playerY + 'px';
    isJumping = false;
    playerVelocityY = 0;

    score = 0;
    scoreDisplay.textContent = "Điểm: " + score;
    
    currentEnemySpeed = enemySpeedBase;
    currentEnemySpawnInterval = enemySpawnIntervalStart;

    gameActive = true;
    gameOverScreen.style.display = 'none';
    lastEnemySpawnTime = performance.now();
    lastShotTime = performance.now();
    
    if (firstInteractionDone && backgroundMusic && backgroundMusic.paused) {
        backgroundMusic.play().catch(e => console.warn("Lỗi phát lại nhạc nền sau reset:", e));
    }

    requestAnimationFrame(updateGame);
}

// --- Input Handling ---
const keysPressed = {};
document.addEventListener('keydown', handleFirstInteractionOnKey);
document.addEventListener('mousedown', handleFirstInteraction);
document.addEventListener('touchstart', handleFirstInteraction, { capture: true, once: true });

document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    keysPressed[key] = true;
    if (key === ' ' && gameActive) {
        e.preventDefault(); createBullet();
    }
    if ((key === 'w' || key === 'arrowup') && gameActive) {
        e.preventDefault(); handlePlayerJump();
    }
});
document.addEventListener('keyup', (e) => {
    keysPressed[e.key.toLowerCase()] = false;
});

if (btnMoveLeft) {
    btnMoveLeft.addEventListener('touchstart', (e) => { handleFirstInteractionForButton(e); e.preventDefault(); keysPressed['arrowleft'] = true;});
    btnMoveLeft.addEventListener('touchend', (e) => { e.preventDefault(); keysPressed['arrowleft'] = false; });
}
if (btnMoveRight) {
    btnMoveRight.addEventListener('touchstart', (e) => { handleFirstInteractionForButton(e); e.preventDefault(); keysPressed['arrowright'] = true; });
    btnMoveRight.addEventListener('touchend', (e) => { e.preventDefault(); keysPressed['arrowright'] = false; });
}
if (btnShootMobile) {
    btnShootMobile.addEventListener('touchstart', (e) => { handleFirstInteractionForButton(e); e.preventDefault(); createBullet(); });
}
if (btnJumpMobile) {
    btnJumpMobile.addEventListener('touchstart', (e) => { handleFirstInteractionForButton(e); e.preventDefault(); handlePlayerJump(); });
}

// --- Start Game ---
lastEnemySpawnTime = performance.now();
lastShotTime = performance.now();
requestAnimationFrame(updateGame);