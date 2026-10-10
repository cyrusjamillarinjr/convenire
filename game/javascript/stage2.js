(function() {
    // Authentication Session Guard - Require Login
    if (window.AuthEngine && !window.AuthEngine.getSession()) {
        window.location.href = 'MainMenu.html';
        return;
    }

    // ===================================================
    // WEB AUDIO SYNTHESIZER & PROCEDURAL SOUND FX ENGINE
    // ===================================================
    let audioCtx = null;
    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) audioCtx = new AudioContext();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    const soundFx = {
        blip: function() {
            try {
                const ctx = getAudioContext();
                if (!ctx) return;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(850, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1450, ctx.currentTime + 0.06);
                gain.gain.setValueAtTime(0.06, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.06);
            } catch(e) {}
        },
        snap: function() {
            try {
                const ctx = getAudioContext();
                if (!ctx) return;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(200, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.12);
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.12);
            } catch(e) {}
        },
        powerHum: function() {
            try {
                const ctx = getAudioContext();
                if (!ctx) return;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(80, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.65);
                gain.gain.setValueAtTime(0.16, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.7);
            } catch(e) {}
        },
        errorBuzz: function() {
            try {
                const ctx = getAudioContext();
                if (!ctx) return;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(130, ctx.currentTime);
                osc.frequency.setValueAtTime(95, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.25);
            } catch(e) {}
        },
        speedBonus: function() {
            try {
                const ctx = getAudioContext();
                if (!ctx) return;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
                osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
                gain.gain.setValueAtTime(0.18, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            } catch(e) {}
        },
        quizRight: function() {
            if (this.speedBonus) this.speedBonus();
        },
        victoryChime: function() {
            try {
                const ctx = getAudioContext();
                if (!ctx) return;
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                notes.forEach((freq, index) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);
                    gain.gain.setValueAtTime(0.2, ctx.currentTime + index * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.1 + 0.5);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime + index * 0.1);
                    osc.stop(ctx.currentTime + index * 0.1 + 0.5);
                });
            } catch(e) {}
        },
        gameOver: function() {
            try {
                const ctx = getAudioContext();
                if (!ctx) return;
                const now = ctx.currentTime;

                // 1. Electrical Short-Circuit Spark Pop (Bandpass white noise burst)
                const bufferSize = Math.floor(ctx.sampleRate * 0.15);
                const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const output = noiseBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
                }
                const whiteNoise = ctx.createBufferSource();
                whiteNoise.buffer = noiseBuffer;
                const noiseFilter = ctx.createBiquadFilter();
                noiseFilter.type = 'bandpass';
                noiseFilter.frequency.setValueAtTime(1400, now);
                noiseFilter.frequency.exponentialRampToValueAtTime(250, now + 0.15);
                const noiseGain = ctx.createGain();
                noiseGain.gain.setValueAtTime(0.35, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                whiteNoise.connect(noiseFilter);
                noiseFilter.connect(noiseGain);
                noiseGain.connect(ctx.destination);
                whiteNoise.start(now);

                // 2. Power Grid Shutdown Pitch-Fall (Motherboard voltage drop)
                const powerOsc = ctx.createOscillator();
                const powerGain = ctx.createGain();
                powerOsc.type = 'sawtooth';
                powerOsc.frequency.setValueAtTime(360, now);
                powerOsc.frequency.exponentialRampToValueAtTime(40, now + 0.85);
                powerGain.gain.setValueAtTime(0.25, now);
                powerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
                powerOsc.connect(powerGain);
                powerGain.connect(ctx.destination);
                powerOsc.start(now);
                powerOsc.stop(now + 0.9);

                // 3. Melodic Game Over Descending Minor Cadence (G4 -> F4 -> Eb4 -> Low C4 & Sub-bass C3)
                const sadNotes = [
                    { f: 392.00, t: 0.12, d: 0.22 }, // G4
                    { f: 349.23, t: 0.32, d: 0.22 }, // F4
                    { f: 311.13, t: 0.52, d: 0.25 }, // Eb4
                    { f: 261.63, t: 0.75, d: 0.65 }, // C4
                    { f: 130.81, t: 0.75, d: 0.85 }  // C3 deep sub-bass
                ];

                sadNotes.forEach(note => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(note.f, now + note.t);
                    gain.gain.setValueAtTime(0.28, now + note.t);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + note.t);
                    osc.stop(now + note.t + note.d);
                });
            } catch(e) {}
        }
    };

    // HTML5 Audio Elements
    const gameMusic = document.getElementById("gameMusic");
    const clickSound = document.getElementById("clickSound");
    const successSound = document.getElementById("successSound");
    const dropSound = document.getElementById("dropSound");
    const errorSound = document.getElementById("errorSound");
    const dragSound = document.getElementById("dragSound");
    // Game state
    let gameActive = true;
    let timerInterval = null;
    let timeLeft = 90;
    let score = 0;
    let zoneAssignments = {};
    let powerUsed = false;
    let powerAttempted = false;
    let gameWon = false;
    let isGameOver = false;
    let sparksAnimationId = null;

    // DOM elements
    const gamePanel = document.getElementById('gamePanel');
    const componentContainer = document.getElementById('componentContainer');
    const dropZones = document.querySelectorAll(".drop-zone");
    dropZones.forEach(zone => zone.removeAttribute('title'));
    const gameMessage = document.getElementById('gameMessage');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const timerDisplay = document.getElementById('timerDisplay');
    const timerPill = timerDisplay ? timerDisplay.closest('.timer-pill') : null;
    const placedCounter = document.getElementById('placedCounter');
    const chassisStatus = document.getElementById('chassisStatus');
    const resetStageBtn = document.getElementById('resetStageBtn');
    const backToMenuBtn = document.getElementById('backToMenuBtn');
    const nextStageBtn = document.getElementById('nextStageBtn');
    const nextStageBadge = document.getElementById('nextStageBadge');
    const powerBtn = document.getElementById('powerBtn');
    const powerStatusLabel = document.getElementById('powerStatusLabel');
    const alertBox = document.getElementById('alertBox');
    const alertTitle = document.getElementById('alertTitle');
    const alertMsg = document.getElementById('alertMsg');
    const alertIconRing = document.getElementById('alertIconRing');
    const board = document.querySelector('.board');
    const sparksCanvas = document.getElementById('victorySparksCanvas');

    const componentImages = {
        keyboard: { src: "images/keyboard.png", width: 40, height: 40 },
        mouse: { src: "images/mouse.png", width: 40, height: 40 },
        usb: { src: "images/usb.png", width: 80, height: 30 },
        hdmi: { src: "images/hdmi.png", width: 45, height: 20 },
        ethernet: { src: "images/ethernet.png", width: 50, height: 25 },
        speaker: { src: "images/speaker.png", width: 60, height: 25 },
        microphone: { src: "images/microphone.png", width: 60, height: 25 },
        vga: { src: "images/vga.png", width: 45, height: 25 },
        parallel: { src: "images/parallel.png", width: 45, height: 20 },
        game: { src: "images/game.png", width: 40, height: 40 }
    };

    // Arcade Floating Speed Score Spark
    function spawnSpeedBonusSpark(targetEl, text) {
        if (!targetEl) return;
        const rect = targetEl.getBoundingClientRect();
        const popup = document.createElement('div');
        popup.className = 'speed-score-popup';
        popup.textContent = text;
        popup.style.left = `${rect.left + rect.width / 2}px`;
        popup.style.top = `${rect.top}px`;
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 1100);
    }

    const stage2Specs = {
        usb: { name: "USB 2.0 High-Speed Ports", desc: "Universal Serial Bus ports delivering 480 Mbps data bandwidth for external peripherals." },
        hdmi: { name: "DVI / HDMI Video Output", desc: "High-definition digital interface transmitting display telemetry directly to monitors." },
        ethernet: { name: "RJ-45 Gigabit Ethernet LAN", desc: "8P8C twisted-pair networking socket supplying 1000 Mbps wired internet connectivity." },
        speaker: { name: "3.5mm Lime Green Audio-Out", desc: "Analog line-out port delivering amplified stereo audio to speakers & headphones." },
        microphone: { name: "3.5mm Pink Mic Audio-In", desc: "Dedicated microphone input jack providing low-noise audio recording capability." },
        vga: { name: "DE-15 Blue VGA Video Port", desc: "15-pin D-Sub analog interface transmitting red, green, blue, H-sync, and V-sync signals." },
        parallel: { name: "DB-25 Parallel (LPT1) Port", desc: "Legacy 25-pin parallel port historically used for high-reliability dot-matrix printers." },
        keyboard: { name: "Green PS/2 Keyboard Connector", desc: "6-pin Mini-DIN port providing hardware-level interrupt keyboard communication." },
        mouse: { name: "Purple PS/2 Mouse Connector", desc: "6-pin Mini-DIN port providing direct hardware-level mouse packet tracking." },
        game: { name: "DA-15 Game / MIDI Interface", desc: "15-pin D-sub port linking analog game flight sticks, gamepads, and MIDI synthesizers." }
    };

    const educationalPortInfo = {
        keyboard: "🟢 Green PS/2: 6-pin Mini-DIN connector dedicated to keyboard hardware input.",
        mouse: "🟣 Purple PS/2: 6-pin Mini-DIN connector dedicated to computer mouse input.",
        usb: "🔌 USB 2.0 (Black): Universal Serial Bus delivering 480 Mbps data & 5V power for peripherals.",
        hdmi: "🖥️ DVI Digital Video: High-definition digital interface transmitting display signals to monitors.",
        parallel: "🖨️ DB-25 Parallel / LPT1: 25-pin legacy interface historically used for printers.",
        vga: "📺 VGA (DE-15): 15-pin D-Sub analog video interface transmitting RGBHV signals to monitors.",
        game: "🕹️ Serial / Game Port (Yellow): 15-pin interface for legacy joysticks, gamepads, and MIDI.",
        ethernet: "🌐 RJ-45 Gigabit LAN: 8P8C Ethernet network socket for high-speed wired internet.",
        speaker: "🔊 3.5mm Audio Out (Lime Green): Analog stereo output delivering audio to speakers & headphones.",
        microphone: "🎙️ 3.5mm Mic In (Pink): Analog microphone input supplying audio capture to sound cards."
    };

    // ===================================================
    // CANVAS VICTORY SPARKS ENGINE
    // ===================================================
    function startVictorySparks() {
        if (!sparksCanvas) return;
        const ctx = sparksCanvas.getContext('2d');
        sparksCanvas.width = window.innerWidth;
        sparksCanvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#00f5ff', '#00ff88', '#ffb700', '#ffffff', '#a855f7'];

        for (let i = 0; i < 180; i++) {
            particles.push({
                x: sparksCanvas.width / 2 + (Math.random() - 0.5) * 300,
                y: sparksCanvas.height / 2 + (Math.random() - 0.5) * 200,
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.5) * 16 - 3,
                size: Math.random() * 4 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: Math.random() * 0.015 + 0.008
            });
        }

        function render() {
            ctx.clearRect(0, 0, sparksCanvas.width, sparksCanvas.height);
            let activeCount = 0;

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.25; // gravity
                p.alpha -= p.decay;

                if (p.alpha > 0) {
                    activeCount++;
                    ctx.save();
                    ctx.globalAlpha = Math.max(0, p.alpha);
                    ctx.fillStyle = p.color;
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            });

            if (activeCount > 0) {
                sparksAnimationId = requestAnimationFrame(render);
            } else {
                ctx.clearRect(0, 0, sparksCanvas.width, sparksCanvas.height);
            }
        }

        if (sparksAnimationId) cancelAnimationFrame(sparksAnimationId);
        render();
    }

    // ===================================================
    // UI REFRESH & COUNTER UPDATES
    // ===================================================
    function updatePlacedCounter() {
        const placed = Object.keys(zoneAssignments).length;
        if (placedCounter) {
            placedCounter.textContent = `${placed}/10`;
        }

        if (chassisStatus) {
            if (isGameOver) {
                chassisStatus.textContent = "STATUS: 💀 SYSTEM HALTED • SIGNAL COLLISION DETECTED";
                chassisStatus.style.color = "var(--crimson-primary)";
            } else if (placed === 0) {
                chassisStatus.textContent = "STATUS: AWAITING I/O CABLES";
                chassisStatus.style.color = "#7ba2c2";
            } else if (placed < 10) {
                chassisStatus.textContent = `STATUS: ${placed}/10 PORTS CONNECTED`;
                chassisStatus.style.color = "var(--cyan-primary)";
            } else {
                chassisStatus.textContent = "STATUS: ALL 10 PORTS MOUNTED • READY FOR POWER";
                chassisStatus.style.color = "var(--emerald-primary)";
            }
        }

        if (powerStatusLabel) {
            if (isGameOver) {
                powerStatusLabel.textContent = "GAME OVER";
                powerStatusLabel.style.color = "var(--crimson-primary)";
            } else if (placed === 10 && !powerUsed) {
                powerStatusLabel.textContent = "READY TO BOOT";
                powerStatusLabel.style.color = "var(--amber-primary)";
            } else if (gameWon) {
                powerStatusLabel.textContent = "CHASSIS ONLINE";
                powerStatusLabel.style.color = "var(--emerald-primary)";
            } else {
                powerStatusLabel.textContent = "BOOT PC";
                powerStatusLabel.style.color = "var(--cyan-primary)";
            }
        }
    }

    // ===================================================
    // INITIALIZATION & AUDIO
    // ===================================================
    function init() {
        dropZones.forEach(zone => {
            zone.classList.add('active');
        });

        if (board) {
            board.classList.add('show');
        }

        const components = document.querySelectorAll('.component');
        components.forEach((c, i) => {
            setTimeout(() => {
                c.classList.add('show');
            }, i * 70);
        });

        initAudio();
        setupDragAndDrop();
        resetStage();
    }

    function initAudio() {
        if (gameMusic) {
            gameMusic.volume = 0.25;
            gameMusic.loop = true;
            
            let playPromise = gameMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log("Stage 2 music playing");
                }).catch(() => {
                    const enableAudio = () => {
                        gameMusic.play().catch(()=>{});
                        document.removeEventListener('click', enableAudio);
                        document.removeEventListener('keydown', enableAudio);
                    };
                    document.addEventListener('click', enableAudio, { once: true });
                    document.addEventListener('keydown', enableAudio, { once: true });
                });
            }
        }
    }

    // ===================================================
    // DRAG AND DROP HANDLERS WITH TARGET HIGHLIGHT
    // ===================================================
    function setupDragAndDrop() {
        const components = document.querySelectorAll('.component');
        components.forEach(comp => {
            comp.setAttribute('draggable', 'true');
            comp.addEventListener('dragstart', dragStart);
            comp.addEventListener('dragend', dragEnd);
            comp.addEventListener('mouseenter', () => soundFx.blip());
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                if (gameActive && !powerUsed && !isGameOver) {
                    e.preventDefault();
                    zone.classList.add('drag-over');
                }
            });
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });
            zone.addEventListener('drop', (e) => {
                zone.classList.remove('drag-over');
                drop(e);
            });
        });

        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }

    function dragStart(e) {
        const component = e.target.closest('.component');
        if (!component) return;
        
        if (!gameActive || powerUsed || isGameOver || component.classList.contains('disabled')) {
            e.preventDefault();
            return false;
        }

        const tooltip = document.getElementById('specTooltip');
        if (tooltip) tooltip.style.display = 'none';

        soundFx.blip();
        if (dragSound) {
            dragSound.currentTime = 0;
            dragSound.play().catch(() => {});
        }
        
        e.dataTransfer.setData('text/plain', component.id);
        component.classList.add('dragging');
    }

    function dragOver(e) {
        if (gameActive && !powerUsed && !isGameOver) {
            e.preventDefault();
        }
    }

    function dragEnd(e) {
        document.querySelectorAll('.component.dragging').forEach(c => c.classList.remove('dragging'));
    }

    function handlePortPlaced(draggedId, accept, draggedEl, zone) {
        if (draggedId === accept) {
            const eduText = educationalPortInfo[draggedId] || `${draggedEl.querySelector('.comp-name')?.textContent || draggedId} connected!`;
            
            // Speed scoring calculation (100 PTS Max Scale):
            // Base placement score: 4 pts (10 x 4 = 40 pts)
            // Speed bonus: up to +3 pts based on remaining time (timeLeft / 90 * 3) -> (10 x 3 = 30 pts)
            // Max from port connections: 70 pts
            const basePts = 4;
            const speedBonus = Math.max(0, Math.round((timeLeft / 90) * 3));
            const earnedPts = basePts + speedBonus;
            
            score = Math.min(100, score + earnedPts);
            updateScore();
            soundFx.snap();
            if (speedBonus >= 2) {
                soundFx.speedBonus();
            }
            
            if (dropSound) {
                dropSound.currentTime = 0;
                dropSound.play().catch(() => {});
            }

            // Visual feedback & floating arcade speed indicator
            if (speedBonus > 0) {
                gameMessage.innerHTML = `✅ ${eduText} <strong style="color:var(--cyan-primary); text-shadow:0 0 10px rgba(0,243,255,0.7);">[+${earnedPts} PTS · ⚡ +${speedBonus} SPEED]</strong>`;
            } else {
                gameMessage.innerHTML = `✅ ${eduText} <strong style="color:var(--emerald-primary);">[+${earnedPts} PTS]</strong>`;
            }

            spawnSpeedBonusSpark(zone, `+${earnedPts} PTS${speedBonus > 0 ? ' ⚡' : ''}`);
        } else {
            gameMessage.innerText = `🔧 ${draggedEl.querySelector('.comp-name')?.textContent || draggedId} placed in socket (verify with POWER)`;
            soundFx.snap();
            
            if (dropSound) {
                dropSound.currentTime = 0;
                dropSound.play().catch(() => {});
            }
        }

        updatePlacedCounter();

        // When all 10 rear ports are connected, automatically trigger power sequence after 750ms
        const totalPlaced = Object.keys(zoneAssignments).length;
        if (totalPlaced === 10 && !powerUsed && !isGameOver) {
            gameMessage.innerHTML = '⚡ <strong style="color:var(--emerald-primary); text-shadow:0 0 10px rgba(0,255,136,0.6);">ALL 10 REAR I/O PORTS CONNECTED! INITIATING PERIPHERAL POWER POST...</strong>';
            if (powerBtn) {
                powerBtn.classList.add("on");
            }
            setTimeout(() => {
                if (!powerUsed && !isGameOver && Object.keys(zoneAssignments).length === 10) {
                    powerOn();
                }
            }, 750);
        }
    }

    function drop(e) {
        e.preventDefault();
        
        if (!gameActive || powerUsed || isGameOver) {
            gameMessage.innerText = '⚠️ Cannot connect peripheral right now!';
            soundFx.errorBuzz();
            return;
        }

        const zone = e.target.closest('.drop-zone');
        if (!zone) return;
        
        const draggedId = e.dataTransfer.getData('text/plain');
        if (!draggedId) return;
        
        const draggedEl = document.getElementById(draggedId);
        if (!draggedEl) return;
        
        const accept = zone.dataset.accept;
        
        if (draggedEl.classList.contains('disabled')) {
            gameMessage.innerText = '⚠️ Connector already installed!';
            soundFx.errorBuzz();
            return;
        }
        
        if (zoneAssignments[accept]) {
            gameMessage.innerText = '⚠️ This rear port already has a cable plugged in!';
            soundFx.errorBuzz();
            return;
        }
        
        zoneAssignments[accept] = draggedId;
        
        draggedEl.classList.add('disabled');
        draggedEl.draggable = false;
        draggedEl.style.opacity = '0.32';
        
        const img = componentImages[draggedId];
        if (img) {
            zone.classList.add('occupied');
            zone.innerHTML = `<img src="${img.src}" alt="${draggedId}" style="width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.9)); opacity:1;">`;
        }
        
        handlePortPlaced(draggedId, accept, draggedEl, zone);
    }

    // ===================================================
    // SHUFFLE & RESET ROUTINES
    // ===================================================
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function shuffleComponents() {
        if (!componentContainer) return;
        const components = Array.from(componentContainer.children);
        const shuffled = shuffleArray(components);
        componentContainer.innerHTML = '';
        shuffled.forEach(comp => componentContainer.appendChild(comp));
        
        setTimeout(() => {
            document.querySelectorAll('.component').forEach((c, idx) => {
                setTimeout(() => c.classList.add('show'), idx * 50);
            });
        }, 50);
    }

    function resetComponentStates() {
        document.querySelectorAll('.component').forEach(c => {
            c.style.opacity = "";
            c.draggable = true;
            c.classList.remove('disabled', 'dragging', 'show');
        });
    }

    function clearDropZones() {
        dropZones.forEach(z => {
            z.classList.remove("correct", "wrong", "occupied");
            z.innerHTML = "";
            z.classList.add('active');
        });
    }

    // ===================================================
    // TIMER & SCORE ENGINE
    // ===================================================
    function updateTimer() {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        if (timerDisplay) {
            timerDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }

        if (timerPill) {
            if (timeLeft <= 10) {
                timerPill.className = 'timer-pill urgent';
            } else if (timeLeft <= 30) {
                timerPill.className = 'timer-pill warning';
            } else {
                timerPill.className = 'timer-pill';
            }
        }
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (!gameActive || powerAttempted) {
                if (powerAttempted && timerInterval) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                }
                return;
            }
            timeLeft -= 1;
            updateTimer();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                if (!powerAttempted) {
                    isGameOver = true;
                    gameActive = false;
                    soundFx.errorBuzz();
                    if (gameMusic) {
                        gameMusic.pause();
                        gameMusic.currentTime = 0;
                    }
                    if (score > 0 && window.AuthEngine && typeof window.AuthEngine.logStageCompletion === 'function') {
                        try {
                            window.AuthEngine.logStageCompletion(2, score, 'Time Expired');
                        } catch (err) {}
                    }
                    showAlert("⏰ Time's Up!", `Rear I/O connection window expired.\nEarned Score: ${score} PTS.\nClick RESET STAGE to retry for a higher score!`, "⏳", "OKAY");
                    dropZones.forEach(z => z.classList.remove("active"));
                    document.querySelectorAll('.component').forEach(comp => {
                        comp.classList.add('disabled');
                        comp.draggable = false;
                    });
                    if (resetStageBtn) {
                        resetStageBtn.style.borderColor = "var(--cyan-primary)";
                        resetStageBtn.style.boxShadow = "0 0 20px var(--cyan-primary)";
                    }
                }
            }
        }, 1000);
    }

    function updateScore() {
        score = Math.min(100, Math.max(0, score));
        if (scoreDisplay) {
            scoreDisplay.textContent = score;
        }
    }

    // ===================================================
    // CUSTOM CYBER ALERT MODAL
    // ===================================================
    let alertConfirmCallback = null;
    window.closeAlert = function() {
        if (alertBox) alertBox.style.display = "none";
        const confirmBtn = alertBox ? alertBox.querySelector('.alert-confirm-btn') : null;
        if (confirmBtn) confirmBtn.textContent = "ACKNOWLEDGE";
        const cb = alertConfirmCallback;
        alertConfirmCallback = null;
        if (typeof cb === 'function') {
            try { cb(); } catch (err) { console.error("Alert callback error:", err); }
        }
        if (gameMusic && gameMusic.paused && !gameWon && !isGameOver && gameActive) {
            gameMusic.play().catch(() => {});
        }
    };

    function showAlert(title, msg, icon = "⚡", btnText = "ACKNOWLEDGE", onConfirm = null) {
        if (!alertBox) return;
        alertConfirmCallback = (typeof onConfirm === 'function') ? onConfirm : null;
        if (alertTitle) alertTitle.textContent = title;
        if (alertMsg) alertMsg.textContent = msg;
        if (alertIconRing) alertIconRing.textContent = icon;
        const confirmBtn = alertBox.querySelector('.alert-confirm-btn');
        if (confirmBtn) confirmBtn.textContent = btnText;
        alertBox.style.display = "flex";
    }

    // ===================================================
    // POWER-ON SEQUENCE & VICTORY LOGIC
    // ===================================================
    function powerOn() {
        soundFx.blip();
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.play().catch(() => {});
        }

        if (isGameOver) {
            showAlert("💀 GAME OVER", "The system is offline due to fatal signal collision.\n\nPlease click RESET STAGE to start a new game.", "💀", "OKAY");
            return;
        }
        
        if (!gameActive) {
            showAlert("Cannot Power On", "Start or reset the game first!", "⚠️");
            return;
        }
        
        if (powerUsed) {
            showAlert("Already Powered", "System diagnostics completed. Reset to test again.", "ℹ️");
            return;
        }

        powerUsed = true;
        
        let correctCount = 0;
        let wrongCount = 0;
        let wrongPlacements = [];
        let allZonesFilled = true;

        dropZones.forEach(zone => {
            const accept = zone.dataset.accept;
            if (!zoneAssignments[accept]) {
                allZonesFilled = false;
            }
        });

        if (!allZonesFilled) {
            showAlert("⚠️ Incomplete Connections", "Please connect all 10 hardware peripheral cables to the rear panel before pressing POWER!", "🔌");
            powerUsed = false;
            if (powerBtn) powerBtn.classList.remove("on");
            soundFx.errorBuzz();
            return;
        }

        // Stop timer immediately upon pressing power button and prevent Time's Up indicator
        powerAttempted = true;
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }

        soundFx.powerHum();

        dropZones.forEach(zone => {
            const accept = zone.dataset.accept;
            const placedId = zoneAssignments[accept];
            
            if (placedId === accept) {
                correctCount++;
            } else {
                // Wrong placement: tracked for clearing without displaying red error indicators
                wrongCount++;
                score = Math.max(0, score - 5);
                wrongPlacements.push({ zone, accept, placedId });
            }
        });
        
        updateScore();
        
        if (correctCount === 10) {
            // VICTORY - All dropzones highlight green
            dropZones.forEach(zone => zone.classList.add("correct"));

            if (gameMusic) {
                gameMusic.pause();
                gameMusic.currentTime = 0;
            }
            soundFx.victoryChime();
            if (successSound) {
                successSound.currentTime = 0;
                successSound.play().catch(() => {});
            }
            gameWon = true;
            gameActive = false;
            clearInterval(timerInterval);
            timerInterval = null;
    
            if (powerBtn) powerBtn.classList.add("on");
            if (board) board.style.boxShadow = '0 0 35px var(--emerald-primary), 0 0 70px rgba(0,255,136,0.3)';
    
            // Power POST Check & Remaining Time Bonus (Max 100 PTS Scale):
            // +10 PTS for flawless POST + up to +20 PTS for remaining time
            const timeBonus = Math.min(20, Math.round((timeLeft / 90) * 20));
            score = Math.min(100, score + 10 + timeBonus);
            updateScore();

            localStorage.setItem('stage2_completed', 'true');
            localStorage.setItem('stage2_score', String(score));
            if (window.AuthEngine && typeof window.AuthEngine.logStageCompletion === 'function') {
                try {
                    window.AuthEngine.logStageCompletion(2, score, 'Completed');
                } catch (authErr) {
                    console.error("AuthEngine error in stage2:", authErr);
                }
            }
            
            if (nextStageBadge) nextStageBadge.textContent = "UNLOCKED ➔";
            if (nextStageBtn) {
                nextStageBtn.style.borderColor = "var(--emerald-primary)";
                nextStageBtn.style.boxShadow = "0 0 25px var(--emerald-primary)";
            }

            startVictorySparks();
            updatePlacedCounter();
            gameMessage.innerText = "⚡ PERIPHERAL HARMONY ACHIEVED! ALL 10 PORTS ONLINE!";

            setTimeout(() => {
                showAlert(
                    "🎉 STAGE 2 COMPLETE!",
                    `All 10 physical rear panel connectors linked with full bandwidth!\n\n⚡ Time Remaining: ${timeLeft}s\n⏱️ Speed Time Bonus: +${timeBonus} PTS\n🏆 Final Score: ${score}/100 PTS\n\nStage 3 is now unlocked!`,
                    "🏆",
                    "CONTINUE TO STAGE 3 ➔",
                    () => {
                        window.location.href = "stage3.html";
                    }
                );
            }, 600);
            
        } else {
            // GAME OVER - POWER-ON FAILED
            isGameOver = true;
            gameActive = false;
            powerUsed = true; // Lock power sequence - cannot re-power without resetting stage

            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }

            if (gameMusic) {
                gameMusic.pause();
                gameMusic.currentTime = 0;
            }

            // Record whatever score was accumulated before failure
            if (score > 0 && window.AuthEngine && typeof window.AuthEngine.logStageCompletion === 'function') {
                try {
                    window.AuthEngine.logStageCompletion(2, score, 'Power Failed');
                } catch (authErr) {}
            }
            soundFx.gameOver();
            if (errorSound) {
                errorSound.currentTime = 0;
                errorSound.play().catch(() => {});
            }

            if (powerBtn) powerBtn.classList.remove("on");
            if (board) board.style.boxShadow = ''; // No error glow on board to keep it hard to identify
        
            // Remove any error / correct indicator on all dropzones - make it hard for player to identify
            dropZones.forEach(zone => {
                zone.classList.remove("wrong", "correct", "active", "drag-over");
            });

            // Disable all inventory components so user cannot continue playing
            document.querySelectorAll('.component').forEach(comp => {
                comp.classList.add('disabled');
                comp.draggable = false;
            });

            // Deactivate all drop zones
            dropZones.forEach(zone => {
                zone.classList.remove("active", "drag-over");
            });

            if (powerStatusLabel) {
                powerStatusLabel.textContent = "GAME OVER";
                powerStatusLabel.style.color = "var(--crimson-primary)";
            }

            if (chassisStatus) {
                chassisStatus.textContent = "STATUS: 💀 SYSTEM HALTED • SIGNAL COLLISION DETECTED";
                chassisStatus.style.color = "var(--crimson-primary)";
            }

            if (gameMessage) {
                gameMessage.innerText = "💀 GAME OVER: Signal collision detected! System halted. Click RESET STAGE to retry.";
            }

            // Highlight RESET STAGE button to guide user to restart
            if (resetStageBtn) {
                resetStageBtn.style.borderColor = "var(--cyan-primary)";
                resetStageBtn.style.boxShadow = "0 0 20px var(--cyan-primary)";
            }

            // Display Game Over alert with OKAY button
            showAlert(
                "💀 GAME OVER",
                "Critical I/O short circuit! Incorrect cable connections detected.\n\nThe system suffered a fatal signal collision and cannot boot.\nClick RESET STAGE to start a new attempt.",
                "💀",
                "OKAY"
            );
        }
    }

    // ===================================================
    // RESET STAGE
    // ===================================================
    function resetStage() {
        soundFx.blip();
        if (timerInterval) clearInterval(timerInterval);
        
        isGameOver = false;
        gameActive = true;
        powerUsed = false;
        powerAttempted = false;
        gameWon = false;
        score = 0;
        timeLeft = 90;
        zoneAssignments = {};
        
        if (board) {
            board.style.boxShadow = '';
            board.classList.add('show');
        }

        if (nextStageBadge) nextStageBadge.textContent = "LOCKED";
        if (nextStageBtn) {
            nextStageBtn.style.borderColor = "";
            nextStageBtn.style.boxShadow = "";
        }

        if (resetStageBtn) {
            resetStageBtn.style.borderColor = "";
            resetStageBtn.style.boxShadow = "";
        }
        
        resetComponentStates();
        clearDropZones();
        shuffleComponents();
        
        updateScore();
        updateTimer();
        updatePlacedCounter();
        startTimer();
        
        if (gameMessage) gameMessage.innerText = 'Connect all 10 hardware peripheral cables to the rear panel and initiate power.';
        if (powerBtn) powerBtn.classList.remove("on");
        if (gameMusic && gameMusic.paused && !gameWon) {
            gameMusic.play().catch(() => {});
        }
    }

    // ===================================================
    // NAVIGATION HANDLERS
    // ===================================================
    function backToMenu() {
        soundFx.blip();
        window.location.href = 'MainMenu.html';
    }

    function nextStage() {
        soundFx.blip();
        if (gameWon) {
            window.location.href = 'stage3.html';
        } else if (Object.keys(zoneAssignments).length === 10 && !powerUsed) {
            powerOn();
        } else {
            showAlert("Stage Locked", "Connect all 10 peripheral cables to the rear panel first!", "🔒");
        }
    }

    // ===================================================
    // STORY & TUTORIAL ENGINES
    // ===================================================
    function playStage2Story(onComplete) {
        if (window.StoryEngine) {
            window.StoryEngine.showStory({
                title: "CONVENIRE: ACT II — PERIPHERAL HARMONY",
                badge: "STAGE 02",
                avatar: "⚡",
                avatarName: "Guild Master Ryan",
                speaker: "GUILD MASTER RYAN",
                dialogues: [
                    "The motherboard has awakened from the Silence! Now the Convenires must link its voice and senses to the world.",
                    "Interface the rear metal I/O shield: align PS/2 input, USB data, DVI and VGA video telemetry, Parallel logic, and RJ-45 LAN connectivity.",
                    "Assemble all rear I/O connectors with speed and precision before time runs out to earn maximum technician speed bonus points!",
                    "Unite all peripheral channels to establish complete hardware harmony and prepare for the final Assembly Race!"
                ],
                onComplete: onComplete
            });
        } else {
            if (typeof onComplete === 'function') onComplete();
        }
    }

    function startStage2Tutorial() {
        soundFx.blip();
        if (window.TutorialEngine) {
            window.TutorialEngine.runHandSimulation([
                { sourceId: "usb", targetZoneAccept: "usb", instruction: "Plug USB Ports into Back Panel Dual USB Slot!" },
                { sourceId: "hdmi", targetZoneAccept: "hdmi", instruction: "Plug HDMI Port into Digital Display Slot!" },
                { sourceId: "ethernet", targetZoneAccept: "ethernet", instruction: "Plug Ethernet Port into Gigabit LAN Slot!" }
            ], function() {
                if (gameMessage) gameMessage.innerText = "💡 Tutorial complete! Connect all remaining back panel peripheral ports.";
            });
        }
    }

    // ===================================================
    // KEYBOARD SHORTCUTS
    // ===================================================
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.code === 'Space') {
            e.preventDefault();
            powerOn();
        } else if (e.code === 'KeyR') {
            resetStage();
        } else if (e.code === 'KeyT') {
            startStage2Tutorial();
        } else if (e.code === 'KeyS') {
            playStage2Story();
        } else if (e.code === 'Escape') {
            if (alertBox && alertBox.style.display === 'flex') {
                closeAlert();
            } else {
                backToMenu();
            }
        } else if (e.code === 'Enter') {
            if (alertBox && alertBox.style.display === 'flex') {
                closeAlert();
            } else if (gameWon) {
                nextStage();
            }
        }
    });

    // ===================================================
    // EVENT LISTENERS & INITIALIZATION
    // ===================================================
    if (resetStageBtn) resetStageBtn.addEventListener('click', resetStage);
    if (backToMenuBtn) backToMenuBtn.addEventListener('click', backToMenu);
    if (nextStageBtn) nextStageBtn.addEventListener('click', nextStage);
    if (powerBtn) powerBtn.addEventListener('click', powerOn);

    const storyBriefBtn = document.getElementById('storyBriefBtn');
    if (storyBriefBtn) {
        storyBriefBtn.addEventListener('click', () => playStage2Story(function() {}));
    }

    // Initialize Game & Component Tooltips
    init();
    if (window.TutorialEngine) {
        window.TutorialEngine.initComponentTooltips(stage2Specs);
    }

    // Story brief available on-demand via the STORY button or [S] key
    // (Auto-popup removed so players can start playing immediately)

    // Start video background
    const gameplayVideo = document.getElementById('gameplayVideo');
    if (gameplayVideo) {
        gameplayVideo.play().catch(() => console.log("Video autoplay prevented"));
    }
})();