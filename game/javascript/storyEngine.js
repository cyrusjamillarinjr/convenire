/**
 * CONVENIRE - Interactive Storyline Engine & Dialogue System
 */

(function() {
    window.StoryEngine = {
        typewriterTimer: null,

        showStory: function(options) {
            const {
                title = "MISSION BRIEFING",
                badge = "CHAPTER 1",
                avatar = "👨‍💻",
                avatarName = "Chief Alex",
                speaker = "CHIEF ENGINEER ALEX",
                dialogues = [],
                onComplete = function() {}
            } = options;

            // Remove existing overlay if present
            let existingOverlay = document.getElementById('storyOverlay');
            if (existingOverlay) existingOverlay.remove();

            // Build DOM structure
            const overlay = document.createElement('div');
            overlay.id = 'storyOverlay';
            overlay.className = 'story-overlay';
            overlay.style.position = 'fixed';
            overlay.style.inset = '0';
            overlay.style.zIndex = '100000';

            overlay.innerHTML = `
                <div class="story-box" id="storyBox">
                    <div class="story-header">
                        <span class="story-title">⚡ ${title}</span>
                        <span class="story-badge">${badge}</span>
                    </div>
                    <div class="story-body">
                        <div class="story-avatar">
                            <span>${avatar}</span>
                            <div class="story-avatar-name">${avatarName}</div>
                        </div>
                        <div class="story-content">
                            <div class="story-speaker">${speaker}</div>
                            <div class="story-text" id="storyText"></div>
                        </div>
                    </div>
                    <div class="story-footer">
                        <button class="story-btn story-btn-skip" id="storySkipBtn">⚡ SKIP STORY</button>
                        <button class="story-btn story-btn-next" id="storyNextBtn">NEXT ➡</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            let currentStep = 0;
            const storyBox = document.getElementById('storyBox');
            const storyText = document.getElementById('storyText');
            const nextBtn = document.getElementById('storyNextBtn');
            const skipBtn = document.getElementById('storySkipBtn');

            function typeWriter(text, i, fnCallback) {
                if (i < text.length) {
                    storyText.innerHTML = text.substring(0, i+1) + '<span class="cursor">|</span>';
                    window.StoryEngine.typewriterTimer = setTimeout(function() {
                        typeWriter(text, i + 1, fnCallback);
                    }, 22);
                } else if (typeof fnCallback == 'function') {
                    storyText.innerHTML = text;
                    fnCallback();
                }
            }

            function playDialogueStep(stepIndex) {
                if (window.StoryEngine.typewriterTimer) {
                    clearTimeout(window.StoryEngine.typewriterTimer);
                }

                if (stepIndex >= dialogues.length) {
                    closeStory();
                    return;
                }

                const currentText = dialogues[stepIndex];
                if (stepIndex === dialogues.length - 1) {
                    nextBtn.innerHTML = "BEGIN MISSION 🚀";
                } else {
                    nextBtn.innerHTML = "NEXT ➡";
                }

                typeWriter(currentText, 0, null);
            }

            function closeStory() {
                if (window.StoryEngine.typewriterTimer) {
                    clearTimeout(window.StoryEngine.typewriterTimer);
                }
                document.removeEventListener('keydown', handleKeydown);
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.remove();
                    if (typeof onComplete === 'function') onComplete();
                }, 300);
            }

            function advanceDialogue() {
                if (storyText.innerHTML.includes('<span class="cursor">|</span>')) {
                    // Instantly complete current dialogue if currently typing
                    clearTimeout(window.StoryEngine.typewriterTimer);
                    storyText.innerHTML = dialogues[currentStep];
                } else {
                    currentStep++;
                    playDialogueStep(currentStep);
                }
            }

            function handleKeydown(e) {
                if (e.key === 'Escape') {
                    closeStory();
                } else if (e.key === 'Enter' || e.key === ' ') {
                    advanceDialogue();
                }
            }

            nextBtn.addEventListener('click', advanceDialogue);
            skipBtn.addEventListener('click', closeStory);

            // Clicking backdrop outside the dialog box closes it
            overlay.addEventListener('click', function(e) {
                if (!storyBox.contains(e.target)) {
                    closeStory();
                }
            });

            document.addEventListener('keydown', handleKeydown);

            // Start first dialogue
            playDialogueStep(0);
        }
    };
})();
