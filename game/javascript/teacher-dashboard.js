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
        sortCol: 'date',
        sortDir: 'desc'
    };

    // ─────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────
    function sessionDate(session) {
        const src = session.startTime || session.timestamp;
        if (!src) return null;
        const d = new Date(src);
        return isNaN(d) ? null : d;
    }

    function fmtDateTime(d) {
        if (!d) return '—';
        return d.toLocaleString([], {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    }

    function scoreClass(score) {
        if (score >= 80) return 'high';
        if (score >= 50) return 'mid';
        return 'low';
    }

    // ─────────────────────────────────────────────────────────
    let dbLogs = [];

    function fetchDbLogs() {
        fetch('php/get_logs.php')
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.logs)) {
                    dbLogs = data.logs;
                    render();
                }
            })
            .catch(err => console.warn('[DB Logs] Could not fetch MySQL logs:', err));
    }

    // ─────────────────────────────────────────────────────────
    // BUILD FLAT SESSION LIST (one row per play session)
    // ─────────────────────────────────────────────────────────
    function buildSessionRows(users) {
        const rows = [];
        const seenKeys = new Set();

        users.forEach(u => {
            const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.studentId || 'Unknown';
            (u.logs || []).forEach(log => {
                const dateObj = sessionDate(log);
                const key = `${u.studentId}_${log.stage}_${log.score}`;
                seenKeys.add(key);
                rows.push({
                    studentId: u.studentId || '—',
                    name: fullName,
                    date: dateObj,
                    score: log.score != null ? log.score : null
                });
            });
        });

        dbLogs.forEach(dbl => {
            const key = `${dbl.id_number}_${dbl.stage}_${dbl.score}`;
            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                const d = new Date(dbl.timestamp);
                rows.push({
                    studentId: dbl.id_number || '—',
                    name: dbl.full_name,
                    date: isNaN(d) ? null : d,
                    score: dbl.score
                });
            }
        });

        return rows;
    }

    function filterRows(rows) {
        const q = state.searchQuery.toLowerCase();
        if (!q) return rows;
        return rows.filter(r =>
            r.name.toLowerCase().includes(q) ||
            (r.studentId && r.studentId.toLowerCase().includes(q))
        );
    }

    function sortRows(rows) {
        const dir = state.sortDir === 'asc' ? 1 : -1;
        return [...rows].sort((a, b) => {
            let va, vb;
            if (state.sortCol === 'name') {
                va = a.name.toLowerCase();
                vb = b.name.toLowerCase();
            } else if (state.sortCol === 'score') {
                va = a.score != null ? a.score : -1;
                vb = b.score != null ? b.score : -1;
            } else {
                // date
                va = a.date ? a.date.getTime() : 0;
                vb = b.date ? b.date.getTime() : 0;
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
        let rows = buildSessionRows(users);

        // Summary stats (over all sessions, not affected by search)
        const uniqueStudents = new Set(rows.map(r => r.name)).size;
        const scored = rows.filter(r => r.score != null);
        const avgScore = scored.length
            ? Math.round(scored.reduce((s, r) => s + r.score, 0) / scored.length)
            : null;

        if (elStatSessions) elStatSessions.textContent = rows.length;
        if (elStatStudents) elStatStudents.textContent = uniqueStudents;
        if (elStatAvgScore) elStatAvgScore.textContent = avgScore != null ? avgScore + '%' : '—';

        rows = filterRows(rows);
        rows = sortRows(rows);

        renderTable(rows);
    }

    function renderTable(rows) {
        if (!elTableBody) return;

        if (rows.length === 0) {
            elTableBody.innerHTML = `
                <tr class="td-empty-row">
                    <td colspan="4">No matching activity found.</td>
                </tr>`;
            return;
        }

        let html = '';
        rows.forEach(r => {
            const dateStr = fmtDateTime(r.date);
            const scoreHtml = r.score != null
                ? `<span class="td-score ${scoreClass(r.score)}">${r.score}</span>`
                : `<span class="td-score none">—</span>`;

            html += `
            <tr>
                <td><span class="td-student-id">${r.studentId}</span></td>
                <td><span class="td-student-name">${r.name}</span></td>
                <td><span class="td-date-time">${dateStr}</span></td>
                <td>${scoreHtml}</td>
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
                state.sortDir = col === 'date' ? 'desc' : 'asc';
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
                        u.scores = { stage1: 0, stage2: 0, stage3: 0 };
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
                        sessionData.user.scores = { stage1: 0, stage2: 0, stage3: 0 };
                        sessionData.user.stageProgress = { stage1: false, stage2: false, stage3: false };
                        sessionData.user.logs = [];
                        localStorage.setItem('convenire_session', JSON.stringify(sessionData));
                    }

                    // Clear all stage progress keys
                    ['stage1', 'stage2', 'stage3'].forEach(s => {
                        localStorage.removeItem(`${s}_completed`);
                        localStorage.removeItem(`${s}_score`);
                    });

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
    const defaultSortHeader = document.querySelector('th[data-sort="date"]');
    if (defaultSortHeader) {
        defaultSortHeader.classList.add('sort-desc');
        const icon = defaultSortHeader.querySelector('.td-sort-icon');
        if (icon) icon.textContent = '↓';
    }

    render();
    fetchDbLogs();

})();