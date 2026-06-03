// --- FINAL DAYS POPUP LOGIC ---

(function() {
    'use strict';

    // Configuration
    const DEADLINE = new Date('2026-05-12T21:00:00+02:00'); // 21:00 España martes 12 de mayo (UTC+2)
    const COUNTDOWN_UPDATE_INTERVAL = 1000; // Update every second
    const SIMULATE_DEADLINE_REACHED = true; // SET TO FALSE TO DISABLE SIMULATION

    // DOM Elements
    const popup = document.getElementById('finalDaysPopup');
    const closeBtn = document.getElementById('finalDaysClose');
    const shopBtn = document.getElementById('finalDaysShopBtn');
    
    // Large countdown display (always visible, single element)
    const countdownLarge = document.getElementById('countdownLarge');
    const countdownLargeDays = document.getElementById('countdownLargeDays');
    const countdownLargeHours = document.getElementById('countdownLargeHours');
    const countdownLargeMinutes = document.getElementById('countdownLargeMinutes');
    const countdownLargeSeconds = document.getElementById('countdownLargeSeconds');

    // Verify critical elements exist
    if (!popup || !countdownLarge) {
        console.warn('[Final Days] Critical elements missing:', { popup: !!popup, countdownLarge: !!countdownLarge });
        return;
    }

    let countdownInterval = null;

    // Check if deadline has passed
    function isDeadlineReached() {
        if (SIMULATE_DEADLINE_REACHED) return true;
        return new Date() >= DEADLINE;
    }

    // Show NIERIKA video and apply dark theme
    function activateNierika() {
        // Show video as map element (clone template and make visible)
        const videoTemplate = document.getElementById('nierika-video-template');
        if (videoTemplate) {
            videoTemplate.style.display = 'block';
        }
        
        // Hide popup if visible
        if (popup) {
            popup.style.display = 'none';
        }
        
        // Update countdown to show "DROP 1 NOW AVAILABLE"
        // Hide individual countdown elements
        if (countdownLargeDays) countdownLargeDays.style.display = 'none';
        if (countdownLargeHours) countdownLargeHours.style.display = 'none';
        if (countdownLargeMinutes) countdownLargeMinutes.style.display = 'none';
        if (countdownLargeSeconds) countdownLargeSeconds.style.display = 'none';
        
        // Add new div for "DROP 1 NOW AVAILABLE" text
        const countdownLargeContent = document.querySelector('.countdown-large-content');
        if (countdownLargeContent) {
            // Remove old content
            countdownLargeContent.innerHTML = '';
            
            // Create new drop text element
            const dropText = document.createElement('div');
            dropText.className = 'drop-text-container';
            dropText.innerHTML = '<span class=\"drop-text\">DROP 2<br>NOW AVAILABLE</span>';
            countdownLargeContent.appendChild(dropText);
        }
        
        // Apply dark theme
        document.body.classList.add('nierika-active');
    }

    // Update all countdown displays
    function updateCountdown() {
        const now = new Date();
        const diff = DEADLINE - now;

        if (diff <= 0) {
            // Deadline reached - show NIERIKA video and dark theme
            activateNierika();
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const daysStr = String(days).padStart(2, '0');
        const hoursStr = String(hours).padStart(2, '0');
        const minutesStr = String(minutes).padStart(2, '0');
        const secondsStr = String(seconds).padStart(2, '0');

        // Update large countdown (single version)
        if (countdownLargeDays) countdownLargeDays.textContent = daysStr;
        if (countdownLargeHours) countdownLargeHours.textContent = hoursStr;
        if (countdownLargeMinutes) countdownLargeMinutes.textContent = minutesStr;
        if (countdownLargeSeconds) countdownLargeSeconds.textContent = secondsStr;
    }

    // Show popup function
    function showPopup() {
        // DO NOT SHOW if deadline has passed
        if (isDeadlineReached()) {
            return;
        }

        // Update countdown immediately
        updateCountdown();

        // Bring countdown to foreground
        if (countdownLarge) {
            countdownLarge.classList.add('popup-active');
        }

        // Reduce background audio volume when popup appears
        reduceBackgroundAudioVolume();

        // Show main popup with animation
        if (popup) {
            popup.style.display = 'flex';
            popup.style.opacity = '0';
            
            // Trigger reflow to enable CSS transitions
            void popup.offsetWidth;
            
            popup.style.opacity = '1';
        }

        // Setup event listeners
        setupEventListeners();
    }

    // Setup all event listeners
    function setupEventListeners() {
        // Close button handler
        if (closeBtn) {
            closeBtn.onclick = closePopup;
        }

        // Shop button handler
        if (shopBtn) {
            shopBtn.onclick = function() {
                window.location.href = 'https://shop.eaftimos.com/';
            };
        }

        // Allow closing with Escape key
        const handleEscape = function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                closePopup();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Click outside to close (on the dark overlay)
        if (popup) {
            popup.addEventListener('click', function(e) {
                if (e.target === popup) {
                    closePopup();
                }
            });
        }
    }

    // Close popup function
    function closePopup() {
        if (popup) {
            popup.style.opacity = '0';
        }
        
        // Remove popup-active class to restore countdown to background
        if (countdownLarge) {
            countdownLarge.classList.remove('popup-active');
        }
        
        setTimeout(() => {
            if (popup) popup.style.display = 'none';
            
            // Restore background audio volume
            restoreBackgroundAudioVolume();
        }, 600); // Match CSS transition duration
    }

    // Reduce background audio volume
    function reduceBackgroundAudioVolume() {
        // Find all audio elements on the page
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            if (!audio.dataset.originalVolume) {
                audio.dataset.originalVolume = audio.volume;
            }
            // Reduce volume significantly (to 10% of original)
            audio.volume = (audio.dataset.originalVolume || 0.5) * 0.1;
        });
        
        // Also reduce global UI sounds volume if available
        if (typeof window.setUIAudioVolume === 'function') {
            window.setUIAudioVolume(0.05);
        }
    }

    // Restore background audio volume
    function restoreBackgroundAudioVolume() {
        // Restore all audio elements to original volume
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            audio.volume = audio.dataset.originalVolume || 0.5;
        });
        
        // Restore global UI sounds volume if available
        if (typeof window.setUIAudioVolume === 'function') {
            window.setUIAudioVolume(0.15);
        }
    }

    // Hook into preloader ENTER button
    function setupPreloaderHook() {
        // Wait for preloader enter button to be available
        const checkForButton = setInterval(function() {
            const enterBtn = document.getElementById('preloaderEnterBtn');
            
            if (enterBtn) {
                clearInterval(checkForButton);
                
                // Add click listener to show popup
                enterBtn.addEventListener('click', function() {
                    // Show popup after a short delay (allows preloader animations to start)
                    setTimeout(showPopup, 200);
                });
            }
        }, 100);
        
        // Stop checking after 5 seconds
        setTimeout(() => clearInterval(checkForButton), 5000);
    }

    // Initialize
    function initialize() {
        // Check if deadline has already passed
        if (isDeadlineReached()) {
            activateNierika();
            return;
        }

        // Ensure countdown is visible at start (not in popup-active mode)
        if (countdownLarge) {
            countdownLarge.classList.remove('popup-active');
            countdownLarge.style.display = 'flex';
        }

        // Update countdown immediately
        updateCountdown();

        // Start countdown timer (update every second)
        countdownInterval = setInterval(updateCountdown, COUNTDOWN_UPDATE_INTERVAL);

        // Hook into preloader enter button
        setupPreloaderHook();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
