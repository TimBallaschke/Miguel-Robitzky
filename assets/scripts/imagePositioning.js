// Image positioning script - clones project images with fixed positioning
// Only applies on desktop (viewport width > 768px)
document.addEventListener('DOMContentLoaded', function() {
    const scroller = document.querySelector('.scroller');
    const projectsImages = document.querySelectorAll('.projects-images');
    const projectTextContainers = document.querySelectorAll('.project-text-container:not(.project-text-clone)');
    
    if (!scroller || !projectsImages.length) {
        return;
    }

    // Store clones and their original elements
    const imageClones = [];
    const textBackgroundClones = []; // Text background clones (inside images container)
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
        
        // Get text background clones (inside images container, share same mask)
        textBackgroundClones.length = 0;
        const textBgClones = clonesContainer.querySelectorAll('.project-text-background-clone');
        projectTextContainers.forEach((original, index) => {
            const clone = textBgClones[index];
            if (clone) {
                textBackgroundClones.push({
                    original,
                    clone
                });
            }
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
        
        // Position text background clones (follow original text containers)
        textBackgroundClones.forEach(({ original, clone }) => {
            const rect = original.getBoundingClientRect();
            clone.style.top = rect.top + 'px';
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
    let currentOpacity = '0'; // Clones hidden initially, revealed with content container

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
        
        // Show clones only when content is visible and not in fullscreen
        const shouldShowClones = !isContentHidden && !isFullscreenOpen;
        const targetOpacity = shouldShowClones ? '1' : '0';
        
        // Update clone opacity
        if (currentOpacity !== targetOpacity) {
            clonesContainer.style.opacity = targetOpacity;
            clonesContainer.style.pointerEvents = 'none';
            currentOpacity = targetOpacity;
        }
        
        // Hide unmasked clone when inner-scroller-2 has connected-middle class
        if (unmaskedContainer && innerScroller2) {
            const projectTextClonesContainer = document.querySelector('.project-text-clones-container');
            const hasInnerScrollerConnectedMiddle = innerScroller2.classList.contains('connected-middle');
            if (hasInnerScrollerConnectedMiddle) {
                unmaskedContainer.style.display = 'none';
                if (projectTextClonesContainer) {
                    projectTextClonesContainer.style.transition = 'unset';
                }
            } else {
                unmaskedContainer.style.display = 'block';
                if (projectTextClonesContainer) {
                    projectTextClonesContainer.style.transition = 'opacity 0.3s ease-in-out';
                }
                // Also set opacity based on content visibility (same as regular clones)
                unmaskedContainer.style.opacity = shouldShowClones ? '1' : '0';
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
    
    // Set clones hidden initially (will be revealed with content container)
    if (clonesContainer) {
        clonesContainer.style.opacity = '0';
        clonesContainer.style.pointerEvents = 'none';
        // Add smooth transition for reveal
        clonesContainer.style.transition = 'opacity 500ms ease-in-out';
    }
    
    // Set unmasked clone hidden initially (desktop only)
    if (unmaskedContainer && !isMobile()) {
        unmaskedContainer.style.display = 'block';
        unmaskedContainer.style.opacity = '0';
        unmaskedContainer.style.pointerEvents = 'none';
        unmaskedContainer.style.transition = 'opacity 500ms ease-in-out';
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

    setInterval(() => {
        updateCloneVisibility();
    }, 500);
    
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

