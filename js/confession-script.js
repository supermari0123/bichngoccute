// js/confession-script.js
const confessionContainer = document.getElementById('confessionContainer');
const noButton = document.getElementById('noButton');
const yesButton = document.getElementById('yesButton');
const confessionMusic = document.getElementById('confessionMusic');
const yesSound = document.getElementById('yesSound');
const buttonsArea = document.querySelector('.buttons-area');

let noButtonClickCount = 0;
const baseYesButtonFontSize = 1.15; // em, khớp với CSS
const baseYesButtonPaddingHorizontal = 28; // px
const baseYesButtonPaddingVertical = 14; // px

let initialNoButtonPos = { x: 0, y: 0 };
let initialYesButtonPos = { x: 0, y: 0 };
let allowButtonMouseMoveEffect = true; // Cờ để kiểm soát hiệu ứng di chuột

function setInitialButtonPositions() {
    if (!buttonsArea || !noButton || !yesButton) {
        console.error("Một hoặc nhiều phần tử nút không tìm thấy!");
        return;
    }

    // Đảm bảo các nút hiển thị để lấy kích thước chính xác
    noButton.style.display = 'inline-block';
    yesButton.style.display = 'inline-block';
    noButton.style.opacity = '1'; // Đảm bảo nút "Không" hiện rõ ràng

    const areaWidth = buttonsArea.offsetWidth;
    const areaHeight = buttonsArea.offsetHeight;
    const noBtnWidth = noButton.offsetWidth;
    const noBtnHeight = noButton.offsetHeight;
    const yesBtnWidth = yesButton.offsetWidth;
    const yesBtnHeight = yesButton.offsetHeight;

    initialNoButtonPos.x = (areaWidth / 2) - noBtnWidth - 20; // 20 là nửa của gap (40px)
    initialNoButtonPos.y = (areaHeight / 2) - (noBtnHeight / 2);
    
    initialYesButtonPos.x = (areaWidth / 2) + 20;
    initialYesButtonPos.y = (areaHeight / 2) - (yesBtnHeight / 2);

    noButton.style.left = initialNoButtonPos.x + 'px';
    noButton.style.top = initialNoButtonPos.y + 'px';
    yesButton.style.left = initialYesButtonPos.x + 'px';
    yesButton.style.top = initialYesButtonPos.y + 'px';

    // Reset transform và scale
    noButton.style.transform = 'translate(0px, 0px) scale(1)';
    yesButton.style.transform = 'translate(0px, 0px) scale(1)';
    // Reset font-size và padding cho nút "Có"
    yesButton.style.fontSize = baseYesButtonFontSize + 'em';
    yesButton.style.padding = `${baseYesButtonPaddingVertical}px ${baseYesButtonPaddingHorizontal}px`;

    noButtonClickCount = 0; // Reset bộ đếm
    allowButtonMouseMoveEffect = true; // Cho phép hiệu ứng di chuột lại
    noButton.style.pointerEvents = 'auto'; // Cho phép click lại nút "Không"
}

window.addEventListener('DOMContentLoaded', () => {
    setInitialButtonPositions();

    function playConfessionMusic() {
        if (confessionMusic && confessionMusic.paused) {
            confessionMusic.play().catch(e => console.warn("Lỗi phát nhạc tỏ tình:", e));
        }
        document.body.removeEventListener('mousemove', playConfessionMusic);
        document.body.removeEventListener('click', playConfessionMusic);
        document.body.removeEventListener('touchstart', playConfessionMusic);
    }
    document.body.addEventListener('mousemove', playConfessionMusic, { once: true });
    document.body.addEventListener('click', playConfessionMusic, { once: true });
    document.body.addEventListener('touchstart', playConfessionMusic, { once: true });
});

// Gọi lại khi thay đổi kích thước cửa sổ
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(setInitialButtonPositions, 200); // Debounce
});


buttonsArea.addEventListener('mousemove', (e) => {
    if (!allowButtonMouseMoveEffect) return;

    const rect = buttonsArea.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const moveFactor = 0.07;

    // Di chuyển nút "Không"
    if (noButton.style.display !== 'none') {
        const noBtnCenterX = parseFloat(noButton.style.left) + noButton.offsetWidth / 2;
        const noBtnCenterY = parseFloat(noButton.style.top) + noButton.offsetHeight / 2;
        let noDeltaX = (mouseX - noBtnCenterX) * -moveFactor;
        let noDeltaY = (mouseY - noBtnCenterY) * -moveFactor;
        noDeltaX = Math.max(-15, Math.min(15, noDeltaX));
        noDeltaY = Math.max(-15, Math.min(15, noDeltaY));
        noButton.style.transform = `translate(${noDeltaX}px, ${noDeltaY}px) scale(${1 - noButtonClickCount * 0.1})`;
    }

    // Di chuyển nút "Có"
    const yesBtnCenterX = parseFloat(yesButton.style.left) + yesButton.offsetWidth / 2;
    const yesBtnCenterY = parseFloat(yesButton.style.top) + yesButton.offsetHeight / 2;
    let yesDeltaX = (mouseX - yesBtnCenterX) * -moveFactor;
    let yesDeltaY = (mouseY - yesBtnCenterY) * -moveFactor;
    yesDeltaX = Math.max(-20, Math.min(20, yesDeltaX));
    yesDeltaY = Math.max(-20, Math.min(20, yesDeltaY));
    yesButton.style.transform = `translate(${yesDeltaX}px, ${yesDeltaY}px) scale(${1 + noButtonClickCount * 0.1})`;
});

buttonsArea.addEventListener('mouseleave', () => {
    if (!allowButtonMouseMoveEffect) return;
    if (noButton.style.display !== 'none') {
        noButton.style.transform = `translate(0px, 0px) scale(${1 - noButtonClickCount * 0.1})`;
    }
    yesButton.style.transform = `translate(0px, 0px) scale(${1 + noButtonClickCount * 0.1})`;
});


noButton.addEventListener('click', () => {
    noButtonClickCount++;
    
    const newYesFontSize = baseYesButtonFontSize + (noButtonClickCount * 0.2);
    const newYesPaddingH = baseYesButtonPaddingHorizontal + (noButtonClickCount * 3.5);
    const newYesPaddingV = baseYesButtonPaddingVertical + (noButtonClickCount * 2);

    yesButton.style.fontSize = newYesFontSize + 'em';
    yesButton.style.padding = `${newYesPaddingV}px ${newYesPaddingH}px`;
    // Nút "Có" sẽ tự to ra, hiệu ứng scale từ mousemove sẽ cập nhật theo kích thước mới
    // Cần tính lại vị trí nút "Có" để nó không bị lệch khi to ra quá nhiều (nếu cần)
    // Hiện tại để nó to ra từ vị trí gốc của nó

    // Làm nút "Không" nhỏ lại và di chuyển ngẫu nhiên
    noButton.style.transform = `translate(0px, 0px) scale(${1 - noButtonClickCount * 0.18})`;

    if (noButtonClickCount >= 1) { // Di chuyển ngay từ lần click đầu
        const areaWidth = buttonsArea.offsetWidth;
        const areaHeight = buttonsArea.offsetHeight;
        // Lấy kích thước hiện tại của nút sau khi có thể đã scale
        const noBtnCurrentWidth = noButton.getBoundingClientRect().width;
        const noBtnCurrentHeight = noButton.getBoundingClientRect().height;
        
        const yesBtnRect = yesButton.getBoundingClientRect(); // Vị trí và kích thước hiện tại của nút "Có"
        const buttonsAreaGlobalRect = buttonsArea.getBoundingClientRect(); // Tọa độ toàn cục của vùng nút

        let randomX, randomY, attempts = 0;
        do {
            randomX = Math.random() * (areaWidth - noBtnCurrentWidth);
            randomY = Math.random() * (areaHeight - noBtnCurrentHeight);
            attempts++;

            // Tạo rect ảo cho vị trí mới của nút "Không" (tọa độ toàn cục)
            const noBtnNewGlobalRect = {
                left: buttonsAreaGlobalRect.left + randomX,
                top: buttonsAreaGlobalRect.top + randomY,
                right: buttonsAreaGlobalRect.left + randomX + noBtnCurrentWidth,
                bottom: buttonsAreaGlobalRect.top + randomY + noBtnCurrentHeight
            };
            // Kiểm tra chồng lấn với nút "Có"
            const overlaps = !(yesBtnRect.right < noBtnNewGlobalRect.left ||
                               yesBtnRect.left > noBtnNewGlobalRect.right ||
                               yesBtnRect.bottom < noBtnNewGlobalRect.top ||
                               yesBtnRect.top > noBtnNewGlobalRect.bottom);
            if (!overlaps || attempts > 30) break;
        } while (true);

        noButton.style.left = randomX + 'px';
        noButton.style.top = randomY + 'px';
    }

    const noButtonMessages = ["Suy nghĩ lại đi mà🥺", "Cơ hội cuối? 😟", "Đừng làm tớ buồn...💔", "Thật sự không á? 😭"];
    if (noButtonClickCount <= noButtonMessages.length) {
        noButton.textContent = noButtonMessages[noButtonClickCount -1];
    }


    if (noButtonClickCount >= 5) { // Sau 5 lần nhấn "Không"
        noButton.style.opacity = '0';
        noButton.style.pointerEvents = 'none';
        allowButtonMouseMoveEffect = false; // Dừng hiệu ứng di chuột khi nút "Không" ẩn
        setTimeout(() => {
            noButton.style.display = 'none';
        }, 300);
        // Làm nút "Có" chiếm giữa và to hơn nữa
        yesButton.style.left = (buttonsArea.offsetWidth / 2 - yesButton.offsetWidth / 2) + 'px';
        yesButton.style.top = (buttonsArea.offsetHeight / 2 - yesButton.offsetHeight / 2) + 'px';
        yesButton.style.fontSize = (baseYesButtonFontSize + (noButtonClickCount * 0.25)) + 'em'; // To hơn nữa
        yesButton.style.padding = `${baseYesButtonPaddingVertical + (noButtonClickCount * 3)}px ${baseYesButtonPaddingHorizontal + (noButtonClickCount*5)}px`;
        yesButton.style.transform = 'translate(0px, 0px) scale(1.1)'; // Hơi phóng to thêm
    }
});

yesButton.addEventListener('click', () => {
    allowButtonMouseMoveEffect = false; // Dừng hiệu ứng di chuột
    if (confessionMusic && !confessionMusic.paused) {
        confessionMusic.pause();
        confessionMusic.currentTime = 0;
    }
    if (yesSound) {
        yesSound.play().catch(e => console.warn("Lỗi phát âm thanh đồng ý:", e));
    }

    // Ẩn các nút
    noButton.style.display = 'none';
    yesButton.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    yesButton.style.opacity = '0';
    yesButton.style.transform = 'scale(0.8)';


    setTimeout(() => { // Đợi nút "Có" ẩn đi rồi mới thay đổi nội dung
        yesButton.style.display = 'none';
        confessionContainer.innerHTML = `
            <div class="final-message" style="opacity:0; transform: scale(0.8);">
                <h2>Tớ biết cậu sẽ đồng ý mà! Yêu cậu nhiều lắm! ❤️</h2>
                <p>Giờ thì đến với lời chúc đặc biệt nhất nè...</p>
            </div>
        `;
        const finalMsgElement = document.querySelector('.final-message');
        // Trigger reflow để animation hoạt động
        void finalMsgElement.offsetWidth; 
        
        finalMsgElement.style.transition = 'opacity 0.7s ease-out 0.2s, transform 0.7s ease-out 0.2s';
        finalMsgElement.style.opacity = '1';
        finalMsgElement.style.transform = 'scale(1)';
    }, 300); // Thời gian khớp với transition của nút "Có"


    setTimeout(() => {
        window.location.href = 'message.html';
    }, 3500);
});