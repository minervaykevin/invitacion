document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('intro-video');
    const infoButtonContainer = document.getElementById('info-button-container');

    // Play video when user clicks/taps anywhere on the screen
    const handlePlay = () => {
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

        // 3. Perform redirect after 2 seconds (when transitions finish)
        setTimeout(() => {
            window.location.href = infoBtn.href;
        }, duration);
    });
});
