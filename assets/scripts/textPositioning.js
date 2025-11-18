// Text positioning script - clones project text containers with fixed positioning
// Only applies on desktop (viewport width > 768px)
document.addEventListener('DOMContentLoaded', function() {
    const scroller = document.querySelector('.scroller');
    const projectTextContainers = document.querySelectorAll('.project-text-container:not(.project-text-clone)');
    
    if (!scroller || !projectTextContainers.length) {
        return;
    }

    // Store clones and their original elements
    const textClones = [];
    
    // Get the pre-existing clones container from the DOM (populated by PHP)
    const clonesContainer = document.querySelector('.project-text-clones-container');
    
    if (!clonesContainer) {
        return;
    }

    // Check if device is mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // Initialize clones (they already exist in DOM from PHP)
    function initializeClones() {
        textClones.length = 0;

        // Skip on mobile
        if (isMobile()) {
            clonesContainer.style.display = 'none';
            return;
        }
        
        // Show container on desktop
        clonesContainer.style.display = 'block';

        // Get the clones that were rendered by PHP
        const clones = clonesContainer.querySelectorAll('.project-text-clone');
        
        // Match each clone with its original
        projectTextContainers.forEach((original, index) => {
            const clone = clones[index];
            
            if (!clone) {
                return;
            }
            
            // Store reference
            textClones.push({
                original,
                clone
            });
        });
    }

    // Update clone positions to follow originals
    // Clones are positioned absolutely within fixed container at 0,0
    // Use viewport coordinates (from getBoundingClientRect) directly
    function updateClonePositions() {
        // Skip on mobile
        if (isMobile()) {
            return;
        }

        textClones.forEach(({ original, clone }) => {
            // Get the position of the original element (viewport coordinates)
            const rect = original.getBoundingClientRect();
            
            // Position the clone using viewport coordinates
            clone.style.top = rect.top + 'px';
            clone.style.left = rect.left + 'px';
            clone.style.width = rect.width + 'px';
            clone.style.height = rect.height + 'px';
        });
    }

    // Handle resize - re-initialize if switching between mobile/desktop
    let wasMobile = isMobile();
    function handleResize() {
        const nowMobile = isMobile();
        
        if (wasMobile !== nowMobile) {
            // Mode changed, re-initialize clones
            initializeClones();
            wasMobile = nowMobile;
        }
        
        updateClonePositions();
    }

    // Get inner-scroller-2 and number-container-2 to check connection state
    const innerScroller2 = document.querySelector('#inner-scroller-2');
    const numberContainer2 = document.querySelector('#number-2-container');
    
    // Track current visibility state to avoid unnecessary updates
    let currentOpacity = '0';
    
    // Function to control container visibility based on connection state
    function updateCloneVisibility() {
        if (!numberContainer2 || isMobile()) return;
        
        const hasConnectedTop = numberContainer2.classList.contains('connected-top');
        const hasConnectedMiddle = numberContainer2.classList.contains('connected-middle');
        const isConnected = hasConnectedTop || hasConnectedMiddle;
        
        const targetOpacity = isConnected ? '1' : '0';
        
        // Only update if opacity actually changed
        if (currentOpacity !== targetOpacity) {
            clonesContainer.style.opacity = targetOpacity;
            currentOpacity = targetOpacity;
        }
    }
    
    // Use requestAnimationFrame to batch updates
    let rafScheduled = false;
    
    function scheduleUpdate() {
        if (!rafScheduled) {
            rafScheduled = true;
            requestAnimationFrame(() => {
                updateClonePositions();
                updateCloneVisibility();
                rafScheduled = false;
            });
        }
    }
    
    // Initialize - clones already in DOM from PHP
    initializeClones();
    updateClonePositions();
    updateCloneVisibility(); // Initial visibility check

    // Update on scroll - use RAF for smoother performance
    scroller.addEventListener('scroll', scheduleUpdate, { passive: true });
    
    // Update on resize
    window.addEventListener('resize', () => {
        handleResize();
        updateCloneVisibility();
    });
});

