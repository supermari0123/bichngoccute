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
const gameOriginalWidth = 800;
const gameOriginalHeight = 450;
let scaleFactor = 1;

const basePlayerXStart = 50;
const basePlayerWidth = 40;
const basePlayerHeight = 40;
const basePlayerMoveSpeed = 5;
const baseEntityBottomY = 10;
const baseGravity = 1;
const baseJumpStrength = -16;
const baseBulletWidth = 15;
const baseBulletHeight = 8;
const baseBulletSpeed = 10;
const baseEnemyWidth = 35;
const baseEnemyHeight = 35;
const baseEnemySpeed = 1.8;
const baseBossWallWidth = 60;
const baseScoreDisplayTop = 10;
const baseScoreDisplayLeft = 10;
const baseScoreDisplayFontSize = 24;

let playerX, playerWidth, playerHeight, playerMoveSpeed;
let entityBottomY, playerY_current_bottom, playerVelocityY, gravity, jumpStrength, isJumping;
let bullets, bulletWidth, bulletHeight, bulletSpeed, lastShotTime;
let enemies, enemyWidth, enemyHeight, currentEnemySpeed, currentEnemySpawnInterval, lastEnemySpawnTime;
let score, gameActive, firstInteractionDone = false, bossWallWidth;

const bulletCooldown = 220;
const enemySpawnIntervalStart = 2000;
const enemySpawnIntervalMin = 700;
const enemySpawnIntervalDecrementPerKill = 10;
const targetScoreToWin = 330;
const pointsPerKill = 30;

// --- Functions ---

function tryPlayBackgroundMusic() {
    if (backgroundMusic && backgroundMusic.paused && !firstInteractionDone) {
        const playPromise = backgroundMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log("Nhạc nền đã bắt đầu phát.");
                backgroundMusic.volume = 0.2; // ĐẶT ÂM LƯỢNG 20%
                firstInteractionDone = true;
                removeFirstInteractionListeners();
            }).catch(error => {
                console.warn("Không thể tự động phát nhạc nền:", error);
                firstInteractionDone = true; 
                removeFirstInteractionListeners();
            });
        }
    } else if (backgroundMusic && !backgroundMusic.paused) {
        backgroundMusic.volume = 0.2; // Đảm bảo âm lượng đúng nếu đã phát trước đó
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
    console.log("First interaction listeners removed.");
}

function handleFirstInteractionOnKey(e) {
    handleFirstInteraction();
}

function handleFirstInteractionForButton(e) {
    handleFirstInteraction();
}

function resizeGameAndElements() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let newGameScreenWidth, newGameScreenHeight;
    const aspectRatio = gameOriginalWidth / gameOriginalHeight;

    if (windowWidth < gameOriginalWidth + 20) {
        newGameScreenWidth = windowWidth * 0.95;
        if (windowWidth <= 480) newGameScreenWidth = windowWidth * 0.98;
    } else {
        newGameScreenWidth = gameOriginalWidth;
    }
    newGameScreenHeight = newGameScreenWidth / aspectRatio;

    if (newGameScreenHeight > windowHeight * 0.90) {
        newGameScreenHeight = windowHeight * 0.90;
        newGameScreenWidth = newGameScreenHeight * aspectRatio;
    }
    newGameScreenWidth = Math.min(newGameScreenWidth, gameOriginalWidth);
    newGameScreenHeight = Math.min(newGameScreenHeight, gameOriginalHeight);

    gameScreen.style.width = newGameScreenWidth + 'px';
    gameScreen.style.height = newGameScreenHeight + 'px';
    scaleFactor = newGameScreenWidth / gameOriginalWidth;

    playerWidth = Math.round(basePlayerWidth * scaleFactor);
    playerHeight = Math.round(basePlayerHeight * scaleFactor);
    playerMoveSpeed = basePlayerMoveSpeed * scaleFactor;
    entityBottomY = Math.round(baseEntityBottomY * scaleFactor);
    gravity = baseGravity * scaleFactor;
    jumpStrength = baseJumpStrength * scaleFactor;
    bulletWidth = Math.round(baseBulletWidth * scaleFactor);
    bulletHeight = Math.round(baseBulletHeight * scaleFactor);
    bulletSpeed = baseBulletSpeed * scaleFactor;
    enemyWidth = Math.round(baseEnemyWidth * scaleFactor);
    enemyHeight = Math.round(baseEnemyHeight * scaleFactor);
    bossWallWidth = Math.round(baseBossWallWidth * scaleFactor);

    player.style.width = playerWidth + 'px';
    player.style.height = playerHeight + 'px';
    bossWall.style.width = bossWallWidth + 'px';
    bossWall.style.height = '100%';
    bossWall.style.right = '0px';
    bossWall.style.display = 'block';

    scoreDisplay.style.top = Math.round(baseScoreDisplayTop * scaleFactor) + 'px';
    scoreDisplay.style.left = Math.round(baseScoreDisplayLeft * scaleFactor) + 'px';
    scoreDisplay.style.fontSize = Math.max(10, Math.round(baseScoreDisplayFontSize * scaleFactor)) + 'px';

    const oldGameScreenWidthForPlayerX = parseFloat(player.style.left) / (playerX / (gameScreen.offsetWidth || gameOriginalWidth));
    if (gameScreen.offsetWidth > 0 && oldGameScreenWidthForPlayerX > 0) {
         playerX = (playerX / oldGameScreenWidthForPlayerX) * newGameScreenWidth;
    } else {
         playerX = basePlayerXStart * scaleFactor;
    }
    playerX = Math.max(0, Math.min(playerX, newGameScreenWidth - playerWidth - bossWallWidth - Math.round(5 * scaleFactor)));

    if (!isJumping) playerY_current_bottom = entityBottomY;
    else {
        const oldGameScreenHeightForPlayerY = player.style.bottom / (playerY_current_bottom / (gameScreen.offsetHeight || gameOriginalHeight));
        if(gameScreen.offsetHeight > 0 && oldGameScreenHeightForPlayerY > 0) {
            playerY_current_bottom = (playerY_current_bottom / oldGameScreenHeightForPlayerY) * newGameScreenHeight;
        } else {
            playerY_current_bottom = entityBottomY;
        }
        playerY_current_bottom = Math.max(entityBottomY, playerY_current_bottom);
    }
    player.style.left = playerX + 'px';
    player.style.bottom = playerY_current_bottom + 'px';
}

function initializeGameVariables() {
    playerX = basePlayerXStart * scaleFactor;
    playerY_current_bottom = entityBottomY;
    isJumping = false; playerVelocityY = 0;
    bullets = []; lastShotTime = 0;
    enemies = [];
    currentEnemySpeed = baseEnemySpeed;
    currentEnemySpawnInterval = enemySpawnIntervalStart;
    lastEnemySpawnTime = 0;
    score = 0; scoreDisplay.textContent = "Điểm: " + score;
    gameActive = true;

    player.style.left = playerX + 'px';
    player.style.bottom = playerY_current_bottom + 'px';
}

function createBullet() {
    const currentTime = performance.now();
    if (currentTime - lastShotTime < bulletCooldown || !gameActive) return;
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.width = bulletWidth + 'px';
    bullet.style.height = bulletHeight + 'px';
    bullet.style.left = (playerX + playerWidth) + 'px';
    bullet.style.bottom = (playerY_current_bottom + playerHeight / 2 - bulletHeight / 2) + 'px';
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
    enemy.style.left = (gameScreen.offsetWidth - bossWallWidth - enemyWidth - Math.round(5 * scaleFactor)) + 'px';
    enemy.style.bottom = entityBottomY + 'px';
    gameScreen.appendChild(enemy);
    enemies.push(enemy);
}

function handlePlayerJump() {
    if (!isJumping && gameActive && playerY_current_bottom === entityBottomY) {
        isJumping = true;
        playerVelocityY = jumpStrength;
    }
}

function updateGame(timestamp) {
    if (!gameActive) return;

    // 1. Player Movement
    if (keysPressed['a'] || keysPressed['arrowleft']) playerX -= playerMoveSpeed;
    if (keysPressed['d'] || keysPressed['arrowright']) playerX += playerMoveSpeed;
    playerX = Math.max(0, Math.min(playerX, gameScreen.offsetWidth - playerWidth - bossWallWidth - Math.round(5 * scaleFactor)));
    player.style.left = playerX + 'px';

    if (isJumping) {
        playerVelocityY += gravity;
        playerY_current_bottom -= playerVelocityY;
        if (playerY_current_bottom <= entityBottomY) {
            playerY_current_bottom = entityBottomY;
            isJumping = false;
            playerVelocityY = 0;
        }
        player.style.bottom = playerY_current_bottom + 'px';
    }

    // 3. Bullet Movement and Collision
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        if (!bullet.parentNode) { bullets.splice(i, 1); continue; }
        let bulletX = parseFloat(bullet.style.left);
        bulletX += bulletSpeed;
        bullet.style.left = bulletX + 'px';
        if (bulletX > gameScreen.offsetWidth) { bullet.remove(); bullets.splice(i, 1); continue; }
        for (let j = enemies.length - 1; j >= 0; j--) {
            let enemy = enemies[j];
            if (!enemy.parentNode) { enemies.splice(j,1); continue; }
            if (isColliding(bullet, enemy)) {
                enemy.remove(); enemies.splice(j, 1);
                bullet.remove(); bullets.splice(i, 1);
                score += pointsPerKill;
                scoreDisplay.textContent = "Điểm: " + score;
                if (currentEnemySpawnInterval > enemySpawnIntervalMin) {
                    currentEnemySpawnInterval -= enemySpawnIntervalDecrementPerKill;
                }
                if (score > 0 && score % (pointsPerKill * 2) === 0) currentEnemySpeed += (0.05 * scaleFactor);
                if (score >= targetScoreToWin) { winGame(); return; }
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
        if (!enemy.parentNode) { enemies.splice(i,1); continue; }
        let enemyX = parseFloat(enemy.style.left);
        enemyX -= (currentEnemySpeed * scaleFactor);
        enemy.style.left = enemyX + 'px';
        if (isColliding(player, enemy)) { gameOver("Bạn đã bị quái chạm!"); return; }
        if (enemyX + enemyWidth < 0) { enemy.remove(); enemies.splice(i, 1); }
    }
    requestAnimationFrame(updateGame);
}

function isColliding(el1, el2) {
    if (!el1 || !el2 || !el1.parentNode || !el2.parentNode) return false;
    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    if (r1.width === 0 || r1.height === 0 || r2.width === 0 || r2.height === 0) return false;
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

function winGame(message = "XUẤT SẮC!") {
    gameActive = false;
    if (backgroundMusic && !backgroundMusic.paused) backgroundMusic.pause();
    gameOverScreen.style.display = 'block';
    gameOverScreen.querySelector('p:first-child').textContent = message;
    finalScoreDisplay.textContent = "Bạn đạt: " + score + " điểm!";
    setTimeout(() => { window.location.href = 'confession.html'; }, 2500);
}

function resetGame() {
    bullets.forEach(b => { if(b.parentNode) b.remove(); }); bullets = [];
    enemies.forEach(e => { if(e.parentNode) e.remove(); }); enemies = [];
    
    playerX = basePlayerXStart * scaleFactor;
    playerY_current_bottom = entityBottomY;
    
    player.style.left = playerX + 'px';
    player.style.bottom = playerY_current_bottom + 'px';
    isJumping = false; playerVelocityY = 0;

    score = 0; scoreDisplay.textContent = "Điểm: " + score;
    currentEnemySpeed = baseEnemySpeed;
    currentEnemySpawnInterval = enemySpawnIntervalStart;
    
    gameActive = true; gameOverScreen.style.display = 'none';
    lastEnemySpawnTime = performance.now(); lastShotTime = performance.now();
    
    if (firstInteractionDone && backgroundMusic && backgroundMusic.paused) {
        backgroundMusic.play().then(() => {
            backgroundMusic.volume = 0.2; // Đặt lại âm lượng khi phát lại
        }).catch(e => console.warn("Lỗi phát lại nhạc:", e));
    } else if (firstInteractionDone && backgroundMusic && !backgroundMusic.paused) {
        backgroundMusic.volume = 0.2; // Đảm bảo âm lượng đúng nếu đang phát
    }
    requestAnimationFrame(updateGame);
}

// --- Input Handling ---
const keysPressed = {};
document.addEventListener('keydown', handleFirstInteractionOnKey, { once: true });
document.addEventListener('mousedown', handleFirstInteraction, { once: true });
document.addEventListener('touchstart', handleFirstInteraction, { capture: true, once: true });

document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    keysPressed[key] = true;
    if (key === ' ' && gameActive) { e.preventDefault(); createBullet(); }
    if ((key === 'w' || key === 'arrowup') && gameActive) { e.preventDefault(); handlePlayerJump(); }
});
document.addEventListener('keyup', (e) => { keysPressed[e.key.toLowerCase()] = false; });

if (btnMoveLeft) {
    btnMoveLeft.addEventListener('touchstart', (e) => { handleFirstInteractionForButton(e); e.preventDefault(); keysPressed['arrowleft'] = true;});
    btnMoveLeft.addEventListener('touchend', (e) => { e.preventDefault(); keysPressed['arrowleft'] = false; });
}
if (btnMoveRight) {
    btnMoveRight.addEventListener('touchstart', (e) => { handleFirstInteractionForButton(e); e.preventDefault(); keysPressed['arrowright'] = true; });
    btnMoveRight.addEventListener('touchend', (e) => { e.preventDefault(); keysPressed['arrowright'] = false; });
}
if (btnShootMobile) btnShootMobile.addEventListener('touchstart', (e) => { handleFirstInteractionForButton(e); e.preventDefault(); createBullet(); });
if (btnJumpMobile) btnJumpMobile.addEventListener('touchstart', (e) => { handleFirstInteractionForButton(e); e.preventDefault(); handlePlayerJump(); });

// --- Start Game ---
window.addEventListener('load', () => {
    console.log("Window loaded. Initializing game.");
    resizeGameAndElements();
    initializeGameVariables();
    lastEnemySpawnTime = performance.now();
    lastShotTime = performance.now();
    requestAnimationFrame(updateGame);
});
let resizeTimerDebounce;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimerDebounce);
    resizeTimerDebounce = setTimeout(() => {
        console.log("Window resizing, adjusting game elements...");
        const oldGameScreenWidth = parseFloat(gameScreen.style.width) || gameOriginalWidth;
        const oldPlayerXRatio = playerX / oldGameScreenWidth;

        resizeGameAndElements();
        
        if (oldGameScreenWidth > 0) {
             playerX = oldPlayerXRatio * parseFloat(gameScreen.style.width);
        } else {
            playerX = basePlayerXStart * scaleFactor;
        }
        playerX = Math.max(0, Math.min(playerX, parseFloat(gameScreen.style.width) - playerWidth - bossWallWidth - Math.round(5 * scaleFactor) ));
        player.style.left = playerX + 'px';

        if (!isJumping) {
            playerY_current_bottom = entityBottomY;
            player.style.bottom = playerY_current_bottom + 'px';
        }
    }, 250);
});