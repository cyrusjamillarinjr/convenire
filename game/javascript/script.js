(function () {
    // DOM Elements
    const mainMenu = document.getElementById('mainMenu');
    const settingsPanel = document.getElementById('settingsPanel');
    const stageMenu = document.getElementById('stageMenu');
    const instructionsPanel = document.getElementById('instructionsPanel');
    const scoringPanel = document.getElementById('scoringPanel');
    const startBtn = document.getElementById('startBtn');
    const stageSelectBtn = document.getElementById('stageSelectBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    const scoringBtn = document.getElementById('scoringBtn');
    const exitBtn = document.getElementById('exitBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const backFromSettings = document.getElementById('backFromSettings');
    const backToMenuFromStage = document.getElementById('backToMenuFromStage');
    const backToMenuFromIns = document.getElementById('backToMenuFromIns');
    const backToMenuFromScoring = document.getElementById('backToMenuFromScoring');
    const stageGrid = document.getElementById('stageGrid');
    const backgroundMusic = document.getElementById('backgroundMusic');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    const muteBtn = document.getElementById('muteBtn');
    const widgetVolumeSlider = document.getElementById('widgetVolumeSlider');
    const widgetMuteBtn = document.getElementById('widgetMuteBtn');
    const equalizerBars = document.getElementById('equalizerBars');
    const startTransition = document.getElementById('startTransition');
    const missionScreen = document.getElementById('missionScreen');
    const loaderFill = document.getElementById('loaderFill');

    // Check which stages are completed
    const stage1Completed = localStorage.getItem('stage1_completed') === 'true';
    const stage2Completed = localStorage.getItem('stage2_completed') === 'true';
    const stage3Completed = localStorage.getItem('stage3_completed') === 'true';

    // Stages data with rich CSS NC II competencies
    const stages = [
        {
            number: "01",
            title: "MOTHERBOARD ASSEMBLY",
            category: "Core Hardware & Sockets",
            desc: "Mount the CPU, RAM modules, GPU, and PSU cables into their precision motherboard sockets.",
            icon: "🖥️",
            timeLimit: 90,
            maxScore: "100 PTS",
            tags: ["Hardware Sockets", "RAM & PCIe"],
            unlocked: true,
            completed: stage1Completed,
            score: localStorage.getItem('stage1_score') || '0',
            accent: "cyan"
        },
        {
            number: "02",
            title: "REAR I/O PORT MATRIX",
            category: "Peripheral Connectivity",
            desc: "Identify, analyze, and match HDMI, DisplayPort, USB-C, Ethernet, Audio, and legacy peripheral ports.",
            icon: "🔌",
            timeLimit: 70,
            maxScore: "100 PTS",
            tags: ["Port Recognition", "I/O Interface"],
            unlocked: stage1Completed,
            completed: stage2Completed,
            score: localStorage.getItem('stage2_score') || '0',
            accent: "violet"
        },
        {
            number: "03",
            title: "RJ-45 CABLE FABRICATION",
            category: "Networking & Cabling",
            desc: "Strip jacket, align T568A/T568B leads, squeeze the crimper, and verify dual-end 16-pin continuity.",
            icon: "🛠️",
            timeLimit: 60,
            maxScore: "150+ PTS",
            tags: ["T568A / T568B", "16-Pin Tester"],
            unlocked: stage1Completed && stage2Completed,
            completed: stage3Completed,
            score: localStorage.getItem('stage3_score') || '0',
            accent: "emerald"
        }
    ];

    // Audio settings
    let currentVolume = 50;
    let isMuted = false;

    // Synchronize Audio Controls
    function updateAudioState(vol, mute) {
        currentVolume = vol;
        isMuted = mute;

        if (backgroundMusic) {
            backgroundMusic.volume = isMuted ? 0 : currentVolume / 100;
        }

        if (volumeSlider) volumeSlider.value = currentVolume;
        if (widgetVolumeSlider) widgetVolumeSlider.value = currentVolume;
        if (volumeValue) volumeValue.textContent = currentVolume + '%';

        const muteText = isMuted ? '🔇 Unmute' : '🔊 Mute';
        const widgetMuteIcon = isMuted ? '🔇' : '🔊';

        if (muteBtn) muteBtn.textContent = muteText;
        if (widgetMuteBtn) widgetMuteBtn.textContent = widgetMuteIcon;

        // Animate or pause equalizer bars based on mute status
        if (equalizerBars) {
            equalizerBars.querySelectorAll('.eq-bar').forEach(bar => {
                bar.style.animationPlayState = (isMuted || currentVolume === 0) ? 'paused' : 'running';
                bar.style.opacity = (isMuted || currentVolume === 0) ? '0.3' : '1';
            });
        }
    }

    // Initialize audio
    if (backgroundMusic) {
        backgroundMusic.volume = currentVolume / 100;
    }

    // Start music on first interaction
    document.addEventListener('click', function initMusic() {
        if (backgroundMusic) {
            backgroundMusic.play().then(() => {
                updateAudioState(currentVolume, isMuted);
            }).catch(() => { });
        }
        document.removeEventListener('click', initMusic);
    }, { once: true });

    // Slider Listeners
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            updateAudioState(val, val === 0);
        });
    }

    if (widgetVolumeSlider) {
        widgetVolumeSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            updateAudioState(val, val === 0);
        });
    }

    // Mute Listeners
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            updateAudioState(currentVolume, !isMuted);
        });
    }

    if (widgetMuteBtn) {
        widgetMuteBtn.addEventListener('click', () => {
            updateAudioState(currentVolume, !isMuted);
        });
    }

    // Active Button Selector Helper
    function setActiveButton(clickedBtn) {
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
        if (clickedBtn) clickedBtn.classList.add('active');
    }

    // Navigation functions
    function showMainMenu() {
        mainMenu.classList.remove('hidden');
        settingsPanel.classList.add('hidden');
        stageMenu.classList.add('hidden');
        instructionsPanel.classList.add('hidden');
        if (scoringPanel) scoringPanel.classList.add('hidden');
        setActiveButton(null);
    }

    function showSettings() {
        mainMenu.classList.add('hidden');
        settingsPanel.classList.remove('hidden');
        stageMenu.classList.add('hidden');
        instructionsPanel.classList.add('hidden');
        if (scoringPanel) scoringPanel.classList.add('hidden');
        setActiveButton(settingsBtn);
    }

    function showStageMenu() {
        setActiveButton(stageSelectBtn);
        // All stages unlocked by default
        stages[0].unlocked = true;
        stages[1].unlocked = true;
        stages[2].unlocked = true;

        renderStageGrid();
        mainMenu.classList.add('hidden');
        settingsPanel.classList.add('hidden');
        stageMenu.classList.remove('hidden');
        instructionsPanel.classList.add('hidden');
        if (scoringPanel) scoringPanel.classList.add('hidden');
    }

    function showAbout() {
        setActiveButton(aboutBtn);
        mainMenu.classList.add('hidden');
        settingsPanel.classList.add('hidden');
        stageMenu.classList.add('hidden');
        instructionsPanel.classList.remove('hidden');
        if (scoringPanel) scoringPanel.classList.add('hidden');
    }

    function showScoring() {
        setActiveButton(scoringBtn);
        mainMenu.classList.add('hidden');
        settingsPanel.classList.add('hidden');
        stageMenu.classList.add('hidden');
        instructionsPanel.classList.add('hidden');
        if (scoringPanel) scoringPanel.classList.remove('hidden');
        // Always read fresh data (catches same-tab resets too)
        updateScoringModalUI();
    }

    // Dynamic Simple Game Scoreboard & Leaderboard Updater
    function updateScoringModalUI() {
        const session = window.AuthEngine ? window.AuthEngine.getSession() : null;
        const cardAvatar = document.getElementById('playerCardAvatar');
        const cardName = document.getElementById('playerCardName');
        const cardMeta = document.getElementById('playerCardMeta');
        const rankGrade = document.getElementById('playerRankGrade');
        const rankTitle = document.getElementById('playerRankTitle');

        const st1ScoreElem = document.getElementById('playerStg1Score');
        const st1Status = document.getElementById('playerStg1Status');
        const st2ScoreElem = document.getElementById('playerStg2Score');
        const st2Status = document.getElementById('playerStg2Status');
        const st3ScoreElem = document.getElementById('playerStg3Score');
        const st3Status = document.getElementById('playerStg3Status');
        const bonusScoreElem = document.getElementById('playerBonusScore');
        const bonusStatus = document.getElementById('playerBonusStatus');
        const grandTotalElem = document.getElementById('playerGrandTotal');
        const leaderboardList = document.getElementById('simpleLeaderboardList');

        // After a reset, the session may still hold stale user data.
        // Cross-check: if the student no longer exists in the users list,
        // treat them as a guest so scores show as cleared.
        let effectiveSession = session;
        if (session && session.role === 'student' && window.AuthEngine) {
            const liveUsers = window.AuthEngine.getUsers() || [];
            const stillExists = liveUsers.some(u =>
                u.studentId === session.user?.studentId || u.id === session.user?.id
            );
            if (!stillExists) {
                effectiveSession = null; // fall through to guest mode
            } else {
                // Refresh user data from the live store (scores may have changed)
                const liveUser = liveUsers.find(u =>
                    u.studentId === session.user?.studentId || u.id === session.user?.id
                );
                if (liveUser) effectiveSession = { ...session, user: liveUser };
            }
        }

        if (effectiveSession && effectiveSession.role === 'student') {
            const user = effectiveSession.user;
            const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || user.studentId;
            const sectionStr = user.section ? ` · Section: ${user.section}` : '';

            if (cardAvatar) cardAvatar.textContent = '👨‍💻';
            if (cardName) cardName.textContent = fullName.toUpperCase();
            if (cardMeta) cardMeta.textContent = `Student ID: ${user.studentId || 'N/A'}${sectionStr}`;

            const s1 = Math.min(100, Math.max(parseInt(user.scores?.stage1) || 0, parseInt(localStorage.getItem('stage1_score')) || 0));
            const s2 = Math.min(100, Math.max(parseInt(user.scores?.stage2) || 0, parseInt(localStorage.getItem('stage2_score')) || 0));
            const s3 = Math.min(100, Math.max(parseInt(user.scores?.stage3) || 0, parseInt(localStorage.getItem('stage3_score')) || 0));
            const sBonus = Math.min(50, Math.max(parseInt(user.scores?.stage3_bonus) || 0, parseInt(localStorage.getItem('stage3_bonus_score')) || 0));
            if (!user.scores) user.scores = { stage1: 0, stage2: 0, stage3: 0, stage3_bonus: 0 };
            user.scores.stage1 = s1;
            user.scores.stage2 = s2;
            user.scores.stage3 = s3;
            user.scores.stage3_bonus = sBonus;
            const totalScore = window.AuthEngine ? window.AuthEngine.calculateTotalScore(user) : (s1 + s2 + s3 + sBonus);
            const rankInfo = window.AuthEngine ? window.AuthEngine.getTechnicianRank(totalScore) : { tier: 'RANKED', title: 'Technician', icon: '⚡', percent: Math.round((totalScore / 350) * 100) };

            let gradeLetter = 'GRADE C';
            if (totalScore >= 315) gradeLetter = 'GRADE S (MASTER)';
            else if (totalScore >= 262) gradeLetter = 'GRADE A (SENIOR)';
            else if (totalScore >= 210) gradeLetter = 'GRADE B (CERTIFIED)';
            else if (totalScore > 0) gradeLetter = 'GRADE C (APPRENTICE)';
            else gradeLetter = 'UNRANKED';

            if (rankGrade) rankGrade.textContent = gradeLetter;
            if (rankTitle) rankTitle.textContent = `${rankInfo.icon} ${rankInfo.title}`;

            if (st1ScoreElem) st1ScoreElem.textContent = `${s1} / 100 PTS`;
            if (st1Status) {
                st1Status.className = user.stageProgress?.stage1 ? 'stage-status status-passed' : 'stage-status status-incomplete';
                st1Status.textContent = user.stageProgress?.stage1 ? '✅ PASSED' : '🔒 INCOMPLETE';
            }

            if (st2ScoreElem) st2ScoreElem.textContent = `${s2} / 100 PTS`;
            if (st2Status) {
                st2Status.className = user.stageProgress?.stage2 ? 'stage-status status-passed' : 'stage-status status-incomplete';
                st2Status.textContent = user.stageProgress?.stage2 ? '✅ PASSED' : '🔒 INCOMPLETE';
            }

            if (st3ScoreElem) st3ScoreElem.textContent = `${s3} / 100 PTS`;
            if (st3Status) {
                st3Status.className = user.stageProgress?.stage3 ? 'stage-status status-passed' : 'stage-status status-incomplete';
                st3Status.textContent = user.stageProgress?.stage3 ? '✅ PASSED' : '🔒 INCOMPLETE';
            }

            if (bonusScoreElem) bonusScoreElem.textContent = `${sBonus} / 50 PTS`;
            if (bonusStatus) {
                bonusStatus.className = sBonus > 0 ? 'stage-status status-passed' : 'stage-status status-incomplete';
                bonusStatus.textContent = sBonus > 0 ? '⚡ BONUS PASS' : '🔒 INCOMPLETE';
            }

            if (grandTotalElem) grandTotalElem.textContent = `${totalScore} / 350 PTS`;
        } else if (session && session.role === 'admin') {
            if (cardAvatar) cardAvatar.textContent = '👑';
            if (cardName) cardName.textContent = `ADMINISTRATOR (${session.user.name || 'Admin'})`;
            if (cardMeta) cardMeta.textContent = 'Instructor Mode · Full Access';
            if (rankGrade) rankGrade.textContent = 'INSTRUCTOR';
            if (rankTitle) rankTitle.textContent = '👑 Lead Evaluator';

            if (st1ScoreElem) st1ScoreElem.textContent = '100 / 100 PTS';
            if (st1Status) { st1Status.className = 'stage-status status-passed'; st1Status.textContent = '✅ MASTERED'; }
            if (st2ScoreElem) st2ScoreElem.textContent = '100 / 100 PTS';
            if (st2Status) { st2Status.className = 'stage-status status-passed'; st2Status.textContent = '✅ MASTERED'; }
            if (st3ScoreElem) st3ScoreElem.textContent = '100 / 100 PTS';
            if (st3Status) { st3Status.className = 'stage-status status-passed'; st3Status.textContent = '✅ MASTERED'; }
            if (bonusScoreElem) bonusScoreElem.textContent = '50 / 50 PTS';
            if (bonusStatus) { bonusStatus.className = 'stage-status status-passed'; bonusStatus.textContent = '⚡ MASTERED'; }
            if (grandTotalElem) grandTotalElem.textContent = '350 / 350 PTS';
        } else {
            // Guest Mode - Accurately read local guest progress
            if (cardAvatar) cardAvatar.textContent = '👤';
            if (cardName) cardName.textContent = 'GUEST TECHNICIAN';
            if (cardMeta) cardMeta.textContent = 'Guest Session · (Sign in to save records)';

            const g1 = Math.min(100, parseInt(localStorage.getItem('stage1_score')) || 0);
            const g2 = Math.min(100, parseInt(localStorage.getItem('stage2_score')) || 0);
            const g3 = Math.min(100, parseInt(localStorage.getItem('stage3_score')) || 0);
            const gBonus = Math.min(50, parseInt(localStorage.getItem('stage3_bonus_score')) || 0);
            const g1Done = localStorage.getItem('stage1_completed') === 'true';
            const g2Done = localStorage.getItem('stage2_completed') === 'true';
            const g3Done = localStorage.getItem('stage3_completed') === 'true';
            const guestTotal = g1 + g2 + g3 + gBonus;

            let gradeLetter = 'UNRANKED';
            let rankTitleStr = '🔒 Sign In to Record';
            if (guestTotal >= 315) { gradeLetter = 'GRADE S (MASTER)'; rankTitleStr = '🌟 Master Systems Architect'; }
            else if (guestTotal >= 262) { gradeLetter = 'GRADE A (SENIOR)'; rankTitleStr = '🥇 Senior Specialist'; }
            else if (guestTotal >= 210) { gradeLetter = 'GRADE B (CERTIFIED)'; rankTitleStr = '🥈 Certified Tech'; }
            else if (guestTotal > 0) { gradeLetter = 'GRADE C (APPRENTICE)'; rankTitleStr = '🥉 Junior Apprentice'; }

            if (rankGrade) rankGrade.textContent = gradeLetter;
            if (rankTitle) rankTitle.textContent = rankTitleStr;

            if (st1ScoreElem) st1ScoreElem.textContent = `${g1} / 100 PTS`;
            if (st1Status) {
                st1Status.className = g1Done ? 'stage-status status-passed' : 'stage-status status-incomplete';
                st1Status.textContent = g1Done ? '✅ PASSED' : '🔒 INCOMPLETE';
            }

            if (st2ScoreElem) st2ScoreElem.textContent = `${g2} / 100 PTS`;
            if (st2Status) {
                st2Status.className = g2Done ? 'stage-status status-passed' : 'stage-status status-incomplete';
                st2Status.textContent = g2Done ? '✅ PASSED' : '🔒 INCOMPLETE';
            }

            if (st3ScoreElem) st3ScoreElem.textContent = `${g3} / 100 PTS`;
            if (st3Status) {
                st3Status.className = g3Done ? 'stage-status status-passed' : 'stage-status status-incomplete';
                st3Status.textContent = g3Done ? '✅ PASSED' : '🔒 INCOMPLETE';
            }

            if (bonusScoreElem) bonusScoreElem.textContent = `${gBonus} / 50 PTS`;
            if (bonusStatus) {
                bonusStatus.className = gBonus > 0 ? 'stage-status status-passed' : 'stage-status status-incomplete';
                bonusStatus.textContent = gBonus > 0 ? '⚡ BONUS PASS' : '🔒 INCOMPLETE';
            }

            if (grandTotalElem) grandTotalElem.textContent = `${guestTotal} / 350 PTS`;
        }

        // Render Top Leaderboard Scores Table
        if (leaderboardList && window.AuthEngine) {
            const users = window.AuthEngine.getUsers() || [];
            const activeSession = window.AuthEngine.getSession();
            const currentStudentId = (activeSession && activeSession.role === 'student') ? activeSession.user?.studentId : null;

            const sorted = [...users].sort((a, b) => {
                const sa = window.AuthEngine.calculateTotalScore(a);
                const sb = window.AuthEngine.calculateTotalScore(b);
                return sb - sa;
            });

            let lbHtml = '';
            sorted.forEach((u, i) => {
                const s1 = Math.min(100, parseInt(u.scores?.stage1) || 0);
                const s2 = Math.min(100, parseInt(u.scores?.stage2) || 0);
                const s3 = Math.min(100, parseInt(u.scores?.stage3) || 0);
                const sBonus = Math.min(50, parseInt(u.scores?.stage3_bonus) || 0);
                const total = s1 + s2 + s3 + sBonus;
                const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.studentId;
                const isCurrent = (currentStudentId && u.studentId === currentStudentId);
                const rowClass = isCurrent ? 'active-user-row' : '';

                let medal = `<span class="lb-rank-badge">#${i + 1}</span>`;
                if (i === 0) medal = '🥇 1';
                else if (i === 1) medal = '🥈 2';
                else if (i === 2) medal = '🥉 3';

                let gradeBadge = '<span class="badge-grade-u">UNRANKED</span>';
                if (total >= 315) gradeBadge = '<span class="badge-grade-s">GRADE S</span>';
                else if (total >= 262) gradeBadge = '<span class="badge-grade-a">GRADE A</span>';
                else if (total >= 210) gradeBadge = '<span class="badge-grade-b">GRADE B</span>';
                else if (total > 0) gradeBadge = '<span class="badge-grade-c">GRADE C</span>';

                lbHtml += `
                    <tr class="${rowClass}">
                        <td><strong>${medal}</strong></td>
                        <td><strong>${name}</strong>${isCurrent ? ' <span style="color:var(--cyan-primary); font-size:10px;">(YOU)</span>' : ''}</td>
                        <td>${u.section || 'N/A'}</td>
                        <td>${s1}</td>
                        <td>${s2}</td>
                        <td>${s3}</td>
                        <td><strong style="color:#ffb800;">${sBonus}</strong></td>
                        <td class="lb-total-score">${total}</td>
                        <td>${gradeBadge}</td>
                    </tr>
                `;
            });
            leaderboardList.innerHTML = lbHtml || '<tr><td colspan="9" style="text-align:center; padding:12px; color:#888;">No student scores recorded yet</td></tr>';
        }

        // Asynchronously fetch live MySQL leaderboard and sync state
        if (leaderboardList) {
            fetch('php/get_leaderboard.php')
                .then(r => r.json())
                .then(data => {
                    if (data.success && Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
                        const activeSession = window.AuthEngine ? window.AuthEngine.getSession() : null;
                        const currentStudentId = (activeSession && activeSession.role === 'student') ? activeSession.user?.studentId : null;
                        let usersUpdated = false;
                        const liveUsers = window.AuthEngine ? (window.AuthEngine.getUsers() || []) : [];

                        // Sync each DB student into liveUsers store if score in DB is higher
                        data.leaderboard.forEach(dbStudent => {
                            const found = liveUsers.find(u =>
                                u.studentId && String(u.studentId).trim().toLowerCase() === String(dbStudent.studentId).trim().toLowerCase()
                            );
                            if (found) {
                                if (!found.scores) found.scores = { stage1: 0, stage2: 0, stage3: 0, stage3_bonus: 0 };
                                if (!found.stageProgress) found.stageProgress = { stage1: false, stage2: false, stage3: false };
                                [1, 2, 3].forEach(st => {
                                    const dbScore = dbStudent.scores?.[`stage${st}`] || 0;
                                    if (dbScore > (found.scores[`stage${st}`] || 0)) {
                                        found.scores[`stage${st}`] = dbScore;
                                        found.stageProgress[`stage${st}`] = true;
                                        usersUpdated = true;
                                    }
                                });
                                const dbBonus = dbStudent.scores?.stage3_bonus || 0;
                                if (dbBonus > (found.scores.stage3_bonus || 0)) {
                                    found.scores.stage3_bonus = dbBonus;
                                    usersUpdated = true;
                                }
                            }
                        });

                        if (usersUpdated && window.AuthEngine) {
                            window.AuthEngine.saveUsers(liveUsers);
                            if (activeSession && activeSession.role === 'student') {
                                const refreshed = liveUsers.find(u =>
                                    u.studentId && String(u.studentId).trim().toLowerCase() === String(activeSession.user?.studentId).trim().toLowerCase()
                                );
                                if (refreshed) {
                                    activeSession.user = refreshed;
                                    localStorage.setItem('convenire_session', JSON.stringify(activeSession));
                                    // Refresh top player card
                                    const s1 = parseInt(refreshed.scores?.stage1) || 0;
                                    const s2 = parseInt(refreshed.scores?.stage2) || 0;
                                    const s3 = Math.min(100, parseInt(refreshed.scores?.stage3) || 0);
                                    const sBonus = Math.min(50, parseInt(refreshed.scores?.stage3_bonus) || 0);
                                    const totalScore = s1 + s2 + s3 + sBonus;
                                    if (st1ScoreElem) st1ScoreElem.textContent = `${s1} / 100 PTS`;
                                    if (st1Status) {
                                        st1Status.className = refreshed.stageProgress?.stage1 ? 'stage-status status-passed' : 'stage-status status-incomplete';
                                        st1Status.textContent = refreshed.stageProgress?.stage1 ? '✅ PASSED' : '🔒 INCOMPLETE';
                                    }
                                    if (st2ScoreElem) st2ScoreElem.textContent = `${s2} / 100 PTS`;
                                    if (st2Status) {
                                        st2Status.className = refreshed.stageProgress?.stage2 ? 'stage-status status-passed' : 'stage-status status-incomplete';
                                        st2Status.textContent = refreshed.stageProgress?.stage2 ? '✅ PASSED' : '🔒 INCOMPLETE';
                                    }
                                    if (st3ScoreElem) st3ScoreElem.textContent = `${s3} / 100 PTS`;
                                    if (st3Status) {
                                        st3Status.className = refreshed.stageProgress?.stage3 ? 'stage-status status-passed' : 'stage-status status-incomplete';
                                        st3Status.textContent = refreshed.stageProgress?.stage3 ? '✅ PASSED' : '🔒 INCOMPLETE';
                                    }
                                    if (bonusScoreElem) bonusScoreElem.textContent = `${sBonus} / 50 PTS`;
                                    if (bonusStatus) {
                                        bonusStatus.className = sBonus > 0 ? 'stage-status status-passed' : 'stage-status status-incomplete';
                                        bonusStatus.textContent = sBonus > 0 ? '⚡ BONUS PASS' : '🔒 INCOMPLETE';
                                    }
                                    if (grandTotalElem) grandTotalElem.textContent = `${totalScore} / 350 PTS`;
                                    let gradeLetter = 'GRADE C';
                                    if (totalScore >= 315) gradeLetter = 'GRADE S (MASTER)';
                                    else if (totalScore >= 262) gradeLetter = 'GRADE A (SENIOR)';
                                    else if (totalScore >= 210) gradeLetter = 'GRADE B (CERTIFIED)';
                                    else if (totalScore > 0) gradeLetter = 'GRADE C (APPRENTICE)';
                                    else gradeLetter = 'UNRANKED';
                                    if (rankGrade) rankGrade.textContent = gradeLetter;
                                    renderStageGrid();
                                }
                            }
                        }

                        // Render live DB Leaderboard rows
                        let dbHtml = '';
                        data.leaderboard.forEach((u, i) => {
                            const s1 = Math.min(100, parseInt(u.scores?.stage1) || 0);
                            const s2 = Math.min(100, parseInt(u.scores?.stage2) || 0);
                            const s3 = Math.min(100, parseInt(u.scores?.stage3) || 0);
                            const sBonus = Math.min(50, parseInt(u.scores?.stage3_bonus) || 0);
                            const total = s1 + s2 + s3 + sBonus;
                            const isCurrent = (currentStudentId && String(u.studentId).trim().toLowerCase() === String(currentStudentId).trim().toLowerCase());
                            const rowClass = isCurrent ? 'active-user-row' : '';

                            let medal = `<span class="lb-rank-badge">#${i + 1}</span>`;
                            if (i === 0) medal = '🥇 1';
                            else if (i === 1) medal = '🥈 2';
                            else if (i === 2) medal = '🥉 3';

                            let gradeBadge = '<span class="badge-grade-u">UNRANKED</span>';
                            if (total >= 315) gradeBadge = '<span class="badge-grade-s">GRADE S</span>';
                            else if (total >= 262) gradeBadge = '<span class="badge-grade-a">GRADE A</span>';
                            else if (total >= 210) gradeBadge = '<span class="badge-grade-b">GRADE B</span>';
                            else if (total > 0) gradeBadge = '<span class="badge-grade-c">GRADE C</span>';

                            dbHtml += `
                                <tr class="${rowClass}">
                                    <td><strong>${medal}</strong></td>
                                    <td><strong>${u.name || u.studentId}</strong>${isCurrent ? ' <span style="color:var(--cyan-primary); font-size:10px;">(YOU)</span>' : ''}</td>
                                    <td>${u.section || 'N/A'}</td>
                                    <td>${s1}</td>
                                    <td>${s2}</td>
                                    <td>${s3}</td>
                                    <td><strong style="color:#ffb800;">${sBonus}</strong></td>
                                    <td class="lb-total-score">${total}</td>
                                    <td>${gradeBadge}</td>
                                </tr>
                            `;
                        });
                        if (dbHtml) leaderboardList.innerHTML = dbHtml;
                    }
                })
                .catch(err => console.warn('[Leaderboard] DB sync note:', err));
        }
    }
    window.updateScoringModalUI = updateScoringModalUI;

    // ── Auto-refresh leaderboard when teacher resets records from another tab ──
    window.addEventListener('storage', function (e) {
        if (e.key === 'convenire_users' || e.key === 'convenire_session' || e.key === 'convenire_reset_flag') {
            updateScoringModalUI();
            if (window.AuthEngine && typeof window.AuthEngine.updateUserUI === 'function') {
                window.AuthEngine.updateUserUI();
            }
        }
    });

    // ── Also catch same-tab resets via reset flag on page focus ──
    window.addEventListener('focus', function () {
        if (localStorage.getItem('convenire_reset_flag') === '1') {
            localStorage.removeItem('convenire_reset_flag');
            updateScoringModalUI();
            if (window.AuthEngine && typeof window.AuthEngine.updateUserUI === 'function') {
                window.AuthEngine.updateUserUI();
            }
        }
    });

    // Check reset flag on initial page load too
    if (localStorage.getItem('convenire_reset_flag') === '1') {
        localStorage.removeItem('convenire_reset_flag');
        updateScoringModalUI();
    }

    function playCyberBeep(freq = 600, type = 'sine', duration = 0.1) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) { }
    }

    function renderStageGrid() {
        if (!stageGrid) {
            console.error("Stage grid element not found!");
            return;
        }

        // Dynamically refresh completion state & scores based on active user session
        const session = window.AuthEngine ? window.AuthEngine.getSession() : null;
        let s1Done = false, s2Done = false, s3Done = false;
        let s1Score = '0', s2Score = '0', s3Score = '0';

        if (session && session.role === 'student' && session.user) {
            const u = session.user;
            s1Done = !!u.stageProgress?.stage1 || (parseInt(u.scores?.stage1) > 0);
            s2Done = !!u.stageProgress?.stage2 || (parseInt(u.scores?.stage2) > 0);
            s3Done = !!u.stageProgress?.stage3 || (parseInt(u.scores?.stage3) > 0);
            s1Score = String(u.scores?.stage1 || 0);
            s2Score = String(u.scores?.stage2 || 0);
            s3Score = String(u.scores?.stage3 || 0);
        } else {
            s1Done = localStorage.getItem('stage1_completed') === 'true';
            s2Done = localStorage.getItem('stage2_completed') === 'true';
            s3Done = localStorage.getItem('stage3_completed') === 'true';
            s1Score = localStorage.getItem('stage1_score') || '0';
            s2Score = localStorage.getItem('stage2_score') || '0';
            s3Score = localStorage.getItem('stage3_score') || '0';
        }

        stages[0].unlocked = true;
        stages[0].completed = s1Done;
        stages[0].score = s1Score;

        stages[1].unlocked = s1Done;
        stages[1].completed = s2Done;
        stages[1].score = s2Score;

        stages[2].unlocked = s1Done && s2Done;
        stages[2].completed = s3Done;
        stages[2].score = s3Score;

        let html = '';
        stages.forEach((st, idx) => {
            const isLocked = !st.unlocked;
            const lockClass = isLocked ? 'locked' : '';
            const statusClass = st.completed ? 'status-pass' : (isLocked ? 'status-lock' : 'status-ready');
            const reqStage = idx === 1 ? 'STAGE 1' : 'STAGE 2';
            const statusBadgeText = st.completed
                ? `PASSED (${st.score} PTS) ✅`
                : (isLocked ? `LOCKED (BEAT ${reqStage}) 🔒` : `READY FOR DEPLOYMENT ⚡`);
            const btnText = isLocked
                ? `LOCKED 🔒`
                : (st.completed ? `REPLAY MISSION ➔` : `DEPLOY MISSION ➔`);

            html += `
                <div class="stage-card ${lockClass} stage-theme-${st.accent}" data-stage-index="${idx}">
                    <!-- Ambient Card FX -->
                    <div class="card-shimmer"></div>
                    <div class="card-glow-edge"></div>

                    <!-- Top Card Header -->
                    <div class="stage-card-header">
                        <span class="stage-card-badge">STAGE ${st.number}</span>
                        <span class="stage-card-time"><span class="time-icon">⏱</span> ${st.timeLimit}s</span>
                    </div>

                    <!-- Holographic Center Avatar/Icon -->
                    <div class="stage-card-icon-wrap">
                        <div class="stage-icon-halo"></div>
                        <span class="stage-card-icon">${st.icon}</span>
                    </div>

                    <!-- Title and Category -->
                    <h3 class="stage-card-title">${st.title}</h3>
                    <span class="stage-card-category">${st.category}</span>
                    <p class="stage-card-desc">${st.desc}</p>

                    <!-- Tags & Competencies -->
                    <div class="stage-card-tags">
                        ${st.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}
                        <span class="card-tag tag-score">🏆 ${st.maxScore}</span>
                    </div>

                    <!-- Card Footer -->
                    <div class="stage-card-footer">
                        <div class="stage-card-status ${statusClass}">
                            <span>${statusBadgeText}</span>
                        </div>
                        <button class="stage-launch-btn ${lockClass}">
                            <span>${btnText}</span>
                        </button>
                    </div>
                </div>
            `;
        });
        stageGrid.innerHTML = html;

        // Add click events to stage cards
        document.querySelectorAll('.stage-card').forEach(card => {
            card.addEventListener('mouseenter', function () {
                if (!this.classList.contains('locked')) {
                    playCyberBeep(640, 'sine', 0.04);
                }
            });

            card.addEventListener('click', function (e) {
                const idx = this.dataset.stageIndex;
                if (idx !== undefined && stages[idx] && stages[idx].unlocked) {
                    playCyberBeep(880, 'triangle', 0.12);
                    const session = window.AuthEngine ? window.AuthEngine.getSession() : null;
                    if (!session) {
                        // Not logged in -> Show login modal and do NOT proceed
                        openAuthModal('login');
                        showLoginError('Please sign in with your Username and Password to access stages.');
                        return;
                    }

                    const index = parseInt(idx);
                    if (index === 0) {
                        window.location.href = 'stage1.html';
                    } else if (index === 1) {
                        window.location.href = 'stage2.html';
                    } else if (index === 2) {
                        window.location.href = 'stage3.html';
                    }
                } else {
                    const req = idx == 1 ? "Stage 1" : "Stage 2";
                    showAlert("🔒 Stage Locked", `Complete ${req} to unlock Stage ${stages[idx]?.number || (parseInt(idx) + 1)}!`);
                }
            });
        });
    }

    function exitGame() {
        window.location.href = '../website/website.html';
    }

    function playPrologueStory(onComplete) {
        if (window.StoryEngine) {
            window.StoryEngine.showStory({
                title: "CONVENIRE: THE FOUNDING MYTH",
                badge: "ORIGIN SAGA",
                avatar: "⚡",
                avatarName: "The Grand Assembler",
                speaker: "THE FOUNDING SAGA OF CONVENIRE",
                dialogues: [
                    "CHAPTER I — THE FRAGMENTATION: Long before the first motherboard hummed to life, there was only the Fragmentation — a scattering of components across the digital wastes: shattered CPUs, corrupted RAM shards, GPUs half-buried in silicon dust. No machine could run. No system could think. The world called this age the Silence.",
                    "CHAPTER II — THE ASSEMBLER: From the digital ruins arose the First Assembler — a visionary builder who discovered that silicon components possessed hidden harmony. By aligning pin connectors and socket keys with mathematical precision, energy began to flow back into dead motherboards.",
                    "CHAPTER III — THE CONVENIRES: The Assembler gathered scholars across North Negros to master computer hardware engineering. Together, they established the Convenires — guardians of hardware knowledge who vowed to teach every student the sacred art of PC assembly and system diagnostics.",
                    "CHAPTER IV — THE ASSEMBLY RACE: To prove their mastery, builders competed in high-speed hardware assembly arenas. Players identified socket pinouts, seated PCIe graphics cards under pressure, and diagnosed faulty connections before thermal limits were breached.",
                    "CHAPTER V — END THE SILENCE: With all hardware components assembled and linked, the master power switch was toggled. A surge of electric cyan light illuminated the motherboard, fans spun to 3000 RPM, and the POST speaker chimed victory. The Silence was ended forever."
                ],
                onComplete: onComplete
            });
        } else {
            if (typeof onComplete === 'function') onComplete();
        }
    }
    window.playPrologueStory = playPrologueStory;

    function cinematicStart() {
        if (startTransition && missionScreen) {
            mainMenu.classList.add('hidden');
            startTransition.classList.remove('hidden');

            setTimeout(() => {
                if (loaderFill) loaderFill.style.width = '100%';
            }, 100);

            setTimeout(() => {
                window.location.href = 'stage1.html';
            }, 1200);
        } else {
            window.location.href = 'stage1.html';
        }
    }

    // Alert function (Uses Cyber In-Game Alert Modal)
    window.closeAlert = function () {
        if (window.closeInGameAlert) {
            window.closeInGameAlert();
            return;
        }
        const alertBox = document.getElementById('alertBox');
        if (alertBox) alertBox.style.display = 'none';
    };

    function showAlert(title, msg, icon = '⚡', btnText = 'ACKNOWLEDGE') {
        if (window.showInGameAlert) {
            window.showInGameAlert(title, msg, icon, btnText);
            return;
        }
        const alertBox = document.getElementById('alertBox');
        const alertTitle = document.getElementById('alertTitle');
        const alertMsg = document.getElementById('alertMsg');

        if (alertBox && alertTitle && alertMsg) {
            alertTitle.textContent = title;
            alertMsg.textContent = msg;
            alertBox.style.display = 'flex';
        }
    }
    window.showAlert = showAlert;

    // AUTHENTICATION MODAL & ADMIN DASHBOARD INTEGRATION
    const authModal = document.getElementById('authModal');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const userAuthBtn = document.getElementById('userAuthBtn');
    const userSessionBadge = document.getElementById('userSessionBadge');

    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');

    const unifiedLoginForm = document.getElementById('unifiedLoginForm');
    const registerForm = document.getElementById('registerForm');

    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    const loginUsernameInput = document.getElementById('loginUsername');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginErrorMessage = document.getElementById('loginErrorMessage');
    const loginErrorText = document.getElementById('loginErrorText');

    const adminDashboardModal = document.getElementById('adminDashboardModal');
    const closeAdminDash = document.getElementById('closeAdminDash');
    const dashSectionFilter = document.getElementById('dashSectionFilter');
    const dashSearchInput = document.getElementById('dashSearchInput');
    const adminStudentRosterBody = document.getElementById('adminStudentRosterBody');

    // Quick Stats Elements
    const statTotalStudents = document.getElementById('statTotalStudents');
    const statPassedStage1 = document.getElementById('statPassedStage1');
    const statPassedStage2 = document.getElementById('statPassedStage2');
    const statPassedStage3 = document.getElementById('statPassedStage3');
    const statClassAvgScore = document.getElementById('statClassAvgScore');
    const statMasterCount = document.getElementById('statMasterCount');

    function openAuthModal(mode = 'login') {
        if (!authModal) return;
        authModal.classList.remove('hidden');
        clearLoginError();

        if (mode === 'register') {
            showRegisterView();
        } else {
            showUnifiedLoginView();
        }
    }

    function hideAuthModal() {
        if (authModal) authModal.classList.add('hidden');
        clearLoginError();
        if (registerForm) registerForm.reset();
    }

    function clearLoginError() {
        if (loginErrorMessage) loginErrorMessage.classList.add('hidden');
        if (loginErrorText) loginErrorText.textContent = '';
    }

    function showLoginError(msg) {
        if (loginErrorText) loginErrorText.textContent = msg;
        if (loginErrorMessage) loginErrorMessage.classList.remove('hidden');
    }

    function showUnifiedLoginView() {
        if (registerForm) {
            registerForm.reset();
            registerForm.classList.add('hidden');
        }
        if (unifiedLoginForm) unifiedLoginForm.classList.remove('hidden');

        if (authTitle) authTitle.textContent = 'CONVENIRE';
        if (authSubtitle) authSubtitle.textContent = 'Assemble. Connect. Terminate. Enter credentials to sign in.';
    }

    function showRegisterView() {
        if (registerForm) {
            registerForm.reset();
            registerForm.classList.remove('hidden');
        }
        if (unifiedLoginForm) unifiedLoginForm.classList.add('hidden');

        if (authTitle) authTitle.textContent = 'CREATE ACCOUNT';
        if (authSubtitle) authSubtitle.textContent = 'Register a Student Account to track game progress across stages.';
    }

    // View Switching Link Handlers
    if (switchToRegister) switchToRegister.addEventListener('click', (e) => { e.preventDefault(); showRegisterView(); });
    if (switchToLogin) switchToLogin.addEventListener('click', (e) => { e.preventDefault(); showUnifiedLoginView(); });
    if (closeAuthModal) closeAuthModal.addEventListener('click', hideAuthModal);

    // Header User Session Button (Log In / Log Out)
    if (userAuthBtn) {
        userAuthBtn.addEventListener('click', () => {
            const session = window.AuthEngine ? window.AuthEngine.getSession() : null;
            if (session) {
                const name = [session.user.firstName, session.user.lastName].filter(Boolean).join(' ') || session.user.name || session.user.studentId || 'User';
                if (window.showInGameConfirm) {
                    window.showInGameConfirm(
                        'LOG OUT CONFIRMATION',
                        `Logged in as ${name}.\nWould you like to Log Out?`,
                        () => {
                            window.AuthEngine.logout();
                            showAlert('🔒 LOGGED OUT', 'You have been logged out successfully.\nGame is now operating in Guest / Offline Mode.', '🔒', 'CONTINUE');
                        },
                        null,
                        '⚠️',
                        'LOG OUT',
                        'CANCEL'
                    );
                }
            } else {
                openAuthModal('login');
            }
        });
    }

    const userBadgeText = document.getElementById('userBadgeText');
    if (userBadgeText) {
        userBadgeText.addEventListener('click', () => {
            const session = window.AuthEngine ? window.AuthEngine.getSession() : null;
            if (session && session.role === 'admin') {
                openAdminDashboard();
            } else if (!session) {
                openAuthModal('login');
            }
        });
    }

    // Unified Form Login Handler (Auto Role Identification & Redirect)
    if (unifiedLoginForm) {
        unifiedLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearLoginError();

            const username = loginUsernameInput?.value.trim();
            const password = loginPasswordInput?.value.trim();

            if (!username || !password) {
                showLoginError('Please enter both Username and Password.');
                return;
            }

            if (!window.AuthEngine) return;

            const res = window.AuthEngine.authenticateAsync
                ? await window.AuthEngine.authenticateAsync(username, password)
                : window.AuthEngine.authenticate(username, password);

            if (res.success) {
                hideAuthModal();
                if (loginUsernameInput) loginUsernameInput.value = '';
                if (loginPasswordInput) loginPasswordInput.value = '';

                if (res.role === 'student') {
                    // Student Login: Display Name and Section, do not automatically enter stage 1
                    const fullName = [res.user.firstName, res.user.lastName].filter(Boolean).join(' ') || res.user.studentId;
                    const sectionStr = res.user.section ? ` (${res.user.section})` : '';
                    showAlert('✅ ACCESS GRANTED', `Welcome back, ${fullName}${sectionStr}!\nYou are now signed in.\nClick "START GAME" whenever you are ready.`, '👨‍💻', 'START PLAYING');
                    if (window.AuthEngine) {
                        window.AuthEngine.updateUserUI();
                    }
                } else if (res.role === 'admin') {
                    // Admin Login: Redirect directly to Admin Dashboard
                    showAlert('👑 ADMIN ACCESS GRANTED', 'Welcome Administrator!\nOpening Admin Dashboard...', '👑', 'CONTINUE');
                    setTimeout(() => {
                        openAdminDashboard();
                    }, 800);
                }
            } else {
                // Display Appropriate Error Message
                showLoginError(res.message);
            }
        });
    }

    // Registration Submit
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const firstName = document.getElementById('regFirstName')?.value.trim();
            const lastName = document.getElementById('regLastName')?.value.trim();
            const studentId = document.getElementById('regStudentId')?.value.trim();
            const section = document.getElementById('regSection')?.value;
            const pass = document.getElementById('regPass')?.value;
            const confirmPass = document.getElementById('regConfirmPass')?.value;

            if (!firstName || !lastName || !studentId || !pass || !section) {
                showAlert('⚠️ Validation Error', 'Please fill in all registration fields and select your section.', '⚠️');
                return;
            }

            if (pass !== confirmPass) {
                showAlert('⚠️ Password Error', 'Passwords do not match!', '⚠️');
                return;
            }

            if (window.AuthEngine) {
                const res = window.AuthEngine.registerStudent({
                    firstName, lastName, studentId, section, email: '', password: pass
                });

                if (res.success) {
                    hideAuthModal();
                    registerForm.reset();
                    const fullName = [res.user.firstName, res.user.lastName].filter(Boolean).join(' ') || res.user.studentId;
                    const sectionStr = res.user.section ? ` (${res.user.section})` : '';
                    showAlert('🎉 ACCOUNT CREATED', `Student account created for ${fullName}${sectionStr}!\nYou are now signed in.\nClick "START GAME" to begin.`, '🎉', 'CONTINUE');
                    if (window.AuthEngine) {
                        window.AuthEngine.updateUserUI();
                    }

                    // --- Also save to MySQL database via PHP ---
                    fetch('php/register.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ firstName, lastName, studentId, section, email: '', password: pass })
                    })
                        .then(r => r.json())
                        .then(dbRes => {
                            if (!dbRes.success) {
                                // Already registered in localStorage, DB duplicate is acceptable
                                console.warn('[DB] Registration note:', dbRes.message);
                            } else {
                                console.log('[DB] Student saved to database. ID:', dbRes.student_id);
                            }
                        })
                        .catch(err => console.warn('[DB] Could not reach register.php:', err));

                } else {
                    showAlert('❌ Registration Failed', res.message);
                }
            }
        });
    }

    // Admin Dashboard RBAC & Management Render
    function openAdminDashboard() {
        const session = window.AuthEngine ? window.AuthEngine.getSession() : null;
        if (!session || session.role !== 'admin') {
            showAlert('🚫 Access Denied', 'Only administrators are authorized to access the Admin Dashboard.');
            return;
        }

        window.location.href = 'teacher-dashboard.html';
    }

    if (closeAdminDash) closeAdminDash.addEventListener('click', () => {
        if (adminDashboardModal) adminDashboardModal.classList.add('hidden');
    });

    if (dashSectionFilter) {
        dashSectionFilter.addEventListener('change', renderAdminRoster);
    }

    if (dashSearchInput) {
        dashSearchInput.addEventListener('input', renderAdminRoster);
    }

    function renderAdminRoster() {
        if (!adminStudentRosterBody || !window.AuthEngine) return;

        const users = window.AuthEngine.getUsers();
        const selectedSection = dashSectionFilter ? dashSectionFilter.value : 'ALL';
        const searchQuery = dashSearchInput ? dashSearchInput.value.trim().toLowerCase() : '';

        // Calculate Dashboard Stats
        const totalCount = users.length;
        const passedStg1Count = users.filter(u => u.stageProgress && u.stageProgress.stage1).length;
        const passedStg2Count = users.filter(u => u.stageProgress && u.stageProgress.stage2).length;
        const passedStg3Count = users.filter(u => u.stageProgress && u.stageProgress.stage3).length;

        let totalScoreSum = 0;
        let masterArchitectCount = 0;
        users.forEach(u => {
            const sc = window.AuthEngine.calculateTotalScore(u);
            totalScoreSum += sc;
            if (sc >= 580) masterArchitectCount++;
        });

        const classAvg = totalCount > 0 ? Math.round(totalScoreSum / totalCount) : 0;

        if (statTotalStudents) statTotalStudents.textContent = totalCount;
        if (statPassedStage1) statPassedStage1.textContent = passedStg1Count;
        if (statPassedStage2) statPassedStage2.textContent = passedStg2Count;
        if (statPassedStage3) statPassedStage3.textContent = passedStg3Count;
        if (statClassAvgScore) statClassAvgScore.textContent = `${classAvg} pts`;
        if (statMasterCount) statMasterCount.textContent = masterArchitectCount;

        // Filter Student Records
        const filtered = users.filter(u => {
            const matchesSection = selectedSection === 'ALL' || u.section === selectedSection;
            const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
            const studentId = (u.studentId || '').toLowerCase();
            const matchesSearch = !searchQuery || fullName.includes(searchQuery) || studentId.includes(searchQuery);

            return matchesSection && matchesSearch;
        });

        if (filtered.length === 0) {
            adminStudentRosterBody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:#888; padding: 25px;">No student records found matching your filters.</td></tr>`;
            return;
        }

        let html = '';
        filtered.forEach(u => {
            const st1Score = (u.scores && u.scores.stage1) ? `${u.scores.stage1} pts` : '';
            const st2Score = (u.scores && u.scores.stage2) ? `${u.scores.stage2} pts` : '';
            const st3Score = (u.scores && u.scores.stage3) ? `${u.scores.stage3} pts` : '';

            const st1 = u.stageProgress?.stage1 ? `<span class="status-badge-pass">PASSED ✅ ${st1Score}</span>` : '<span class="status-badge-lock">LOCKED 🔒</span>';
            const st2 = u.stageProgress?.stage2 ? `<span class="status-badge-pass">PASSED ✅ ${st2Score}</span>` : '<span class="status-badge-lock">LOCKED 🔒</span>';
            const st3 = u.stageProgress?.stage3 ? `<span class="status-badge-pass">PASSED ✅ ${st3Score}</span>` : '<span class="status-badge-lock">LOCKED 🔒</span>';

            const totalScore = window.AuthEngine.calculateTotalScore(u);
            const rankInfo = window.AuthEngine.getTechnicianRank(totalScore);
            const logCount = u.logs ? u.logs.length : 0;

            let rankBadgeHtml = '';
            if (totalScore >= 580) {
                rankBadgeHtml = `<span class="status-badge-rank-master">🌟 MASTER (${rankInfo.percent}%)</span>`;
            } else if (totalScore >= 480) {
                rankBadgeHtml = `<span class="status-badge-rank-senior">🥇 SENIOR (${rankInfo.percent}%)</span>`;
            } else if (totalScore >= 380) {
                rankBadgeHtml = `<span class="status-badge-rank-certified">🥈 CERTIFIED (${rankInfo.percent}%)</span>`;
            } else if (totalScore > 0) {
                rankBadgeHtml = `<span class="status-badge-rank-apprentice">🥉 APPRENTICE (${rankInfo.percent}%)</span>`;
            } else {
                rankBadgeHtml = `<span class="status-badge-rank-unranked">🔒 UNRANKED</span>`;
            }

            html += `<tr>
                <td><strong>${u.studentId}</strong></td>
                <td>${u.firstName || ''} ${u.lastName || ''}</td>
                <td><span class="badge-text">${u.section || 'N/A'}</span></td>
                <td>${u.email || 'N/A'}</td>
                <td>${st1}</td>
                <td>${st2}</td>
                <td>${st3}</td>
                <td><strong style="color: #ffd700;">${totalScore} / 645 pts</strong></td>
                <td>${rankBadgeHtml}</td>
                <td>${logCount} Sessions</td>
                <td>
                    <button class="btn-action-reset" data-id="${u.studentId}" title="Reset Scores & Progress">↺ Reset</button>
                    <button class="btn-action-delete" data-id="${u.studentId}" title="Delete Record">🗑 Delete</button>
                </td>
            </tr>`;
        });

        adminStudentRosterBody.innerHTML = html;

        // Attach Action Button Handlers
        adminStudentRosterBody.querySelectorAll('.btn-action-reset').forEach(btn => {
            btn.addEventListener('click', function () {
                const stdId = this.getAttribute('data-id');
                window.showInGameConfirm(
                    'RESET STUDENT PROGRESS',
                    `Are you sure you want to reset scores and stage progress for student (${stdId})?`,
                    () => {
                        window.AuthEngine.resetStudentProgress(stdId);
                        renderAdminRoster();
                        showAlert('🔄 PROGRESS RESET', `Progress for student ${stdId} has been reset.`, '🔄');
                    },
                    null,
                    '⚠️',
                    'RESET',
                    'CANCEL'
                );
            });
        });

        adminStudentRosterBody.querySelectorAll('.btn-action-delete').forEach(btn => {
            btn.addEventListener('click', function () {
                const stdId = this.getAttribute('data-id');
                window.showInGameConfirm(
                    'DELETE STUDENT RECORD',
                    `Are you sure you want to permanently DELETE student record (${stdId})?`,
                    () => {
                        window.AuthEngine.deleteStudent(stdId);
                        renderAdminRoster();
                        showAlert('🗑️ RECORD DELETED', `Student record ${stdId} was deleted.`, '🗑️');
                    },
                    null,
                    '⚠️',
                    'DELETE',
                    'CANCEL'
                );
            });
        });
    }

    const storyBtn = document.getElementById('storyBtn');

    // Start Game & Stage Selection (Requires Login)
    if (startBtn) {
        startBtn.addEventListener('click', (e) => {
            const session = window.AuthEngine ? window.AuthEngine.getSession() : null;
            if (!session) {
                // User is not logged in -> Prompt login modal and do NOT proceed into game
                openAuthModal('login');
                showLoginError('Please sign in with your Username and Password to start the game.');
                return;
            }

            // User is authenticated -> Proceed to stage 1
            window.location.href = 'stage1.html';
        });
    }

    if (storyBtn) {
        storyBtn.addEventListener('click', () => {
            setActiveButton(storyBtn);
            playPrologueStory(function () { });
        });
    }

    if (stageSelectBtn) {
        stageSelectBtn.addEventListener('click', () => {
            showStageMenu();
        });
    }

    if (aboutBtn) {
        aboutBtn.addEventListener('click', showAbout);
    }

    if (scoringBtn) {
        scoringBtn.addEventListener('click', showScoring);
    }

    if (backToMenuFromScoring) {
        backToMenuFromScoring.addEventListener('click', showMainMenu);
    }

    // Tutorial Tabs Switcher
    const tutTabBtns = document.querySelectorAll('.tut-tab-btn');
    const tutTabPanes = document.querySelectorAll('.tut-tab-pane');

    tutTabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const targetTabId = this.getAttribute('data-tab');
            tutTabBtns.forEach(b => b.classList.remove('active'));
            tutTabPanes.forEach(p => p.classList.remove('active'));

            this.classList.add('active');
            const targetPane = document.getElementById(targetTabId);
            if (targetPane) targetPane.classList.add('active');
        });
    });

    // Stage 1 Animated Hand Live Demo
    const btnRunStage1Demo = document.getElementById('btnRunStage1Demo');
    if (btnRunStage1Demo) {
        btnRunStage1Demo.addEventListener('click', function () {
            if (window.TutorialEngine) {
                window.TutorialEngine.runHandSimulation([
                    { sourceId: 'simCpuItem', targetId: 'simCpuSocket', instruction: 'Align CPU pin 1 and seat into LGA-1700 Matrix Socket.' },
                    { sourceId: 'simRamItem', targetId: 'simRamSocket', instruction: 'Press DDR5 RAM module down until locking levers click.' },
                    { sourceId: 'simGpuItem', targetId: 'simGpuSocket', instruction: 'Insert GPU firmly into PCIe 5.0 x16 expansion slot.' }
                ]);
            }
        });
    }

    // Stage 2 Animated Hand Live Demo
    const btnRunStage2Demo = document.getElementById('btnRunStage2Demo');
    if (btnRunStage2Demo) {
        btnRunStage2Demo.addEventListener('click', function () {
            if (window.TutorialEngine) {
                window.TutorialEngine.runHandSimulation([
                    { sourceId: 'simUsbItem', targetId: 'simUsbSocket', instruction: 'Plug USB 3.0 Type-A connector into rear port.' },
                    { sourceId: 'simHdmiItem', targetId: 'simHdmiSocket', instruction: 'Connect HDMI 2.1 cable to display output port.' },
                    { sourceId: 'simEthItem', targetId: 'simEthSocket', instruction: 'Insert RJ-45 Gigabit Ethernet cable until clip locks.' }
                ]);
            }
        });
    }

    if (exitBtn) {
        exitBtn.addEventListener('click', exitGame);
    }

    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettings);
    }

    if (backFromSettings) {
        backFromSettings.addEventListener('click', showMainMenu);
    }

    if (backToMenuFromStage) {
        backToMenuFromStage.addEventListener('click', showMainMenu);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (stageMenu && !stageMenu.classList.contains('hidden')) {
                showMainMenu();
            }
        }
    });

    if (backToMenuFromIns) {
        backToMenuFromIns.addEventListener('click', showMainMenu);
    }

    // Initialize UI and Stages
    renderStageGrid();
    showMainMenu();

    if (window.AuthEngine) {
        window.AuthEngine.updateUserUI();
    }
})();
