/**
 * CONVENIRE - Realistic Vector Animated Hand Engine & Academy Tutorial Simulation
 * 100% Alpha-Transparent Anatomically Detailed Human Hand (Zero Background Artifacts)
 */

(function() {
    // Generate Realistic Human Hand Vector SVG Markup
    function getRealisticHandSVG() {
        return `
            <svg viewBox="0 0 140 140" class="realistic-hand-vector-svg" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <!-- Realistic Human Skin Tones & Subsurface Shading -->
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
                    <filter id="handSoftShadow" x="-25%" y="-25%" width="150%" height="150%">
                        <feDropShadow dx="3" dy="6" stdDeviation="5" flood-color="#000000" flood-opacity="0.55" />
                    </filter>
                </defs>
                <g filter="url(#handSoftShadow)">
                    <!-- Forearm / Wrist base -->
                    <path class="hand-wrist" d="M 52 138 C 54 112, 50 96, 55 84 C 66 84, 86 87, 97 92 C 99 108, 97 122, 99 138 Z" fill="url(#skinGrad1)" stroke="#884824" stroke-width="1.2" />

                    <!-- Palm Body -->
                    <path class="hand-palm" d="M 48 86 C 36 74, 37 52, 50 46 C 66 40, 88 44, 98 58 C 105 70, 101 88, 93 92 C 78 96, 60 92, 48 86 Z" fill="url(#skinGradPalm)" stroke="#884824" stroke-width="1.2" />

                    <!-- Realistic Creases & Skin folds -->
                    <path d="M 55 82 C 60 70, 70 62, 80 60" fill="none" stroke="#ba7045" stroke-width="1.4" stroke-linecap="round" opacity="0.6" />
                    <path d="M 64 86 C 74 78, 86 76, 92 82" fill="none" stroke="#ba7045" stroke-width="1.2" stroke-linecap="round" opacity="0.5" />

                    <!-- Pinky Finger (Curved Gripping Anatomy) -->
                    <path class="finger-pinky" d="M 94 58 C 105 46, 115 42, 119 46 C 123 52, 115 62, 105 70 C 99 76, 94 72, 94 58 Z" fill="url(#skinGrad1)" stroke="#884824" stroke-width="1.2" />
                    <path d="M 113 44 C 116 43, 119 45, 119 48 C 118 50, 115 51, 113 50 Z" fill="url(#fingerNailGrad)" />

                    <!-- Ring Finger (Curved Gripping Anatomy) -->
                    <path class="finger-ring" d="M 86 48 C 97 32, 109 26, 113 30 C 117 36, 107 48, 97 58 C 91 62, 86 58, 86 48 Z" fill="url(#skinGrad1)" stroke="#884824" stroke-width="1.2" />
                    <path d="M 95 40 C 98 38, 102 40, 103 42" fill="none" stroke="#ba7045" stroke-width="1" opacity="0.6" />
                    <path d="M 107 28 C 110 27, 114 29, 114 32 C 113 34, 110 35, 107 34 Z" fill="url(#fingerNailGrad)" />

                    <!-- Middle Finger (Dominant Gripping Finger) -->
                    <path class="finger-middle" d="M 72 42 C 78 20, 89 12, 95 16 C 101 22, 93 38, 85 52 C 79 56, 72 52, 72 42 Z" fill="url(#skinGrad1)" stroke="#884824" stroke-width="1.2" />
                    <path d="M 79 28 C 83 26, 89 28, 91 31" fill="none" stroke="#ba7045" stroke-width="1" opacity="0.6" />
                    <path d="M 89 14 C 92 13, 96 15, 96 18 C 95 20, 92 21, 89 20 Z" fill="url(#fingerNailGrad)" />

                    <!-- Index Finger (Precision Tip & Grip) -->
                    <path class="finger-index" d="M 54 46 C 54 26, 62 16, 68 18 C 74 22, 72 36, 68 50 C 62 54, 56 52, 54 46 Z" fill="url(#skinGrad1)" stroke="#884824" stroke-width="1.2" />
                    <path d="M 58 32 C 62 30, 66 32, 68 34" fill="none" stroke="#ba7045" stroke-width="1" opacity="0.6" />
                    <path d="M 62 17 C 65 16, 68 18, 68 20 C 67 22, 65 23, 62 22 Z" fill="url(#fingerNailGrad)" />

                    <!-- Thumb (Opposing Pincher Grip) -->
                    <path class="finger-thumb" d="M 44 68 C 26 58, 20 48, 28 38 C 36 30, 48 44, 52 56 C 54 62, 50 68, 44 68 Z" fill="url(#skinGrad1)" stroke="#884824" stroke-width="1.2" />
                    <path d="M 32 46 C 36 44, 40 46, 42 50" fill="none" stroke="#ba7045" stroke-width="1" opacity="0.6" />
                    <path d="M 23 38 C 26 34, 30 36, 31 39 C 30 42, 26 42, 23 38 Z" fill="url(#fingerNailGrad)" />
                </g>
            </svg>
        `;
    }

    // Expose Global Realistic Hand Helper
    window.RealisticHandSVG = getRealisticHandSVG;

    const HAND_SPRITES = {
        hover: 'images/hands/hand-hover.png',
        point: 'images/hands/hand-point.png',
        pinch: 'images/hands/hand-pinch.png',
        grab: 'images/hands/hand-grab.png',
        release: 'images/hands/hand-release.png',
        thumbsup: 'images/hands/hand-thumbsup.png'
    };

    window.TutorialEngine = {
        isSimulating: false,

        /**
         * Run Realistic Hand Simulation
         * @param {Array} steps Array of { sourceEl: HTMLElement, targetEl: HTMLElement, instruction: String, compImgSrc: String }
         * @param {Function} onComplete Callback when demonstration completes
         */
        runHandSimulation: function(steps, onComplete) {
            if (this.isSimulating) return;
            this.isSimulating = true;

            // Create or get realistic animated hand element
            let hand = document.getElementById('animatedHand');
            if (!hand) {
                hand = document.createElement('div');
                hand.id = 'animatedHand';
                hand.className = 'animated-realistic-hand frame-hover';
                hand.innerHTML = `
                    <img src="${HAND_SPRITES.hover}" class="game-hand-photo-sprite" id="gameHandPhoto" alt="Tutorial Hand">
                    <div class="hand-held-item" id="handHeldItem"></div>
                `;
                document.body.appendChild(hand);
            }

            const photoEl = document.getElementById('gameHandPhoto');
            const heldItem = document.getElementById('handHeldItem');
            hand.style.display = 'flex';
            hand.style.opacity = '1';

            function setHandState(state) {
                if (!hand) return;
                hand.className = 'animated-realistic-hand frame-' + state;
                if (photoEl && HAND_SPRITES[state]) {
                    photoEl.src = HAND_SPRITES[state];
                }
            }

            // Create floating guidance HUD banner
            let banner = document.getElementById('tutorialBanner');
            if (!banner) {
                banner = document.createElement('div');
                banner.id = 'tutorialBanner';
                banner.className = 'tutorial-hud-banner';
                document.body.appendChild(banner);
            }

            let currentStepIdx = 0;

            function processStep() {
                if (currentStepIdx >= steps.length) {
                    // Celebration Frame: Thumbs-up
                    setHandState('thumbsup');
                    if (banner) {
                        banner.innerHTML = `<span class="hud-banner-icon">👍</span> <strong>TUTORIAL COMPLETE!</strong> Socket all remaining components.`;
                    }
                    setTimeout(() => {
                        hand.style.opacity = '0';
                        setTimeout(() => {
                            hand.style.display = 'none';
                            if (banner) banner.remove();
                            window.TutorialEngine.isSimulating = false;
                            if (typeof onComplete === 'function') onComplete();
                        }, 400);
                    }, 1400);
                    return;
                }

                const step = steps[currentStepIdx];
                let sourceEl = typeof step.sourceId === 'string' ? document.getElementById(step.sourceId) : step.sourceEl;
                let targetZone = typeof step.targetZoneAccept === 'string' 
                    ? document.querySelector(`.drop-zone[data-accept="${step.targetZoneAccept}"]`) 
                    : (typeof step.targetId === 'string' ? document.getElementById(step.targetId) : step.targetEl);

                if (banner) {
                    banner.innerHTML = `<span class="hud-banner-icon">✋</span> <strong>DEMONSTRATION:</strong> ${step.instruction}`;
                    banner.style.display = 'flex';
                }

                if (!sourceEl || !targetZone) {
                    currentStepIdx++;
                    setTimeout(processStep, 800);
                    return;
                }

                // Calculate bounding positions
                const sourceRect = sourceEl.getBoundingClientRect();
                const targetRect = targetZone.getBoundingClientRect();

                const startX = sourceRect.left + sourceRect.width / 2 - 80;
                const startY = sourceRect.top + sourceRect.height / 2 - 35;

                const endX = targetRect.left + targetRect.width / 2 - 80;
                const endY = targetRect.top + targetRect.height / 2 - 35;

                // Frame 1: Pointing / Hovering over source component
                setHandState('point');
                if (heldItem) {
                    heldItem.classList.remove('visible');
                    heldItem.innerHTML = '';
                }
                hand.style.transition = 'none';
                hand.style.left = startX + 'px';
                hand.style.top = startY + 'px';

                targetZone.classList.add('highlight-target-pulse');

                // Step sequence: Point -> Pinch/Grab -> Drag Glide -> Snap Release
                setTimeout(() => {
                    // Frame 2: Firm Grip / Pinch on component
                    const isSmallComp = step.instruction && (step.instruction.toLowerCase().includes('cpu') || step.instruction.toLowerCase().includes('usb') || step.instruction.toLowerCase().includes('wire'));
                    setHandState(isSmallComp ? 'pinch' : 'grab');

                    const compImg = step.compImgSrc || sourceEl.querySelector('img')?.src;
                    if (compImg && heldItem) {
                        heldItem.innerHTML = `<img src="${compImg}" alt="Hardware">`;
                        heldItem.classList.add('visible');
                    }

                    setTimeout(() => {
                        // Smooth gliding trajectory carrying component
                        hand.style.transition = 'all 1.1s cubic-bezier(0.25, 1, 0.5, 1)';
                        hand.style.left = endX + 'px';
                        hand.style.top = endY + 'px';

                        setTimeout(() => {
                            // Frame 3: Realistic Seat & Release Component
                            setHandState('release');
                            if (heldItem) heldItem.classList.remove('visible');
                            targetZone.classList.remove('highlight-target-pulse');

                            // Socket verification spark
                            targetZone.classList.add('demo-socketed-success');

                            setTimeout(() => {
                                targetZone.classList.remove('demo-socketed-success');
                                currentStepIdx++;
                                setTimeout(processStep, 700);
                            }, 600);
                        }, 1100);
                    }, 400);
                }, 450);
            }

            processStep();
        },

        /**
         * Initialize Component Hover Tooltips
         */
        initComponentTooltips: function(specMap) {
            let tooltip = document.getElementById('specTooltip');
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.id = 'specTooltip';
                tooltip.className = 'spec-tooltip';
                tooltip.style.display = 'none';
                document.body.appendChild(tooltip);
            }

            const components = document.querySelectorAll('.component');
            components.forEach(comp => {
                const compId = comp.id;
                const spec = specMap[compId];
                if (!spec) return;

                comp.addEventListener('mouseenter', () => {
                    if (window.TutorialEngine.isSimulating) return;
                    tooltip.innerHTML = `
                        <div class="spec-tooltip-title">${spec.name}</div>
                        <div class="spec-tooltip-desc">${spec.desc}</div>
                    `;
                    tooltip.style.display = 'block';

                    const rect = comp.getBoundingClientRect();
                    tooltip.style.left = (rect.right + 15) + 'px';
                    tooltip.style.top = rect.top + 'px';
                });

                comp.addEventListener('mouseleave', () => {
                    tooltip.style.display = 'none';
                });
            });
        }
    };
})();
