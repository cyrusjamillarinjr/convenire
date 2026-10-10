/* CONVENIRE - Cybernetic Real-Time Canvas Video Background Engine */
(function() {
    'use strict';

    function initCyberVideoBackground() {
        let canvas = document.getElementById('cyberVideoCanvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'cyberVideoCanvas';
            canvas.style.position = 'fixed';
            canvas.style.inset = '0';
            canvas.style.width = '100vw';
            canvas.style.height = '100vh';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '-2';
            canvas.style.opacity = '0.75';
            canvas.style.mixBlendMode = 'screen';

            const bgContainer = document.querySelector('.premium-background-container') || document.body;
            bgContainer.appendChild(canvas);
        }

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        // 1. Data Packet Spark Nodes
        const numPackets = 40;
        const packets = [];
        for (let i = 0; i < numPackets; i++) {
            packets.push({
                x: Math.random() * width,
                y: Math.random() * height,
                speedX: (Math.random() - 0.5) * 1.5,
                speedY: (Math.random() - 0.5) * 1.5,
                radius: Math.random() * 2 + 1,
                alpha: Math.random() * 0.7 + 0.3,
                color: Math.random() > 0.3 ? '#00f5ff' : '#007bff'
            });
        }

        // 2. Holographic Laser Scanning Line
        let scanLineY = 0;
        let scanSpeed = 1.2;

        // 3. Floating Hex Telemetry Code Stream
        const hexChars = '0123456789ABCDEF';
        const codeColumns = Math.floor(width / 180);
        const streams = [];

        for (let c = 0; c < codeColumns; c++) {
            streams.push({
                x: (c + 0.5) * (width / codeColumns),
                y: Math.random() * height,
                speed: Math.random() * 0.8 + 0.4,
                code: Array.from({ length: 6 }, () => hexChars[Math.floor(Math.random() * 16)]).join('')
            });
        }

        // Main Animation Loop
        function animate() {
            ctx.clearRect(0, 0, width, height);

            // Draw Scanner Line Sweep
            scanLineY += scanSpeed;
            if (scanLineY > height) scanLineY = 0;

            const grad = ctx.createLinearGradient(0, scanLineY - 15, 0, scanLineY + 15);
            grad.addColorStop(0, 'rgba(0, 245, 255, 0)');
            grad.addColorStop(0.5, 'rgba(0, 245, 255, 0.25)');
            grad.addColorStop(1, 'rgba(0, 245, 255, 0)');
            
            ctx.fillStyle = grad;
            ctx.fillRect(0, scanLineY - 15, width, 30);

            // Draw Floating Telemetry Streams
            ctx.font = '11px "Share Tech Mono", monospace';
            ctx.fillStyle = 'rgba(0, 245, 255, 0.22)';

            streams.forEach(s => {
                s.y += s.speed;
                if (s.y > height) {
                    s.y = -20;
                    s.code = Array.from({ length: 6 }, () => hexChars[Math.floor(Math.random() * 16)]).join('');
                }
                ctx.fillText(`0x${s.code}`, s.x, s.y);
            });

            // Draw Data Packets & Circuit Sparks
            packets.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCyberVideoBackground);
    } else {
        initCyberVideoBackground();
    }
})();
