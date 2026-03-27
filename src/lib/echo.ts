import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Cấu hình bắt buộc để Echo hoạt động
(window as any).Pusher = Pusher;

export const echo = new Echo({
    broadcaster: 'reverb',
    key: 'namocean_key', // Bạn có thể đổi key này trong file .env của Laravel
    wsHost: 'localhost',
    wsPort: 80, // Cổng mặc định của Laravel Sail
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
});