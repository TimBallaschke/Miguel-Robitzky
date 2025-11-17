// Image positioning script - clones project images with fixed positioning
// Only applies on desktop (viewport width > 768px)
document.addEventListener('DOMContentLoaded', function() {
    console.log('[ImagePositioning] Script initialized');
    
    const scroller = document.querySelector('.scroller');
    const projectsImages = document.querySelectorAll('.projects-images');
    
    console.log('[ImagePositioning] Found elements:', {
        scroller: !!scroller,
        projectsImagesCount: projectsImages.length
    });
    
    if (!scroller || !projectsImages.length) {
        console.log('[ImagePositioning] Missing required elements, exiting');
        return;
    }

    // Store clones and their original elements
    const imageClones = [];
    
    // Get the pre-existing clones container from the DOM (populated by PHP)
    const clonesContainer = document.querySelector('.projects-images-clones-container');
    
    if (!clonesContainer) {
        console.log('[ImagePositioning] Clones container not found in DOM');
        return;
    }

    // Check if device is mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // Initialize clones (they already exist in DOM from PHP)
    function initializeClones() {
        console.log('[ImagePositioning] initializeClones() called');
        
        imageClones.length = 0;

        // Skip on mobile
        if (isMobile()) {
            console.log('[ImagePositioning] Mobile device detected, hiding clones');
            clonesContainer.style.display = 'none';
            // Show originals on mobile
            projectsImages.forEach(img => {
                img.style.opacity = '1';
            });
            return;
        }
        
        // Show container on desktop
        clonesContainer.style.display = 'block';
        
        console.log('[ImagePositioning] Container found in DOM with clones already rendered by PHP');

        // Get the clones that were rendered by PHP
        const clones = clonesContainer.querySelectorAll('.projects-images-clone');
        
        // Match each clone with its original
        projectsImages.forEach((original, index) => {
            const clone = clones[index];
            
            if (!clone) {
                console.log(`[ImagePositioning] Warning: Clone ${index} not found`);
                return;
            }
            
            console.log(`[ImagePositioning] Pairing clone ${index + 1}/${projectsImages.length}`);
            
            // Hide the original (clone will be visible instead)
            original.style.opacity = '0';
            
            // Store reference
            imageClones.push({
                original,
                clone
            });
        });
        
        console.log('[ImagePositioning] All clones initialized:', imageClones.length);
    }

    // Update clone positions to follow originals
    function updateClonePositions() {
        // Skip on mobile
        if (isMobile()) {
            // Show originals on mobile
            projectsImages.forEach(img => {
                img.style.opacity = '1';
            });
            return;
        }

        console.log('[ImagePositioning] updateClonePositions() called');

        imageClones.forEach(({ original, clone }, index) => {
            // Get the position of the original element
            const rect = original.getBoundingClientRect();
            
            // Position the clone to match the original
            clone.style.width = rect.width + 'px';
            clone.style.height = rect.height + 'px';
            clone.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
        
            // Control visibility based on whether it's in or near viewport
            const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
            clone.style.opacity = isInViewport ? '1' : '0';
            
            if (index === 0) {
                console.log('[ImagePositioning] First clone position:', {
                    width: rect.width,
                    height: rect.height,
                    left: rect.left,
                    top: rect.top,
                    isInViewport,
                    opacity: clone.style.opacity
                });
            }
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
    
    // Function to control clone visibility and mask based on connection state
    // Clones should only be visible when the red SVG is being drawn,
    // which happens when number-container-2 has 'connected-top' or 'connected-middle' class
    function updateCloneVisibility() {
        if (!numberContainer2 || isMobile()) return;
        
        const hasConnectedTop = numberContainer2.classList.contains('connected-top');
        const hasConnectedMiddle = numberContainer2.classList.contains('connected-middle');
        const isConnected = hasConnectedTop || hasConnectedMiddle;
        
        console.log('[ImagePositioning] Connection state:', {
            hasConnectedTop,
            hasConnectedMiddle,
            isConnected
        });
        
        if (isConnected) {
            clonesContainer.classList.add('masked');
            clonesContainer.style.opacity = '1';
            console.log('[ImagePositioning] Showing clones with mask (connected)');
        } else {
            clonesContainer.classList.remove('masked');
            clonesContainer.style.opacity = '0';
            console.log('[ImagePositioning] Hiding clones and mask (not connected)');
        }
    }
    
    // Initialize - clones already in DOM from PHP
    console.log('[ImagePositioning] Starting initialization...');
    
    initializeClones();
    updateClonePositions();
    updateCloneVisibility(); // Initial visibility check

    // Update on scroll
    scroller.addEventListener('scroll', () => {
        updateClonePositions();
        updateCloneVisibility();
    });
    
    // Update on resize
    window.addEventListener('resize', () => {
        handleResize();
        updateCloneVisibility();
    });
});

