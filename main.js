document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('intro-video');
    const infoButtonContainer = document.getElementById('info-button-container');

    // Web Audio API setup for iOS volume fading compatibility
    let audioCtx = null;
    let gainNode = null;
    let source = null;
    let audioInitialized = false;

    const initAudio = () => {
        if (audioInitialized) return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
                gainNode = audioCtx.createGain();
                
                // Keep initial volume at 1.0 (100%)
                gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
                
                // Create source from the video element and route it through the gain node to the destination
                source = audioCtx.createMediaElementSource(video);
                source.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                audioInitialized = true;
                console.log("Web Audio API initialized successfully.");
            }
        } catch (error) {
            console.warn("Web Audio API not supported or initialization failed, using standard fallback:", error);
            audioInitialized = false;
        }
    };

    // Play video when user clicks/taps anywhere on the screen
    const handlePlay = () => {
        // Initialize/resume AudioContext on first user interaction
        initAudio();
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        if (video.paused) {
            video.play().catch(error => {
                console.error("Playback failed, trying muted:", error);
                video.muted = true;
                video.play();
            });
        }
    };

    // Listen to click events on both video and its container
    video.addEventListener('click', handlePlay);
    document.getElementById('app-container').addEventListener('click', handlePlay);

    // Monitor playback time to reveal the button at 22s
    video.addEventListener('timeupdate', () => {
        if (video.currentTime >= 22) {
            infoButtonContainer.classList.remove('hidden');
        } else {
            infoButtonContainer.classList.add('hidden');
        }
    });

    // Handle cinematic redirect when "Más información" is clicked
    const infoBtn = document.getElementById('info-btn');
    const fadeOverlay = document.getElementById('fade-overlay');

    infoBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent immediate redirect
        
        // 1. Activate white screen fade transition
        fadeOverlay.classList.add('active');

        // 2. Gradually fade out the video audio over 2 seconds
        const duration = 2000; // 2 seconds

        if (audioInitialized && audioCtx && gainNode) {
            try {
                // Smoothly ramp the GainNode down to 0 over 2 seconds (perfect for iOS compatibility)
                gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2.0);
                console.log("Fading audio smoothly via Web Audio API...");
            } catch (error) {
                console.warn("Web Audio API fade failed, falling back to standard fade:", error);
                standardVolumeFade();
            }
        } else {
            standardVolumeFade();
        }

        function standardVolumeFade() {
            const startVolume = video.volume;
            const fadeInterval = 50; // ms
            const steps = duration / fadeInterval;
            const volumeStep = startVolume / steps;

            let currentStep = 0;
            const fadeAudio = setInterval(() => {
                currentStep++;
                if (video.volume > volumeStep) {
                    video.volume -= volumeStep;
                } else {
                    video.volume = 0;
                    clearInterval(fadeAudio);
                }

                if (currentStep >= steps) {
                    clearInterval(fadeAudio);
                }
            }, fadeInterval);
        }

        // 3. Perform redirect after 2 seconds (when transitions finish)
        setTimeout(() => {
            window.location.href = infoBtn.href;
        }, duration);
    });
});
