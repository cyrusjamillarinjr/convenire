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
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.06);
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
                osc.frequency.setValueAtTime(180, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.12);
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
                osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.6);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.65);
            } catch(e) {}
        },
        errorBuzz: function() {
            try {
                const ctx = getAudioContext();
                if (!ctx) return;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(120, ctx.currentTime);
                osc.frequency.setValueAtTime(90, ctx.currentTime + 0.1);
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
    
    // Game State
    const STAGE1_DURATION = 90; // 90 seconds (1 minute 30 seconds duration)
    let gameActive = true;
    let timerInterval = null;
    let timeLeft = STAGE1_DURATION;
    let hasChosenMotherboard = false;
    let score = 0;
    let zoneAssignments = {};
    let powerUsed = false;
    let powerAttempted = false;
    let gameWon = false;
    let isGameOver = false;
    let sparksAnimationId = null;
    let selectedMap = 'classic'; // 'classic' | 'modern'

    // DOM Elements
    const gamePanel = document.getElementById('gamePanel');
    const componentContainer = document.getElementById('componentContainer');
    const dropZones = document.querySelectorAll(".drop-zone");
    dropZones.forEach(zone => zone.removeAttribute('title'));
    const gameMessage = document.getElementById('gameMessage');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const timerDisplay = document.getElementById('timerDisplay');
    const timerPill = timerDisplay ? timerDisplay.closest('.timer-pill') : null;
    const placedCounter = document.getElementById('placedCounter');
    const pcbStatus = document.getElementById('pcbStatus');
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
    const components = document.querySelectorAll('.component');
    const sparksCanvas = document.getElementById('victorySparksCanvas');

    // Classic board component images
    const componentImages = {
        cpu:   { src: "images/cpu.png",   width:  85, height:  85, name: "Intel Core i9 Desktop CPU" },
        ram:   { src: "images/RAM.png",   width: 250, height:  30, name: "DDR5 High-Speed RAM" },
        pcie:  { src: "images/PCIE.png",  width:  30, height: 175, name: "PCIe x1 Expansion Card" },
        sata:  { src: "images/SATA.png",  width:  60, height:  60, name: "SATA III 6Gbps Data Cable" },
        gpu:   { src: "images/GPU.png",   width:  20, height: 180, name: "GeForce RTX Dedicated GPU" },
        pin24: { src: "images/24pin.png", width: 120, height:  20, name: "24-Pin ATX Main Power Cable" },
        pin4:  { src: "images/4pin.png",  width:  20, height:  20, name: "4-Pin +12V CPU Power Cable" }
    };

    // Modern board component images (Z890 Cybernetix)
    // Falls back to classic images if modern-specific ones not generated yet
    const modernComponentImages = {
        cpu:   { src: "images/cpu.png",   width: 100, height: 100, name: "Intel Core i9-14900K LGA-1700" },
        ram:   { src: "images/RAM.png",   width: 290, height:  30, name: "G.Skill Trident Z5 DDR5-6000" },
        pcie:  { src: "images/PCIE.png",  width:  30, height: 190, name: "PCIe x4 Wi-Fi 7 Expansion Card" },
        sata:  { src: "images/SATA.png",  width:  50, height:  95, name: "SATA III 6Gbps Data Cable" },
        gpu:   { src: "images/GPU.png",   width:  22, height: 200, name: "GeForce RTX 4090 PCIe x16" },
        pin24: { src: "images/24pin.png", width: 100, height:  22, name: "24-Pin ATX Main Power Connector" },
        pin4:  { src: "images/4pin.png",  width:  22, height:  22, name: "8-Pin CPU EPS +12V Power" }
    };

    /** Return the correct image set for the active map */
    function getActiveComponentImages() {
        return selectedMap === 'modern' ? modernComponentImages : componentImages;
    }

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

    // ===================================================
    // DROP ZONE LAYOUT DEFINITIONS (per map)
    // Board display: 700x500px, image object-fit: cover
    // ===================================================
    const dropZoneLayouts = {
        // --- CLASSIC board (original green PCB map.png) ---
        classic: {
            cpu:   { top: 175, left: 495, width: 125, height: 115 },
            ram:   { top: 335, left: 280, width: 310, height:  80 },
            gpu:   { top: 100, left: 260, width:  30, height: 215 },
            pcie:  { top:  90, left:  60, width:  30, height: 180 },
            sata:  { top: 400, left: 155, width:  62, height:  72 },
            pin24: { top: 440, left: 295, width: 110, height:  26 },
            pin4:  { top:  85, left: 435, width:  26, height:  26 }
        },
        // --- MODERN board (Z890 Cybernetix modern_map.jpg) ---
        // Generated image: ~1200×900px → Board render: 700×500px (object-fit:cover)
        // Scale = 700/1200 = 0.5833 | vCrop = (900×0.5833 - 500)/2 ≈ 12.5px clipped top+bottom
        // Formula: display_x = orig_x × 0.5833 | display_y = orig_y × 0.5833 - 12.5
        //
        // Component socket locations on generated Z890 image (1200×900 source pixels):
        //   CPU socket (gold square, upper-right):    orig x:615-840, y:265-480
        //   DDR5 DIMM slots (2 cyan strips, lower):   orig x:538-1090, y:585-715
        //   GPU PCIe x16 (vertical glowing slot):     orig x:440-480, y:195-580
        //   PCIe x4 expansion (horizontal, left):     orig x:55-395, y:285-325
        //   SATA ports (4 red, bottom-left):          orig x:68-158, y:650-830
        //   24-pin ATX (right edge, tall block):      orig x:1082-1175, y:125-340
        //   8-pin CPU EPS (top-left small block):     orig x:62-158, y:38-155
        modern: {
            cpu:   { top: 210, left: 400, width: 132, height: 100 },  // CPU Socket LGA-1700
            ram:   { top: 348, left: 330, width: 280, height:  75 },  // DDR5 RAM DIMM Slots
            gpu:   { top: 120, left: 275, width:  23, height: 198 },  // PCIe 5.0 x16 Primary GPU Slot
            pcie:  { top: 125, left:  80, width:  29, height: 190 },  // PCIe x1 Expansion Slot
            sata:  { top: 390, left:  90, width:  47, height:  77 },  // SATA 6Gbps Data Ports
            pin24: { top: 445, left: 400, width: 105, height:  28 },  // 24-Pin ATX Main Power Socket
            pin4:  { top: 110, left: 610, width:  25, height:  35 }   // 4-Pin +12V CPU Power Socket
        }
    };

    /**
     * Apply drop zone positions for the selected map layout.
     * @param {string} mapKey - 'classic' or 'modern'
     */
    function applyDropZoneLayout(mapKey) {
        const layout = dropZoneLayouts[mapKey];
        if (!layout) return;
        dropZones.forEach(zone => {
            const key = zone.dataset.accept;
            const pos = layout[key];
            if (!pos) return;
            zone.style.top    = pos.top    + 'px';
            zone.style.left   = pos.left   + 'px';
            zone.style.width  = pos.width  + 'px';
            zone.style.height = pos.height + 'px';
        });
    }

    // ===================================================
    // APPLY COMPONENT UI (images + specs for selected map)
    // ===================================================
    /**
     * Swaps component inventory panel to show correct images and specs
     * based on the selected map (classic green PCB vs modern Z890 board).
     * @param {string} mapKey - 'classic' or 'modern'
     */
    function applyComponentUI(mapKey) {
        const isModern = mapKey === 'modern';
        const imgs = isModern ? modernComponentImages : componentImages;

        // Update each component card's image and spec label
        const compCards = {
            cpu:   { nameEl: null, specEl: null },
            ram:   { nameEl: null, specEl: null },
            gpu:   { nameEl: null, specEl: null },
            pcie:  { nameEl: null, specEl: null },
            sata:  { nameEl: null, specEl: null },
            pin24: { nameEl: null, specEl: null },
            pin4:  { nameEl: null, specEl: null }
        };

        const modernSpecs = {
            cpu:   { spec: 'LGA-1700 Socket • Core i9-14900K',  tag: 'PROCESSOR' },
            ram:   { spec: 'Dual DIMM DDR5 • 6000MHz CL30',     tag: 'MEMORY'    },
            gpu:   { spec: 'RTX 4090 • PCIe x16 Gen5',          tag: 'GRAPHICS'  },
            pcie:  { spec: 'Wi-Fi 7 / PCIe 4.0 x4',            tag: 'EXPANSION' },
            sata:  { spec: '6Gbps Storage Bus • SATA III',      tag: 'STORAGE'   },
            pin24: { spec: 'Main Board +12V / +5V / +3.3V',     tag: 'POWER'     },
            pin4:  { spec: '8-Pin EPS +12V CPU Power',          tag: 'POWER'     }
        };

        const classicSpecs = {
            cpu:   { spec: 'LGA-1700 Socket • Core i9',         tag: 'PROCESSOR' },
            ram:   { spec: 'Dual DIMM • 6000MHz',               tag: 'MEMORY'    },
            gpu:   { spec: 'RTX 4090 • Dedicated Video',        tag: 'GRAPHICS'  },
            pcie:  { spec: 'Wi-Fi 7 / High-Speed I/O',          tag: 'EXPANSION' },
            sata:  { spec: '6Gbps Storage Bus',                 tag: 'STORAGE'   },
            pin24: { spec: 'Main Board +12V/+5V/+3.3V',         tag: 'POWER'     },
            pin4:  { spec: 'Auxiliary EPS CPU Power',           tag: 'POWER'     }
        };

        const specsTable = isModern ? modernSpecs : classicSpecs;

        const compNames = {
            cpu:   isModern ? 'Core i9-14900K' : 'Desktop CPU',
            ram:   isModern ? 'DDR5-6000 Module' : 'DDR5 RAM Module',
            gpu:   isModern ? 'RTX 4090 PCIe x16' : 'PCIe x16 GPU',
            pcie:  isModern ? 'Wi-Fi 7 PCIe Card' : 'PCIe Expansion Card',
            sata:  isModern ? 'SATA 6Gbps Cable' : 'SATA III Data Cable',
            pin24: isModern ? '24-Pin Main Power' : '24-Pin ATX Power',
            pin4:  isModern ? '8-Pin EPS CPU' : '4-Pin CPU +12V'
        };

        Object.keys(compCards).forEach(id => {
            const compEl = document.getElementById(id);
            if (!compEl) return;

            // Swap image src
            const imgEl = compEl.querySelector('img');
            if (imgEl && imgs[id]) {
                imgEl.src = imgs[id].src;
                imgEl.alt = imgs[id].name;
            }

            // Swap component name
            const nameEl = compEl.querySelector('.comp-name');
            if (nameEl) nameEl.textContent = compNames[id];

            // Swap spec text
            const specEl = compEl.querySelector('.comp-spec');
            if (specEl && specsTable[id]) specEl.textContent = specsTable[id].spec;

            // Swap tag text
            const tagEl = compEl.querySelector('.comp-tag');
            if (tagEl && specsTable[id]) tagEl.textContent = specsTable[id].tag;
        });

        // Update board frame header text
        const frameHeader = document.querySelector('.pcb-meta-tag');
        if (frameHeader) {
            frameHeader.textContent = isModern
                ? 'PCB ID: Z890-CYBERNETIX // LGA-1700 SOCKET • DDR5 • PCIe 5.0'
                : 'PCB ID: ATX-MB-REV4 // SOCKET 1700 CHASSIS';
        }

        // Update PCB title in frame
        const stageName = document.getElementById('stageName');
        if (stageName) {
            stageName.textContent = isModern ? 'Z890 Cybernetix Assembly' : 'Motherboard Assembly';
        }
    }

    const stage1Specs = {
        cpu: { name: "Central Processing Unit (CPU)", desc: "The core processor socket (LGA-1700). Executes all machine code and computing logic." },
        ram: { name: "DDR5 High-Speed RAM Slots", desc: "Ultra-fast volatile system memory delivering 6000MHz bandwidth for active computing." },
        pcie: { name: "PCIe 4.0 x1 Expansion Slot", desc: "High-bandwidth expansion socket for sound cards, Wi-Fi 7 adapters, or peripherals." },
        sata: { name: "SATA III 6Gbps Data Connector", desc: "Direct Serial ATA interface routing storage drives directly to the chipset." },
        gpu: { name: "PCIe 5.0 x16 Primary GPU Slot", desc: "Dedicated high-bandwidth graphics card slot providing 16 direct CPU lanes." },
        pin24: { name: "24-Pin ATX Main Power", desc: "Primary motherboard power harness distributing +3.3V, +5V, and +12V rails." },
        pin4: { name: "4-Pin CPU +12V EPS Power", desc: "Dedicated auxiliary power header delivering isolated +12V power to CPU VRMs." }
    };

    // ===================================================
    // CANVAS VICTORY SPARKS & CONFETTI ENGINE
    // ===================================================
    function startVictorySparks() {
        if (!sparksCanvas) return;
        const ctx = sparksCanvas.getContext('2d');
        sparksCanvas.width = window.innerWidth;
        sparksCanvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#00f5ff', '#00ff88', '#ffb700', '#ffffff', '#a855f7'];

        for (let i = 0; i < 160; i++) {
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
    // AUDIO INITIALIZATION
    // ===================================================
    function initAudio() {
        if (gameMusic) {
            gameMusic.volume = 0.25;
            gameMusic.loop = true;
            
            let playPromise = gameMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log("Stage 1 background audio active");
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
    initAudio();

    // ===================================================
    // UI REFRESH & COUNTER UPDATES
    // ===================================================
    function updatePlacedCounter() {
        const placed = Object.keys(zoneAssignments).length;
        if (placedCounter) {
            placedCounter.textContent = `${placed}/7`;
        }

        if (pcbStatus) {
            if (isGameOver) {
                pcbStatus.textContent = "STATUS: 💀 SYSTEM HALTED • SHORT CIRCUIT DETECTED";
                pcbStatus.style.color = "var(--crimson-primary)";
            } else if (placed === 0) {
                pcbStatus.textContent = "STATUS: AWAITING COMPONENTS";
                pcbStatus.style.color = "#7ba2c2";
            } else if (placed < 7) {
                pcbStatus.textContent = `STATUS: ${placed}/7 SLOTS OCCUPIED`;
                pcbStatus.style.color = "var(--cyan-primary)";
            } else {
                pcbStatus.textContent = "STATUS: ALL SLOTS MOUNTED • READY FOR POWER";
                pcbStatus.style.color = "var(--emerald-primary)";
            }
        }

        if (powerStatusLabel) {
            if (isGameOver) {
                powerStatusLabel.textContent = "GAME OVER";
                powerStatusLabel.style.color = "var(--crimson-primary)";
            } else if (placed === 7 && !powerUsed) {
                powerStatusLabel.textContent = "READY TO IGNITE";
                powerStatusLabel.style.color = "var(--amber-primary)";
            } else if (gameWon) {
                powerStatusLabel.textContent = "SYSTEM ONLINE";
                powerStatusLabel.style.color = "var(--emerald-primary)";
            } else {
                powerStatusLabel.textContent = "BOOT PCB";
                powerStatusLabel.style.color = "var(--cyan-primary)";
            }
        }
    }

    // ===================================================
    // TIMER & SCORE ENGINE
    // ===================================================
    function updateTimer() {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        if (timerDisplay) {
            timerDisplay.textContent = `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
        }

        if (timerPill) {
            if (timeLeft <= 15) {
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
                if (timerInterval) {
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
                            window.AuthEngine.logStageCompletion(1, score, 'Time Expired');
                        } catch (err) {}
                    }
                    showAlert("⏰ Time's Up!", `System assembly window expired.\nEarned Score: ${score} PTS.\nClick RESET STAGE to retry for a higher score!`, "⏳", "OKAY");
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
            gameMusic.play().catch(()=>{});
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
    // DRAG & DROP LOGIC
    // ===================================================
    function dragStart(e) {
        if (!gameActive || powerUsed || isGameOver) {
            e.preventDefault();
            return false;
        }

        soundFx.blip();
        if (dragSound) {
            dragSound.currentTime = 0;
            dragSound.play().catch(()=>{});
        }
        
        const comp = e.target.closest('.component');
        if (!comp) return;
        
        e.dataTransfer.setData("text/plain", comp.id);
        comp.classList.add('dragging');
    }

    function dragOver(e) {
        if (gameActive && !powerUsed && !isGameOver) {
            e.preventDefault();
        }
    }

    function dragEnd(e) {
        const comp = e.target.closest('.component');
        if (comp) comp.classList.remove('dragging');
    }

    function drop(e) {
        e.preventDefault();
        if (!gameActive || powerUsed || isGameOver) return;

        const zone = e.target.closest(".drop-zone");
        if (!zone) return;
        
        const draggedId = e.dataTransfer.getData("text/plain");
        const accept = zone.dataset.accept;
        const draggedEl = document.getElementById(draggedId);

        if (!draggedEl) return;

        if (draggedEl.style.opacity === "0.32" || draggedEl.classList.contains('disabled')) {
            gameMessage.innerText = '⚠️ Component already mounted!';
            soundFx.errorBuzz();
            return;
        }

        if (zoneAssignments[accept]) {
            gameMessage.innerText = '⚠️ This socket already contains a component!';
            soundFx.errorBuzz();
            return;
        }

        zoneAssignments[accept] = draggedId;
        soundFx.snap();
        
        if (dropSound) {
            dropSound.currentTime = 0;
            dropSound.play().catch(()=>{});
        }

        draggedEl.classList.add('disabled');
        draggedEl.draggable = false;
        
        const img = getActiveComponentImages()[draggedId];
        zone.innerHTML = `<img src="${img.src}" alt="${img.name}" style="width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 6px 14px rgba(0,0,0,0.9)); opacity:0.95;">`;
        
        const compName = draggedEl.querySelector('.comp-name')?.textContent || draggedId.toUpperCase();

        if (draggedId === accept) {
            // Speed scoring calculation (100 PTS Max Scale):
            // Base placement score: 5 pts (7 x 5 = 35 pts)
            // Speed bonus: up to +5 pts based on remaining time (timeLeft / 120 * 5) -> (7 x 5 = 35 pts)
            // Max from mounting: 70 pts
            const basePts = 5;
            const speedBonus = Math.max(0, Math.round((timeLeft / STAGE1_DURATION) * 5));
            const earnedPts = basePts + speedBonus;
            
            score = Math.min(100, score + earnedPts);
            updateScore();
            if (speedBonus >= 3) {
                soundFx.speedBonus();
            }

            if (speedBonus > 0) {
                gameMessage.innerHTML = `✅ Mounted: ${compName} <strong style="color:var(--cyan-primary); text-shadow:0 0 10px rgba(0,243,255,0.7);">[+${earnedPts} PTS · ⚡ +${speedBonus} SPEED]</strong>`;
            } else {
                gameMessage.innerHTML = `✅ Mounted: ${compName} <strong style="color:var(--emerald-primary);">[+${earnedPts} PTS]</strong>`;
            }

            spawnSpeedBonusSpark(zone, `+${earnedPts} PTS${speedBonus > 0 ? ' ⚡' : ''}`);
        } else {
            gameMessage.innerText = `🔧 Socketed: ${compName} (verify socket with POWER)`;
        }

        updatePlacedCounter();

        // When all 7 slots are mounted, automatically trigger power sequence after 750ms
        const totalPlaced = Object.keys(zoneAssignments).length;
        if (totalPlaced === 7 && !powerUsed && !isGameOver) {
            gameMessage.innerHTML = '⚡ <strong style="color:var(--emerald-primary); text-shadow:0 0 10px rgba(0,255,136,0.6);">ALL 7 SICK SOCKETS MOUNTED! INITIATING POST POWER SEQUENCE...</strong>';
            if (powerBtn) {
                powerBtn.classList.add("on");
            }
            setTimeout(() => {
                if (!powerUsed && !isGameOver && Object.keys(zoneAssignments).length === 7) {
                    powerOn();
                }
            }, 750);
        }
    }

    // ===================================================
    // COMPONENT SHUFFLE & STAGGERED INTRO
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
        const comps = Array.from(componentContainer.children);
        const shuffled = shuffleArray(comps);
        componentContainer.innerHTML = '';
        shuffled.forEach(comp => componentContainer.appendChild(comp));
        
        setTimeout(() => {
            document.querySelectorAll('.component').forEach((c, idx) => {
                setTimeout(() => c.classList.add('show'), idx * 80);
            });
        }, 50);
    }

    function resetComponentStates() {
        document.querySelectorAll('.component').forEach(c => {
            c.draggable = true;
            c.style.opacity = "";
            c.classList.remove('disabled');
            c.classList.remove('dragging');
            c.classList.remove('show');
        });
    }

    function clearDropZones() {
        dropZones.forEach(z => {
            z.classList.remove("correct", "wrong");
            z.innerHTML = "";
            z.classList.add('active');
        });
    }

    // ===================================================
    // LED DIAGNOSTICS POST INDICATORS
    // ===================================================
    function updateLedDiagnostics(cpuOk, ramOk, gpuOk, pwrOk, showRed = false) {
        const ledCpu = document.getElementById('ledCpu');
        const ledRam = document.getElementById('ledRam');
        const ledGpu = document.getElementById('ledGpu');
        const ledPwr = document.getElementById('ledPwr');

        const getClass = (ok) => ok ? 'active-green' : (showRed ? 'active-red' : '');
        if (ledCpu) ledCpu.className = 'led-dot ' + getClass(cpuOk);
        if (ledRam) ledRam.className = 'led-dot ' + getClass(ramOk);
        if (ledGpu) ledGpu.className = 'led-dot ' + getClass(gpuOk);
        if (ledPwr) ledPwr.className = 'led-dot ' + getClass(pwrOk);
    }

    // ===================================================
    // POWER-ON SEQUENCE & VICTORY LOGIC
    // ===================================================
    function powerOn() {
        soundFx.blip();
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.play().catch(()=>{});
        }

        if (isGameOver) {
            showAlert("💀 GAME OVER", "The motherboard is offline due to a fatal short circuit.\n\nPlease click RESET STAGE to start a new game.", "💀", "OKAY");
            return;
        }

        if (!gameActive) {
            showAlert("Cannot Power On", "Please start or reset the game first!", "⚠️");
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
            showAlert("⚠️ Incomplete Assembly", "Please mount all 7 hardware components into their motherboard sockets before initiating power!", "🔌");
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
                wrongCount++;
                score = Math.max(0, score - 5);
                wrongPlacements.push({ zone, accept, placedId });
            }
        });
        
        updateScore();
        
        const cpuPlaced = zoneAssignments['cpu'] === 'cpu';
        const ramPlaced = zoneAssignments['ram'] === 'ram';
        const gpuPlaced = zoneAssignments['gpu'] === 'gpu';
        const pwrPlaced = zoneAssignments['pin24'] === 'pin24' && zoneAssignments['pin4'] === 'pin4';

        if (correctCount === 7) {
            dropZones.forEach(zone => {
                zone.classList.add("correct");
                const accept = zone.dataset.accept;
                const img = getActiveComponentImages()[accept];
                zone.innerHTML = `<img src="${img.src}" style="width:100%; height:100%; object-fit:contain; opacity:1;">`;
            });
            updateLedDiagnostics(cpuPlaced, ramPlaced, gpuPlaced, pwrPlaced, false);
            // VICTORY COMPLETE
            if (gameMusic) gameMusic.pause();
            soundFx.victoryChime();
            if (successSound) {
                successSound.currentTime = 0;
                successSound.play().catch(()=>{});
            }

            gameWon = true;
            gameActive = false;
            clearInterval(timerInterval);
            timerInterval = null;
    
            if (powerBtn) powerBtn.classList.add("on");
            if (board) board.style.boxShadow = '0 0 35px var(--emerald-primary), 0 0 70px rgba(0,255,136,0.3) inset';
            
            const circuitPulse = document.getElementById('circuitPulse');
            if (circuitPulse) circuitPulse.classList.add('active');

            // Power POST Check & Remaining Time Bonus (Max 100 PTS Scale):
            // +10 PTS for flawless POST + up to +20 PTS for remaining time
            const timeBonus = Math.min(20, Math.round((timeLeft / STAGE1_DURATION) * 20));
            score = Math.min(100, score + 10 + timeBonus);
            updateScore();

            // Save Progress
            localStorage.setItem('stage1_completed', 'true');
            localStorage.setItem('stage1_score', String(score));
            if (window.AuthEngine && typeof window.AuthEngine.logStageCompletion === 'function') {
                try {
                    window.AuthEngine.logStageCompletion(1, score, 'Completed');
                } catch (authErr) {
                    console.error("AuthEngine error in stage1:", authErr);
                }
            }
            
            // Unlock Next Stage Button
            if (nextStageBadge) {
                nextStageBadge.textContent = "UNLOCKED ➔";
            }
            if (nextStageBtn) {
                nextStageBtn.style.borderColor = "var(--emerald-primary)";
                nextStageBtn.style.boxShadow = "0 0 25px var(--emerald-primary)";
            }

            startVictorySparks();
            updatePlacedCounter();
            gameMessage.innerText = "⚡ POST CHECK PASSED! MOTHERBOARD FULLY OPERATIONAL!";

            setTimeout(() => {
                showAlert(
                    "🎉 STAGE COMPLETE!",
                    `All 7 components connected with full signal integrity!\n\n⚡ Time Remaining: ${timeLeft}s\n⏱️ Speed Time Bonus: +${timeBonus} PTS\n🏆 Final Score: ${score}/100 PTS\n\nStage 2: Back Panel Challenge is now unlocked!`,
                    "🏆",
                    "CONTINUE TO STAGE 2 ➔",
                    () => {
                        window.location.href = "stage2.html";
                    }
                );
            }, 600);
            
        } else {
            // GAME OVER - POWER SEQUENCE FAILED
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
                    window.AuthEngine.logStageCompletion(1, score, 'Power Failed');
                } catch (authErr) {}
            }
            soundFx.gameOver();
            if (errorSound) {
                errorSound.currentTime = 0;
                errorSound.play().catch(()=>{});
            }

            if (powerBtn) powerBtn.classList.remove("on");
            if (board) board.style.boxShadow = ''; // No error glow on board to keep it hard to identify

            // Remove any error / correct indicator on all dropzones - make it hard for player to identify
            dropZones.forEach(zone => {
                zone.classList.remove("wrong", "correct", "active", "drag-over");
            });

            // Disable all components in inventory dock - game is over, do not allow continuing
            document.querySelectorAll('.component').forEach(comp => {
                comp.classList.add('disabled');
                comp.draggable = false;
            });

            // Neutral diagnostics: do not reveal which components were wrong
            updateLedDiagnostics(false, false, false, false, false);

            if (powerStatusLabel) {
                powerStatusLabel.textContent = "GAME OVER";
                powerStatusLabel.style.color = "var(--crimson-primary)";
            }

            if (pcbStatus) {
                pcbStatus.textContent = "STATUS: 💀 SYSTEM HALTED • SHORT CIRCUIT DETECTED";
                pcbStatus.style.color = "var(--crimson-primary)";
            }

            if (gameMessage) {
                gameMessage.innerText = "💀 GAME OVER: Power sequence failed! System halted. Click RESET STAGE to retry.";
            }

            // Highlight RESET STAGE button to guide user to restart
            if (resetStageBtn) {
                resetStageBtn.style.borderColor = "var(--cyan-primary)";
                resetStageBtn.style.boxShadow = "0 0 20px var(--cyan-primary)";
            }

            // Display Game Over alert with OKAY button
            showAlert(
                "💀 GAME OVER",
                "Critical short circuit! Incorrect component placement detected.\n\nThe motherboard suffered a fatal electrical surge and cannot boot.\nClick RESET STAGE to start a new attempt.",
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
        timeLeft = STAGE1_DURATION;
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

        const circuitPulse = document.getElementById('circuitPulse');
        if (circuitPulse) circuitPulse.classList.remove('active');

        updateLedDiagnostics(false, false, false, false);
        
        resetComponentStates();
        clearDropZones();
        shuffleComponents();
        
        updateScore();
        updateTimer();
        updatePlacedCounter();
        
        // Start timer only if motherboard has already been selected by player
        if (hasChosenMotherboard) {
            startTimer();
            if (gameMusic && gameMusic.paused && !gameWon) {
                gameMusic.play().catch(()=>{});
            }
        }
        
        if (gameMessage) gameMessage.innerText = 'Socket all 7 components into the motherboard and initiate power.';
        if (powerBtn) powerBtn.classList.remove("on");
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
            window.location.href = 'stage2.html';
        } else if (Object.keys(zoneAssignments).length === 7 && !powerUsed) {
            powerOn();
        } else {
            showAlert("Stage Locked", "Mount all 7 hardware components into their motherboard sockets first!", "🔒");
        }
    }

    // ===================================================
    // STORY & TUTORIAL ENGINES
    // ===================================================
    function playStage1Story(onComplete) {
        if (window.StoryEngine) {
            window.StoryEngine.showStory({
                title: "CONVENIRE: ACT I — THE MOTHERBOARD AWAKENING",
                badge: "STAGE 01",
                avatar: "👩‍🔧",
                avatarName: "The First Assembler Maya",
                speaker: "CHIEF ARCHITECT MAYA",
                dialogues: [
                    "In the digital wastes, dormant silicon awaits reconstruction: CPUs, high-speed RAM DIMMs, and PCIe graphics cards.",
                    "Your objective is to mount each core component—Processor, DDR5 RAM, PCIe GPU, Expansion Card, SATA Bus, and ATX Power Connectors—into its physical socket.",
                    "Hover over components to inspect specifications, or click '✋ TUTORIAL' for guidance. Once fully populated, hit ⏻ POWER to awaken the PCB!",
                    "Let the voltage flow. Good luck, Assembler."
                ],
                onComplete: onComplete
            });
        } else {
            if (typeof onComplete === 'function') onComplete();
        }
    }

    function startStage1Tutorial() {
        soundFx.blip();
        if (window.TutorialEngine) {
            window.TutorialEngine.runHandSimulation([
                { sourceId: "cpu", targetZoneAccept: "cpu", instruction: "Drag CPU into LGA-1700 Socket!" },
                { sourceId: "ram", targetZoneAccept: "ram", instruction: "Drag RAM module into DDR5 Slots!" },
                { sourceId: "gpu", targetZoneAccept: "gpu", instruction: "Drag GPU into PCIe 5.0 x16 Slot!" }
            ], function() {
                if (gameMessage) gameMessage.innerText = "💡 Tutorial complete! Socket all remaining hardware components.";
            });
        }
    }

    // ===================================================
    // KEYBOARD SHORTCUTS
    // ===================================================
    document.addEventListener('keydown', (e) => {
        // Avoid triggering when user is in input/modal
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.code === 'Space') {
            e.preventDefault();
            powerOn();
        } else if (e.code === 'KeyR') {
            resetStage();
        } else if (e.code === 'KeyS') {
            if (timerInterval) clearInterval(timerInterval);
            playStage1Story(() => {
                if (hasChosenMotherboard && gameActive && !isGameOver && !gameWon) {
                    startTimer();
                }
            });
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
    document.querySelectorAll('.component').forEach(comp => {
        comp.addEventListener('dragstart', dragStart);
        comp.addEventListener('dragend', dragEnd);
        comp.addEventListener('mouseenter', () => soundFx.blip());
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
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

    if (resetStageBtn) resetStageBtn.addEventListener('click', resetStage);
    if (backToMenuBtn) backToMenuBtn.addEventListener('click', backToMenu);
    if (nextStageBtn) nextStageBtn.addEventListener('click', nextStage);
    if (powerBtn) powerBtn.addEventListener('click', powerOn);

    const storyBriefBtn = document.getElementById('storyBriefBtn');
    if (storyBriefBtn) {
        storyBriefBtn.addEventListener('click', () => {
            if (timerInterval) clearInterval(timerInterval);
            playStage1Story(() => {
                if (hasChosenMotherboard && gameActive && !isGameOver && !gameWon) {
                    startTimer();
                }
            });
        });
    }

    // Initialize Game & Component Tooltips
    resetStage();
    if (window.TutorialEngine) {
        window.TutorialEngine.initComponentTooltips(stage1Specs);
    }

    // Start video background
    const gameplayVideo = document.getElementById('gameplayVideo');
    if (gameplayVideo) {
        gameplayVideo.play().catch(() => console.log("Video autoplay prevented"));
    }

    // ===================================================
    // MAP SELECTION SCREEN LOGIC
    // ===================================================
    (function initMapSelection() {
        const overlay      = document.getElementById('mapSelectionOverlay');
        const cardClassic  = document.getElementById('mapCardClassic');
        const cardModern   = document.getElementById('mapCardModern');
        const boardImg     = document.querySelector('.board-img');

        if (!overlay) {
            hasChosenMotherboard = true;
            startTimer();
            return;
        }

        // Map config: src of each motherboard image
        const mapSources = {
            classic: 'images/map.png',
            modern:  'images/modern_map.jpg'
        };

        function selectMap(mapKey) {
            selectedMap = mapKey;
            hasChosenMotherboard = true;

            // Swap the board image
            if (boardImg) {
                boardImg.src = mapSources[mapKey];
                if (mapKey === 'modern') {
                    boardImg.classList.add('modern-map');
                } else {
                    boardImg.classList.remove('modern-map');
                }
            }

            // Add/remove modern class on the board container for CSS targeting
            if (board) {
                if (mapKey === 'modern') {
                    board.classList.add('modern-active');
                } else {
                    board.classList.remove('modern-active');
                }
            }

            // Apply the correct drop zone positions for this map
            applyDropZoneLayout(mapKey);

            // Swap component images & specs in the left panel
            applyComponentUI(mapKey);

            // Play a satisfying blip
            soundFx.blip();

            // Start 90s timer (1:30) immediately upon selecting the motherboard
            timeLeft = STAGE1_DURATION;
            updateTimer();
            startTimer();

            // Start gameplay background music
            if (gameMusic && gameMusic.paused && !gameWon) {
                gameMusic.play().catch(()=>{});
            }

            // Animate overlay out
            overlay.classList.add('fade-out');
            overlay.addEventListener('animationend', function onEnd() {
                overlay.removeEventListener('animationend', onEnd);
                overlay.style.display = 'none';
            }, { once: true });
        }

        // Click / keyboard handlers for both cards
        [cardClassic, cardModern].forEach(card => {
            if (!card) return;
            card.addEventListener('click', () => selectMap(card.dataset.map));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectMap(card.dataset.map);
                }
            });
        });
    })();
})();