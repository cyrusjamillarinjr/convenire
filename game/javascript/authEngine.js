/* CONVENIRE - Authentication & Admin Engine */

window.AuthEngine = (function () {
    // LocalStorage Keys
    const USERS_KEY = 'convenire_users';
    const SESSION_KEY = 'convenire_session';

    // Default Admin Account
    const DEFAULT_ADMIN = {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'Administrator'
    };

    // No default seed accounts — scoreboard starts empty.
    // Only real registered students will appear.

    // Initialize User Data Store
    function getUsers() {
        const data = localStorage.getItem(USERS_KEY);
        // Always start with an empty list if the key is absent or corrupted.
        // Never seed demo accounts into a real classroom environment.
        if (data === null) {
            localStorage.setItem(USERS_KEY, JSON.stringify([]));
            return [];
        }
        try {
            const users = JSON.parse(data);
            if (!Array.isArray(users)) {
                localStorage.setItem(USERS_KEY, JSON.stringify([]));
                return [];
            }
            let updated = false;
            users.forEach(u => {
                if (u && u.scores) {
                    if (u.scores.stage1 > 100) { u.scores.stage1 = 100; updated = true; }
                    if (u.scores.stage2 > 100) { u.scores.stage2 = 100; updated = true; }
                    if (u.scores.stage3 > 100) { u.scores.stage3 = 100; updated = true; }
                }
            });
            if (updated) {
                localStorage.setItem(USERS_KEY, JSON.stringify(users));
            }
            return users;
        } catch (e) {
            localStorage.setItem(USERS_KEY, JSON.stringify([]));
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    // Get Active Session
    function getSession() {
        const data = localStorage.getItem(SESSION_KEY);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch (e) {
            return null;
        }
    }

    // --- CYBER HUD NOTIFICATION & SOUND ENGINE ---
    let authAudioCtx = null;
    function getAuthAudioContext() {
        if (!authAudioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) authAudioCtx = new AudioCtx();
        }
        if (authAudioCtx && authAudioCtx.state === 'suspended') {
            authAudioCtx.resume();
        }
        return authAudioCtx;
    }

    function playAuthSound(type) {
        try {
            const ctx = getAuthAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'login') {
                // Rising dual cyber chime
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.start(now);
                osc.stop(now + 0.35);
            } else if (type === 'logout') {
                // Descending cyber power-down chime
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);
                gain.gain.setValueAtTime(0.09, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
            }
        } catch (e) {
            // AudioContext not supported or restricted
        }
    }

    let authToastTimeout = null;
    function showAuthToast(type, title, message) {
        injectAuthStyles();
        playAuthSound(type);

        let toast = document.getElementById('cyberAuthToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'cyberAuthToast';
            toast.className = 'cyber-auth-toast';
            document.body.appendChild(toast);
        }

        const isLogin = type === 'login';
        const badgeIcon = isLogin ? '🟢' : '🔴';
        const badgeText = isLogin ? 'ACCESS GRANTED // SESSION ONLINE' : 'SESSION TERMINATED // LOGGED OUT';

        toast.className = `cyber-auth-toast toast-${type} active`;
        toast.innerHTML = `
            <div class="toast-glow-bar"></div>
            <div class="toast-content">
                <div class="toast-header-row">
                    <span class="toast-badge">${badgeIcon} ${badgeText}</span>
                    <span class="toast-time">SYS_AUTH</span>
                </div>
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;

        if (authToastTimeout) {
            clearTimeout(authToastTimeout);
        }

        authToastTimeout = setTimeout(() => {
            if (toast) {
                toast.classList.remove('active');
            }
        }, 4000);
    }

    // --- IN-GAME CUSTOM NOTICE (ALERT) & CONFIRMATION POPUP SYSTEM ---
    let onAlertCallback = null;
    function showInGameAlert(title, message, icon = '⚡', btnText = 'ACKNOWLEDGE', callback = null) {
        injectAuthStyles();
        onAlertCallback = callback;

        let alertBox = document.getElementById('alertBox');
        if (!alertBox) {
            alertBox = document.createElement('div');
            alertBox.id = 'alertBox';
            alertBox.className = 'custom-alert';
            alertBox.innerHTML = `
                <div class="custom-alert-box">
                    <div class="alert-icon-ring" id="alertIconRing">${icon}</div>
                    <h2 id="alertTitle">${title}</h2>
                    <p id="alertMsg">${message}</p>
                    <button class="alert-confirm-btn" id="alertConfirmBtn">${btnText}</button>
                </div>
            `;
            document.body.appendChild(alertBox);
        } else {
            const alertTitle = alertBox.querySelector('#alertTitle') || alertBox.querySelector('h2');
            const alertMsg = alertBox.querySelector('#alertMsg') || alertBox.querySelector('p');
            const alertIconRing = alertBox.querySelector('#alertIconRing') || alertBox.querySelector('.alert-icon-ring');
            const alertBtn = alertBox.querySelector('#alertConfirmBtn') || alertBox.querySelector('.alert-confirm-btn') || alertBox.querySelector('button');

            if (alertTitle) alertTitle.textContent = title;
            if (alertMsg) alertMsg.textContent = message;
            if (alertIconRing) alertIconRing.textContent = icon;
            if (alertBtn) alertBtn.textContent = btnText;
        }

        const confirmBtn = alertBox.querySelector('#alertConfirmBtn') || alertBox.querySelector('.alert-confirm-btn') || alertBox.querySelector('button');
        if (confirmBtn) {
            confirmBtn.onclick = function () {
                closeInGameAlert();
            };
        }

        alertBox.style.display = 'flex';
    }

    function closeInGameAlert() {
        const alertBox = document.getElementById('alertBox');
        if (alertBox) alertBox.style.display = 'none';
        if (typeof onAlertCallback === 'function') {
            const cb = onAlertCallback;
            onAlertCallback = null;
            cb();
        }
    }

    let onConfirmOkCallback = null;
    let onConfirmCancelCallback = null;
    function showInGameConfirm(title, message, onOk, onCancel = null, icon = '⚠️', okBtnText = 'LOG OUT', cancelBtnText = 'CANCEL') {
        injectAuthStyles();
        onConfirmOkCallback = onOk;
        onConfirmCancelCallback = onCancel;

        let confirmBox = document.getElementById('confirmModalBox');
        if (!confirmBox) {
            confirmBox = document.createElement('div');
            confirmBox.id = 'confirmModalBox';
            confirmBox.className = 'custom-alert';
            confirmBox.innerHTML = `
                <div class="custom-alert-box confirm-box">
                    <div class="alert-icon-ring" id="confirmIconRing" style="border-color: #ff3366; color: #ff3366; text-shadow: 0 0 10px #ff3366;">${icon}</div>
                    <h2 id="confirmTitle" style="color: #ff3366;">${title}</h2>
                    <p id="confirmMsg">${message}</p>
                    <div class="confirm-btn-row">
                        <button class="confirm-action-btn" id="confirmOkBtn">${okBtnText}</button>
                        <button class="confirm-cancel-btn" id="confirmCancelBtn">${cancelBtnText}</button>
                    </div>
                </div>
            `;
            document.body.appendChild(confirmBox);
        } else {
            const cTitle = confirmBox.querySelector('#confirmTitle') || confirmBox.querySelector('h2');
            const cMsg = confirmBox.querySelector('#confirmMsg') || confirmBox.querySelector('p');
            const cIcon = confirmBox.querySelector('#confirmIconRing') || confirmBox.querySelector('.alert-icon-ring');
            const okBtn = confirmBox.querySelector('#confirmOkBtn') || confirmBox.querySelector('.confirm-action-btn');
            const cancelBtn = confirmBox.querySelector('#confirmCancelBtn') || confirmBox.querySelector('.confirm-cancel-btn');

            if (cTitle) cTitle.textContent = title;
            if (cMsg) cMsg.textContent = message;
            if (cIcon) cIcon.textContent = icon;
            if (okBtn) okBtn.textContent = okBtnText;
            if (cancelBtn) cancelBtn.textContent = cancelBtnText;
        }

        const okBtn = confirmBox.querySelector('#confirmOkBtn') || confirmBox.querySelector('.confirm-action-btn');
        const cancelBtn = confirmBox.querySelector('#confirmCancelBtn') || confirmBox.querySelector('.confirm-cancel-btn');

        if (okBtn) {
            okBtn.onclick = function () {
                confirmBox.style.display = 'none';
                if (typeof onConfirmOkCallback === 'function') {
                    const cb = onConfirmOkCallback;
                    onConfirmOkCallback = null;
                    cb();
                }
            };
        }

        if (cancelBtn) {
            cancelBtn.onclick = function () {
                confirmBox.style.display = 'none';
                if (typeof onConfirmCancelCallback === 'function') {
                    const cb = onConfirmCancelCallback;
                    onConfirmCancelCallback = null;
                    cb();
                }
            };
        }

        confirmBox.style.display = 'flex';
    }

    // Expose in-game popups to window
    window.showInGameAlert = showInGameAlert;
    window.showInGameConfirm = showInGameConfirm;
    window.closeAlert = closeInGameAlert;
    window.showAlert = showInGameAlert;

    function injectAuthStyles() {
        if (document.getElementById('cyber-auth-styles')) return;
        const style = document.createElement('style');
        style.id = 'cyber-auth-styles';
        style.textContent = `
            .custom-alert {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(2, 6, 14, 0.88);
                backdrop-filter: blur(14px);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                animation: alertBackdropFade 0.3s ease;
            }
            .custom-alert-box {
                background: linear-gradient(135deg, rgba(8, 22, 42, 0.98), rgba(4, 12, 24, 0.98));
                border: 2px solid #00f5ff;
                padding: 32px 48px;
                border-radius: 24px;
                text-align: center;
                box-shadow: 0 0 50px rgba(0, 245, 255, 0.45), inset 0 0 25px rgba(0, 245, 255, 0.1);
                max-width: 480px;
                width: 90%;
                animation: alertPopIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
            }
            .custom-alert-box.confirm-box {
                border-color: #ff3366;
                box-shadow: 0 0 50px rgba(255, 51, 102, 0.45), inset 0 0 25px rgba(255, 51, 102, 0.1);
            }
            .alert-icon-ring {
                font-size: 2.2rem;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: rgba(0, 245, 255, 0.1);
                border: 2px solid #00f5ff;
                box-shadow: 0 0 20px rgba(0, 245, 255, 0.5);
                margin-bottom: 6px;
            }
            .custom-alert-box h2 {
                font-family: 'Orbitron', sans-serif;
                color: #00f5ff;
                font-size: 1.35rem;
                letter-spacing: 1.5px;
                text-shadow: 0 0 12px rgba(0, 245, 255, 0.5);
                margin: 0;
            }
            .custom-alert-box p {
                font-family: 'Outfit', sans-serif;
                font-size: 1rem;
                color: #e0f2fe;
                line-height: 1.6;
                white-space: pre-line;
                margin: 0;
            }
            .alert-confirm-btn {
                font-family: 'Orbitron', sans-serif;
                background: linear-gradient(90deg, #00f5ff, #007bff);
                border: none;
                border-radius: 12px;
                padding: 12px 32px;
                color: #020814;
                font-size: 0.95rem;
                font-weight: 800;
                cursor: pointer;
                box-shadow: 0 0 20px rgba(0, 245, 255, 0.5);
                transition: all 0.2s ease;
                margin-top: 10px;
                letter-spacing: 1px;
            }
            .alert-confirm-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 0 30px #00f5ff;
                background: linear-gradient(90deg, #00ff88, #00f5ff);
            }
            .confirm-btn-row {
                display: flex;
                gap: 14px;
                margin-top: 14px;
                width: 100%;
                justify-content: center;
            }
            .confirm-action-btn {
                font-family: 'Orbitron', sans-serif;
                background: linear-gradient(90deg, #ff3366, #ff0044);
                border: none;
                border-radius: 12px;
                padding: 12px 28px;
                color: #ffffff;
                font-size: 0.92rem;
                font-weight: 800;
                cursor: pointer;
                box-shadow: 0 0 20px rgba(255, 51, 102, 0.5);
                transition: all 0.2s ease;
                letter-spacing: 1px;
            }
            .confirm-action-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 0 30px rgba(255, 51, 102, 0.85);
            }
            .confirm-cancel-btn {
                font-family: 'Orbitron', sans-serif;
                background: rgba(0, 245, 255, 0.1);
                border: 2px solid #00f5ff;
                border-radius: 12px;
                padding: 12px 28px;
                color: #e0f2fe;
                font-size: 0.92rem;
                font-weight: 800;
                cursor: pointer;
                transition: all 0.2s ease;
                letter-spacing: 1px;
            }
            .confirm-cancel-btn:hover {
                background: rgba(0, 245, 255, 0.25);
                color: #ffffff;
                box-shadow: 0 0 20px rgba(0, 245, 255, 0.4);
                transform: scale(1.05);
            }
            @keyframes alertPopIn {
                from { transform: scale(0.85); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            @keyframes alertBackdropFade {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .status-pulse-dot {
                display: inline-block;
                width: 9px;
                height: 9px;
                border-radius: 50%;
                margin-right: 6px;
                flex-shrink: 0;
                transition: all 0.3s ease;
            }
            .status-pulse-dot.active {
                background: #00ff88;
                box-shadow: 0 0 8px #00ff88, 0 0 16px rgba(0, 255, 136, 0.7);
                animation: statusPulseGreen 1.8s infinite alternate;
            }
            .status-pulse-dot.offline {
                background: #ff3366;
                box-shadow: 0 0 8px #ff3366, 0 0 16px rgba(255, 51, 102, 0.6);
                animation: statusPulseRed 1.8s infinite alternate;
            }
            @keyframes statusPulseGreen {
                0% { transform: scale(0.9); opacity: 0.8; }
                100% { transform: scale(1.25); opacity: 1; }
            }
            @keyframes statusPulseRed {
                0% { transform: scale(0.9); opacity: 0.7; }
                100% { transform: scale(1.15); opacity: 1; }
            }
            .user-session-badge.user-online {
                border-color: rgba(0, 255, 136, 0.45) !important;
                box-shadow: 0 0 18px rgba(0, 255, 136, 0.25) !important;
            }
            .user-session-badge.user-offline {
                border-color: rgba(255, 51, 102, 0.35) !important;
                box-shadow: 0 0 14px rgba(255, 51, 102, 0.15) !important;
            }
            .user-session-hud-pill {
                display: flex;
                align-items: center;
                gap: 8px;
                background: rgba(4, 14, 28, 0.92);
                padding: 6px 14px;
                border-radius: 12px;
                border: 1px solid rgba(0, 245, 255, 0.3);
                font-family: 'Share Tech Mono', monospace;
                font-size: 0.88rem;
                color: #c9e6ff;
                box-shadow: 0 0 12px rgba(0, 245, 255, 0.15);
                backdrop-filter: blur(12px);
                transition: all 0.3s ease;
            }
            .user-session-hud-pill.online {
                border-color: rgba(0, 255, 136, 0.45);
                box-shadow: 0 0 15px rgba(0, 255, 136, 0.2);
            }
            .user-session-hud-pill.offline {
                border-color: rgba(255, 51, 102, 0.4);
                box-shadow: 0 0 12px rgba(255, 51, 102, 0.15);
            }
            .user-hud-info {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .user-hud-tag {
                font-size: 0.72rem;
                color: #7ba2c2;
                letter-spacing: 1px;
                font-weight: 700;
            }
            .user-hud-name {
                color: #ffffff;
                font-weight: 700;
                max-width: 170px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .user-hud-logout-btn {
                background: rgba(255, 51, 102, 0.18);
                border: 1px solid rgba(255, 51, 102, 0.6);
                color: #ff88a3;
                font-family: 'Orbitron', sans-serif;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 0.8px;
                padding: 4px 9px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-left: 4px;
            }
            .user-hud-logout-btn:hover {
                background: #ff3366;
                color: #ffffff;
                box-shadow: 0 0 10px rgba(255, 51, 102, 0.8);
                transform: translateY(-1px);
            }
            .user-hud-logout-btn.btn-signin {
                background: rgba(0, 245, 255, 0.18);
                border-color: rgba(0, 245, 255, 0.6);
                color: #00f5ff;
            }
            .user-hud-logout-btn.btn-signin:hover {
                background: #00f5ff;
                color: #02060e;
                box-shadow: 0 0 10px rgba(0, 245, 255, 0.8);
            }
            .cyber-auth-toast {
                position: fixed;
                top: 24px;
                left: 50%;
                transform: translateX(-50%) translateY(-150%);
                z-index: 100000;
                display: flex;
                align-items: stretch;
                min-width: 380px;
                max-width: 520px;
                background: rgba(3, 10, 20, 0.95);
                border-radius: 12px;
                backdrop-filter: blur(20px);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.85);
                overflow: hidden;
                opacity: 0;
                pointer-events: none;
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
            }
            .cyber-auth-toast.active {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
                pointer-events: auto;
            }
            .cyber-auth-toast.toast-login {
                border: 1px solid rgba(0, 255, 136, 0.7);
                box-shadow: 0 0 30px rgba(0, 255, 136, 0.35), 0 10px 40px rgba(0, 0, 0, 0.9);
            }
            .cyber-auth-toast.toast-logout {
                border: 1px solid rgba(255, 51, 102, 0.7);
                box-shadow: 0 0 30px rgba(255, 51, 102, 0.35), 0 10px 40px rgba(0, 0, 0, 0.9);
            }
            .toast-glow-bar {
                width: 6px;
                flex-shrink: 0;
            }
            .toast-login .toast-glow-bar {
                background: linear-gradient(180deg, #00ff88, #00b4d8);
                box-shadow: 0 0 12px #00ff88;
            }
            .toast-logout .toast-glow-bar {
                background: linear-gradient(180deg, #ff3366, #ff758c);
                box-shadow: 0 0 12px #ff3366;
            }
            .toast-content {
                flex: 1;
                padding: 12px 18px;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .toast-header-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-family: 'Orbitron', sans-serif;
                font-size: 11px;
                letter-spacing: 1px;
                font-weight: 700;
            }
            .toast-login .toast-badge {
                color: #00ff88;
                text-shadow: 0 0 8px rgba(0, 255, 136, 0.6);
            }
            .toast-logout .toast-badge {
                color: #ff3366;
                text-shadow: 0 0 8px rgba(255, 51, 102, 0.6);
            }
            .toast-time {
                font-family: 'Share Tech Mono', monospace;
                font-size: 10px;
                color: #627d98;
            }
            .toast-title {
                font-family: 'Orbitron', sans-serif;
                font-size: 14px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 0.5px;
            }
            .toast-message {
                font-family: 'Outfit', sans-serif;
                font-size: 12px;
                color: #b0c4de;
                line-height: 1.4;
            }
        `;
        document.head.appendChild(style);
    }

    function setSession(sessionData, triggerToast = true) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

        // Sync logged-in student's personal stage scores to local storage keys
        if (sessionData && sessionData.user && sessionData.role === 'student') {
            const u = sessionData.user;
            for (let st = 1; st <= 3; st++) {
                const sc = parseInt(u.scores?.[`stage${st}`]) || 0;
                const prog = !!u.stageProgress?.[`stage${st}`];
                localStorage.setItem(`stage${st}_score`, String(sc));
                localStorage.setItem(`stage${st}_completed`, prog ? 'true' : 'false');
            }
        }

        updateUserUI();

        if (triggerToast && sessionData && sessionData.user) {
            const u = sessionData.user;
            const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.name || u.studentId || 'User';
            const sec = u.section ? ` · SEC: ${u.section}` : '';
            const id = u.studentId ? ` [ID: ${u.studentId}]` : '';
            showAuthToast('login', `TECHNICIAN ONLINE: ${name}`, `Authenticated as ${name}${id}${sec}. Systems online & score logging active.`);
        }
    }

    function clearSession(triggerToast = true) {
        const prevSession = getSession();
        localStorage.removeItem(SESSION_KEY);

        // Clear stage tracking keys so new accounts start completely fresh
        for (let st = 1; st <= 3; st++) {
            localStorage.removeItem(`stage${st}_score`);
            localStorage.removeItem(`stage${st}_completed`);
        }

        updateUserUI();

        if (triggerToast) {
            const name = prevSession && prevSession.user ? ([prevSession.user.firstName, prevSession.user.lastName].filter(Boolean).join(' ') || prevSession.user.name || prevSession.user.studentId) : 'User';
            showAuthToast('logout', `SESSION CLOSED: ${name}`, 'User logged out. Game running in Guest / Offline Mode.');
        }
    }

    // Unified Role Identification & Authentication System (Synchronous local check)
    function authenticate(usernameInput, passwordInput) {
        if (!usernameInput || !passwordInput) {
            return { success: false, message: 'Please enter both Username and Password.' };
        }

        const username = usernameInput.trim();
        const password = passwordInput.trim();

        // 1. Check Admin Credentials (hardcoded default fallback)
        if (username.toLowerCase() === DEFAULT_ADMIN.username.toLowerCase()) {
            if (password === DEFAULT_ADMIN.password) {
                const adminUser = {
                    username: DEFAULT_ADMIN.username,
                    name: DEFAULT_ADMIN.name,
                    role: 'admin'
                };
                setSession({
                    role: 'admin',
                    user: adminUser
                });
                return { success: true, role: 'admin', user: adminUser };
            } else {
                return { success: false, message: 'Invalid password for Admin account!' };
            }
        }

        // 2. Check Student Accounts (match by studentId only)
        const users = getUsers();
        const student = users.find(u =>
            u.studentId.toLowerCase() === username.toLowerCase()
        );

        if (student) {
            if (student.password === password) {
                setSession({
                    role: 'student',
                    user: student
                });
                return { success: true, role: 'student', user: student };
            } else {
                return { success: false, message: 'Invalid password for Student account!' };
            }
        }

        return { success: false, message: 'Username not found. Please check your credentials or create an account.' };
    }

    // Unified Asynchronous Authentication (Checks MySQL `teachers` table first for admin accounts)
    async function authenticateAsync(usernameInput, passwordInput) {
        if (!usernameInput || !passwordInput) {
            return { success: false, message: 'Please enter both Username and Password.' };
        }

        const username = usernameInput.trim();
        const password = passwordInput.trim();

        // 1. Check Hardcoded Default Admin Credentials (instant offline access)
        if (username.toLowerCase() === DEFAULT_ADMIN.username.toLowerCase()) {
            if (password === DEFAULT_ADMIN.password) {
                const adminUser = {
                    username: DEFAULT_ADMIN.username,
                    name: DEFAULT_ADMIN.name,
                    role: 'admin'
                };
                setSession({
                    role: 'admin',
                    user: adminUser
                });
                return { success: true, role: 'admin', user: adminUser };
            } else {
                return { success: false, message: 'Invalid password for Admin account!' };
            }
        }

        // 2. Check MySQL Database `teachers` Table via teacher_auth.php
        try {
            const dbResp = await fetch('php/teacher_auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (dbResp.ok) {
                const data = await dbResp.json();
                if (data.success && data.role === 'admin') {
                    setSession({
                        role: 'admin',
                        user: data.user
                    });
                    return { success: true, role: 'admin', user: data.user };
                } else if (data.message && data.message.includes('Invalid password')) {
                    return { success: false, message: data.message };
                }
            }
        } catch (err) {
            console.warn('[AUTH] Could not reach teacher_auth.php:', err);
        }

        // 3. Check Student Accounts in Local Storage
        const users = getUsers();
        const student = users.find(u =>
            u.studentId.toLowerCase() === username.toLowerCase()
        );

        if (student) {
            if (student.password === password) {
                setSession({
                    role: 'student',
                    user: student
                });
                return { success: true, role: 'student', user: student };
            } else {
                return { success: false, message: 'Invalid password for Student account!' };
            }
        }

        return { success: false, message: 'Username or Student ID not found. Please check your credentials or create an account.' };
    }

    // Register Student Account
    function registerStudent(studentData) {
        const users = getUsers();

        // Check for existing Student ID
        const existingId = users.find(u => u.studentId.toLowerCase() === studentData.studentId.toLowerCase());
        if (existingId) {
            return { success: false, message: 'Student ID is already registered!' };
        }

        const newStudent = {
            id: 'std_' + Date.now(),
            role: 'student',
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            studentId: studentData.studentId,
            section: studentData.section,
            password: studentData.password,
            createdAt: new Date().toLocaleString(),
            stageProgress: {
                stage1: false,
                stage2: false,
                stage3: false
            },
            scores: {
                stage1: 0,
                stage2: 0,
                stage3: 0
            },
            logs: []
        };

        users.push(newStudent);
        saveUsers(users);

        // Auto Login
        setSession({
            role: 'student',
            user: newStudent
        });

        return { success: true, message: 'Account created successfully!', user: newStudent };
    }

    // Legacy Helpers for Backward Compatibility
    function loginStudent(studentId, password) {
        return authenticate(studentId, password);
    }

    function loginAdmin(adminId, password) {
        return authenticate(adminId, password);
    }

    // Reset Progress for a Student (Admin Function)
    function resetStudentProgress(studentId) {
        const users = getUsers();
        const index = users.findIndex(u => u.studentId === studentId || u.id === studentId);
        if (index !== -1) {
            users[index].stageProgress = { stage1: false, stage2: false, stage3: false };
            users[index].scores = { stage1: 0, stage2: 0, stage3: 0 };
            users[index].logs = [];
            saveUsers(users);

            // If reset student is current session user, update session
            const session = getSession();
            if (session && session.user && (session.user.studentId === studentId || session.user.id === studentId)) {
                session.user = users[index];
                setSession(session);
            }
            return { success: true, message: 'Student progress reset successfully.' };
        }
        return { success: false, message: 'Student record not found.' };
    }

    // Delete Student Record (Admin Function)
    function deleteStudent(studentId) {
        let users = getUsers();
        const initialLength = users.length;
        users = users.filter(u => u.studentId !== studentId && u.id !== studentId);

        if (users.length < initialLength) {
            saveUsers(users);
            return { success: true, message: 'Student account deleted successfully.' };
        }
        return { success: false, message: 'Student record not found.' };
    }

    // Record Stage Completion
    function logStageCompletion(stageNumber, score, timeSpent) {
        let validScore = (typeof score === 'number' && !isNaN(score)) ? Math.max(0, score) : (parseInt(score) || 0);
        const stageLimit = 100;
        validScore = Math.min(stageLimit, Math.max(0, validScore));

        // Update local storage stage scores
        localStorage.setItem(`stage${stageNumber}_completed`, 'true');
        localStorage.setItem(`stage${stageNumber}_score`, String(validScore));

        const session = getSession();
        if (!session || session.role !== 'student') return;

        const studentId = session.user?.studentId || session.user?.id_number;
        if (!studentId) return;

        const users = getUsers();
        let userIndex = users.findIndex(u =>
            (u.studentId && String(u.studentId).trim().toLowerCase() === String(studentId).trim().toLowerCase()) ||
            (u.id && session.user?.id && u.id === session.user.id)
        );

        let user = userIndex !== -1 ? users[userIndex] : null;
        if (!user) {
            user = {
                id: session.user.id || ('std_' + Date.now()),
                role: 'student',
                studentId: studentId,
                firstName: session.user.firstName || '',
                lastName: session.user.lastName || '',
                name: session.user.name || session.user.fullName || studentId,
                section: session.user.section || 'N/A',
                scores: { stage1: 0, stage2: 0, stage3: 0 },
                stageProgress: { stage1: false, stage2: false, stage3: false },
                logs: []
            };
            users.push(user);
            userIndex = users.length - 1;
        }

        if (!user.stageProgress) user.stageProgress = { stage1: false, stage2: false, stage3: false };
        if (!user.scores) user.scores = { stage1: 0, stage2: 0, stage3: 0 };
        if (!user.logs) user.logs = [];

        user.stageProgress[`stage${stageNumber}`] = true;
        user.scores[`stage${stageNumber}`] = Math.min(stageLimit, Math.max(user.scores[`stage${stageNumber}`] || 0, validScore));

        user.logs.push({
            stage: stageNumber,
            score: validScore,
            timeSpent: timeSpent || 'N/A',
            timestamp: new Date().toLocaleString()
        });

        users[userIndex] = user;
        saveUsers(users);

        // Update session user
        session.user = user;
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        // --- Save directly to MySQL database via PHP ---
        fetch('php/save_progress.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: studentId,
                stage: stageNumber,
                score: validScore
            }),
            keepalive: true
        })
            .then(r => r.json())
            .then(dbRes => {
                if (dbRes.success) {
                    console.log(`[DB] Stage ${stageNumber} score (${validScore} pts) saved. Log ID: ${dbRes.log_id}`);
                } else {
                    console.warn('[DB] Progress note:', dbRes.message);
                }
            })
            .catch(err => console.warn('[DB] Could not reach save_progress.php:', err));
    }

    // Auto-sync any locally completed stages into the student account and database
    function syncPendingStageProgress() {
        const session = getSession();
        if (!session || session.role !== 'student' || !session.user) return;

        const studentId = session.user?.studentId || session.user?.id_number;
        if (!studentId) return;

        const users = getUsers();
        let userIndex = users.findIndex(u =>
            (u.studentId && String(u.studentId).trim().toLowerCase() === String(studentId).trim().toLowerCase()) ||
            (u.id && session.user?.id && u.id === session.user.id)
        );
        if (userIndex === -1) return;

        const user = users[userIndex];
        if (!user.stageProgress) user.stageProgress = { stage1: false, stage2: false, stage3: false };
        if (!user.scores) user.scores = { stage1: 0, stage2: 0, stage3: 0 };

        let changed = false;
        for (let st = 1; st <= 3; st++) {
            const isDone = localStorage.getItem(`stage${st}_completed`) === 'true';
            const savedScore = parseInt(localStorage.getItem(`stage${st}_score`)) || 0;
            const currentScore = user.scores[`stage${st}`] || 0;

            if (isDone && !user.stageProgress[`stage${st}`]) {
                user.stageProgress[`stage${st}`] = true;
                changed = true;
            }
            if (savedScore > currentScore) {
                user.scores[`stage${st}`] = Math.min(100, savedScore);
                changed = true;
            }
        }

        if (changed) {
            users[userIndex] = user;
            saveUsers(users);
            session.user = user;
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));

            // Sync with MySQL in background
            for (let st = 1; st <= 3; st++) {
                if (user.stageProgress[`stage${st}`] && user.scores[`stage${st}`] > 0) {
                    fetch('php/save_progress.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            studentId: studentId,
                            stage: st,
                            score: user.scores[`stage${st}`]
                        }),
                        keepalive: true
                    }).catch(() => { });
                }
            }
        }
    }

    // Update Top UI Session Display (Supports Lobby and In-Game Stages)
    function updateUserUI() {
        injectAuthStyles();
        syncPendingStageProgress();
        const session = getSession();

        // 1. Update Lobby Session Badge (#userSessionBadge in index.html)
        const userBadge = document.getElementById('userSessionBadge');
        const userBadgeText = document.getElementById('userBadgeText');
        const userAuthBtn = document.getElementById('userAuthBtn');

        if (userBadge) {
            let statusDot = userBadge.querySelector('.status-pulse-dot');
            if (!statusDot) {
                statusDot = document.createElement('span');
                statusDot.className = 'status-pulse-dot';
                userBadge.insertBefore(statusDot, userBadge.firstChild);
            }

            if (session) {
                statusDot.className = 'status-pulse-dot active';
                if (session.role === 'admin') {
                    const adminName = session.user.name || 'Administrator';
                    if (userBadgeText) userBadgeText.innerHTML = `👑 <strong style="color:var(--cyan-primary,#00f5ff);">ADMIN</strong> (${adminName})`;
                    if (userAuthBtn) userAuthBtn.textContent = 'LOG OUT';
                } else if (session.role === 'student') {
                    const fullName = [session.user.firstName, session.user.lastName].filter(Boolean).join(' ') || session.user.name || session.user.studentId || 'Player';
                    const sectionStr = session.user.section ? ` (${session.user.section})` : '';
                    if (userBadgeText) userBadgeText.innerHTML = `👨‍💻 <strong>${fullName}</strong>${sectionStr}`;
                    if (userAuthBtn) userAuthBtn.textContent = 'LOG OUT';
                }
                userBadge.classList.remove('hidden', 'user-offline');
                userBadge.classList.add('user-online');
            } else {
                statusDot.className = 'status-pulse-dot offline';
                if (userBadgeText) userBadgeText.innerHTML = `🔴 <span>GUEST / OFFLINE</span>`;
                if (userAuthBtn) userAuthBtn.textContent = 'SIGN IN';
                userBadge.classList.remove('hidden', 'user-online');
                userBadge.classList.add('user-offline');
            }
        }

        // 2. Update In-Game Stage HUD Pill (#stageUserPill in stage1.html, stage2.html, stage3.html)
        let stageUserPill = document.getElementById('stageUserPill');
        if (!stageUserPill) {
            const progressContainer = document.querySelector('.game-header .progress, header.game-header .progress');
            if (progressContainer) {
                stageUserPill = document.createElement('div');
                stageUserPill.id = 'stageUserPill';
                stageUserPill.className = 'user-session-hud-pill';
                progressContainer.insertBefore(stageUserPill, progressContainer.firstChild);
            }
        }

        if (stageUserPill) {
            if (session) {
                const u = session.user || {};
                const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.name || u.studentId || 'Technician';
                const section = u.section ? ` (${u.section})` : '';
                stageUserPill.className = 'user-session-hud-pill online';
                stageUserPill.innerHTML = `
                    <span class="status-pulse-dot active" title="Active Technician Session"></span>
                    <span class="user-hud-info" title="Logged in as ${name}${section}">
                        <span class="user-hud-tag">TECH:</span>
                        <span class="user-hud-name">${name}${section}</span>
                    </span>
                    <button type="button" class="user-hud-logout-btn" id="stageUserLogoutBtn" title="Log Out / Switch Account">LOG OUT</button>
                `;
            } else {
                stageUserPill.className = 'user-session-hud-pill offline';
                stageUserPill.innerHTML = `
                    <span class="status-pulse-dot offline" title="Not Logged In"></span>
                    <span class="user-hud-info" title="Operating in Guest Mode">
                        <span class="user-hud-name">🔴 GUEST / OFFLINE</span>
                    </span>
                    <button type="button" class="user-hud-logout-btn btn-signin" id="stageUserLogoutBtn" title="Sign In to Record Scores">SIGN IN</button>
                `;
            }

            const stageBtn = document.getElementById('stageUserLogoutBtn');
            if (stageBtn) {
                stageBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (session) {
                        const u = session.user || {};
                        const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.name || u.studentId || 'Technician';
                        showInGameConfirm(
                            'LOG OUT CONFIRMATION',
                            `Logged in as ${name}.\nWould you like to Log Out and return to the main menu?`,
                            () => {
                                clearSession(true);
                                showInGameAlert(
                                    '🔒 LOGGED OUT',
                                    'You have been logged out successfully.\nReturning to the main menu...',
                                    '🔒',
                                    'OK',
                                    () => {
                                        window.location.href = 'index.html';
                                    }
                                );
                                setTimeout(() => {
                                    window.location.href = 'index.html';
                                }, 1500);
                            },
                            null,
                            '⚠️',
                            'LOG OUT',
                            'CANCEL'
                        );
                    } else {
                        window.location.href = 'index.html';
                    }
                };
            }
        }

        if (typeof window.updateScoringModalUI === 'function') {
            window.updateScoringModalUI();
        }
    }

    // Scoring & Rank System Constants & Methods (Stage 1: 100 + Stage 2: 100 + Stage 3: 100 = 300)
    const MAX_GAME_SCORE = 300;

    function calculateTotalScore(user) {
        if (!user || !user.scores) return 0;
        const s1 = Math.min(100, parseInt(user.scores.stage1) || 0);
        const s2 = Math.min(100, parseInt(user.scores.stage2) || 0);
        const s3 = Math.min(100, parseInt(user.scores.stage3) || 0);
        return s1 + s2 + s3;
    }

    function getTechnicianRank(totalScore) {
        const score = totalScore || 0;
        const percent = Math.min(100, Math.round((score / MAX_GAME_SCORE) * 100));

        if (score >= 270) {
            return {
                title: 'Master Systems Architect',
                tier: 'S-TIER (90-100%)',
                icon: '🌟',
                badgeClass: 'rank-badge-master',
                percent: percent,
                description: 'Flawless execution across hardware assembly, rear I/O protocols, and RJ45 cable termination.'
            };
        } else if (score >= 225) {
            return {
                title: 'Senior Systems Specialist',
                tier: 'A-TIER (75-89%)',
                icon: '🥇',
                badgeClass: 'rank-badge-expert',
                percent: percent,
                description: 'Excellent technical capability with minor timing or socket placement tolerances.'
            };
        } else if (score >= 180) {
            return {
                title: 'Certified Field Technician',
                tier: 'B-TIER (60-74%)',
                icon: '🥈',
                badgeClass: 'rank-badge-certified',
                percent: percent,
                description: 'Solid hardware foundation; successfully brought all three test systems online.'
            };
        } else if (score > 0) {
            return {
                title: 'Junior Apprentice',
                tier: 'C-TIER (<60%)',
                icon: '🥉',
                badgeClass: 'rank-badge-apprentice',
                percent: percent,
                description: 'Hardware stages cleared with multiple diagnostic errors. Recommended for review.'
            };
        } else {
            return {
                title: 'Unranked Technician',
                tier: 'INCOMPLETE',
                icon: '🔒',
                badgeClass: 'rank-badge-unranked',
                percent: 0,
                description: 'Complete Stage 1, Stage 2, and Stage 3 to establish your official ranking.'
            };
        }
    }

    // Auto-initialize UI on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateUserUI);
    } else {
        setTimeout(updateUserUI, 0);
    }

    return {
        getUsers: getUsers,
        saveUsers: saveUsers,
        _save: saveUsers,
        getSession: getSession,
        authenticate: authenticate,
        authenticateAsync: authenticateAsync,
        registerStudent: registerStudent,
        loginStudent: loginStudent,
        loginAdmin: loginAdmin,
        resetStudentProgress: resetStudentProgress,
        deleteStudent: deleteStudent,
        logStageCompletion: logStageCompletion,
        logout: clearSession,
        updateUserUI: updateUserUI,
        calculateTotalScore: calculateTotalScore,
        getTechnicianRank: getTechnicianRank,
        showAuthToast: showAuthToast,
        showInGameAlert: showInGameAlert,
        showInGameConfirm: showInGameConfirm,
        showAlert: showInGameAlert,
        closeAlert: closeInGameAlert,
        MAX_GAME_SCORE: MAX_GAME_SCORE
    };
})();
