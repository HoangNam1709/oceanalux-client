import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Cấu hình bắt buộc để Echo hoạt động
(window as any).Pusher = Pusher;

export const echo = new Echo({
    broadcaster: 'reverb',
    key: 'namocean_key', 
    wsHost: 'localhost',
    // FIX: Reverb mặc định dùng cổng 8080 trong Laravel Sail
    wsPort: 8080, 
    wssPort: 8080,
    forceTLS: false,
    enabledTransports: ['ws'], // Chỉ sử dụng WebSocket 
    // Thêm cái này để tránh lỗi kết nối chập chờn
    disableStats: true,
});

// Gán vào window để các Component khác gọi được dễ dàng
(window as any).Echo = echo;