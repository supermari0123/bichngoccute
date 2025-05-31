// script.js (cho các hàm dùng chung, ví dụ hiệu ứng trái tim)

const heartsContainer = document.querySelector('.hearts-container');

function createHeart() {
    if (!heartsContainer) return; // Chỉ chạy nếu có heartsContainer

    const heart = document.createElement('span');
    heart.classList.add('heart-char');
    heart.innerHTML = '❤'; // Hoặc dùng hình ảnh: <img src='assets/trai-tim-icon.png' />

    // Vị trí ngẫu nhiên ở phía trên màn hình
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.top = '-30px'; // Bắt đầu từ ngoài màn hình phía trên

    // Thời gian rơi và kích thước ngẫu nhiên
    const duration = Math.random() * 5 + 5; // Từ 5 đến 10 giây
    heart.style.animationDuration = duration + 's';
    heart.style.fontSize = Math.random() * 15 + 10 + 'px'; // Từ 10px đến 25px
    heart.style.opacity = Math.random() * 0.5 + 0.5; // Từ 0.5 đến 1

    heartsContainer.appendChild(heart);

    // Xóa trái tim sau khi nó rơi xong để không làm nặng trang
    setTimeout(() => {
        heart.remove();
    }, duration * 1000 + 1000); // Thêm 1 giây buffer
}

// Tạo trái tim liên tục
let heartInterval;
function startHeartStream() {
    if (heartsContainer) { // Chỉ bắt đầu nếu có element
       heartInterval = setInterval(createHeart, 100); // Tạo một trái tim mỗi 300ms
    }
}

function stopHeartStream() {
    clearInterval(heartInterval);
}

// Gọi hàm này nếu bạn muốn bắt đầu trái tim rơi ngay khi script load
// Ví dụ: trên trang index.html thì nó được gọi trong script inline
// startHeartStream();