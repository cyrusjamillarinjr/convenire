/* ==========================================================================
   CONVENIRE - Computer Hardware Educational Puzzle Game
   JavaScript Interactive Gaming Engine, 3D Story Lore Movie & Audio Synthesizer
   ========================================================================== */

// --- SYNTHESIZED WEB AUDIO API SOUND ENGINE ---
const ConvenireAudio = (() => {
  let audioCtx = null;
  let sfxEnabled = true;

  function initCtx() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type, duration, startGain = 0.1, endGain = 0.001) {
    if (!sfxEnabled) return;
    try {
      initCtx();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(startGain, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(endGain, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio playTone failed", e);
    }
  }

  return {
    toggleSFX() {
      sfxEnabled = !sfxEnabled;
      return sfxEnabled;
    },
    isSFXEnabled() {
      return sfxEnabled;
    },
    playClick() {
      playTone(600, 'sine', 0.08, 0.08);
    },
    playSnap() {
      playTone(400, 'triangle', 0.12, 0.15);
      setTimeout(() => playTone(800, 'sine', 0.1, 0.12), 40);
    },
    playCorrect() {
      playTone(523.25, 'sine', 0.15, 0.12);
      setTimeout(() => playTone(659.25, 'sine', 0.15, 0.12), 100);
      setTimeout(() => playTone(783.99, 'sine', 0.25, 0.15), 200);
    },
    playWrong() {
      playTone(180, 'sawtooth', 0.25, 0.2);
      setTimeout(() => playTone(140, 'sawtooth', 0.3, 0.2), 100);
    },
    playPowerOn() {
      playTone(300, 'sine', 0.2, 0.15);
      setTimeout(() => playTone(450, 'sine', 0.2, 0.15), 150);
      setTimeout(() => playTone(600, 'sine', 0.3, 0.2), 300);
      setTimeout(() => playTone(900, 'triangle', 0.5, 0.25), 450);
    },
    playVictory() {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 'triangle', 0.3, 0.2), i * 140);
      });
    }
  };
})();

// MAIN INITIALIZER
document.addEventListener('DOMContentLoaded', () => {

  // --- 0. PRELOADER SCREEN ---
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloaderBar');
  const preloaderPercent = document.getElementById('preloaderPercent');
  const preloaderStatus = document.getElementById('preloaderStatus');

  if (preloader && preloaderBar && preloaderPercent) {
    let loadProgress = 0;
    const statuses = [
      'INITIALIZING HARDWARE ENGINE...',
      'COMPILING PUZZLE SYSTEM...',
      'CALIBRATING HARDWARE BLUEPRINTS...',
      'SYSTEM ACTIVE'
    ];
    
    const loadInterval = setInterval(() => {
      loadProgress += Math.floor(Math.random() * 14) + 6;
      if (loadProgress > 100) loadProgress = 100;
      
      preloaderBar.style.width = `${loadProgress}%`;
      preloaderPercent.textContent = `${loadProgress}%`;
      
      const statusIdx = Math.min(statuses.length - 1, Math.floor((loadProgress / 100) * statuses.length));
      if (preloaderStatus) preloaderStatus.textContent = statuses[statusIdx];

      if (loadProgress >= 100) {
        clearInterval(loadInterval);
        setTimeout(() => {
          preloader.classList.add('fade-out');
        }, 300);
      }
    }, 60);
  }

  // --- 1. CUSTOM NEON CURSOR CONTROLLER ---
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  if (cursorDot && cursorRing) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    function renderCursor() {
      ringX += (mouseX - ringX) * 0.2;
      ringY += (mouseY - ringY) * 0.2;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(renderCursor);
    }
    renderCursor();
  }

  // --- 2. MOBILE NAVBAR TOGGLE & SMOOTH SCROLL SPY ---
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('#navMenu a');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      ConvenireAudio.playClick();
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      if (navMenu && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
      }
      ConvenireAudio.playClick();
    });
  });

  // --- 3.5. 3D STORY LORE MOVIE ANIMATED CANVAS ENGINE ---
  const storyCanvas = document.getElementById('storyLoreVideoCanvas');
  const storyChapterBadge = document.getElementById('storyChapterBadge');
  const narrativeChapterTag = document.getElementById('narrativeChapterTag');
  const narrativeTitle = document.getElementById('narrativeTitle');
  const narrativeText = document.getElementById('narrativeText');
  const lorePlayPauseBtn = document.getElementById('lorePlayPauseBtn');
  const loreResetBtn = document.getElementById('loreResetBtn');
  const storyTimelineProgress = document.getElementById('storyTimelineProgress');
  const storyChapterBtns = document.querySelectorAll('.chapter-tab-btn');

  const storyChapters = [
    {
      badge: 'CHAPTER I / V: THE FRAGMENTATION',
      tag: 'AGE OF THE SILENCE',
      title: 'Chapter I: The Fragmentation',
      text: 'Long before the first motherboard hummed to life, there was only the Fragmentation — a scattering of components across the digital wastes: shattered CPUs, corrupted RAM shards, GPUs half-buried in silicon dust. No machine could run. No system could think. The world called this age the Silence.',
      color: '#00f2fe'
    },
    {
      badge: 'CHAPTER II / V: THE ASSEMBLER',
      tag: 'RISE OF THE BUILDER',
      title: 'Chapter II: The Assembler',
      text: 'From the digital ruins arose the First Assembler — a visionary builder who discovered that silicon components possessed hidden harmony. By aligning pin connectors and socket keys with mathematical precision, energy began to flow back into dead motherboards.',
      color: '#00d2ff'
    },
    {
      badge: 'CHAPTER III / V: THE CONVENIRES',
      tag: 'FORMATION OF THE GUILD',
      title: 'Chapter III: The Convenires',
      text: 'The Assembler gathered scholars across North Negros to master computer hardware engineering. Together, they established the Convenires — guardians of hardware knowledge who vowed to teach every student the sacred art of PC assembly and system diagnostics.',
      color: '#00a8ff'
    },
    {
      badge: 'CHAPTER IV / V: THE ASSEMBLY RACE',
      tag: 'THE SPEED TEST',
      title: 'Chapter IV: The Assembly Race',
      text: 'To prove their mastery, builders competed in high-speed hardware assembly arenas. Players identified socket LGA-1700 pinouts, seated PCIe graphics cards under pressure, and diagnosed faulty capacitors before thermal limits were breached.',
      color: '#4facfe'
    },
    {
      badge: 'CHAPTER V / V: END THE SILENCE',
      tag: 'SYSTEM POST SUCCESS',
      title: 'Chapter V: End The Silence',
      text: 'With all 5 hardware components assembled, the master power switch was toggled. A surge of electric cyan light illuminated the motherboard, fans spun to 3000 RPM, and the POST speaker chimed victory. The Silence was ended forever.',
      color: '#0072ff'
    }
  ];

  let currentChapterIdx = 0;
  let isStoryAutoPlaying = false;
  let storyAutoInterval = null;
  let storyParticleTime = 0;

  function setStoryChapter(index) {
    currentChapterIdx = index;
    const cData = storyChapters[index];

    storyChapterBtns.forEach((btn, i) => {
      if (i === index) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    if (storyChapterBadge) storyChapterBadge.textContent = cData.badge;
    if (narrativeChapterTag) narrativeChapterTag.textContent = cData.tag;
    if (narrativeTitle) {
      narrativeTitle.textContent = cData.title;
      narrativeTitle.style.color = cData.color;
    }
    if (narrativeText) narrativeText.textContent = cData.text;
    if (storyTimelineProgress) {
      storyTimelineProgress.style.width = `${((index + 1) / storyChapters.length) * 100}%`;
    }
  }

  storyChapterBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      setStoryChapter(i);
      ConvenireAudio.playClick();
    });
  });

  if (lorePlayPauseBtn) {
    lorePlayPauseBtn.addEventListener('click', () => {
      isStoryAutoPlaying = !isStoryAutoPlaying;
      if (isStoryAutoPlaying) {
        lorePlayPauseBtn.textContent = '⏸ Pause Lore Movie';
        lorePlayPauseBtn.classList.remove('btn-primary');
        lorePlayPauseBtn.classList.add('btn-secondary');
        storyAutoInterval = setInterval(() => {
          setStoryChapter((currentChapterIdx + 1) % storyChapters.length);
          ConvenireAudio.playClick();
        }, 5000);
      } else {
        lorePlayPauseBtn.textContent = '▶ Auto-Play Lore Movie';
        lorePlayPauseBtn.classList.remove('btn-secondary');
        lorePlayPauseBtn.classList.add('btn-primary');
        clearInterval(storyAutoInterval);
      }
      ConvenireAudio.playClick();
    });
  }

  if (loreResetBtn) {
    loreResetBtn.addEventListener('click', () => {
      setStoryChapter(0);
      if (isStoryAutoPlaying && lorePlayPauseBtn) {
        lorePlayPauseBtn.click();
      }
      ConvenireAudio.playSnap();
    });
  }

  // 3D Canvas Visual Renderer Loop for Story Canvas
  if (storyCanvas) {
    const ctx = storyCanvas.getContext('2d');

    function renderStoryCanvas() {
      storyParticleTime += 0.02;
      ctx.clearRect(0, 0, storyCanvas.width, storyCanvas.height);

      // Dark background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, storyCanvas.width, storyCanvas.height);
      bgGrad.addColorStop(0, '#060a16');
      bgGrad.addColorStop(1, '#0a1428');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, storyCanvas.width, storyCanvas.height);

      const color = storyChapters[currentChapterIdx].color;
      const centerX = storyCanvas.width / 2;
      const centerY = storyCanvas.height / 2;

      // Draw Rotating 3D Holographic Core Rings
      for (let r = 1; r <= 3; r++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(storyParticleTime * (r % 2 === 0 ? 0.8 : -0.8));
        ctx.beginPath();
        ctx.ellipse(0, 0, 80 * r, 30 * r, Math.PI / 4, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.35 / r;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Draw Floating Quantum Hardware Particles
      for (let i = 0; i < 20; i++) {
        const px = (centerX + Math.cos(storyParticleTime + i) * (60 + i * 8));
        const py = (centerY + Math.sin(storyParticleTime * 1.2 + i) * (40 + i * 5));
        ctx.beginPath();
        ctx.arc(px, py, 3 + (i % 3), 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.6;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fill();
      }

      // Center Chapter Emblem Core
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(storyParticleTime * 0.5);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.2;
      ctx.fillRect(-35, -35, 70, 70);
      ctx.strokeStyle = '#ffffff';
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 2;
      ctx.strokeRect(-35, -35, 70, 70);
      ctx.restore();

      requestAnimationFrame(renderStoryCanvas);
    }
    renderStoryCanvas();
  }

  // --- 3. ANIMATED STAT COUNTERS ---
  const counters = document.querySelectorAll('.counter[data-target]');
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'), 10);
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 40));
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            counter.textContent = target;
            clearInterval(timer);
          } else {
            counter.textContent = current;
          }
        }, 30);
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  // --- 4. GAME ARENA NAVIGATION TABS ---
  const gameTabs = document.querySelectorAll('.game-tab-btn');
  const gameViews = document.querySelectorAll('.game-view');

  gameTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetGame = tab.getAttribute('data-game');
      gameTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      gameViews.forEach(view => {
        if (view.id === `${targetGame}View`) {
          view.classList.add('active');
        } else {
          view.classList.remove('active');
        }
      });
      ConvenireAudio.playClick();
    });
  });

  // --- 5. PC ASSEMBLY BUILDER ENGINE (DRAG & DROP / SNAP) ---
  const partItems = document.querySelectorAll('.part-item');
  const dropZones = document.querySelectorAll('.drop-zone');
  const applyPasteBtn = document.getElementById('applyThermalPasteBtn');
  const powerOnBtn = document.getElementById('powerOnPcBtn');
  const assemblyStatus = document.getElementById('assemblyStatus');
  let thermalPasteApplied = false;
  let installedParts = 0;

  partItems.forEach(part => {
    part.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', part.getAttribute('data-part'));
      part.classList.add('dragging');
      ConvenireAudio.playClick();
    });

    part.addEventListener('dragend', () => {
      part.classList.remove('dragging');
    });

    // Touch / Click Support for Mobile / Click to Snap
    part.addEventListener('click', () => {
      const partName = part.getAttribute('data-part');
      const targetZone = document.querySelector(`.drop-zone[data-slot="${partName}"]`);
      if (targetZone && !targetZone.classList.contains('filled')) {
        snapPartToZone(part, targetZone);
      }
    });
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
      e.preventDefault();
      zone.classList.remove('drag-over');
      const partName = e.dataTransfer.getData('text/plain');
      const matchingPart = document.querySelector(`.part-item[data-part="${partName}"]`);

      if (matchingPart && zone.getAttribute('data-slot') === partName) {
        snapPartToZone(matchingPart, zone);
      } else {
        ConvenireAudio.playWrong();
      }
    });
  });

  function snapPartToZone(part, zone) {
    if (zone.classList.contains('filled')) return;

    zone.classList.add('filled');
    zone.querySelector('.zone-status').textContent = 'Installed ✓';
    zone.querySelector('.zone-status').style.color = '#00f2fe';
    part.classList.add('used');
    part.style.opacity = '0.5';
    part.style.pointerEvents = 'none';

    installedParts++;
    ConvenireAudio.playSnap();

    if (installedParts >= 5 && assemblyStatus) {
      assemblyStatus.textContent = 'All hardware sockets filled! Click Power On system to test.';
    }
  }

  if (applyPasteBtn) {
    applyPasteBtn.addEventListener('click', () => {
      thermalPasteApplied = true;
      applyPasteBtn.textContent = '🧪 Thermal Paste Applied ✓';
      applyPasteBtn.classList.remove('btn-secondary');
      applyPasteBtn.classList.add('btn-primary');
      applyPasteBtn.disabled = true;
      ConvenireAudio.playCorrect();
    });
  }

  if (powerOnBtn) {
    powerOnBtn.addEventListener('click', () => {
      if (installedParts < 5) {
        alert('Please assemble all 5 hardware components onto the motherboard first!');
        ConvenireAudio.playWrong();
        return;
      }

      const fans = document.querySelectorAll('.mb-fan');
      fans.forEach(f => f.classList.add('spinning'));

      ConvenireAudio.playPowerOn();

      setTimeout(() => {
        ConvenireAudio.playVictory();
        alert('🎉 POST SUCCESSFUL! System booted into BIOS. 3-Star Mastery Awarded!');
      }, 1200);
    });
  }

  // --- 6. GAMESHOW QUIZ ENGINE ---
  const quizQuestions = [
    {
      q: "Which hardware component performs all arithmetic and logic calculations in a computer system?",
      options: ["RAM (Random Access Memory)", "CPU (Central Processing Unit)", "GPU (Graphics Processing Unit)", "SSD (Solid State Drive)"],
      correct: 1
    },
    {
      q: "What component provides high-speed temporary storage for active running programs?",
      options: ["ROM", "Motherboard", "DDR RAM", "Power Supply"],
      correct: 2
    },
    {
      q: "Which expansion slot on the motherboard is designed for high-performance graphics cards?",
      options: ["PCIe x16", "SATA III", "M.2 Key-M", "USB 3.2"],
      correct: 0
    }
  ];

  let currentQuizIdx = 0;
  let quizScore = 0;

  const quizQEl = document.getElementById('quizQuestion');
  const quizOptEls = document.querySelectorAll('.quiz-opt-btn');
  const quizScoreEl = document.getElementById('quizScoreText');

  function loadQuizQuestion() {
    if (!quizQEl || currentQuizIdx >= quizQuestions.length) return;
    const qData = quizQuestions[currentQuizIdx];
    quizQEl.textContent = qData.q;

    quizOptEls.forEach((btn, idx) => {
      btn.textContent = `${['A', 'B', 'C', 'D'][idx]}. ${qData.options[idx]}`;
      btn.classList.remove('correct', 'wrong');
      btn.disabled = false;
    });
  }

  quizOptEls.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      const qData = quizQuestions[currentQuizIdx];
      if (idx === qData.correct) {
        btn.classList.add('correct');
        quizScore += 100;
        if (quizScoreEl) quizScoreEl.textContent = `Score: ${quizScore} XP`;
        ConvenireAudio.playCorrect();
      } else {
        btn.classList.add('wrong');
        quizOptEls[qData.correct].classList.add('correct');
        ConvenireAudio.playWrong();
      }

      quizOptEls.forEach(b => b.disabled = true);

      setTimeout(() => {
        currentQuizIdx = (currentQuizIdx + 1) % quizQuestions.length;
        loadQuizQuestion();
      }, 1600);
    });
  });

  loadQuizQuestion();

  // --- 7. HARDWARE REPAIR TICKETS SIMULATOR ---
  const ticketBtns = document.querySelectorAll('.ticket-item');
  const repairToolBtns = document.querySelectorAll('.tool-btn');
  const nextRepairBtn = document.getElementById('nextRepairBtn');

  ticketBtns.forEach(t => {
    t.addEventListener('click', () => {
      ticketBtns.forEach(b => b.classList.remove('active'));
      t.classList.add('active');
      ConvenireAudio.playClick();
    });
  });

  repairToolBtns.forEach(tb => {
    tb.addEventListener('click', () => {
      repairToolBtns.forEach(b => b.classList.remove('active'));
      tb.classList.add('active');
      ConvenireAudio.playCorrect();
      if (nextRepairBtn) nextRepairBtn.disabled = false;
    });
  });

  if (nextRepairBtn) {
    nextRepairBtn.addEventListener('click', () => {
      alert('Repair Ticket Submitted! Customer diagnostics verified ✓');
      ConvenireAudio.playVictory();
    });
  }

  // --- 8.5. INTERACTIVE TUTORIAL VIDEO & SIMULATOR THEATRE ENGINE ---
  function getRealisticHandVectorSVG() {
    return `
      <svg viewBox="0 0 140 140" class="realistic-hand-vector-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="skinGrad1" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stop-color="#f8d7be" />
            <stop offset="35%" stop-color="#eab58f" />
            <stop offset="75%" stop-color="#cd895e" />
            <stop offset="100%" stop-color="#a8623b" />
          </linearGradient>
          <linearGradient id="skinGradPalm" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fee6d5" />
            <stop offset="50%" stop-color="#e6ad87" />
            <stop offset="100%" stop-color="#c1774d" />
          </linearGradient>
          <linearGradient id="fingerNailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fff5ee" />
            <stop offset="50%" stop-color="#fad6c8" />
            <stop offset="100%" stop-color="#e59e87" />
          </linearGradient>
          <filter id="theatreHandShadow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="3" dy="6" stdDeviation="5" flood-color="#000000" flood-opacity="0.65" />
          </filter>
        </defs>
        <g filter="url(#theatreHandShadow)">
          <path class="hand-wrist" d="M 52 138 C 54 112, 50 96, 55 84 C 66 84, 86 87, 97 92 C 99 108, 97 122, 99 138 Z" fill="url(#skinGrad1)" stroke="#884824" stroke-width="1.2" />
          <path class="hand-palm" d="M 48 86 C 36 74, 37 52, 50 46 C 66 40, 88 44, 98 58 C 105 70, 101 88, 93 92 C 78 96, 60 92, 48 86 Z" fill="url(#skinGradPalm)" stroke="#884824" stroke-width="1.2" />
          <path d="M 55 82 C 60 70, 70 62, 80 60" fill="none" stroke="#ba7045" stroke-width="1.4" stroke-linecap="round" opacity="0.6" />
          <path d="M 64 86 C 74 78, 86 76, 92 82" fill="none" stroke="#ba7045" stroke-width="1.2" stroke-linecap="round" opacity="0.5" />
          <path class="finger-pinky" d="M 94 58 C 105 46, 115 42, 119 46 C 123 52, 115 62, 105 70 C 99 76, 94 72, 94 58 Z" fill="url(#skinGrad1)" stroke="#884824" stroke-width="1.2" />
          <path d="M 113 44 C 116 43, 119 45, 119 48 C 118 50, 115 51, 113 50 Z" fill="url(#fingerNailGrad)" />
          <path class="finger-ring" d="M 86 48 C 97 32, 109 26, 113 30 C 117 36, 107 48, 97 58 C 91 62, 86 58, 86 48 Z" fill="url(#skinGrad1)" stroke="#884824" stroke-width="1.2" />
          <path d="M 95 40 C 98 38, 102 40, 103 42" fill="none" stroke="#ba7045" stroke-width="1" opacity="0.6" />
          <path d="M 107 28 C 110 27, 114 29, 114 32 C 113 34, 110 35, 107 34 Z" fill="url(#fingerNailGrad)" />
          <path class="finger-middle" d="M 72 42 C 78 20, 89 12, 95 16 C 101 22, 93 38, 85 52 C 79 56, 72 52, 72 42 Z" fill="url(#skinGrad1)" stroke="#884824" stroke-width="1.2" />
          <path d="M 79 28 C 83 26, 89 28, 91 31" fill="none" stroke="#ba7045" stroke-width="1" opacity="0.6" />
          <path d="M 89 14 C 92 13, 96 15, 96 18 C 95 20, 92 21, 89 20 Z" fill="url(#fingerNailGrad)" />
          <path class="finger-index" d="M 54 46 C 54 26, 62 16, 68 18 C 74 22, 72 36, 68 50 C 62 54, 56 52, 54 46 Z" fill="url(#skinGrad1)" stroke="#884824" stroke-width="1.2" />
          <path d="M 58 32 C 62 30, 66 32, 68 34" fill="none" stroke="#ba7045" stroke-width="1" opacity="0.6" />
          <path d="M 62 17 C 65 16, 68 18, 68 20 C 67 22, 65 23, 62 22 Z" fill="url(#fingerNailGrad)" />
          <path class="finger-thumb" d="M 44 68 C 26 58, 20 48, 28 38 C 36 30, 48 44, 52 56 C 54 62, 50 68, 44 68 Z" fill="url(#skinGrad1)" stroke="#884824" stroke-width="1.2" />
          <path d="M 32 46 C 36 44, 40 46, 42 50" fill="none" stroke="#ba7045" stroke-width="1" opacity="0.6" />
          <path d="M 23 38 C 26 34, 30 36, 31 39 C 30 42, 26 42, 23 38 Z" fill="url(#fingerNailGrad)" />
        </g>
      </svg>
    `;
  }

  const THEATRE_HAND_SPRITES = {
    hover: 'images/hands/hand-hover.png',
    point: 'images/hands/hand-point.png',
    pinch: 'images/hands/hand-pinch.png',
    grab: 'images/hands/hand-grab.png',
    release: 'images/hands/hand-release.png',
    thumbsup: 'images/hands/hand-thumbsup.png'
  };

  const theatreStageTabs = document.querySelectorAll('.theatre-tab-btn');
  const theatreBgVideo = document.getElementById('theatreBgVideo');
  const theatreHand = document.getElementById('theatreHand');
  const theatreHandPhoto = document.getElementById('theatreHandPhoto');
  const theatreHeldItem = document.getElementById('theatreHeldItem');
  const theatreStepBanner = document.getElementById('theatreStepBanner');
  const theatreBannerText = document.getElementById('theatreBannerText');
  const theatreProgressFill = document.getElementById('theatreProgressFill');
  const theatreStageKicker = document.getElementById('theatreStageKicker');
  const theatreStageTitle = document.getElementById('theatreStageTitle');
  const theatreStageDesc = document.getElementById('theatreStageDesc');
  const theatreActionVal = document.getElementById('theatreActionVal');
  const theatreTargetVal = document.getElementById('theatreTargetVal');
  const theatreStatusVal = document.getElementById('theatreStatusVal');
  const theatrePlayBtn = document.getElementById('theatrePlayBtn');
  const theatrePlayIcon = document.getElementById('theatrePlayIcon');
  const theatrePlayText = document.getElementById('theatrePlayText');
  const theatrePrevBtn = document.getElementById('theatrePrevBtn');
  const theatreNextBtn = document.getElementById('theatreNextBtn');
  const theatreRestartBtn = document.getElementById('theatreRestartBtn');
  const theatreLaunchStageBtn = document.getElementById('theatreLaunchStageBtn');
  const theatreModeAuto = document.getElementById('theatreModeAuto');
  const theatreModeInteractive = document.getElementById('theatreModeInteractive');
  const floatingDragHand = document.getElementById('floatingDragHand');
  const floatingDragHandImg = document.getElementById('floatingDragHandImg');
  const floatingHeldItem = document.getElementById('floatingHeldItem');

  let currentTheatreMode = 'auto'; // 'auto' or 'interactive'

  function setTheatreHandState(state) {
    if (!theatreHand) return;
    theatreHand.className = 'theatre-animated-hand frame-' + state;
    if (theatreHandPhoto && THEATRE_HAND_SPRITES[state]) {
      theatreHandPhoto.src = THEATRE_HAND_SPRITES[state];
    }
  }

  const THEATRE_STAGES = {
    1: {
      kicker: "STAGE 1 TUTORIAL VIDEO",
      title: "Motherboard Hardware Assembly",
      desc: "Watch the realistic hand demonstrate how to pick components from the inventory rack and slide them into their exact socket targets on the motherboard PCB, or switch to interactive mode to drag & drop them yourself!",
      videoSrc: "../game/video/vidzzzz.mp4",
      launchUrl: "../game/stage1.html",
      steps: [
        {
          instruction: "Align CPU pin 1 triangle and seat into LGA-1700 Matrix Socket.",
          sourceId: "simCompCpu",
          targetId: "simSocketCpu",
          hardwareName: "Desktop CPU (Core i9)",
          targetName: "LGA-1700 Central Socket",
          imgSrc: "images/cpu.png"
        },
        {
          instruction: "Press DDR5 RAM module down until DIMM locking levers click.",
          sourceId: "simCompRam",
          targetId: "simSocketRam",
          hardwareName: "DDR5 High-Speed RAM",
          targetName: "DIMM_A2 Dual Slots",
          imgSrc: "images/RAM.png"
        },
        {
          instruction: "Insert GPU firmly into PCIe 5.0 x16 steel-reinforced expansion slot.",
          sourceId: "simCompGpu",
          targetId: "simSocketGpu",
          hardwareName: "RTX 4090 GPU",
          targetName: "PCIe 5.0 x16 Primary Slot",
          imgSrc: "images/GPU.png"
        }
      ]
    },
    2: {
      kicker: "STAGE 2 TUTORIAL VIDEO",
      title: "PC Rear I/O Back Panel Shield",
      desc: "Watch how to identify external peripheral connectors and plug them into the correct color-coded ports on the rear chassis shield, or drag & drop them in interactive mode.",
      videoSrc: "../game/video/stage2.mp4",
      launchUrl: "../game/stage2.html",
      steps: [
        {
          instruction: "Plug USB 2.0 / 3.0 Type-A connector into the dual rear USB port.",
          sourceId: "simCompUsb",
          targetId: "simSocketUsb",
          hardwareName: "Dual USB 2.0 Ports",
          targetName: "Chassis USB 2.0 Ports",
          imgSrc: "images/usb.png"
        },
        {
          instruction: "Connect HDMI 2.1 cable to the digital high-resolution display output port.",
          sourceId: "simCompHdmi",
          targetId: "simSocketHdmi",
          hardwareName: "DVI / HDMI Video",
          targetName: "Digital HDMI 2.1 Out",
          imgSrc: "images/hdmi.png"
        },
        {
          instruction: "Insert RJ-45 Gigabit Ethernet twisted-pair cable until the retention clip locks.",
          sourceId: "simCompEth",
          targetId: "simSocketEth",
          hardwareName: "Gigabit Ethernet",
          targetName: "RJ-45 8P8C LAN Port",
          imgSrc: "images/ethernet.png"
        }
      ]
    },
    3: {
      kicker: "STAGE 3 TUTORIAL VIDEO",
      title: "RJ-45 Network Cable Fabrication",
      desc: "Simulate the 5 practical competencies: Stripping the outer sheath, untwisting conductors, arranging T568B color pinouts, and crimping with tester verification.",
      videoSrc: "../game/video/stage3.mp4",
      launchUrl: "../game/stage3.html",
      steps: [
        {
          instruction: "Strip 1 inch of outer Cat6 PVC sheath using cable stripper.",
          sourceId: "simStripBtnVisual",
          targetId: "simCableSheathGraphic",
          hardwareName: "Cable Stripper Tool",
          targetName: "Cat6 Outer PVC Sheath",
          isStripStep: true
        },
        {
          instruction: "Arrange 8 wires into T568B order and slide into modular plug channels.",
          sourceId: "simCableSheathGraphic",
          targetId: "simRj45Channels",
          hardwareName: "8 Color Conductors",
          targetName: "Clear RJ-45 Plug Body",
          isWireStep: true
        },
        {
          instruction: "Squeeze ratcheting crimp tool to seat 8 gold contact pin blades.",
          sourceId: "simCrimpActionBox",
          targetId: "simCrimpActionBox",
          hardwareName: "Ratcheting Crimp Tool",
          targetName: "Gold Contact Blades",
          isCrimpStep: true
        }
      ]
    }
  };

  let activeTheatreStage = 1;
  let currentTheatreStep = 0;
  let isTheatrePlaying = false;
  let theatreTimeout = null;

  function setTheatreStage(stageNum) {
    activeTheatreStage = stageNum;
    currentTheatreStep = 0;
    stopTheatreSimulation();

    theatreStageTabs.forEach(btn => {
      if (parseInt(btn.getAttribute('data-stage'), 10) === stageNum) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    document.querySelectorAll('.sim-stage-layer').forEach((layer, idx) => {
      if (idx + 1 === stageNum) {
        layer.classList.add('active');
      } else {
        layer.classList.remove('active');
      }
    });

    const sData = THEATRE_STAGES[stageNum];
    if (!sData) return;

    if (theatreStageKicker) theatreStageKicker.textContent = sData.kicker;
    if (theatreStageTitle) theatreStageTitle.textContent = sData.title;
    if (theatreStageDesc) theatreStageDesc.textContent = sData.desc;
    if (theatreLaunchStageBtn) theatreLaunchStageBtn.setAttribute('href', sData.launchUrl);

    if (theatreBgVideo) {
      theatreBgVideo.src = sData.videoSrc;
      theatreBgVideo.play().catch(() => {});
    }

    resetStageVisuals(stageNum);
    updateTheatreTelemetry("Ready to play", "Click Play Video Tutorial or Drag & Drop", "AWAITING USER START");
    if (theatreBannerText) {
      theatreBannerText.innerHTML = currentTheatreMode === 'interactive' 
        ? `<strong>INTERACTIVE MODE:</strong> Click and drag components with the realistic hand to their sockets!`
        : `DEMONSTRATION: Click Play Video Tutorial to watch Stage ${stageNum} demo.`;
    }
    if (theatreProgressFill) theatreProgressFill.style.width = "0%";
    setupInteractiveDraggableForStage(stageNum);
  }

  function resetStageVisuals(stageNum) {
    if (stageNum === 1) {
      document.querySelectorAll('#simLayerStage1 .sim-comp').forEach(c => c.classList.remove('installed', 'in-demo-grab'));
      document.querySelectorAll('#simLayerStage1 .sim-socket-target').forEach(s => s.classList.remove('highlight-target', 'socketed-success'));
    } else if (stageNum === 2) {
      document.querySelectorAll('#simLayerStage2 .sim-comp').forEach(c => c.classList.remove('installed', 'in-demo-grab'));
      document.querySelectorAll('#simLayerStage2 .sim-socket-target').forEach(s => s.classList.remove('highlight-target', 'socketed-success'));
    } else if (stageNum === 3) {
      const sheath = document.getElementById('simCableSheathGraphic');
      if (sheath) sheath.classList.remove('stripped');
      const sheathText = document.getElementById('sheathStatusText');
      if (sheathText) sheathText.textContent = "JACKET INTACT 🔒";
      const crimpBox = document.getElementById('simCrimpActionBox');
      if (crimpBox) crimpBox.classList.remove('crimped-success');
      const crimpText = document.getElementById('simCrimpToolText');
      if (crimpText) crimpText.textContent = "SQUEEZE CRIMP TOOL [SPACE]";
      for (let i = 0; i < 8; i++) {
        const fill = document.querySelector(`#wireSlot${i} .channel-wire-fill`);
        if (fill) fill.className = "channel-wire-fill";
      }
    }
    if (theatreHand) {
      theatreHand.style.display = 'none';
      theatreHand.style.opacity = '0';
    }
    if (theatreHeldItem) {
      theatreHeldItem.classList.remove('visible');
      theatreHeldItem.innerHTML = '';
    }
  }

  function updateTheatreTelemetry(action, target, status) {
    if (theatreActionVal) theatreActionVal.textContent = action;
    if (theatreTargetVal) theatreTargetVal.textContent = target;
    if (theatreStatusVal) theatreStatusVal.textContent = status;
  }

  function playStepSimulation(stepIdx, onComplete) {
    const sData = THEATRE_STAGES[activeTheatreStage];
    if (!sData || stepIdx >= sData.steps.length) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    const step = sData.steps[stepIdx];
    const totalSteps = sData.steps.length;
    const progressPct = ((stepIdx + 1) / totalSteps) * 100;
    if (theatreProgressFill) theatreProgressFill.style.width = `${progressPct}%`;

    if (theatreBannerText) {
      theatreBannerText.innerHTML = `<strong>STEP ${stepIdx + 1}/${totalSteps}:</strong> ${step.instruction}`;
    }

    updateTheatreTelemetry(step.instruction, step.targetName, `DEMO RUNNING (${stepIdx + 1}/${totalSteps})`);

    const videoFrame = document.getElementById('theatreVideoFrame');
    const sourceEl = document.getElementById(step.sourceId);
    const targetEl = document.getElementById(step.targetId);

    if (!videoFrame || !sourceEl || !targetEl || !theatreHand) {
      theatreTimeout = setTimeout(() => {
        if (typeof onComplete === 'function') onComplete();
      }, 1800);
      return;
    }

    const frameRect = videoFrame.getBoundingClientRect();
    const sRect = sourceEl.getBoundingClientRect();
    const tRect = targetEl.getBoundingClientRect();

    // Position hand so that fingers/pinch align over center of source component
    const startX = sRect.left - frameRect.left + (sRect.width / 2) - 85;
    const startY = sRect.top - frameRect.top + (sRect.height / 2) - 30;

    const endX = tRect.left - frameRect.left + (tRect.width / 2) - 85;
    const endY = tRect.top - frameRect.top + (tRect.height / 2) - 30;

    theatreHand.style.display = 'block';
    theatreHand.style.opacity = '1';
    theatreHand.style.transition = 'none';
    setTheatreHandState('point');
    theatreHand.style.left = `${startX}px`;
    theatreHand.style.top = `${startY}px`;

    sourceEl.classList.add('in-demo-grab');
    targetEl.classList.add('highlight-target');

    theatreTimeout = setTimeout(() => {
      // Step 1: Realistic Pinch/Grab on component
      const isSmall = step.sourceId.includes('Cpu') || step.sourceId.includes('Usb');
      setTheatreHandState(isSmall ? 'pinch' : 'grab');

      if (step.imgSrc && theatreHeldItem) {
        theatreHeldItem.innerHTML = `<img src="${step.imgSrc}" alt="${step.hardwareName}">`;
        theatreHeldItem.classList.add('visible');
      }

      ConvenireAudio.playClick();

      theatreTimeout = setTimeout(() => {
        // Step 2: Smooth gliding trajectory carrying component to socket
        theatreHand.style.transition = 'all 1.1s cubic-bezier(0.25, 1, 0.5, 1)';
        theatreHand.style.left = `${endX}px`;
        theatreHand.style.top = `${endY}px`;

        theatreTimeout = setTimeout(() => {
          // Step 3: Release & seat component into socket
          setTheatreHandState('release');
          if (theatreHeldItem) theatreHeldItem.classList.remove('visible');

          sourceEl.classList.remove('in-demo-grab');
          sourceEl.classList.add('installed');
          targetEl.classList.remove('highlight-target');
          targetEl.classList.add('socketed-success');

          // Stage 3 specific animation triggers
          if (step.isStripStep) {
            const sheath = document.getElementById('simCableSheathGraphic');
            if (sheath) sheath.classList.add('stripped');
            const sheathText = document.getElementById('sheathStatusText');
            if (sheathText) sheathText.textContent = "STRIPPED ✓";
          } else if (step.isWireStep) {
            const wireCodes = ['color-wo', 'color-o', 'color-wg', 'color-b', 'color-wb', 'color-g', 'color-wbr', 'color-br'];
            wireCodes.forEach((c, idx) => {
              const fill = document.querySelector(`#wireSlot${idx} .channel-wire-fill`);
              if (fill) fill.className = `channel-wire-fill ${c}`;
            });
          } else if (step.isCrimpStep) {
            const crimpBox = document.getElementById('simCrimpActionBox');
            if (crimpBox) crimpBox.classList.add('crimped-success');
            const crimpText = document.getElementById('simCrimpToolText');
            if (crimpText) crimpText.textContent = "CRIMP TEST PASSED ✓ (8/8 PINS)";
          }

          ConvenireAudio.playSnap();

          theatreTimeout = setTimeout(() => {
            if (typeof onComplete === 'function') onComplete();
          }, 800);
        }, 1100);
      }, 400);
    }, 450);
  }

  function runFullTheatreSequence() {
    const sData = THEATRE_STAGES[activeTheatreStage];
    if (!sData) return;

    if (currentTheatreStep >= sData.steps.length) {
      currentTheatreStep = 0;
      resetStageVisuals(activeTheatreStage);
    }

    function executeNext() {
      if (!isTheatrePlaying) return;
      if (currentTheatreStep >= sData.steps.length) {
        // Completed all steps in stage - Give celebratory Thumbs-Up!
        isTheatrePlaying = false;
        if (theatrePlayIcon) theatrePlayIcon.textContent = "▶";
        if (theatrePlayText) theatrePlayText.textContent = "Replay Tutorial";
        if (theatreBannerText) {
          theatreBannerText.innerHTML = `🎉 <strong>STAGE ${activeTheatreStage} TUTORIAL COMPLETE!</strong> Ready for hands-on game play.`;
        }
        updateTheatreTelemetry("All hardware seated", "Diagnostics Verified", "STAGE CLEARED ✓");
        
        const videoFrame = document.getElementById('theatreVideoFrame');
        if (videoFrame && theatreHand) {
          const frameRect = videoFrame.getBoundingClientRect();
          theatreHand.style.display = 'block';
          theatreHand.style.opacity = '1';
          theatreHand.style.transition = 'all 0.6s ease';
          theatreHand.style.left = `${frameRect.width / 2 - 65}px`;
          theatreHand.style.top = `${frameRect.height / 2 - 85}px`;
          setTheatreHandState('thumbsup');
        }

        ConvenireAudio.playVictory();
        return;
      }

      playStepSimulation(currentTheatreStep, () => {
        currentTheatreStep++;
        if (isTheatrePlaying) {
          theatreTimeout = setTimeout(executeNext, 600);
        }
      });
    }

    executeNext();
  }

  function stopTheatreSimulation() {
    isTheatrePlaying = false;
    if (theatreTimeout) clearTimeout(theatreTimeout);
    if (theatrePlayIcon) theatrePlayIcon.textContent = "▶";
    if (theatrePlayText) theatrePlayText.textContent = "Play Video Tutorial";
    if (theatreHand) theatreHand.style.display = 'none';
  }

  if (theatrePlayBtn) {
    theatrePlayBtn.addEventListener('click', () => {
      if (isTheatrePlaying) {
        stopTheatreSimulation();
        updateTheatreTelemetry("Demo Paused", "Click Play to continue", "PAUSED");
      } else {
        isTheatrePlaying = true;
        if (theatrePlayIcon) theatrePlayIcon.textContent = "⏸";
        if (theatrePlayText) theatrePlayText.textContent = "Pause Tutorial";
        runFullTheatreSequence();
      }
      ConvenireAudio.playClick();
    });
  }

  if (theatreNextBtn) {
    theatreNextBtn.addEventListener('click', () => {
      stopTheatreSimulation();
      const sData = THEATRE_STAGES[activeTheatreStage];
      if (currentTheatreStep < sData.steps.length) {
        playStepSimulation(currentTheatreStep, () => {
          currentTheatreStep = Math.min(sData.steps.length, currentTheatreStep + 1);
        });
      }
      ConvenireAudio.playClick();
    });
  }

  if (theatrePrevBtn) {
    theatrePrevBtn.addEventListener('click', () => {
      stopTheatreSimulation();
      currentTheatreStep = Math.max(0, currentTheatreStep - 1);
      resetStageVisuals(activeTheatreStage);
      playStepSimulation(currentTheatreStep, () => {});
      ConvenireAudio.playClick();
    });
  }

  if (theatreRestartBtn) {
    theatreRestartBtn.addEventListener('click', () => {
      stopTheatreSimulation();
      currentTheatreStep = 0;
      resetStageVisuals(activeTheatreStage);
      setTheatreStage(activeTheatreStage);
      ConvenireAudio.playClick();
    });
  }

  theatreStageTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const stageNum = parseInt(btn.getAttribute('data-stage'), 10);
      setTheatreStage(stageNum);
      ConvenireAudio.playClick();
    });
  });

  // =========================================================
  // INTERACTIVE REALISTIC DRAG & DROP ENGINE FOR TUTORIAL
  // =========================================================
  const DRAG_MAPPING = {
    simCompCpu: { targetId: 'simSocketCpu', name: 'Desktop CPU (Core i9)', imgSrc: 'images/cpu.png' },
    simCompRam: { targetId: 'simSocketRam', name: 'DDR5 RAM DIMM', imgSrc: 'images/RAM.png' },
    simCompGpu: { targetId: 'simSocketGpu', name: 'RTX 4090 GPU', imgSrc: 'images/GPU.png' },
    simCompUsb: { targetId: 'simSocketUsb', name: 'Dual USB 2.0', imgSrc: 'images/usb.png' },
    simCompHdmi: { targetId: 'simSocketHdmi', name: 'HDMI 2.1 Video', imgSrc: 'images/hdmi.png' },
    simCompEth: { targetId: 'simSocketEth', name: 'Gigabit Ethernet', imgSrc: 'images/ethernet.png' }
  };

  let activeDraggingComp = null;

  function setupInteractiveDraggableForStage(stageNum) {
    const layer = document.getElementById(`simLayerStage${stageNum}`);
    if (!layer) return;

    const comps = layer.querySelectorAll('.sim-comp');
    comps.forEach(comp => {
      if (currentTheatreMode === 'interactive') {
        comp.classList.add('draggable-mode');
      } else {
        comp.classList.remove('draggable-mode');
      }
    });
  }

  if (theatreModeAuto) {
    theatreModeAuto.addEventListener('click', () => {
      currentTheatreMode = 'auto';
      theatreModeAuto.classList.add('active');
      if (theatreModeInteractive) theatreModeInteractive.classList.remove('active');
      setupInteractiveDraggableForStage(activeTheatreStage);
      if (theatreBannerText) {
        theatreBannerText.innerHTML = `DEMONSTRATION: Click Play Video Tutorial to watch Stage ${activeTheatreStage} demo.`;
      }
      ConvenireAudio.playClick();
    });
  }

  if (theatreModeInteractive) {
    theatreModeInteractive.addEventListener('click', () => {
      currentTheatreMode = 'interactive';
      theatreModeInteractive.classList.add('active');
      if (theatreModeAuto) theatreModeAuto.classList.remove('active');
      stopTheatreSimulation();
      setupInteractiveDraggableForStage(activeTheatreStage);
      if (theatreBannerText) {
        theatreBannerText.innerHTML = `✋ <strong>INTERACTIVE DRAG & DROP:</strong> Drag any component with the realistic hand to its socket!`;
      }
      updateTheatreTelemetry("Interactive Mode Active", "Drag items to sockets", "AWAITING USER DRAG");
      ConvenireAudio.playClick();
    });
  }

  // Interactive mouse / touch drag listeners
  document.addEventListener('mousedown', (e) => {
    if (currentTheatreMode !== 'interactive') return;
    const comp = e.target.closest('.sim-comp.draggable-mode');
    if (!comp || comp.classList.contains('installed')) return;

    const compId = comp.id;
    const config = DRAG_MAPPING[compId];
    if (!config) return;

    activeDraggingComp = { comp, config, id: compId };
    comp.classList.add('dragging-active');

    if (floatingDragHand && floatingHeldItem && floatingDragHandImg) {
      floatingDragHandImg.src = THEATRE_HAND_SPRITES.grab;
      floatingHeldItem.innerHTML = `<img src="${config.imgSrc}" alt="${config.name}">`;
      floatingDragHand.style.display = 'block';
      floatingDragHand.style.left = `${e.clientX}px`;
      floatingDragHand.style.top = `${e.clientY}px`;
    }

    const targetEl = document.getElementById(config.targetId);
    if (targetEl) targetEl.classList.add('drag-target-hover');

    updateTheatreTelemetry(`Dragging ${config.name}`, `Target: ${config.targetId}`, "DRAGGING WITH REALISTIC HAND");
    ConvenireAudio.playClick();
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!activeDraggingComp || !floatingDragHand) return;
    floatingDragHand.style.left = `${e.clientX}px`;
    floatingDragHand.style.top = `${e.clientY}px`;
  });

  document.addEventListener('mouseup', (e) => {
    if (!activeDraggingComp) return;

    const { comp, config } = activeDraggingComp;
    comp.classList.remove('dragging-active');

    const targetEl = document.getElementById(config.targetId);
    if (targetEl) targetEl.classList.remove('drag-target-hover');

    if (floatingDragHand) floatingDragHand.style.display = 'none';

    // Check if drop occurred over target socket
    let droppedInSocket = false;
    if (targetEl) {
      const tRect = targetEl.getBoundingClientRect();
      if (
        e.clientX >= tRect.left - 25 &&
        e.clientX <= tRect.right + 25 &&
        e.clientY >= tRect.top - 25 &&
        e.clientY <= tRect.bottom + 25
      ) {
        droppedInSocket = true;
      }
    }

    if (droppedInSocket) {
      comp.classList.add('installed');
      if (targetEl) targetEl.classList.add('socketed-success');
      ConvenireAudio.playSnap();
      updateTheatreTelemetry(`Installed: ${config.name}`, "Correct Socket Seated!", "SOCKETED SUCCESS ✓");
      
      // Temporary floating thumbsup at socket location
      if (theatreHand) {
        const videoFrame = document.getElementById('theatreVideoFrame');
        if (videoFrame) {
          const frameRect = videoFrame.getBoundingClientRect();
          theatreHand.style.display = 'block';
          theatreHand.style.opacity = '1';
          theatreHand.style.left = `${e.clientX - frameRect.left - 65}px`;
          theatreHand.style.top = `${e.clientY - frameRect.top - 85}px`;
          setTheatreHandState('thumbsup');
          setTimeout(() => {
            if (!isTheatrePlaying) theatreHand.style.opacity = '0';
          }, 900);
        }
      }

      // Check if all installed in current stage
      const currentLayer = document.getElementById(`simLayerStage${activeTheatreStage}`);
      if (currentLayer) {
        const remaining = currentLayer.querySelectorAll('.sim-comp:not(.installed)');
        if (remaining.length === 0) {
          ConvenireAudio.playVictory();
          if (theatreBannerText) {
            theatreBannerText.innerHTML = `🎉 <strong>EXCELLENT!</strong> All components seated with realistic hand!`;
          }
          updateTheatreTelemetry("All hardware seated", "Stage Cleared", "STAGE COMPLETE ✓");
        }
      }
    } else {
      updateTheatreTelemetry("Placement cancelled", "Drop inside glowing socket", "AWAITING DROP");
    }

    activeDraggingComp = null;
  });

  // Stage 3 Interactive Workstation Buttons
  const simStripBtnVisual = document.getElementById('simStripBtnVisual');
  if (simStripBtnVisual) {
    simStripBtnVisual.addEventListener('click', () => {
      const sheath = document.getElementById('simCableSheathGraphic');
      if (sheath) sheath.classList.toggle('stripped');
      const sheathText = document.getElementById('sheathStatusText');
      if (sheathText) {
        sheathText.textContent = sheath && sheath.classList.contains('stripped') ? "STRIPPED ✓" : "JACKET INTACT 🔒";
      }
      ConvenireAudio.playClick();
      updateTheatreTelemetry("Cable Stripper Used", "Outer PVC Jacket", "STRIPPED ✓");
    });
  }

  const simCrimpActionBox = document.getElementById('simCrimpActionBox');
  if (simCrimpActionBox) {
    simCrimpActionBox.addEventListener('click', () => {
      simCrimpActionBox.classList.toggle('crimped-success');
      const crimpText = document.getElementById('simCrimpToolText');
      if (crimpText) {
        crimpText.textContent = simCrimpActionBox.classList.contains('crimped-success') 
          ? "CRIMP TEST PASSED ✓ (8/8 PINS)" 
          : "SQUEEZE CRIMP TOOL [SPACE]";
      }
      ConvenireAudio.playSnap();
      updateTheatreTelemetry("Ratcheting Crimp Tool", "Gold Contact Blades", "PINS SEATED ✓");
    });
  }

  // Initialize Default Stage 1 on load
  setTheatreStage(1);

  // --- 9. INTERACTIVE ACADEMY & GAME TUTORIAL CONTROLLER ---
  const tutTabs = document.querySelectorAll('.tut-tab-btn');
  const tutPanes = {
    overview: document.getElementById('tutPaneOverview'),
    stage1: document.getElementById('tutPaneStage1'),
    stage2: document.getElementById('tutPaneStage2'),
    stage3: document.getElementById('tutPaneStage3'),
    scoring: document.getElementById('tutPaneScoring')
  };

  tutTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      tutTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      Object.keys(tutPanes).forEach(paneKey => {
        if (tutPanes[paneKey]) {
          if (paneKey === targetTab) {
            tutPanes[paneKey].classList.add('active');
          } else {
            tutPanes[paneKey].classList.remove('active');
          }
        }
      });
      ConvenireAudio.playClick();
    });
  });

  // T568A / T568B / CROSSOVER PINOUT SIMULATOR
  const pinoutWiresContainer = document.getElementById('pinoutWiresContainer');
  const pinoutTitle = document.getElementById('pinoutTitle');
  const pinoutDesc = document.getElementById('pinoutDesc');
  const pinoutExplanation = document.getElementById('pinoutExplanation');
  const pinoutBtns = document.querySelectorAll('.pinout-btn');

  const PINOUT_DATA = {
    T568A: {
      title: "TIA/EIA-568A Standard Wiring Order",
      desc: "Standard telecommunications pinout. Widely specified in government and commercial networking.",
      explanation: [
        "<strong>Pin 1 & 2:</strong> Transmit Pairs (Tx+/Tx-) — Green / White-Green",
        "<strong>Pin 3 & 6:</strong> Receive Pairs (Rx+/Rx-) — Orange / White-Orange",
        "<strong>Pin 4, 5, 7, 8:</strong> Bidirectional Gigabit Pairs (Bi+/Bi-) — Blue & Brown"
      ],
      wires: [
        { pin: 1, name: "White/Green", code: "wg", role: "Tx+" },
        { pin: 2, name: "Green", code: "g", role: "Tx-" },
        { pin: 3, name: "White/Orange", code: "wo", role: "Rx+" },
        { pin: 4, name: "Blue", code: "b", role: "Bi-" },
        { pin: 5, name: "White/Blue", code: "wb", role: "Bi+" },
        { pin: 6, name: "Orange", code: "o", role: "Rx-" },
        { pin: 7, name: "White/Brown", code: "wbr", role: "Bi-" },
        { pin: 8, name: "Brown", code: "br", role: "Bi+" }
      ]
    },
    T568B: {
      title: "TIA/EIA-568B Standard Wiring Order",
      desc: "Most common commercial Ethernet pinout used in residential and modern office enterprise installations.",
      explanation: [
        "<strong>Pin 1 & 2:</strong> Transmit Pairs (Tx+/Tx-) — Orange / White-Orange",
        "<strong>Pin 3 & 6:</strong> Receive Pairs (Rx+/Rx-) — Green / White-Green",
        "<strong>Pin 4, 5, 7, 8:</strong> Bidirectional Gigabit Pairs (Bi+/Bi-) — Blue & Brown"
      ],
      wires: [
        { pin: 1, name: "White/Orange", code: "wo", role: "Tx+" },
        { pin: 2, name: "Orange", code: "o", role: "Tx-" },
        { pin: 3, name: "White/Green", code: "wg", role: "Rx+" },
        { pin: 4, name: "Blue", code: "b", role: "Bi-" },
        { pin: 5, name: "White/Blue", code: "wb", role: "Bi+" },
        { pin: 6, name: "Green", code: "g", role: "Rx-" },
        { pin: 7, name: "White/Brown", code: "wbr", role: "Bi-" },
        { pin: 8, name: "Brown", code: "br", role: "Bi+" }
      ]
    },
    CROSSOVER: {
      title: "Ethernet Crossover Cable (Plug End A: T568A ➔ Plug End B: T568B)",
      desc: "Connects two like devices directly without a switch (PC to PC, Switch to Switch). Pins 1&2 swap with Pins 3&6.",
      explanation: [
        "<strong>End A (T568A):</strong> Green pairs on 1 & 2 ➔ <strong>End B (T568B):</strong> Green pairs mapped to 3 & 6",
        "<strong>End A (T568A):</strong> Orange pairs on 3 & 6 ➔ <strong>End B (T568B):</strong> Orange pairs mapped to 1 & 2",
        "<strong>Auto-MDIX:</strong> Modern Gigabit NICs automatically detect and configure pairs electronically."
      ],
      wires: [
        { pin: 1, name: "WG ➔ WO", code: "wg", role: "1 ➔ 3" },
        { pin: 2, name: "G ➔ O", code: "g", role: "2 ➔ 6" },
        { pin: 3, name: "WO ➔ WG", code: "wo", role: "3 ➔ 1" },
        { pin: 4, name: "Blue", code: "b", role: "Pass" },
        { pin: 5, name: "White/Blue", code: "wb", role: "Pass" },
        { pin: 6, name: "O ➔ G", code: "o", role: "6 ➔ 2" },
        { pin: 7, name: "White/Brown", code: "wbr", role: "Pass" },
        { pin: 8, name: "Brown", code: "br", role: "Pass" }
      ]
    }
  };

  function renderPinout(standard) {
    const data = PINOUT_DATA[standard];
    if (!data || !pinoutWiresContainer) return;

    if (pinoutTitle) pinoutTitle.textContent = data.title;
    if (pinoutDesc) pinoutDesc.textContent = data.desc;

    if (pinoutExplanation) {
      pinoutExplanation.innerHTML = data.explanation.map(exp => `<span class="info-pill">${exp}</span>`).join('');
    }

    pinoutWiresContainer.innerHTML = data.wires.map(w => `
      <div class="wire-column">
        <span class="wire-pin-badge">PIN ${w.pin}</span>
        <div class="wire-cable-bar wire-color-${w.code}" title="${w.name} (${w.role})"></div>
        <span class="wire-signal-tag">${w.role}</span>
        <span class="wire-name-sub">${w.name}</span>
      </div>
    `).join('');
  }

  pinoutBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const standard = btn.getAttribute('data-standard');
      pinoutBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPinout(standard);
      ConvenireAudio.playSnap();
    });
  });

  // Render default T568A on load
  renderPinout('T568A');

  // --- 10. SIDE DOTS NAVIGATOR & SECTION SCROLL SPY ---
  const sideDots = document.querySelectorAll('.side-dot-item');
  const allSections = document.querySelectorAll('section[id]');

  sideDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetSecId = dot.getAttribute('data-section');
      const targetSec = document.getElementById(targetSecId);
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
        ConvenireAudio.playClick();
      }
    });
  });

  window.addEventListener('scroll', () => {
    let currentSec = 'home';
    const scrollPos = window.scrollY + 250;

    allSections.forEach(sec => {
      const secTop = sec.offsetTop;
      const secHeight = sec.offsetHeight;
      if (scrollPos >= secTop && scrollPos < secTop + secHeight) {
        currentSec = sec.getAttribute('id');
      }
    });

    sideDots.forEach(dot => {
      if (dot.getAttribute('data-section') === currentSec) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    navLinks.forEach(link => {
      if (link.getAttribute('href') === `#${currentSec}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }, { passive: true });

  // --- 11. SDLC AGILE EXPLORER TAB SWITCHER ---
  const sdlcTabBtns = document.querySelectorAll('.sdlc-tab-btn');
  const sdlcTabPanes = document.querySelectorAll('.sdlc-tab-pane');

  if (sdlcTabBtns.length > 0 && sdlcTabPanes.length > 0) {
    sdlcTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        sdlcTabBtns.forEach(b => b.classList.remove('active'));
        sdlcTabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPane = document.getElementById(`pane-${targetTab}`);
        if (targetPane) {
          targetPane.classList.add('active');
        }

        if (typeof ConvenireAudio !== 'undefined' && ConvenireAudio.playClick) {
          ConvenireAudio.playClick();
        }
      });
    });
  }

  // --- 12. PROGRAMMING LANGUAGE DESIGN INTERFACE & TECH STACK CONTROLLER ---
  const techTabs = document.querySelectorAll('.ide-tab-btn');
  const techPanes = document.querySelectorAll('.ide-tab-pane');
  const techMatrixCards = document.querySelectorAll('.tech-matrix-card');
  const ideBreadcrumbDir = document.getElementById('ideBreadcrumbDir');
  const ideBreadcrumbFile = document.getElementById('ideBreadcrumbFile');
  const ideMetaRole = document.getElementById('ideMetaRole');
  const ideMetaLines = document.getElementById('ideMetaLines');

  const langMetadata = {
    html: { dir: 'root', file: 'stage1.html', role: 'Spatial DOM Blueprint', lines: '436 lines' },
    css:  { dir: 'css',  file: 'stage1.css',  role: 'Cyber Shaders & Neon FX', lines: '1,142 lines' },
    js:   { dir: 'javascript', file: 'stage1.js', role: 'Game Physics & Web Audio', lines: '1,284 lines' },
    php:  { dir: 'php',  file: 'save_progress.php', role: 'REST API & MySQL DB', lines: '81 lines' }
  };

  function switchTechTab(langKey) {
    if (!langMetadata[langKey]) return;

    techTabs.forEach(btn => {
      if (btn.getAttribute('data-lang') === langKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    techPanes.forEach(pane => {
      if (pane.id === `pane-${langKey}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    techMatrixCards.forEach(card => {
      if (card.getAttribute('data-tech-target') === langKey) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    const meta = langMetadata[langKey];
    if (ideBreadcrumbDir) ideBreadcrumbDir.textContent = meta.dir;
    if (ideBreadcrumbFile) ideBreadcrumbFile.textContent = meta.file;
    if (ideMetaRole) ideMetaRole.textContent = meta.role;
    if (ideMetaLines) ideMetaLines.textContent = meta.lines;

    if (typeof ConvenireAudio !== 'undefined' && ConvenireAudio.playClick) {
      ConvenireAudio.playClick();
    }
  }

  techTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      switchTechTab(lang);
    });
  });

  techMatrixCards.forEach(card => {
    card.addEventListener('click', () => {
      const targetLang = card.getAttribute('data-tech-target');
      switchTechTab(targetLang);
      const ideStation = document.getElementById('techIdeStation');
      if (ideStation) {
        ideStation.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  // Copy Code Snippet Button
  const copyBtn = document.getElementById('ideCopyCodeBtn');
  const copyText = document.getElementById('ideCopyText');
  if (copyBtn && copyText) {
    copyBtn.addEventListener('click', () => {
      const activePane = document.querySelector('.ide-tab-pane.active');
      if (!activePane) return;
      const codeBlock = activePane.querySelector('.code-block code');
      if (!codeBlock) return;

      const codeStr = codeBlock.textContent || codeBlock.innerText;
      navigator.clipboard.writeText(codeStr).then(() => {
        copyBtn.classList.add('copied');
        copyText.textContent = 'Copied!';
        if (typeof ConvenireAudio !== 'undefined' && ConvenireAudio.playSnap) {
          ConvenireAudio.playSnap();
        }
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyText.textContent = 'Copy';
        }, 2200);
      }).catch(() => {
        copyText.textContent = 'Copied!';
        setTimeout(() => { copyText.textContent = 'Copy'; }, 2000);
      });
    });
  }

  // Mode View Toggle (Code vs Simulator)
  const modeCodeBtn = document.getElementById('ideModeCode');
  const modeLiveBtn = document.getElementById('ideModeLive');
  if (modeCodeBtn && modeLiveBtn) {
    modeCodeBtn.addEventListener('click', () => {
      modeCodeBtn.classList.add('active');
      modeLiveBtn.classList.remove('active');
      const activePane = document.querySelector('.ide-tab-pane.active');
      if (activePane) {
        const codeCol = activePane.querySelector('.ide-code-column');
        if (codeCol && window.innerWidth <= 1024) {
          codeCol.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
      if (typeof ConvenireAudio !== 'undefined' && ConvenireAudio.playClick) {
        ConvenireAudio.playClick();
      }
    });

    modeLiveBtn.addEventListener('click', () => {
      modeLiveBtn.classList.add('active');
      modeCodeBtn.classList.remove('active');
      const activePane = document.querySelector('.ide-tab-pane.active');
      if (activePane) {
        const demoCol = activePane.querySelector('.ide-demo-column');
        if (demoCol && window.innerWidth <= 1024) {
          demoCol.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
      if (typeof ConvenireAudio !== 'undefined' && ConvenireAudio.playClick) {
        ConvenireAudio.playClick();
      }
    });
  }

  // --- HTML5 Simulator: Motherboard Spatial Drop Radar Inspector ---
  const radarSlots = document.querySelectorAll('.pcb-target-slot');
  const radarTargetBadge = document.getElementById('radarTargetBadge');
  const radarTargetName = document.getElementById('radarTargetName');
  const radarTargetMarkup = document.getElementById('radarTargetMarkup');
  const radarTargetDesc = document.getElementById('radarTargetDesc');

  function updateRadarInspector(slot) {
    radarSlots.forEach(s => s.classList.remove('active-inspect'));
    slot.classList.add('active-inspect');

    const slotName = slot.getAttribute('data-slotname') || 'Hardware Socket';
    const slotCode = slot.getAttribute('data-code') || '';
    const slotDesc = slot.getAttribute('data-desc') || '';
    const targetTag = slot.getAttribute('data-target') || 'COMPONENT';

    if (radarTargetBadge) radarTargetBadge.textContent = `ACTIVE TARGET: ${targetTag.toUpperCase()} SOCKET`;
    if (radarTargetName) radarTargetName.textContent = slotName;
    if (radarTargetMarkup) radarTargetMarkup.textContent = slotCode;
    if (radarTargetDesc) radarTargetDesc.textContent = slotDesc;
  }

  radarSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      updateRadarInspector(slot);
      if (typeof ConvenireAudio !== 'undefined' && ConvenireAudio.playClick) {
        ConvenireAudio.playClick();
      }
    });
    slot.addEventListener('mouseenter', () => {
      updateRadarInspector(slot);
    });
  });

  // --- CSS3 Simulator: Realtime Cyber Styler ---
  const cssGlowSlider = document.getElementById('cssGlowSlider');
  const cssGlowVal = document.getElementById('cssGlowVal');
  const simulatedSlotCard = document.getElementById('simulatedSlotCard');
  const computedCssBadge = document.getElementById('computedCssBadge');
  const themeBtns = document.querySelectorAll('.theme-btn');
  const cssScanlineToggle = document.getElementById('cssScanlineToggle');
  const previewScanlines = document.getElementById('previewScanlines');

  let currentSimColor = '#00f2fe';
  let currentSimSize = 25;

  function updateComputedCss() {
    if (simulatedSlotCard) {
      simulatedSlotCard.style.setProperty('--sim-glow-color', currentSimColor);
      simulatedSlotCard.style.setProperty('--sim-glow-size', `${currentSimSize}px`);
    }
    if (computedCssBadge) {
      computedCssBadge.textContent = `box-shadow: 0 0 ${currentSimSize}px ${currentSimColor}`;
    }
  }

  if (cssGlowSlider && cssGlowVal) {
    cssGlowSlider.addEventListener('input', (e) => {
      currentSimSize = e.target.value;
      cssGlowVal.textContent = `${currentSimSize}px`;
      updateComputedCss();
    });
  }

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSimColor = btn.getAttribute('data-color') || '#00f2fe';
      updateComputedCss();
      if (typeof ConvenireAudio !== 'undefined' && ConvenireAudio.playClick) {
        ConvenireAudio.playClick();
      }
    });
  });

  if (cssScanlineToggle && previewScanlines) {
    cssScanlineToggle.addEventListener('change', (e) => {
      previewScanlines.style.display = e.target.checked ? 'block' : 'none';
      if (typeof ConvenireAudio !== 'undefined' && ConvenireAudio.playClick) {
        ConvenireAudio.playClick();
      }
    });
  }

  // --- JavaScript Simulator: Web Audio Synthesizer & Snap Physics ---
  const synthBtnBlip = document.getElementById('synthBtnBlip');
  const synthBtnSnap = document.getElementById('synthBtnSnap');
  const synthBtnHum = document.getElementById('synthBtnHum');
  const synthBtnVictory = document.getElementById('synthBtnVictory');

  if (synthBtnBlip) {
    synthBtnBlip.addEventListener('click', () => {
      if (typeof ConvenireAudio !== 'undefined' && ConvenireAudio.playClick) {
        ConvenireAudio.playClick();
      }
    });
  }

  if (synthBtnSnap) {
    synthBtnSnap.addEventListener('click', () => {
      if (typeof ConvenireAudio !== 'undefined' && ConvenireAudio.playSnap) {
        ConvenireAudio.playSnap();
      }
    });
  }

  if (synthBtnHum) {
    synthBtnHum.addEventListener('click', () => {
      if (typeof ConvenireAudio !== 'undefined' && ConvenireAudio.playPowerOn) {
        ConvenireAudio.playPowerOn();
      }
    });
  }

  if (synthBtnVictory) {
    synthBtnVictory.addEventListener('click', () => {
      if (typeof ConvenireAudio !== 'undefined' && ConvenireAudio.playVictory) {
        ConvenireAudio.playVictory();
      }
    });
  }

  // Euclidean Snap Physics Sandbox
  const snapSandbox = document.getElementById('snapSandbox');
  const targetSocket = document.getElementById('sandboxTargetSocket');
  const draggableChip = document.getElementById('sandboxDraggableChip');
  const statusText = document.getElementById('sandboxStatusText');
  const distanceText = document.getElementById('sandboxDistanceText');

  if (snapSandbox && targetSocket && draggableChip && statusText && distanceText) {
    let isDragging = false;
    let isLocked = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    // Reset chip position
    function resetChip() {
      isLocked = false;
      draggableChip.classList.remove('locked');
      targetSocket.classList.remove('snapped');
      draggableChip.style.transform = 'translate(0px, 0px)';
      statusText.textContent = 'STATUS: Awaiting Drag Gesture';
      statusText.style.color = '#e2e8f0';
      distanceText.textContent = 'Distance: -- px';
    }

    draggableChip.addEventListener('pointerdown', (e) => {
      if (isLocked) {
        resetChip();
        return;
      }
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      draggableChip.setPointerCapture(e.pointerId);
      statusText.textContent = 'STATUS: Component in Motion (Calculating...)';
      statusText.style.color = '#f59e0b';
      if (typeof ConvenireAudio !== 'undefined' && ConvenireAudio.playClick) {
        ConvenireAudio.playClick();
      }
    });

    draggableChip.addEventListener('pointermove', (e) => {
      if (!isDragging || isLocked) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      draggableChip.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

      // Compute Euclidean Distance between chip and target socket
      const chipRect = draggableChip.getBoundingClientRect();
      const socketRect = targetSocket.getBoundingClientRect();

      const chipCenterX = chipRect.left + chipRect.width / 2;
      const chipCenterY = chipRect.top + chipRect.height / 2;

      const socketCenterX = socketRect.left + socketRect.width / 2;
      const socketCenterY = socketRect.top + socketRect.height / 2;

      const dist = Math.hypot(chipCenterX - socketCenterX, chipCenterY - socketCenterY);
      distanceText.textContent = `Distance: ${Math.round(dist)} px`;

      // Check snap tolerance threshold (45px)
      if (dist <= 48) {
        isDragging = false;
        isLocked = true;
        draggableChip.classList.add('locked');
        targetSocket.classList.add('snapped');

        // Snap chip to socket center
        const offsetLeft = socketCenterX - chipCenterX;
        const offsetTop = socketCenterY - chipCenterY;
        draggableChip.style.transform = `translate(${deltaX + offsetLeft}px, ${deltaY + offsetTop}px)`;

        statusText.textContent = 'SUCCESS: Component Snapped into LGA-1700 Socket! (Click chip to reset)';
        statusText.style.color = '#10b981';
        distanceText.textContent = 'Distance: 0 px (SNAPPED)';

        if (typeof ConvenireAudio !== 'undefined' && ConvenireAudio.playCorrect) {
          ConvenireAudio.playCorrect();
        }
      }
    });

    draggableChip.addEventListener('pointerup', (e) => {
      if (isDragging && !isLocked) {
        isDragging = false;
        statusText.textContent = 'STATUS: Released outside snap radius. Realign closer to socket.';
        statusText.style.color = '#f43f5e';
      }
    });
  }

  // --- PHP Simulator: Live REST API & SQL Pipeline Simulator ---
  const apiSendBtn = document.getElementById('apiSendBtn');
  const apiStudentId = document.getElementById('apiStudentId');
  const apiStageSelect = document.getElementById('apiStageSelect');
  const apiScore = document.getElementById('apiScore');
  const apiStatusBadge = document.getElementById('apiStatusBadge');
  const apiConsoleOutput = document.getElementById('apiConsoleOutput');
  const sqlPreviewText = document.getElementById('sqlPreviewText');

  if (apiSendBtn && apiConsoleOutput) {
    apiSendBtn.addEventListener('click', () => {
      const studentId = (apiStudentId && apiStudentId.value.trim()) || 'BSCS-2026-042';
      const stage = (apiStageSelect && apiStageSelect.value) || '1';
      const score = (apiScore && apiScore.value) || '950';

      apiSendBtn.disabled = true;
      apiSendBtn.querySelector('span').textContent = 'TRANSMITTING POST...';
      if (apiStatusBadge) {
        apiStatusBadge.textContent = 'PENDING REQUEST...';
        apiStatusBadge.style.color = '#f59e0b';
      }

      setTimeout(() => {
        const now = new Date();
        const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
        const randomLogId = Math.floor(Math.random() * 800) + 1000;

        let rank = 'HARDWARE ARCHITECT (A+)';
        if (score < 700) rank = 'SYSTEM APPRENTICE (C)';
        else if (score < 850) rank = 'CERTIFIED BUILDER (B+)';

        if (apiStatusBadge) {
          apiStatusBadge.textContent = 'HTTP 200 OK · 38ms';
          apiStatusBadge.style.color = '#10b981';
        }

        apiConsoleOutput.innerHTML = `<pre class="json-output">{
  <span class="j-key">"status"</span>: <span class="j-val">200</span>,
  <span class="j-key">"success"</span>: <span class="j-bool">true</span>,
  <span class="j-key">"message"</span>: <span class="j-str">"Stage progress successfully saved to MySQL database."</span>,
  <span class="j-key">"data"</span>: {
    <span class="j-key">"student_id"</span>: <span class="j-str">"${studentId}"</span>,
    <span class="j-key">"stage"</span>: <span class="j-num">${stage}</span>,
    <span class="j-key">"score"</span>: <span class="j-num">${score}</span>,
    <span class="j-key">"rank"</span>: <span class="j-str">"${rank}"</span>,
    <span class="j-key">"log_id"</span>: <span class="j-num">${randomLogId}</span>,
    <span class="j-key">"recorded_at"</span>: <span class="j-str">"${dateStr}"</span>
  }
}</pre>`;

        if (sqlPreviewText) {
          sqlPreviewText.textContent = `INSERT INTO game_logs (student_id, stage, score) VALUES ('${studentId}', ${stage}, ${score});`;
        }

        apiSendBtn.disabled = false;
        apiSendBtn.querySelector('span').textContent = 'EXECUTE API CALL';

        if (typeof ConvenireAudio !== 'undefined' && ConvenireAudio.playPowerOn) {
          ConvenireAudio.playPowerOn();
        }
      }, 240);
    });
  }
});

/* ==========================================================================
   CONVENIRE — PREMIUM SCROLL EFFECTS ENGINE
   ========================================================================== */

(function () {
  'use strict';

  // ── 1. SCROLL PROGRESS BAR ──────────────────────────────────────────────
  const progressBar = document.createElement('div');
  progressBar.id = 'scrollProgressBar';
  document.body.prepend(progressBar);

  function updateProgressBar() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct.toFixed(2) + '%';
  }

  // ── 2. NAVBAR SCROLL SHRINK ─────────────────────────────────────────────
  const nav = document.getElementById('navbar');
  function updateNavbar() {
    if (!nav) return;
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  // ── 3. SCROLL-DOWN HINT (Hero) ──────────────────────────────────────────
  const heroSection = document.getElementById('home');
  let scrollHintEl = null;
  if (heroSection) {
    scrollHintEl = document.createElement('div');
    scrollHintEl.id = 'scrollHint';
    scrollHintEl.innerHTML = '<div class="hint-arrow"></div><span>SCROLL DOWN</span>';
    heroSection.appendChild(scrollHintEl);
    setTimeout(() => scrollHintEl.classList.add('visible'), 2500);
  }

  function hideScrollHint() {
    if (scrollHintEl && window.scrollY > 80) {
      scrollHintEl.classList.remove('visible');
    }
  }

  // ── 4. PARALLAX (hero title + image) ───────────────────────────────────
  const heroTitle = document.querySelector('.hero-title');
  const heroImg   = document.querySelector('.hero-puzzle-img');

  function updateParallax() {
    const y = window.scrollY;
    if (heroTitle) {
      heroTitle.style.transform = 'translateY(' + (y * 0.18) + 'px)';
    }
    if (heroImg) {
      heroImg.style.transform = 'translateY(' + (y * -0.12) + 'px)';
    }
  }

  // ── 5. SECTION SCAN WIPE & TITLE GLOW (fires once per section) ─────────
  const sectionsSeen = new Set();
  const allSections = document.querySelectorAll('section[id]');

  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var sec = entry.target;
      if (entry.isIntersecting) {
        sec.classList.add('in-view');

        if (!sectionsSeen.has(sec.id)) {
          sectionsSeen.add(sec.id);

          // Scan wipe line
          var flash = document.createElement('div');
          flash.className = 'section-scan-flash';
          sec.appendChild(flash);
          setTimeout(function () { if (flash.parentNode) flash.parentNode.removeChild(flash); }, 1200);

          // Glow pulse on section title
          var secTitle = sec.querySelector('.section-title');
          if (secTitle) {
            secTitle.classList.remove('glow-animate');
            void secTitle.offsetWidth;
            secTitle.classList.add('glow-animate');
          }
        }
      } else {
        sec.classList.remove('in-view');
      }
    });
  }, { threshold: 0.08 });

  allSections.forEach(function (sec) { sectionObserver.observe(sec); });

  // ── 6. REVEAL ON SCROLL ─────────────────────────────────────────────────
  var REVEAL_SELECTORS = [
    '.reveal-on-scroll',
    '.reveal-left',
    '.reveal-right',
    '.reveal-scale',
    '.card.spotlight-card',
    '.feature-box.spotlight-card',
    '.dev-profile-card.spotlight-card',
    '.feature-cyber-card.spotlight-card',
    '.comp-ref-card.spotlight-card',
    '.port-item-card.spotlight-card',
    '.crimp-step-card.spotlight-card',
    '.rubric-card.spotlight-card',
    '.tut-guide-card.spotlight-card',
    '.story-video-container.spotlight-card',
    '.loop-step-item',
    '.hud-item',
    '.curr-pill',
    '.keycap-card',
    '.star-rank-card',
    '.header-line',
  ].join(', ');

  var revealEls = document.querySelectorAll(REVEAL_SELECTORS);

  // Apply stagger delays to sibling groups
  var cardGridParents = [
    { parent: '.cards-grid',                sel: '.card.spotlight-card' },
    { parent: '.features-grid',             sel: '.feature-box.spotlight-card' },
    { parent: '.hero-feature-cards',        sel: '.feature-cyber-card.spotlight-card' },
    { parent: '.dev-team-grid',             sel: '.dev-profile-card.spotlight-card' },
    { parent: '.components-reference-grid', sel: '.comp-ref-card.spotlight-card' },
    { parent: '.ports-reference-grid',      sel: '.port-item-card.spotlight-card' },
    { parent: '.crimping-steps-timeline',   sel: '.crimp-step-card.spotlight-card' },
    { parent: '.rubric-cards-grid',         sel: '.rubric-card.spotlight-card' },
    { parent: '.game-loop-steps',           sel: '.loop-step-item' },
    { parent: '.hud-feature-list',          sel: '.hud-item' },
    { parent: '.banner-badge-group',        sel: '.curr-pill' },
    { parent: '.keycaps-grid',              sel: '.keycap-card' },
    { parent: '.stars-row',                 sel: '.star-rank-card' },
    { parent: '.tech-matrix-grid',          sel: '.tech-matrix-card.spotlight-card' },
  ];

  cardGridParents.forEach(function (cfg) {
    document.querySelectorAll(cfg.parent).forEach(function (parentEl) {
      var siblings = parentEl.querySelectorAll(cfg.sel);
      siblings.forEach(function (el, i) {
        el.style.transitionDelay = (i * 0.1) + 's';
      });
    });
  });

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(function (el) { revealObserver.observe(el); });

  // ── 7. UNIFIED SCROLL HANDLER (rAF throttled) ──────────────────────────
  var ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateProgressBar();
        updateNavbar();
        updateParallax();
        hideScrollHint();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Initial run
  updateProgressBar();
  updateNavbar();

})();
