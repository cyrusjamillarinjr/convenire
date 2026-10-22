/* CONVENIRE — Teacher Dashboard JavaScript (simplified)
   Reads student play sessions through the shared AuthEngine.
   Shows: student name, date & time played, score.
*/

(function () {
    'use strict';

    // ─────────────────────────────────────────────────────────
    // AUTH GATE — redirect to index if not admin
    // Reads through the shared AuthEngine (same engine stage1/2/3
    // and login use) so this page never drifts from the real
    // session/user data. Falls back to direct localStorage parsing
    // only if authEngine.js failed to load.
    // ─────────────────────────────────────────────────────────
    function getSession() {
        if (window.AuthEngine) return window.AuthEngine.getSession();
        try {
            return JSON.parse(localStorage.getItem('convenire_session'));
        } catch (e) {
            return null;
        }
    }

    function getUsers() {
        if (window.AuthEngine) return window.AuthEngine.getUsers();
        try {
            const data = JSON.parse(localStorage.getItem('convenire_users'));
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    }

    const session = getSession();
    if (!session || session.role !== 'admin') {
        window.location.replace('MainMenu.html');
        return;
    }

    // ─────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────
    let state = {
        searchQuery: '',
        sortCol: 'total',
        sortDir: 'desc'
    };

    // ─────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────
    function scoreClass(score) {
        if (score >= 80) return 'high';
        if (score >= 50) return 'mid';
        return 'low';
    }

    // ─────────────────────────────────────────────────────────
    let dbStudents = [];
    let dbLogs = [];

    function fetchDbData() {
        Promise.all([
            fetch('php/get_leaderboard.php').then(res => res.json()).catch(() => ({ success: false })),
            fetch('php/get_logs.php').then(res => res.json()).catch(() => ({ success: false }))
        ]).then(([lbData, logsData]) => {
            if (lbData && lbData.success && Array.isArray(lbData.leaderboard)) {
                dbStudents = lbData.leaderboard;
            }
            if (logsData && logsData.success && Array.isArray(logsData.logs)) {
                dbLogs = logsData.logs;
            }
            render();
        }).catch(err => console.warn('[Teacher Dashboard] Fetch error:', err));
    }

    // ─────────────────────────────────────────────────────────
    // BUILD STUDENT RECORD ROWS (Stage 1, Stage 2, Stage 3, Bonus Quiz, Total)
    // ─────────────────────────────────────────────────────────
    function buildStudentRows(users) {
        const map = new Map();

        // 1. Ingest local user accounts
        users.forEach(u => {
            const sid = (u.studentId || u.id || '').trim();
            if (!sid) return;
            const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || sid;
            const s1 = Math.min(100, parseInt(u.scores?.stage1) || 0);
            const s2 = Math.min(100, parseInt(u.scores?.stage2) || 0);
            const s3 = Math.min(100, parseInt(u.scores?.stage3) || 0);
            const bonus = Math.min(50, parseInt(u.scores?.stage3_bonus) || 0);
            const total = s1 + s2 + s3 + bonus;

            map.set(sid.toLowerCase(), {
                studentId: sid,
                name: fullName,
                section: u.section || 'N/A',
                stage1: s1,
                stage2: s2,
                stage3: s3,
                bonus: bonus,
                total: total
            });
        });

        // 2. Ingest / merge with live MySQL student records
        dbStudents.forEach(db => {
            const sid = (db.studentId || '').trim();
            if (!sid) return;
            const key = sid.toLowerCase();
            const s1 = Math.min(100, parseInt(db.scores?.stage1) || 0);
            const s2 = Math.min(100, parseInt(db.scores?.stage2) || 0);
            const s3 = Math.min(100, parseInt(db.scores?.stage3) || 0);
            const bonus = Math.min(50, parseInt(db.scores?.stage3_bonus) || 0);
            const total = s1 + s2 + s3 + bonus;
            const name = db.fullName || db.name || sid;

            if (map.has(key)) {
                const existing = map.get(key);
                existing.stage1 = Math.max(existing.stage1, s1);
                existing.stage2 = Math.max(existing.stage2, s2);
                existing.stage3 = Math.max(existing.stage3, s3);
                existing.bonus = Math.max(existing.bonus, bonus);
                existing.total = existing.stage1 + existing.stage2 + existing.stage3 + existing.bonus;
                if (db.section && db.section !== 'N/A') existing.section = db.section;
                if (name && name !== sid) existing.name = name;
            } else {
                map.set(key, {
                    studentId: sid,
                    name: name,
                    section: db.section || 'N/A',
                    stage1: s1,
                    stage2: s2,
                    stage3: s3,
                    bonus: bonus,
                    total: total
                });
            }
        });

        return Array.from(map.values());
    }

    function filterRows(rows) {
        const q = state.searchQuery.toLowerCase();
        if (!q) return rows;
        return rows.filter(r =>
            r.name.toLowerCase().includes(q) ||
            r.studentId.toLowerCase().includes(q) ||
            r.section.toLowerCase().includes(q)
        );
    }

    function sortRows(rows) {
        const dir = state.sortDir === 'asc' ? 1 : -1;
        return [...rows].sort((a, b) => {
            let va, vb;
            if (state.sortCol === 'name') {
                va = a.name.toLowerCase();
                vb = b.name.toLowerCase();
            } else if (state.sortCol === 'studentId') {
                va = a.studentId.toLowerCase();
                vb = b.studentId.toLowerCase();
            } else if (state.sortCol === 'section') {
                va = a.section.toLowerCase();
                vb = b.section.toLowerCase();
            } else if (state.sortCol === 'stage1') {
                va = a.stage1;
                vb = b.stage1;
            } else if (state.sortCol === 'stage2') {
                va = a.stage2;
                vb = b.stage2;
            } else if (state.sortCol === 'stage3') {
                va = a.stage3;
                vb = b.stage3;
            } else if (state.sortCol === 'bonus') {
                va = a.bonus;
                vb = b.bonus;
            } else {
                // total
                va = a.total;
                vb = b.total;
            }
            if (va < vb) return -1 * dir;
            if (va > vb) return 1 * dir;
            return 0;
        });
    }

    // ─────────────────────────────────────────────────────────
    // DOM REFS
    // ─────────────────────────────────────────────────────────
    const elTableBody = document.getElementById('tdTableBody');
    const elSearchInput = document.getElementById('tdSearch');
    const elSortHeaders = document.querySelectorAll('th[data-sort]');
    const elStatSessions = document.getElementById('tdStatSessions');
    const elStatStudents = document.getElementById('tdStatStudents');
    const elStatAvgScore = document.getElementById('tdStatAvgScore');
    const elAdminName = document.getElementById('tdAdminName');

    if (elAdminName) {
        elAdminName.textContent = session.user?.name || session.user?.username || 'Admin';
    }

    // ─────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────
    function render() {
        const users = getUsers();
        let rows = buildStudentRows(users);

        // Summary stats
        const uniqueStudents = rows.length;
        const totalSessions = dbLogs.length;
        const totalScores = rows.map(r => r.total);
        const avgScore = totalScores.length
            ? Math.round(totalScores.reduce((s, r) => s + r, 0) / totalScores.length)
            : 0;

        if (elStatSessions) elStatSessions.textContent = totalSessions;
        if (elStatStudents) elStatStudents.textContent = uniqueStudents;
        if (elStatAvgScore) elStatAvgScore.textContent = `${avgScore} / 350 PTS`;

        rows = filterRows(rows);
        rows = sortRows(rows);

        renderTable(rows);
    }

    function renderTable(rows) {
        if (!elTableBody) return;

        if (rows.length === 0) {
            elTableBody.innerHTML = `
                <tr class="td-empty-row">
                    <td colspan="8">No matching student records found.</td>
                </tr>`;
            return;
        }

        let html = '';
        rows.forEach(r => {
            html += `
            <tr>
                <td><span class="td-student-id">${r.studentId}</span></td>
                <td><span class="td-student-name">${r.name}</span></td>
                <td><span class="td-section">${r.section}</span></td>
                <td><span class="td-score ${scoreClass(r.stage1)}">${r.stage1} / 100</span></td>
                <td><span class="td-score ${scoreClass(r.stage2)}">${r.stage2} / 100</span></td>
                <td><span class="td-score ${scoreClass(r.stage3)}">${r.stage3} / 100</span></td>
                <td><span class="td-score" style="color:#ffb800; font-weight:700;">${r.bonus} / 50</span></td>
                <td><span class="td-score ${scoreClass(Math.round((r.total / 350) * 100))}" style="font-weight:800; color:var(--cyan);">${r.total} / 350</span></td>
            </tr>`;
        });

        elTableBody.innerHTML = html;
    }

    // ─────────────────────────────────────────────────────────
    // SEARCH
    // ─────────────────────────────────────────────────────────
    if (elSearchInput) {
        elSearchInput.addEventListener('input', function () {
            state.searchQuery = this.value.trim();
            render();
        });
    }

    // ─────────────────────────────────────────────────────────
    // SORTING
    // ─────────────────────────────────────────────────────────
    elSortHeaders.forEach(th => {
        th.addEventListener('click', function () {
            const col = this.getAttribute('data-sort');
            if (state.sortCol === col) {
                state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                state.sortCol = col;
                state.sortDir = (col === 'name' || col === 'studentId' || col === 'section') ? 'asc' : 'desc';
            }
            elSortHeaders.forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
                const icon = h.querySelector('.td-sort-icon');
                if (icon) icon.textContent = '⇅';
            });
            this.classList.add(state.sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
            const icon = this.querySelector('.td-sort-icon');
            if (icon) icon.textContent = state.sortDir === 'asc' ? '↑' : '↓';
            render();
        });
    });

    // ─────────────────────────────────────────────────────────
    // RESET RECORDS / BACK / SIGN OUT
    // ─────────────────────────────────────────────────────────
    const elRefresh = document.getElementById('tdRefreshBtn');
    if (elRefresh) {
        elRefresh.addEventListener('click', function () {
            const doReset = () => {
                // ── 1. Reset all scores & progress, but PRESERVE student accounts ──
                try {
                    const rawUsers = localStorage.getItem('convenire_users');
                    let users = [];
                    try { users = JSON.parse(rawUsers) || []; } catch (err) { users = []; }

                    users.forEach(u => {
                        u.scores = { stage1: 0, stage2: 0, stage3: 0, stage3_bonus: 0 };
                        u.stageProgress = { stage1: false, stage2: false, stage3: false };
                        u.logs = [];
                    });
                    localStorage.setItem('convenire_users', JSON.stringify(users));
                    if (window.AuthEngine && typeof window.AuthEngine.saveUsers === 'function') {
                        window.AuthEngine.saveUsers(users);
                    }

                    // Reset active session user's score if a student is logged in
                    const sessionData = JSON.parse(localStorage.getItem('convenire_session') || 'null');
                    if (sessionData && sessionData.role === 'student' && sessionData.user) {
                        sessionData.user.scores = { stage1: 0, stage2: 0, stage3: 0, stage3_bonus: 0 };
                        sessionData.user.stageProgress = { stage1: false, stage2: false, stage3: false };
                        sessionData.user.logs = [];
                        localStorage.setItem('convenire_session', JSON.stringify(sessionData));
                    }

                    // Clear all stage progress keys
                    ['stage1', 'stage2', 'stage3'].forEach(s => {
                        localStorage.removeItem(`${s}_completed`);
                        localStorage.removeItem(`${s}_score`);
                    });
                    localStorage.removeItem('stage3_bonus_score');

                    // Signal the game page to clear leaderboard (works same-tab and cross-tab)
                    localStorage.setItem('convenire_reset_flag', '1');

                    // Refresh leaderboard UI if on the same page
                    if (typeof window.updateScoringModalUI === 'function') {
                        window.updateScoringModalUI();
                    }
                    if (window.AuthEngine && typeof window.AuthEngine.updateUserUI === 'function') {
                        window.AuthEngine.updateUserUI();
                    }

                } catch (e) {
                    console.error('Failed to reset student scores:', e);
                }

                // ── 2. Wipe MySQL game_logs & zero student_records (students table KEPT intact) ──
                fetch('php/reset_records.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullReset: false })
                })
                .then(r => r.json())
                .then(res => {
                    if (res.success) {
                        console.log('[DB] Activity logs cleared; student accounts preserved.');
                    } else {
                        console.warn('[DB] Reset note:', res.message);
                    }
                })
                .catch(err => console.warn('[DB] Could not reach reset_records.php:', err));

                // ── 3. Clear the in-memory DB cache so render() shows an empty table ──
                dbStudents = [];
                dbLogs = [];

                render();
                if (window.showInGameAlert) {
                    window.showInGameAlert('🔄 RECORDS RESET COMPLETE', 'All student scores and game activity logs have been cleared. All student login accounts remain active and safe.', '🔄');
                }
            };

            if (window.showInGameConfirm) {
                window.showInGameConfirm(
                    'RESET ACTIVITY RECORDS',
                    'This will clear all game scores and activity logs from the dashboard, but keep all student login accounts safe and intact.\nAre you sure?',
                    doReset,
                    null,
                    '⚠️',
                    'RESET RECORDS',
                    'CANCEL'
                );
            } else if (confirm('⚠️ Reset all activity records?\n\nThis will clear all scores and logs, but keep student accounts intact.')) {
                doReset();
            }
        });
    }

    const elBackToMenu = document.getElementById('backToMenuBtn');
    if (elBackToMenu) {
        elBackToMenu.addEventListener('click', () => {
            window.location.href = 'MainMenu.html';
        });
    }

    const elLogout = document.getElementById('tdLogoutBtn');
    if (elLogout) {
        elLogout.addEventListener('click', () => {
            if (window.showInGameConfirm) {
                window.showInGameConfirm(
                    'SIGN OUT CONFIRMATION',
                    'Sign out from Teacher Dashboard and return to the main menu?',
                    () => {
                        if (window.AuthEngine) {
                            window.AuthEngine.logout();
                        } else {
                            localStorage.removeItem('convenire_session');
                        }
                        window.location.href = 'MainMenu.html';
                    },
                    null,
                    '⚠️',
                    'SIGN OUT',
                    'CANCEL'
                );
            } else if (confirm('Sign out from Teacher Dashboard?')) {
                if (window.AuthEngine) {
                    window.AuthEngine.logout();
                } else {
                    localStorage.removeItem('convenire_session');
                }
                window.location.href = 'MainMenu.html';
            }
        });
    }

    // ─────────────────────────────────────────────────────────
    // INITIAL RENDER
    // ─────────────────────────────────────────────────────────
    const defaultSortHeader = document.querySelector('th[data-sort="total"]');
    if (defaultSortHeader) {
        defaultSortHeader.classList.add('sort-desc');
        const icon = defaultSortHeader.querySelector('.td-sort-icon');
        if (icon) icon.textContent = '↓';
    }

    render();
    fetchDbData();

})();