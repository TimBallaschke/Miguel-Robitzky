// Image positioning script - clones project images with fixed positioning
// Only applies on desktop (viewport width > 768px)
document.addEventListener('DOMContentLoaded', function() {
    const scroller = document.querySelector('.scroller');
    const projectsImages = document.querySelectorAll('.projects-images');
    
    if (!scroller || !projectsImages.length) {
        return;
    }

    // Store clones and their original elements
    const imageClones = [];
    let unmaskedClone = null;
    
    // Get the pre-existing clones container from the DOM (populated by PHP)
    const clonesContainer = document.querySelector('.projects-images-clones-container');
    const unmaskedContainer = document.querySelector('.projects-images-unmasked-container');
    
    if (!clonesContainer) {
        return;
    }

    // Check if device is mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // Initialize clones (they already exist in DOM from PHP)
    function initializeClones() {
        imageClones.length = 0;
        unmaskedClone = null;

        // Skip on mobile
        if (isMobile()) {
            clonesContainer.style.display = 'none';
            if (unmaskedContainer) {
                unmaskedContainer.style.display = 'none';
            }
            return;
        }
        
        // Show containers on desktop
        clonesContainer.style.display = 'block';
        if (unmaskedContainer) {
            unmaskedContainer.style.display = 'block';
        }

        // Get the clones that were rendered by PHP
        const clones = clonesContainer.querySelectorAll('.projects-images-clone');
        
        // Match each clone with its original
        projectsImages.forEach((original, index) => {
            const clone = clones[index];
            
            if (!clone) {
                return;
            }
            
            // Keep originals visible (they're inside content-container)
            // Only clones will have controlled opacity
            
            // Store reference
            imageClones.push({
                original,
                clone
            });
        });
        
        // Get the unmasked clone (only for first project)
        if (unmaskedContainer && projectsImages.length > 0) {
            const unmaskedCloneEl = unmaskedContainer.querySelector('.projects-images-unmasked-clone');
            if (unmaskedCloneEl) {
                unmaskedClone = {
                    original: projectsImages[0], // Track first project
                    clone: unmaskedCloneEl
                };
            }
        }
    }

    // Update clone positions to follow originals
    // Clones are positioned absolutely within fixed container at 0,0
    // Use viewport coordinates (from getBoundingClientRect) directly
    function updateClonePositions() {
        // Skip on mobile
        if (isMobile()) {
            return;
        }

        imageClones.forEach(({ original, clone }, index) => {
            // Get the position of the original element (viewport coordinates)
            const rect = original.getBoundingClientRect();
            
            // Position the clone using viewport coordinates (same as SVG mask)
            clone.style.top = rect.top + 'px';
            clone.style.left = rect.left + 'px';
            clone.style.width = rect.width + 'px';
            clone.style.height = rect.height + 'px';
        });
        
        // Also position the unmasked clone (follows first project)
        if (unmaskedClone) {
            const rect = unmaskedClone.original.getBoundingClientRect();
            unmaskedClone.clone.style.top = rect.top + 'px';
            unmaskedClone.clone.style.left = rect.left + 'px';
            unmaskedClone.clone.style.width = rect.width + 'px';
            unmaskedClone.clone.style.height = rect.height + 'px';
        }
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
    let currentOpacity = '1'; // Clones visible from start

    // Function to control container visibility based on connection state
    // Container (with mask) should only be visible when red SVG is being drawn
    // AND when content-container is not hidden
    // AND when fullscreen gallery is not open
    function updateCloneVisibility() {
        if (!numberContainer2 || isMobile()) return;
        
        const hasConnectedTop = numberContainer2.classList.contains('connected-top');
        const hasConnectedMiddle = numberContainer2.classList.contains('connected-middle');
        const isConnected = hasConnectedTop || hasConnectedMiddle;
        
        // Also check if content-container is hidden
        const contentContainer = document.querySelector('.content-container');
        const isContentHidden = contentContainer && contentContainer.classList.contains('hidden');
        
        // Check if fullscreen gallery is open
        const isFullscreenOpen = document.body.classList.contains('fullscreen-gallery');
        
        // Show clones from the beginning (always visible unless fullscreen is open)
        const targetOpacity = !isFullscreenOpen ? '1' : '0';
        
        // Update clone opacity
        if (currentOpacity !== targetOpacity) {
            clonesContainer.style.opacity = targetOpacity;
            clonesContainer.style.pointerEvents = 'none';
            currentOpacity = targetOpacity;
        }
        
        // Hide unmasked clone when connected-middle is active
        if (unmaskedContainer) {
            if (hasConnectedMiddle) {
                unmaskedContainer.style.display = 'none';
            } else {
                unmaskedContainer.style.display = 'block';
            }
        }
        
        // Always keep originals hidden - clones are always visible now
        imageClones.forEach(({ original }) => {
            original.style.opacity = '0';
        });
    }
    
    // Use requestAnimationFrame to batch updates and reduce flickering
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
    
    // Set clones visible from start
    if (clonesContainer) {
        clonesContainer.style.opacity = '1';
        clonesContainer.style.pointerEvents = 'none';
    }
    
    // Set unmasked clone visible from start (desktop only)
    if (unmaskedContainer && !isMobile()) {
        unmaskedContainer.style.display = 'block';
        unmaskedContainer.style.opacity = '1';
        unmaskedContainer.style.pointerEvents = 'none';
    }
    
    // Hide all originals from the start
    imageClones.forEach(({ original }) => {
        original.style.opacity = '0';
    });
    
    updateClonePositions();
    updateCloneVisibility(); // Initial visibility check

    // Update on scroll - use RAF for smoother performance and avoid flickering
    scroller.addEventListener('scroll', scheduleUpdate, { passive: true });
    
    // Update on resize
    window.addEventListener('resize', () => {
        handleResize();
        updateCloneVisibility();
    });
    
    // Watch for changes to content-container class (when "hidden" is removed)
    const contentContainer = document.querySelector('.content-container');
    if (contentContainer) {
        const observer = new MutationObserver(() => {
            updateCloneVisibility();
        });
        observer.observe(contentContainer, { 
            attributes: true, 
            attributeFilter: ['class'] 
        });
    }
    
    // Watch for changes to body class (when "fullscreen-gallery" is added/removed)
    const bodyObserver = new MutationObserver(() => {
        updateCloneVisibility();
    });
    bodyObserver.observe(document.body, { 
        attributes: true, 
        attributeFilter: ['class'] 
    });
    
    // Expose update functions globally for manual triggering
    window.forceImageClonesUpdate = function() {
        updateClonePositions();
        updateCloneVisibility();
    };
});

