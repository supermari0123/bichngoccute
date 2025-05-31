// js/confession-script.js
const confessionContainer = document.getElementById('confessionContainer');
const noButton = document.getElementById('noButton');
const yesButton = document.getElementById('yesButton');
const confessionMusic = document.getElementById('confessionMusic');
const yesSound = document.getElementById('yesSound');
const buttonsArea = document.querySelector('.buttons-area');

// Kích thước thiết kế gốc của các yếu tố (khi confessionContainer rộng khoảng 550px)
const baseContainerWidth = 550; // Chiều rộng gốc của container mà bạn thiết kế
let scaleFactorConfession = 1;

const baseNoButtonPaddingV = 14;
const baseNoButtonPaddingH = 28;
const baseNoButtonFontSize = 1.15; // em

let baseYesButtonPaddingV = 14;
let baseYesButtonPaddingH = 28;
let baseYesButtonFontSize = 1.15; // em

let noButtonClickCount = 0;

function applyScaledStyles() {
    if (!confessionContainer || !noButton || !yesButton) return;

    // Tính scaleFactor dựa trên chiều rộng hiện tại của confessionContainer so với chiều rộng gốc
    scaleFactorConfession = confessionContainer.offsetWidth / baseContainerWidth;
    // Giới hạn scaleFactor để chữ không quá to hoặc quá nhỏ
    scaleFactorConfession = Math.max(0.7, Math.min(1.2, scaleFactorConfession));


    // Scale nút "Không"
    noButton.style.fontSize = (baseNoButtonFontSize * scaleFactorConfession) + 'em';
    noButton.style.padding = `${Math.round(baseNoButtonPaddingV * scaleFactorConfession)}px ${Math.round(baseNoButtonPaddingH * scaleFactorConfession)}px`;

    // Scale nút "Có" (sẽ được cập nhật thêm khi click "Không")
    yesButton.style.fontSize = (baseYesButtonFontSize + (noButtonClickCount * 0.25 * scaleFactorConfession) ) + 'em';
    yesButton.style.padding = `${Math.round((baseYesButtonPaddingV + (noButtonClickCount * 3)) * scaleFactorConfession)}px ${Math.round((baseYesButtonPaddingH + (noButtonClickCount * 5)) * scaleFactorConfession)}px`;

    // Điều chỉnh transform scale của nút "Không" dựa trên cả scaleFactor và noButtonClickCount
    const noButtonBaseScale = 1 - noButtonClickCount * 0.18;
    noButton.style.transform = `scale(${Math.max(0.1, noButtonBaseScale * (scaleFactorConfession * 0.8 + 0.2) )})`; // Điều chỉnh scale cho nút "Không"

    const yesButtonBaseScale = 1 + noButtonClickCount * 0.05;
    if (noButtonClickCount >= 5) { // Khi nút "Không" ẩn
         yesButton.style.transform = `scale(${1.15 * (scaleFactorConfession * 0.8 + 0.2) })`;
    } else {
         yesButton.style.transform = `scale(${yesButtonBaseScale * (scaleFactorConfession * 0.8 + 0.2) })`;
    }
}


function resetButtonsState() {
    if (!noButton || !yesButton) return;
    noButtonClickCount = 0;
    noButton.style.display = 'inline-flex'; // Hoặc 'flex' nếu muốn align-items bên trong nút
    noButton.style.opacity = '1';
    noButton.style.pointerEvents = 'auto';
    noButton.textContent = "Không";
    
    // Reset kích thước và transform của cả hai nút dựa trên scale hiện tại
    applyScaledStyles();
}


window.addEventListener('DOMContentLoaded', () => {
    // Đảm bảo confessionContainer có kích thước trước khi tính scale
    // CSS đã đặt max-width và width: 90%
    
    setTimeout(() => { // Đợi một chút để CSS áp dụng hoàn toàn kích thước cho container
        resetButtonsState(); // Đặt trạng thái và kích thước ban đầu của nút
    }, 100); // Có thể cần điều chỉnh delay này


    function playConfessionMusic() { /* ... (Giữ nguyên hàm này) ... */ if (confessionMusic && confessionMusic.paused) { confessionMusic.play().catch(e => console.warn("Lỗi phát nhạc tỏ tình:", e)); } document.body.removeEventListener('mousemove', playConfessionMusic); document.body.removeEventListener('click', playConfessionMusic); document.body.removeEventListener('touchstart', playConfessionMusic); }
    document.body.addEventListener('mousemove', playConfessionMusic, { once: true });
    document.body.addEventListener('click', playConfessionMusic, { once: true });
    document.body.addEventListener('touchstart', playConfessionMusic, { once: true });
});

let resizeConfessionTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeConfessionTimer);
    resizeConfessionTimer = setTimeout(() => {
        applyScaledStyles(); // Áp dụng lại scale cho các nút khi cửa sổ resize
    }, 200);
});


noButton.addEventListener('click', () => {
    noButtonClickCount++;
    
    // Kích thước mới cho nút "Có" sẽ được tính trong applyScaledStyles
    // Nút "Không" sẽ được scale nhỏ lại trong applyScaledStyles

    const noButtonMessages = ["Nghĩ kỹ chưa? 🥺", "Cơ hội cuối đó... 😟", "Đừng làm tớ buồn...💔", "Thật sự không á? 😭", "Sắp biến mất rùi..."];
    if (noButtonClickCount <= noButtonMessages.length) {
        noButton.textContent = noButtonMessages[noButtonClickCount -1];
    }

    if (noButtonClickCount >= 5) {
        noButton.style.opacity = '0';
        noButton.style.pointerEvents = 'none';
        setTimeout(() => {
            noButton.style.display = 'none';
        }, 300);
    }
    applyScaledStyles(); // Cập nhật lại kích thước các nút sau khi click
});

yesButton.addEventListener('click', () => {
    if (confessionMusic && !confessionMusic.paused) {
        confessionMusic.pause();
        confessionMusic.currentTime = 0;
    }
    if (yesSound) {
        yesSound.play().catch(e => console.warn("Lỗi phát âm thanh đồng ý:", e));
    }

    noButton.style.display = 'none';
    yesButton.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    yesButton.style.opacity = '0';
    yesButton.style.transform = 'scale(0.8)';

    setTimeout(() => {
        yesButton.style.display = 'none';
        confessionContainer.innerHTML = `
            <div class="final-message" style="opacity:0; transform: scale(0.8);">
                <h2>Tớ biết cậu sẽ đồng ý mà! Yêu cậu nhiều lắm! ❤️</h2>
                <p>Giờ thì đến với lời chúc đặc biệt nhất nè...</p>
            </div>
        `;
        const finalMsgElement = document.querySelector('.final-message');
        void finalMsgElement.offsetWidth; 
        finalMsgElement.style.transition = 'opacity 0.7s ease-out 0.2s, transform 0.7s ease-out 0.2s';
        finalMsgElement.style.opacity = '1';
        finalMsgElement.style.transform = 'scale(1)';
    }, 300);

    setTimeout(() => {
        window.location.href = 'message.html';
    }, 3500);
});