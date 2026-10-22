/* CONVENIRE - STAGE 3: REALISTIC 5-STEP RJ-45 CABLE CRIMPING SIMULATOR GAME ENGINE */

(function () {
    // Authentication Session Guard - Require Login
    if (window.AuthEngine && !window.AuthEngine.getSession()) {
        window.location.href = 'MainMenu.html';
        return;
    }

    // Progression Guard - Require Stage 1 and Stage 2 Completion
    const s2Completed = (function () {
        const session = window.AuthEngine ? window.AuthEngine.getSession() : null;
        if (session && session.role === 'student' && session.user) {
            const u = session.user;
            return (!!u.stageProgress?.stage1 || parseInt(u.scores?.stage1) > 0) &&
                (!!u.stageProgress?.stage2 || parseInt(u.scores?.stage2) > 0);
        }
        return localStorage.getItem('stage1_completed') === 'true' && localStorage.getItem('stage2_completed') === 'true';
    })();

    if (!s2Completed) {
        alert("🔒 Stage 3 is locked! Please unlock it by completing Stage 1 and Stage 2 first.");
        window.location.href = 'MainMenu.html';
        return;
    }

    // 1. Wire Definitions & Pin Function Metadata
    const WIRES = [
        { id: 'wg', name: 'White-Green', code: 'WG', class: 'wire-wg' },
        { id: 'g', name: 'Green', code: 'G', class: 'wire-g' },
        { id: 'wo', name: 'White-Orange', code: 'WO', class: 'wire-wo' },
        { id: 'b', name: 'Blue', code: 'B', class: 'wire-b' },
        { id: 'wb', name: 'White-Blue', code: 'WB', class: 'wire-wb' },
        { id: 'o', name: 'Orange', code: 'O', class: 'wire-o' },
        { id: 'wbr', name: 'White-Brown', code: 'WBR', class: 'wire-wbr' },
        { id: 'br', name: 'Brown', code: 'BR', class: 'wire-br' }
    ];

    const PIN_FUNCTIONS = ['Tx+', 'Tx-', 'Rx+', 'Bi-', 'Bi+', 'Rx-', 'Bi-', 'Bi+'];

    const STANDARDS = {
        T568A: ['wg', 'g', 'wo', 'b', 'wb', 'o', 'wbr', 'br'],
        T568B: ['wo', 'o', 'wg', 'b', 'wb', 'g', 'wbr', 'br']
    };

    // Mission Scenario: End A is T568A, End B is T568B
    const MISSIONS = [
        { id: 'm1', name: 'Cat6 Gigabit Cable (Plug End A: T568A ➔ Plug End B: T568B)', endA: 'T568A', endB: 'T568B' }
    ];

    let currentMissionIdx = 0;
    let activePlug = 'A'; // 'A' or 'B'
    let activeStandard = 'T568A';
    let currentStep = 1; // 1 to 5

    // State flags
    let isJacketStripped = false;
    let isWiresTrimmed = false;
    let isCrimped = false;

    // Separate slots state for Plug End A and Plug End B
    let slotsA = [null, null, null, null, null, null, null, null];
    let slotsB = [null, null, null, null, null, null, null, null];
    let scoredSlotsA = [false, false, false, false, false, false, false, false];
    let scoredSlotsB = [false, false, false, false, false, false, false, false];

    let draggedWireId = null;
    let score = 0;
    const STAGE3_DURATION = 60; // 60 seconds duration (1:00)
    let timeLeft = STAGE3_DURATION;
    let timerInterval = null;

    // Randomized Wire Pool Order (Randomized every restart)
    let wirePoolOrder = [...WIRES];

    function shuffleWirePoolOrder() {
        for (let i = wirePoolOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [wirePoolOrder[i], wirePoolOrder[j]] = [wirePoolOrder[j], wirePoolOrder[i]];
        }
    }

    // DOM Elements
    const wirePool = document.getElementById('wirePool');
    const wirePoolTitle = document.getElementById('wirePoolTitle');
    const poolJacketIndicator = document.getElementById('poolJacketIndicator');
    const slotsContainer = document.getElementById('slotsContainer');
    const timerDisplay = document.getElementById('timerDisplay');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const placedCounter = document.getElementById('placedCounter');
    const targetMissionLabel = document.getElementById('targetMissionLabel');
    const missionBadge = document.getElementById('missionBadge');

    // Diagnostic LED Status Indicators
    const ledJacket = document.getElementById('ledJacket');
    const labelJacket = document.getElementById('labelJacket');
    const ledPlugA = document.getElementById('ledPlugA');
    const labelPlugA = document.getElementById('labelPlugA');
    const ledPlugB = document.getElementById('ledPlugB');
    const labelPlugB = document.getElementById('labelPlugB');
    const ledCrimp = document.getElementById('ledCrimp');
    const labelCrimp = document.getElementById('labelCrimp');

    // Step 1: Left Stripper Outer Jacket Elements
    const jacketStripPanel = document.getElementById('jacketStripPanel');
    const stripStatusBadge = document.getElementById('stripStatusBadge');
    const stripStatusHint = document.getElementById('stripStatusHint');
    const stripIconLarge = document.getElementById('stripIconLarge');
    const stripMainTitle = document.getElementById('stripMainTitle');
    const stripJacketBtn = document.getElementById('stripJacketBtn');
    const stripBtnMainText = document.getElementById('stripBtnMainText');
    const stripKeyShortcut = document.getElementById('stripKeyShortcut');

    const cableJacketElem = document.getElementById('cableJacketElem');
    const cableJacketLabel = document.getElementById('cableJacketLabel');
    const cableJacketPill = document.getElementById('cableJacketPill');
    const stripJacketCableBtn = document.getElementById('stripJacketCableBtn');

    const plugTabA = document.getElementById('plugTabA');
    const plugTabB = document.getElementById('plugTabB');
    const dotPlugA = document.getElementById('dotPlugA');
    const dotPlugB = document.getElementById('dotPlugB');
    const activePlugTitle = document.getElementById('activePlugTitle');

    const crimpBtn = document.getElementById('crimpBtn');
    const resetBtn = document.getElementById('resetBtn');

    const testerModal = document.getElementById('testerModal');
    const testerBanksWrap = document.getElementById('testerBanksWrap');
    const testerStatusMsg = document.getElementById('testerStatusMsg');
    const closeTesterBtn = document.getElementById('closeTesterBtn');
    const gameMessage = document.getElementById('gameMessage');

    // CSS NC II Technician Bonus Quiz DOM Elements
    const bonusQuizModal = document.getElementById('bonusQuizModal');
    const quizProgressBadge = document.getElementById('quizProgressBadge');
    const quizPointsBadge = document.getElementById('quizPointsBadge');
    const quizQNum = document.getElementById('quizQNum');
    const quizQText = document.getElementById('quizQText');
    const quizOptionsGrid = document.getElementById('quizOptionsGrid');
    const quizInsightBox = document.getElementById('quizInsightBox');
    const insightTitle = document.getElementById('insightTitle');
    const insightDesc = document.getElementById('insightDesc');
    const quizNextBtn = document.getElementById('quizNextBtn');

    let quizCurrentIdx = 0;
    let quizScore = 0;
    let bonusScore = 0; // Separate Bonus Quiz Score (0 to 50 PTS)
    let quizAutoLaunchTimer = null;

    // 5 High-Yield Questions Tailored for Computer Systems Servicing (CSS NC II) Students
    // The questions are now stored in MySQL (convenire_db.stage3_bonus_questions) so the
    // teacher can edit them in MySQL-Front. They are loaded fresh every time the quiz starts.
    // Correct answers are NOT sent to the browser; each answer is checked by the server.
    const BONUS_QUESTIONS_URL = 'php/get_bonus_questions.php';
    const BONUS_CHECK_URL = 'php/check_bonus_answer.php';
    const BONUS_POINTS_PER_QUESTION = 10; // 5 questions x 10 pts = 50 PTS max bonus
    const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
    let CSS_QUIZ_DATA = [];        // [{ id, order, q, options: [A, B, C, D] }] from the database
    let quizUnavailable = false;   // true when the DB questions could not be loaded
    let quizAnswerPending = false; // prevents double submissions while the server checks an answer
    let quizSessionId = 0;         // invalidates in-flight requests after a reset/restart

    /* Original hardcoded questions (now seeded into MySQL by game/sql/stage3_bonus_questions.sql):
    const CSS_QUIZ_DATA = [
        {
            q: "When connecting a PC's Network Interface Card (NIC) directly to a network Switch or Hub, which cable type must a CSS technician use?",
            options: [
                "Crossover Cable",
                "Straight-Through Cable",
                "Rollover (Console) Cable",
                "Loopback Plug"
            ],
            correct: 1,
            insight: "Straight-Through cables connect dissimilar devices (PC to Switch, Router to Switch). Crossover cables historically connected similar devices (PC to PC, Switch to Switch)."
        },
        {
            q: "In standard 10/100 Mbps Fast Ethernet (100BASE-TX), which specific pin numbers are actively utilized to transmit and receive data?",
            options: [
                "Pins 4, 5, 7, and 8",
                "Pins 1, 3, 5, and 7",
                "Pins 1, 2, 3, and 6",
                "All 8 pins equally"
            ],
            correct: 2,
            insight: "10/100 Mbps Fast Ethernet only uses Pins 1 & 2 (TX) and Pins 3 & 6 (RX). Gigabit Ethernet (1000BASE-T) uses all 8 pins (all 4 pairs) simultaneously."
        },
        {
            q: "According to TIA/EIA-568 standards, what is the maximum recommended total channel distance for a Cat5e/Cat6 UTP network cable run?",
            options: [
                "100 meters (approx. 328 feet)",
                "50 meters (approx. 164 feet)",
                "200 meters (approx. 656 feet)",
                "500 meters (approx. 1640 feet)"
            ],
            correct: 0,
            insight: "The certified limit is 100 meters (90m horizontal solid cabling + 10m patch cords). Runs exceeding 100m suffer severe signal attenuation and packet loss."
        },
        {
            q: "When terminating an RJ-45 modular plug according to the T568B commercial color code, which colored wire lead must be inserted into Pin 1?",
            options: [
                "White-Green",
                "Solid Orange",
                "White-Orange",
                "Solid Green"
            ],
            correct: 2,
            insight: "T568B pinout begins with Pin 1: White-Orange, Pin 2: Orange, Pin 3: White-Green, Pin 4: Blue... T568A begins with White-Green (Pin 1) and Green (Pin 2)."
        },
        {
            q: "In UTP (Unshielded Twisted Pair) networking cables, why are the copper wire pairs twisted around each other along the cable length?",
            options: [
                "To increase cable flexibility and current resistance",
                "To cancel electromagnetic interference (EMI) and Near-End Crosstalk (NEXT)",
                "To make stripping the outer PVC jacket easier with a rotary stripper",
                "To insulate conductors against high voltage static spikes"
            ],
            correct: 1,
            insight: "Twisting pairs creates electromagnetic cancellation (differential signaling), eliminating Near-End Crosstalk (NEXT) and external noise without metallic foil shielding."
        }
    ];
    */

    // HTML5 Game Audio Elements (Matching Stage 1 and Stage 2)
    const gameMusic = document.getElementById("gameMusic");
    const dragSound = document.getElementById("dragSound");
    const dropSound = document.getElementById("dropSound");
    const errorSound = document.getElementById("errorSound");
    const clickSound = document.getElementById("clickSound");
    const successSound = document.getElementById("successSound");

    // Audio SFX Synthesizer
    function playClickSound() {
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.play().catch(() => { });
        }
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch (e) { }
    }

    function playSnipSound() {
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.play().catch(() => { });
        }
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1500, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.06);
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.06);
        } catch (e) { }
    }

    function playSparkSound() {
        if (dropSound) {
            dropSound.currentTime = 0;
            dropSound.play().catch(() => { });
        }
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.08);
        } catch (e) { }
    }

    function playCrimperSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(180, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);
            gain.gain.setValueAtTime(0.35, ctx.currentTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
        } catch (e) { }
    }

    function playBeep(freq, type, duration) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) { }
    }

    function updateScoreDisplay() {
        if (scoreDisplay) {
            scoreDisplay.textContent = `🏆 ${Math.min(100, Math.max(0, score))}`;
        }
    }

    // Initialize Game Music matching Stage 1 and Stage 2
    function initAudio() {
        if (gameMusic) {
            gameMusic.volume = 0.25;
            gameMusic.loop = true;

            let playPromise = gameMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log("Stage 3 background music playing");
                }).catch(() => {
                    const enableAudio = () => {
                        gameMusic.play().catch(() => { });
                        document.removeEventListener('click', enableAudio);
                        document.removeEventListener('keydown', enableAudio);
                    };
                    document.addEventListener('click', enableAudio, { once: true });
                    document.addEventListener('keydown', enableAudio, { once: true });
                });
            }
        }
    }

    // Visual & State Sync for Step 1: Left Stripper Outer Jacket & Indicators
    function updateStripJacketUI() {
        if (isJacketStripped) {
            // Header Diagnostic LED & Label
            if (ledJacket) ledJacket.className = 'led-dot active-green';
            if (labelJacket) labelJacket.textContent = 'JACKET: STRIPPED ✓';

            // Left Side Stripper Outer Jacket Card
            if (jacketStripPanel) {
                jacketStripPanel.classList.add('stripped');
            }
            if (stripStatusBadge) {
                stripStatusBadge.classList.add('stripped');
                stripStatusBadge.textContent = 'STRIPPED & READY ⚡';
            }
            if (stripIconLarge) {
                stripIconLarge.classList.add('stripped');
                stripIconLarge.textContent = '✓';
            }
            if (stripMainTitle) {
                stripMainTitle.classList.add('stripped');
                stripMainTitle.textContent = 'JACKET STRIPPED';
            }
            if (stripStatusHint) {
                stripStatusHint.textContent = 'Outer sheath removed! Exposed 8 color leads ready for pin alignment.';
            }
            if (stripJacketBtn) {
                stripJacketBtn.classList.add('stripped');
                stripJacketBtn.disabled = true;
            }
            if (stripBtnMainText) {
                stripBtnMainText.textContent = 'JACKET STRIPPED ✓';
            }
            if (stripKeyShortcut) {
                stripKeyShortcut.textContent = 'STEP 1 COMPLETE ✓';
                stripKeyShortcut.style.color = '#00e676';
            }

            // RJ-45 Sheath Boot & Wire Pool Indicators
            if (cableJacketElem) {
                cableJacketElem.classList.add('stripped');
            }
            if (cableJacketLabel) {
                cableJacketLabel.classList.add('stripped');
                cableJacketLabel.textContent = 'CAT6 CONDUCTORS EXPOSED [STRIPPED ✂️]';
            }
            if (cableJacketPill) {
                cableJacketPill.classList.add('stripped');
                cableJacketPill.textContent = 'JACKET: STRIPPED OUT ✓';
            }
            if (stripJacketCableBtn) {
                stripJacketCableBtn.classList.add('stripped');
                stripJacketCableBtn.textContent = 'STRIPPED ✓';
                stripJacketCableBtn.disabled = true;
            }
            if (wirePoolTitle) {
                wirePoolTitle.textContent = 'AVAILABLE STRIPPED WIRES (DRAG OR CLICK TO PLACE)';
            }
            if (poolJacketIndicator) {
                poolJacketIndicator.classList.add('stripped');
                poolJacketIndicator.textContent = '✂️ JACKET STRIPPED OUT — READY TO ALIGN';
            }
        } else {
            // Header Diagnostic LED & Label
            if (ledJacket) ledJacket.className = 'led-dot active-amber';
            if (labelJacket) labelJacket.textContent = 'JACKET: INTACT';

            // Left Side Stripper Outer Jacket Card
            if (jacketStripPanel) {
                jacketStripPanel.classList.remove('stripped');
            }
            if (stripStatusBadge) {
                stripStatusBadge.classList.remove('stripped');
                stripStatusBadge.textContent = 'JACKET INTACT 🔒';
            }
            if (stripIconLarge) {
                stripIconLarge.classList.remove('stripped');
                stripIconLarge.textContent = '✂️';
            }
            if (stripMainTitle) {
                stripMainTitle.classList.remove('stripped');
                stripMainTitle.textContent = 'STRIP OUTER JACKET';
            }
            if (stripStatusHint) {
                stripStatusHint.textContent = 'Strip Cat6 outer sheath to expose 8 color-coded conductors.';
            }
            if (stripJacketBtn) {
                stripJacketBtn.classList.remove('stripped');
                stripJacketBtn.disabled = false;
            }
            if (stripBtnMainText) {
                stripBtnMainText.textContent = 'STRIP OUTER JACKET';
            }
            if (stripKeyShortcut) {
                stripKeyShortcut.textContent = 'OR PRESS [J]';
                stripKeyShortcut.style.color = '#00f5ff';
            }

            // RJ-45 Sheath Boot & Wire Pool Indicators
            if (cableJacketElem) {
                cableJacketElem.classList.remove('stripped');
            }
            if (cableJacketLabel) {
                cableJacketLabel.classList.remove('stripped');
                cableJacketLabel.textContent = 'CAT6 UTP CABLE SHEATH [INTACT]';
            }
            if (cableJacketPill) {
                cableJacketPill.classList.remove('stripped');
                cableJacketPill.textContent = 'JACKET: INTACT 🔒';
            }
            if (stripJacketCableBtn) {
                stripJacketCableBtn.classList.remove('stripped');
                stripJacketCableBtn.textContent = 'STRIP OUTER JACKET ✂️';
                stripJacketCableBtn.disabled = false;
            }
            if (wirePoolTitle) {
                wirePoolTitle.textContent = 'AVAILABLE UNSTRIPPED WIRES (DRAG OR CLICK TO PLACE)';
            }
            if (poolJacketIndicator) {
                poolJacketIndicator.classList.remove('stripped');
                poolJacketIndicator.textContent = '🔒 JACKET NOT STRIPPED';
            }
        }
    }

    // 2. Initialize Stage 3 Engine
    function initStage3() {
        initAudio();
        shuffleWirePoolOrder(); // Randomize wire colors in the tray on init
        setupMission();
        updateStripJacketUI();
        updatePipelineNodes(1);
        updatePlugStatusDots();
        renderSlots();
        renderWirePool();
        setupEventListeners();

        // Auto-show story intro before playing, starting the fabrication timer once closed or skipped
        setTimeout(() => {
            playStage3Story(() => {
                startTimer();
            });
        }, 350);
    }

    function updatePipelineNodes(stepNum) {
        currentStep = stepNum;
        for (let i = 1; i <= 5; i++) {
            const node = document.getElementById(`stepNode${i}`);
            if (node) {
                node.classList.remove('active', 'completed');
                if (i < stepNum) node.classList.add('completed');
                else if (i === stepNum) node.classList.add('active');
            }
        }
    }

    function setupMission() {
        const mission = MISSIONS[currentMissionIdx];
        activeStandard = (activePlug === 'A') ? mission.endA : mission.endB;

        if (targetMissionLabel) targetMissionLabel.textContent = `${mission.name} (End A: ${mission.endA} | End B: ${mission.endB})`;
        if (missionBadge) missionBadge.textContent = `MISSION: ${mission.name}`;
        if (activePlugTitle) activePlugTitle.textContent = `🔌 CLEAR RJ-45 MODULAR PLUG END ${activePlug} (${activeStandard})`;
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        if (timerDisplay) timerDisplay.classList.remove('timer-stopped', 'timer-low');
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                const m = Math.floor(timeLeft / 60);
                const s = timeLeft % 60;
                if (timerDisplay) {
                    timerDisplay.textContent = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
                    if (timeLeft <= 20) {
                        timerDisplay.classList.add('timer-low');
                        if (timeLeft % 2 === 0) playBeep(900, 'sawtooth', 0.08);
                    } else {
                        timerDisplay.classList.remove('timer-low');
                    }
                }
            } else {
                clearInterval(timerInterval);
                timerInterval = null;
                showTimeUpIndicator();
            }
        }, 1000);
    }

    function showTimeUpIndicator() {
        if (timerDisplay) {
            timerDisplay.textContent = "TIME UP!";
            timerDisplay.classList.remove('timer-low', 'timer-stopped');
            timerDisplay.classList.add('timer-timeup');
        }

        if (errorSound) {
            errorSound.currentTime = 0;
            errorSound.play().catch(() => { });
        }
        playBeep(220, 'sawtooth', 0.5);

        const countA = slotsA.filter(id => id !== null).length;
        const countB = slotsB.filter(id => id !== null).length;
        const totalPlaced = countA + countB;

        const timeUpLeadsVal = document.getElementById('timeUpLeadsVal');
        const timeUpScoreVal = document.getElementById('timeUpScoreVal');
        if (timeUpLeadsVal) timeUpLeadsVal.textContent = `${totalPlaced}/16`;
        if (timeUpScoreVal) timeUpScoreVal.textContent = `${Math.min(100, score)} / 100 PTS`;

        const timeUpModal = document.getElementById('timeUpModal');
        if (timeUpModal) {
            timeUpModal.classList.add('active');
        }
        if (gameMessage) {
            gameMessage.textContent = '⏰ TIME UP! Cable fabrication window has expired. Click Retry to reset workspace.';
        }
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        if (timerDisplay) {
            timerDisplay.classList.add('timer-stopped');
            timerDisplay.classList.remove('timer-low');
        }
    }

    // Render Transparent Modular Plug Wire Slots for active plug (A or B)
    function renderSlots() {
        if (!slotsContainer) return;
        slotsContainer.innerHTML = '';

        const activeSlots = (activePlug === 'A') ? slotsA : slotsB;

        for (let i = 0; i < 8; i++) {
            const slot = document.createElement('div');
            slot.className = 'wire-slot';
            slot.dataset.slotIndex = i;

            const wireId = activeSlots[i];

            if (wireId) {
                const wireObj = WIRES.find(w => w.id === wireId);
                slot.classList.add('filled');

                // Internal wire strand extending towards gold contacts
                const internalStrand = document.createElement('div');
                internalStrand.className = `internal-wire-strand ${wireObj.class} ${isWiresTrimmed ? 'trimmed' : ''}`;
                slot.appendChild(internalStrand);

                const wireElem = createWireElement(wireObj, true);
                slot.appendChild(wireElem);
            }

            // Drag Over & Drop Events
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.classList.add('hovered');
            });

            slot.addEventListener('dragleave', () => {
                slot.classList.remove('hovered');
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('hovered');
                if (!isJacketStripped) {
                    if (window.showInGameAlert) {
                        window.showInGameAlert('⚠️ STEP 1 REQUIRED', 'Please click "STRIP OUTER JACKET ✂️" before arranging wires!', '✂️');
                    } else {
                        alert('⚠️ Step 1 Required: Click "STRIP OUTER JACKET ✂️" first!');
                    }
                    return;
                }
                if (draggedWireId) {
                    placeWireInSlot(draggedWireId, i, slot);
                }
            });

            // Click to remove wire from slot
            slot.addEventListener('click', () => {
                if (activeSlots[i]) {
                    activeSlots[i] = null;
                    updatePlugStatusDots();
                    renderSlots();
                    renderWirePool();
                    playClickSound();
                }
            });

            slotsContainer.appendChild(slot);
        }

        updatePlugStatusDots();
    }

    function updatePlugStatusDots() {
        const countA = slotsA.filter(id => id !== null).length;
        const countB = slotsB.filter(id => id !== null).length;

        // Total leads indicator counter in header
        if (placedCounter) {
            placedCounter.textContent = `${countA + countB}/16`;
        }

        // Subtabs completion dots
        if (dotPlugA) {
            if (countA === 8) dotPlugA.classList.add('complete');
            else dotPlugA.classList.remove('complete');
        }

        if (dotPlugB) {
            if (countB === 8) dotPlugB.classList.add('complete');
            else dotPlugB.classList.remove('complete');
        }

        // Header Diagnostic LEDs & Labels
        if (labelPlugA) labelPlugA.textContent = `PLUG A: ${countA}/8`;
        if (ledPlugA) {
            if (countA === 8) ledPlugA.className = 'led-dot active-green';
            else if (countA > 0) ledPlugA.className = 'led-dot active-amber';
            else ledPlugA.className = 'led-dot';
        }

        if (labelPlugB) labelPlugB.textContent = `PLUG B: ${countB}/8`;
        if (ledPlugB) {
            if (countB === 8) ledPlugB.className = 'led-dot active-green';
            else if (countB > 0) ledPlugB.className = 'led-dot active-amber';
            else ledPlugB.className = 'led-dot';
        }

        // Crimper readiness LED
        if (labelCrimp && ledCrimp) {
            if (isCrimped) {
                ledCrimp.className = 'led-dot active-green';
                labelCrimp.textContent = 'CRIMP: DONE ✓';
            } else if (countA === 8 && countB === 8) {
                ledCrimp.className = 'led-dot active-blue';
                labelCrimp.textContent = 'CRIMP: READY [SPACE]';
            } else {
                ledCrimp.className = 'led-dot';
                labelCrimp.textContent = 'CRIMP: STANDBY';
            }
        }
    }

    // Render Available Wires in Pool for current active plug end (Randomized order every restart)
    function renderWirePool() {
        if (!wirePool) return;
        wirePool.innerHTML = '';

        const activeSlots = (activePlug === 'A') ? slotsA : slotsB;
        const usedWires = activeSlots.filter(id => id !== null);
        const availableWires = wirePoolOrder.filter(w => !usedWires.includes(w.id));

        availableWires.forEach(wireObj => {
            const wireElem = createWireElement(wireObj, false);
            wirePool.appendChild(wireElem);
        });
    }

    function createWireElement(wireObj, isInSlot) {
        const wire = document.createElement('div');
        wire.className = `wire-item ${wireObj.class}`;
        wire.draggable = true;
        wire.dataset.wireId = wireObj.id;

        const label = document.createElement('span');
        label.className = 'wire-label-text';
        label.textContent = wireObj.code;
        wire.appendChild(label);

        wire.addEventListener('dragstart', (e) => {
            if (!isJacketStripped) {
                e.preventDefault();
                if (errorSound) {
                    errorSound.currentTime = 0;
                    errorSound.play().catch(() => { });
                }
                if (gameMessage) gameMessage.textContent = '⚠️ Step 1 Required: Click "STRIP OUTER JACKET ✂️" first!';
                return;
            }
            draggedWireId = wireObj.id;
            wire.style.opacity = '0.5';
            if (dragSound) {
                dragSound.currentTime = 0;
                dragSound.play().catch(() => { });
            }
        });

        wire.addEventListener('dragend', () => {
            wire.style.opacity = '1';
        });

        wire.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isJacketStripped) {
                if (errorSound) {
                    errorSound.currentTime = 0;
                    errorSound.play().catch(() => { });
                }
                if (gameMessage) gameMessage.textContent = '⚠️ Step 1 Required: Click "STRIP OUTER JACKET ✂️" first!';
                return;
            }
            if (!isInSlot) {
                const activeSlots = (activePlug === 'A') ? slotsA : slotsB;
                const firstEmptySlot = activeSlots.indexOf(null);
                if (firstEmptySlot !== -1) {
                    const targetSlotElem = document.querySelectorAll('.wire-slot')[firstEmptySlot];
                    placeWireInSlot(wireObj.id, firstEmptySlot, targetSlotElem);
                }
            }
        });

        return wire;
    }

    // Place wire in slot for BOTH Plug End A and Plug End B (No Quiz)
    function placeWireInSlot(wireId, slotIndex, slotElem) {
        const activeSlots = (activePlug === 'A') ? slotsA : slotsB;
        const targetSeq = STANDARDS[activeStandard];

        // If wire is already in another slot on this plug end, remove it
        const existingIdx = activeSlots.indexOf(wireId);
        if (existingIdx !== -1) {
            activeSlots[existingIdx] = null;
        }

        activeSlots[slotIndex] = wireId;
        playSparkSound();

        // Check if placed wire matches the correct color code for this pin (5 pts each pin, 16 total = 80 pts max)
        const isCorrectPin = (targetSeq[slotIndex] === wireId);
        const scoredSlots = (activePlug === 'A') ? scoredSlotsA : scoredSlotsB;

        if (isCorrectPin && !scoredSlots[slotIndex]) {
            scoredSlots[slotIndex] = true;
            score += 5; // 5 pts per correct pin placement
            score = Math.min(100, Math.max(0, score));
            updateScoreDisplay();
        }

        // Advance to step 2 pipeline
        if (currentStep < 2) updatePipelineNodes(2);

        // Trigger visual spark effect
        if (slotElem) {
            const spark = document.createElement('div');
            spark.className = 'spark-effect';
            slotElem.appendChild(spark);
            setTimeout(() => spark.remove(), 350);
        }

        updatePlugStatusDots();
        renderSlots();
        renderWirePool();

        // Check if current plug end is complete
        const currentCount = activeSlots.filter(id => id !== null).length;
        if (currentCount === 8) {
            if (activePlug === 'A') {
                const countB = slotsB.filter(id => id !== null).length;
                if (countB < 8) {
                    if (gameMessage) gameMessage.textContent = "✅ PLUG END A COMPLETE! Now select 'PLUG END B' to wire the opposite cable end.";
                }
            } else {
                const countA = slotsA.filter(id => id !== null).length;
                if (countA < 8) {
                    if (gameMessage) gameMessage.textContent = "✅ PLUG END B COMPLETE! Remember to also wire PLUG END A before crimping.";
                }
            }
        }
    }

    function resetGame() {
        playClickSound();
        slotsA = [null, null, null, null, null, null, null, null];
        slotsB = [null, null, null, null, null, null, null, null];
        isJacketStripped = false;
        isWiresTrimmed = false;
        isCrimped = false;
        scoredSlotsA = [false, false, false, false, false, false, false, false];
        scoredSlotsB = [false, false, false, false, false, false, false, false];
        score = 0;
        bonusScore = 0;
        updateScoreDisplay();
        timeLeft = STAGE3_DURATION;

        // Reset Gold Teeth
        document.querySelectorAll('.gold-tooth-blade').forEach(blade => blade.classList.remove('crimped'));

        if (bonusQuizModal) bonusQuizModal.classList.remove('active');
        if (testerModal) testerModal.classList.remove('active');
        const timeUpModal = document.getElementById('timeUpModal');
        if (timeUpModal) timeUpModal.classList.remove('active');
        if (timerDisplay) {
            timerDisplay.classList.remove('timer-timeup', 'timer-stopped', 'timer-low');
        }
        if (quizAutoLaunchTimer) {
            clearTimeout(quizAutoLaunchTimer);
            quizAutoLaunchTimer = null;
        }
        quizSessionId++; // Ignore any bonus quiz request still in flight
        quizAnswerPending = false;

        shuffleWirePoolOrder(); // Randomize wire colors every restart!
        updateStripJacketUI();
        updatePipelineNodes(1);
        startTimer();
        setupMission();
        updatePlugStatusDots();
        renderSlots();
        renderWirePool();
        if (gameMessage) gameMessage.textContent = 'Workspace reset. Strip outer jacket first, then align all 8 colored wires for Plug End A & End B, then crimp.';
    }

    // Step 1: Strip Jacket Action
    function handleStripJacket() {
        if (isJacketStripped) return;
        isJacketStripped = true;
        playSnipSound();
        updatePipelineNodes(2);
        updateStripJacketUI();
        if (gameMessage) gameMessage.textContent = '✂️ Outer Cat6 jacket stripped! Exposed 8 colored wire leads. Now align wires for Plug End A and Plug End B.';
    }

    // Step 4 & 5: Squeeze Crimp Tool & Dual-End Cable Tester Evaluation
    function crimpAndTestCable() {
        const countA = slotsA.filter(id => id !== null).length;
        const countB = slotsB.filter(id => id !== null).length;

        // Strict Requirement: Both Plug End A AND Plug End B must be wired
        if (countA < 8) {
            if (errorSound) {
                errorSound.currentTime = 0;
                errorSound.play().catch(() => { });
            }
            if (window.showInGameAlert) {
                window.showInGameAlert('⚠️ INCOMPLETE CABLE', 'Please insert all 8 wire leads for PLUG END A first.', '🔌');
            } else {
                alert('⚠️ Incomplete Cable! Please insert all 8 wire leads for PLUG END A first.');
            }
            if (activePlug !== 'A') {
                activePlug = 'A';
                if (plugTabA) plugTabA.classList.add('active');
                if (plugTabB) plugTabB.classList.remove('active');
                setupMission();
                renderSlots();
                renderWirePool();
            }
            return;
        }

        if (countB < 8) {
            if (errorSound) {
                errorSound.currentTime = 0;
                errorSound.play().catch(() => { });
            }
            if (window.showInGameAlert) {
                window.showInGameAlert('⚠️ INCOMPLETE CABLE', 'Both ends of the cable must be wired.\nPlease switch to PLUG END B and insert all 8 wire leads before crimping.', '🔌');
            } else {
                alert('⚠️ Incomplete Cable! Both ends of the cable must be wired.\nPlease switch to PLUG END B and insert all 8 wire leads before crimping.');
            }
            if (activePlug !== 'B') {
                activePlug = 'B';
                if (plugTabB) plugTabB.classList.add('active');
                if (plugTabA) plugTabA.classList.remove('active');
                setupMission();
                renderSlots();
                renderWirePool();
            }
            return;
        }

        // Auto-fulfill jacket strip and trim if not clicked
        isJacketStripped = true;
        isWiresTrimmed = true;
        isCrimped = true;
        updatePlugStatusDots();

        // Trigger Gold Contact Teeth Crimper Pressing Animation & Sound
        updatePipelineNodes(4);
        playCrimperSound();
        if (gameMessage) gameMessage.textContent = '⚡ CRIMPING BLADES ENGAGED: Executing 16-channel continuity diagnostics...';
        document.querySelectorAll('.gold-tooth-blade').forEach(blade => blade.classList.add('crimped'));

        setTimeout(() => {
            updatePipelineNodes(5);
            if (!testerModal || !testerBanksWrap) return;

            testerModal.classList.add('active');
            testerBanksWrap.innerHTML = '';
            testerStatusMsg.textContent = 'TESTING DUAL-END HIGH-SPEED CABLE LINK...';
            testerStatusMsg.style.color = '#ffaa00';

            const mission = MISSIONS[currentMissionIdx];
            const targetSeqA = STANDARDS[mission.endA];
            const targetSeqB = STANDARDS[mission.endB];

            let correctCountA = 0;
            let correctCountB = 0;

            // 1. Build Bank for PLUG END A
            const bankA = document.createElement('div');
            bankA.className = 'tester-bank';
            bankA.innerHTML = `
                <div class="tester-bank-title">PLUG END A (${mission.endA}) CONTINUITY:</div>
                <div class="led-grid" id="ledGridA"></div>
            `;
            testerBanksWrap.appendChild(bankA);
            const ledGridA = bankA.querySelector('#ledGridA');

            for (let i = 0; i < 8; i++) {
                const slotBox = document.createElement('div');
                slotBox.className = 'led-slot';
                slotBox.innerHTML = `
                    <div class="led-bulb" id="ledBulbA_${i}"></div>
                    <span class="led-num">P${i + 1}</span>
                `;
                ledGridA.appendChild(slotBox);
            }

            // 2. Build Bank for PLUG END B
            const bankB = document.createElement('div');
            bankB.className = 'tester-bank';
            bankB.innerHTML = `
                <div class="tester-bank-title">PLUG END B (${mission.endB}) CONTINUITY:</div>
                <div class="led-grid" id="ledGridB"></div>
            `;
            testerBanksWrap.appendChild(bankB);
            const ledGridB = bankB.querySelector('#ledGridB');

            for (let i = 0; i < 8; i++) {
                const slotBox = document.createElement('div');
                slotBox.className = 'led-slot';
                slotBox.innerHTML = `
                    <div class="led-bulb" id="ledBulbB_${i}"></div>
                    <span class="led-num">P${i + 1}</span>
                `;
                ledGridB.appendChild(slotBox);
            }

            // Sequential Dual-End LED Light-up Test Sweep
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const bulbA = document.getElementById(`ledBulbA_${i}`);
                    const bulbB = document.getElementById(`ledBulbB_${i}`);

                    const isMatchA = (slotsA[i] === targetSeqA[i]);
                    const isMatchB = (slotsB[i] === targetSeqB[i]);

                    if (isMatchA) {
                        if (bulbA) bulbA.classList.add('pass');
                        correctCountA++;
                    } else {
                        if (bulbA) bulbA.classList.add('fail');
                    }

                    if (isMatchB) {
                        if (bulbB) bulbB.classList.add('pass');
                        correctCountB++;
                    } else {
                        if (bulbB) bulbB.classList.add('fail');
                    }

                    if (isMatchA && isMatchB) {
                        playBeep(650 + i * 80, 'sine', 0.1);
                    } else {
                        playBeep(220, 'sawtooth', 0.25);
                    }

                    if (i === 7) {
                        setTimeout(() => {
                            evaluateDualResults(correctCountA, correctCountB);
                        }, 350);
                    }
                }, (i + 1) * 220);
            }
        }, 400);
    }

    function evaluateDualResults(correctCountA, correctCountB) {
        const testerActionsRow = document.getElementById('testerActionsRow');
        const closeTesterBtn = document.getElementById('closeTesterBtn');

        if (correctCountA === 8 && correctCountB === 8) {
            stopTimer(); // STOP TIMER: Tester completed with all 16 pins verified!
            score += 20; // Bonus for full dual-end continuity pass (80 + 20 = 100 PTS fixed practical score)
            score = Math.min(100, Math.max(0, score));
            updateScoreDisplay();

            if (testerActionsRow) testerActionsRow.style.display = 'none';

            testerStatusMsg.innerHTML = `
                <div style="padding: 10px 0; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <span style="font-family: 'Share Tech Mono', monospace; font-size: 0.85rem; color: #00ff88; letter-spacing: 1px;">
                        16/16 PINS VERIFIED • CONTINUITY PASS ✅ [PRACTICAL SCORE: 100/100 PTS]
                    </span>
                    <span style="font-family: 'Orbitron', sans-serif; font-size: 1.15rem; font-weight: 800; color: #00f5ff; text-shadow: 0 0 14px rgba(0, 245, 255, 0.7);">
                        LAUNCHING BONUS QUIZ...
                    </span>
                </div>
            `;

            playBeep(587, 'sine', 0.15); // Subtle continuity confirmation ping

            // Immediately persist practical score (100 PTS) upon 16/16 pin continuity verification
            localStorage.setItem('stage3_completed', 'true');
            localStorage.setItem('stage3_score', String(score));
            const existingBonus = parseInt(localStorage.getItem('stage3_bonus_score')) || 0;
            if (window.AuthEngine && typeof window.AuthEngine.logStageCompletion === 'function') {
                try {
                    window.AuthEngine.logStageCompletion(3, score, 'Testing Verified', existingBonus);
                } catch (saveErr) {
                    console.warn("AuthEngine practical completion log note:", saveErr);
                }
            }

            // POP UP THE QUIZ FIRST before displaying the total score!
            if (quizAutoLaunchTimer) clearTimeout(quizAutoLaunchTimer);
            quizAutoLaunchTimer = setTimeout(() => {
                if (testerModal) testerModal.classList.remove('active');
                startBonusQuiz();
            }, 600);
        } else {
            if (testerActionsRow) testerActionsRow.style.display = 'flex';

            if (errorSound) {
                errorSound.currentTime = 0;
                errorSound.play().catch(() => { });
            }

            const mission = MISSIONS[currentMissionIdx];
            testerStatusMsg.innerHTML = `
                <div class="stage3-indicator-box indicator-fail">
                    <div class="indicator-icon-ring fail-ring">❌</div>
                    <div class="indicator-badge-pill fail-badge">CONTINUITY FAULT DETECTED</div>
                    <h2 class="indicator-title fail-title">MISWIRED RJ-45 CABLE!</h2>
                    <p class="indicator-desc">Plug End A passed ${correctCountA}/8 pins • Plug End B passed ${correctCountB}/8 pins. Both ends must match the standard sequence.</p>
                    
                    <div class="indicator-stats-grid">
                        <div class="stat-pill">
                            <span class="stat-label">END A (${mission.endA})</span>
                            <span class="stat-val ${correctCountA === 8 ? 'pass' : 'fail'}">${correctCountA}/8 PINS</span>
                        </div>
                        <div class="stat-pill">
                            <span class="stat-label">END B (${mission.endB})</span>
                            <span class="stat-val ${correctCountB === 8 ? 'pass' : 'fail'}">${correctCountB}/8 PINS</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // ===================================================
    // 5-QUESTION CSS NC II TECHNICIAN BONUS QUIZ ENGINE
    // ===================================================
    function startBonusQuiz() {
        stopTimer(); // Ensure timer remains completely stopped while answering the quiz
        quizCurrentIdx = 0;
        quizScore = 0;
        bonusScore = 0;
        if (bonusQuizModal) {
            bonusQuizModal.classList.add('active');
            loadBonusQuestions();
        }
    }

    // Fetch the latest 5 bonus questions from MySQL (no caching, so teacher edits apply immediately)
    function loadBonusQuestions() {
        const sessionId = ++quizSessionId;
        quizUnavailable = false;
        quizAnswerPending = false;
        CSS_QUIZ_DATA = [];

        if (quizProgressBadge) quizProgressBadge.textContent = 'LOADING...';
        if (quizQNum) quizQNum.textContent = 'Q1';
        if (quizQText) quizQText.textContent = 'Loading question...';
        if (quizOptionsGrid) quizOptionsGrid.innerHTML = '';
        if (quizInsightBox) quizInsightBox.style.display = 'none';
        if (quizNextBtn) quizNextBtn.style.display = 'none';

        fetch(BONUS_QUESTIONS_URL, { cache: 'no-store' })
            .then(res => res.json().catch(() => ({ success: false })))
            .then(data => {
                if (sessionId !== quizSessionId) return; // quiz was reset meanwhile
                const list = (data && data.success && Array.isArray(data.questions)) ? data.questions : null;
                const valid = list && list.length > 0 && list.every(item =>
                    item && Number.isInteger(item.id) && typeof item.q === 'string' &&
                    Array.isArray(item.options) && item.options.length === OPTION_LETTERS.length
                );
                if (!valid) {
                    showBonusQuizUnavailable((data && data.message) || 'Bonus questions are unavailable right now.');
                    return;
                }
                CSS_QUIZ_DATA = list.slice().sort((a, b) => a.order - b.order);
                renderQuizQuestion();
            })
            .catch(err => {
                if (sessionId !== quizSessionId) return;
                console.error('Bonus quiz load failed:', err);
                showBonusQuizUnavailable('Could not reach the server to load the bonus questions.');
            });
    }

    // Safe fallback when the DB questions are missing/invalid: never use old hardcoded answers.
    // The student can retry, or skip the bonus and still complete Stage 3 with the earned score.
    function showBonusQuizUnavailable(message) {
        quizUnavailable = true;
        CSS_QUIZ_DATA = [];
        if (quizProgressBadge) quizProgressBadge.textContent = 'BONUS UNAVAILABLE';
        if (quizPointsBadge) quizPointsBadge.textContent = 'BONUS: +0 PTS';
        if (quizQNum) quizQNum.textContent = '⚠️';
        if (quizQText) quizQText.textContent = message;

        if (quizOptionsGrid) {
            quizOptionsGrid.innerHTML = '';
            const retryBtn = document.createElement('button');
            retryBtn.className = 'quiz-opt-btn';
            retryBtn.id = 'quizRetryLoadBtn';
            retryBtn.innerHTML = `<span class="quiz-opt-letter">↻</span><span class="quiz-opt-text">Retry loading bonus questions</span>`;
            retryBtn.addEventListener('click', () => {
                playClickSound();
                loadBonusQuestions();
            });
            quizOptionsGrid.appendChild(retryBtn);
        }
        if (quizInsightBox) quizInsightBox.style.display = 'none';
        if (quizNextBtn) {
            quizNextBtn.style.display = 'flex';
            quizNextBtn.innerHTML = `<span>SKIP BONUS & VIEW RESULTS</span> <span>🏆</span>`;
        }
    }

    function renderQuizQuestion() {
        if (!bonusQuizModal) return;
        const qData = CSS_QUIZ_DATA[quizCurrentIdx];
        if (!qData) return;
        quizAnswerPending = false;

        if (quizProgressBadge) {
            quizProgressBadge.textContent = `QUESTION ${quizCurrentIdx + 1} / ${CSS_QUIZ_DATA.length}`;
        }
        if (quizPointsBadge) {
            quizPointsBadge.textContent = `BONUS: +${bonusScore} / 50 PTS`;
        }
        if (quizQNum) {
            quizQNum.textContent = `Q${quizCurrentIdx + 1}`;
        }
        if (quizQText) {
            quizQText.textContent = qData.q;
        }
        if (quizInsightBox) {
            quizInsightBox.style.display = 'none';
        }
        if (quizNextBtn) {
            quizNextBtn.style.display = 'none';
        }

        if (quizOptionsGrid) {
            quizOptionsGrid.innerHTML = '';
            const letters = ['A', 'B', 'C', 'D'];
            qData.options.forEach((optText, idx) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-opt-btn';
                btn.innerHTML = `
                    <span class="quiz-opt-letter">${letters[idx]}</span>
                    <span class="quiz-opt-text"></span>
                `;
                // textContent: teacher-entered DB text is shown as plain text (no HTML injection)
                btn.querySelector('.quiz-opt-text').textContent = optText;
                btn.addEventListener('click', () => handleQuizAnswer(idx, btn));
                quizOptionsGrid.appendChild(btn);
            });
        }
    }

    function handleQuizAnswer(selectedIdx, selectedBtn) {
        const qData = CSS_QUIZ_DATA[quizCurrentIdx];
        if (!qData || quizAnswerPending) return;
        quizAnswerPending = true;

        // Freeze all option buttons
        const allBtns = quizOptionsGrid.querySelectorAll('.quiz-opt-btn');
        allBtns.forEach(b => b.disabled = true);

        const sessionId = quizSessionId;
        const questionIdx = quizCurrentIdx;

        // Ask the server (MySQL) whether the selected choice is correct
        fetch(BONUS_CHECK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
            body: JSON.stringify({ questionId: qData.id, selected: OPTION_LETTERS[selectedIdx] })
        })
            .then(res => res.json().catch(() => ({ success: false })))
            .then(data => {
                if (sessionId !== quizSessionId || questionIdx !== quizCurrentIdx) return;
                const correctIdx = data ? OPTION_LETTERS.indexOf(data.correctOption) : -1;
                if (!data || !data.success || correctIdx < 0) {
                    showQuizAnswerError(allBtns, (data && data.message) || 'Could not check your answer.');
                    return;
                }
                applyQuizAnswerResult(selectedBtn, allBtns, data.correct === true, correctIdx, data.insight || '');
            })
            .catch(err => {
                if (sessionId !== quizSessionId || questionIdx !== quizCurrentIdx) return;
                console.error('Bonus answer check failed:', err);
                showQuizAnswerError(allBtns, 'Could not reach the server to check your answer.');
            });
    }

    // Network/DB problem while checking: let the student pick again (no points lost or awarded)
    function showQuizAnswerError(allBtns, message) {
        quizAnswerPending = false;
        allBtns.forEach(b => b.disabled = false);
        if (errorSound) {
            errorSound.currentTime = 0;
            errorSound.play().catch(() => { });
        }
        if (insightTitle) insightTitle.textContent = "⚠️ CONNECTION PROBLEM";
        if (insightDesc) insightDesc.textContent = `${message} Please try selecting your answer again.`;
        if (quizInsightBox) quizInsightBox.style.display = 'block';
    }

    function applyQuizAnswerResult(selectedBtn, allBtns, isCorrect, correctIdx, insightText) {
        quizAnswerPending = false; // Answer verified; option buttons stay disabled for this question
        if (isCorrect) {
            selectedBtn.classList.add('correct');
            quizScore++;
            bonusScore = quizScore * BONUS_POINTS_PER_QUESTION; // Separate 0 to 50 PTS bonus
            if (quizPointsBadge) {
                quizPointsBadge.textContent = `BONUS: +${bonusScore} / 50 PTS`;
            }
            playBeep(659, 'triangle', 0.25);
            if (insightTitle) insightTitle.textContent = "CORRECT! CSS TECHNICIAN INSIGHT:";
        } else {
            selectedBtn.classList.add('wrong');
            if (allBtns[correctIdx]) {
                allBtns[correctIdx].classList.add('correct');
            }
            if (errorSound) {
                errorSound.currentTime = 0;
                errorSound.play().catch(() => { });
            }
            playBeep(220, 'sawtooth', 0.3);
            if (insightTitle) insightTitle.textContent = "INCORRECT! CSS TECHNICIAN INSIGHT:";
        }

        if (insightDesc) {
            insightDesc.textContent = insightText;
        }
        if (quizInsightBox) {
            quizInsightBox.style.display = 'block';
        }

        // Progressive save: persist earned bonus points immediately after each question
        const currentPractical = Math.min(100, Math.max(0, score));
        const currentBonus = Math.min(50, Math.max(0, bonusScore));
        localStorage.setItem('stage3_completed', 'true');
        localStorage.setItem('stage3_score', String(currentPractical));
        localStorage.setItem('stage3_bonus_score', String(currentBonus));
        if (window.AuthEngine && typeof window.AuthEngine.logStageCompletion === 'function') {
            try {
                window.AuthEngine.logStageCompletion(3, currentPractical, 'In Progress', currentBonus);
            } catch (progErr) {
                console.warn("AuthEngine progressive quiz save note:", progErr);
            }
        }

        if (quizNextBtn) {
            quizNextBtn.style.display = 'flex';
            if (quizCurrentIdx === CSS_QUIZ_DATA.length - 1) {
                quizNextBtn.innerHTML = `<span>FINISH & VIEW RESULTS</span> <span>🏆</span>`;
            } else {
                quizNextBtn.innerHTML = `<span>NEXT QUESTION</span> <span>➔</span>`;
            }
        }
    }

    function nextQuizQuestion() {
        playClickSound();
        if (quizUnavailable) {
            finishBonusQuiz(); // Skip bonus: Stage 3 still completes with the continuity score
            return;
        }
        if (quizAnswerPending) return;
        if (quizCurrentIdx < CSS_QUIZ_DATA.length - 1) {
            quizCurrentIdx++;
            renderQuizQuestion();
        } else {
            finishBonusQuiz();
        }
    }

    function finishBonusQuiz() {
        if (gameMusic) {
            gameMusic.pause();
            gameMusic.currentTime = 0;
        }

        // Grand victory sound played after the quiz is finished and total of whole score is revealed!
        if (successSound) {
            successSound.currentTime = 0;
            successSound.play().catch(() => { });
        }
        playBeep(880, 'triangle', 0.5);

        const finalPracticalScore = Math.min(100, Math.max(0, score));
        const finalBonusScore = Math.min(50, Math.max(0, bonusScore));
        const finalTotalStage3 = finalPracticalScore + finalBonusScore;

        localStorage.setItem('stage3_completed', 'true');
        localStorage.setItem('stage3_score', String(finalPracticalScore));
        localStorage.setItem('stage3_bonus_score', String(finalBonusScore));
        if (window.AuthEngine && typeof window.AuthEngine.logStageCompletion === 'function') {
            try {
                window.AuthEngine.logStageCompletion(3, finalPracticalScore, 'Completed', finalBonusScore);
            } catch (authErr) {
                console.error("AuthEngine stage completion log failed:", authErr);
            }
        }

        const quizBodyWrap = document.getElementById('quizBodyWrap');
        const quizFooterRow = document.getElementById('quizFooterRow');
        const quizHeaderTitle = document.querySelector('.quiz-header-title');
        const quizHeaderSub = document.querySelector('.quiz-header-sub');

        if (quizHeaderTitle) quizHeaderTitle.textContent = "🏆 CSS NC II ASSESSMENT RESULTS";
        if (quizHeaderSub) quizHeaderSub.textContent = "Full Cable Fabrication & Servicing Theory Completed!";
        if (quizProgressBadge) quizProgressBadge.textContent = "EVALUATION COMPLETE";
        if (quizFooterRow) quizFooterRow.style.display = 'none';

        const quizTotal = CSS_QUIZ_DATA.length;
        const quizSummaryText = quizUnavailable
            ? 'the bonus quiz was skipped (questions unavailable)'
            : `scored ${quizScore}/${quizTotal} on the CSS network theory quiz (+${finalBonusScore} bonus pts)`;
        const quizStatText = quizUnavailable
            ? 'SKIPPED (+0 / 50 PTS)'
            : `${quizScore}/${quizTotal} (+${finalBonusScore} / 50 PTS)`;

        if (quizBodyWrap) {
            quizBodyWrap.innerHTML = `
                <div class="stage3-indicator-box indicator-victory">
                    <div class="indicator-icon-ring victory-ring">🎓</div>
                    <div class="indicator-badge-pill victory-badge">CSS NC II NETWORK SPECIALIST • COMPLETE</div>
                    <h2 class="indicator-title victory-title">STAGE 03 COMPLETED!</h2>
                    <p class="indicator-desc">Outstanding achievement! You terminated both Cat6 ends with 16/16 pin continuity and ${quizSummaryText}.</p>
                    
                    <div class="indicator-stats-grid">
                        <div class="stat-pill">
                            <span class="stat-label">CABLE FABRICATION</span>
                            <span class="stat-val pass">${finalPracticalScore} / 100 PTS ✅</span>
                        </div>
                        <div class="stat-pill">
                            <span class="stat-label">BONUS QUIZ</span>
                            <span class="stat-val highlight">${quizStatText}</span>
                        </div>
                        <div class="stat-pill">
                            <span class="stat-label">STAGE 03 TOTAL</span>
                            <span class="stat-val highlight" style="color:#00f5ff;">${finalTotalStage3} / 150 PTS ⭐</span>
                        </div>
                    </div>

                    <div class="indicator-actions-wrap" style="margin-top: 10px; display: flex; gap: 12px; width: 100%; justify-content: center;">
                        <a href="MainMenu.html" class="indicator-btn btn-menu-return">
                            <span class="btn-icon">🏆</span>
                            <span>RETURN TO GAME MENU</span>
                        </a>
                        <button class="indicator-btn btn-secondary-close" id="btnFinishQuizClose">
                            CLOSE & EXPLORE ➔
                        </button>
                    </div>
                </div>
            `;

            const btnFinishClose = document.getElementById('btnFinishQuizClose');
            if (btnFinishClose && bonusQuizModal) {
                btnFinishClose.addEventListener('click', () => {
                    playClickSound();
                    bonusQuizModal.classList.remove('active');
                });
            }
        }
    }

    // 5. Setup Event Listeners
    function setupEventListeners() {
        if (stripJacketBtn) {
            stripJacketBtn.addEventListener('click', handleStripJacket);
        }

        if (stripJacketCableBtn) {
            stripJacketCableBtn.addEventListener('click', handleStripJacket);
        }

        if (plugTabA) {
            plugTabA.addEventListener('click', () => {
                playClickSound();
                activePlug = 'A';
                plugTabA.classList.add('active');
                if (plugTabB) plugTabB.classList.remove('active');
                setupMission();
                renderSlots();
                renderWirePool();
            });
        }

        if (plugTabB) {
            plugTabB.addEventListener('click', () => {
                playClickSound();
                activePlug = 'B';
                plugTabB.classList.add('active');
                if (plugTabA) plugTabA.classList.remove('active');
                setupMission();
                renderSlots();
                renderWirePool();
            });
        }

        if (crimpBtn) {
            crimpBtn.addEventListener('click', crimpAndTestCable);
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', resetGame);
        }

        if (quizNextBtn) {
            quizNextBtn.addEventListener('click', nextQuizQuestion);
        }

        if (closeTesterBtn) {
            closeTesterBtn.addEventListener('click', () => {
                playClickSound();
                testerModal.classList.remove('active');
                if (quizAutoLaunchTimer) {
                    clearTimeout(quizAutoLaunchTimer);
                    quizAutoLaunchTimer = null;
                    startBonusQuiz();
                }
            });
        }

        const timeUpRetryBtn = document.getElementById('timeUpRetryBtn');
        if (timeUpRetryBtn) {
            timeUpRetryBtn.addEventListener('click', () => {
                playClickSound();
                const timeUpModal = document.getElementById('timeUpModal');
                if (timeUpModal) timeUpModal.classList.remove('active');
                resetGame();
            });
        }

        const storyBriefBtn = document.getElementById('storyBriefBtn');
        if (storyBriefBtn) {
            storyBriefBtn.addEventListener('click', () => {
                playClickSound();
                if (timerInterval) clearInterval(timerInterval);
                playStage3Story(() => {
                    startTimer();
                });
            });
        }

        // Global Keyboard Shortcuts (Cohesive with Stage 1 & Stage 2)
        document.addEventListener('keydown', (e) => {
            if (window.StoryEngine && window.StoryEngine.isActive) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                playClickSound();
                window.location.href = 'MainMenu.html';
            } else if (e.key === 's' || e.key === 'S') {
                e.preventDefault();
                playClickSound();
                if (timerInterval) clearInterval(timerInterval);
                playStage3Story(() => {
                    startTimer();
                });
            } else if (e.code === 'Space') {
                e.preventDefault();
                crimpAndTestCable();
            } else if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                resetGame();
            } else if (e.key === 'j' || e.key === 'J') {
                e.preventDefault();
                handleStripJacket();
            }
        });
    }

    function playStage3Story(onComplete) {
        if (window.StoryEngine) {
            window.StoryEngine.showStory({
                title: "CONVENIRE: CHAPTER IV & V — THE ASSEMBLY RACE & VICTORY",
                badge: "SAGA ACT III",
                avatar: "🔌",
                avatarName: "Network Master",
                speaker: "NETWORK MASTER KAI",
                dialogues: [
                    "Welcome to the final trial of the Convenires: The Assembly Race!",
                    "To banish the Silence forever and link the digital realms across North Negros, you must fabricate BOTH ends of the sacred Cat6 Gigabit network line.",
                    "First strip the outer cable sheath, then wire Plug End A (Pins 1–8) and switch to Plug End B (Pins 1–8) following the standard pin sequence.",
                    "Both cable ends must be fully wired and verified to achieve 16/16 pin continuity and claim final victory!"
                ],
                onComplete: onComplete
            });
        } else {
            if (typeof onComplete === 'function') onComplete();
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        initStage3();
    });
})();