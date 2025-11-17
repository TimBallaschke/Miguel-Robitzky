// Image positioning script - clones project images with fixed positioning
// Only applies on desktop (viewport width > 768px)
document.addEventListener('DOMContentLoaded', function() {
    const scroller = document.querySelector('.scroller');
    const projectsImages = document.querySelectorAll('.projects-images');
    
    if (!scroller || !projectsImages.length) return;

    // Store clones and their original elements
    const imageClones = [];
    
    // Single container for all clones with the mask applied
    let clonesContainer = null;

    // Check if device is mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // Create clones for all projects-images
    function createClones() {
        // Remove existing container and clones
        if (clonesContainer && clonesContainer.parentNode) {
            clonesContainer.remove();
        }
        imageClones.length = 0;

        // Skip on mobile
        if (isMobile()) return;

        // Create a single container for all clones
        clonesContainer = document.createElement('div');
        clonesContainer.className = 'projects-images-clones-container';
        
        // The container is fixed and covers the entire viewport
        clonesContainer.style.position = 'fixed';
        clonesContainer.style.top = '0';
        clonesContainer.style.left = '0';
        clonesContainer.style.width = '100vw';
        clonesContainer.style.height = '100vh';
        clonesContainer.style.zIndex = '100';
        clonesContainer.style.pointerEvents = 'none';
        clonesContainer.style.userSelect = 'none';
        
        // Apply the SVG mask to the container (not individual clones)
        // This mask stays in a fixed position, matching the red SVG
        const maskId = 'combined-mask-2';
        clonesContainer.style.mask = `url(#${maskId})`;
        clonesContainer.style.webkitMask = `url(#${maskId})`;
        
        // Append container to body
        document.body.appendChild(clonesContainer);

        projectsImages.forEach(original => {
            // Clone the element
            const clone = original.cloneNode(true);
            
            // Style the clone - position absolute within the fixed container
            clone.style.position = 'absolute';
            clone.style.top = '0';
            clone.style.left = '0';
            clone.style.pointerEvents = 'none';
            clone.style.userSelect = 'none';
            clone.style.zIndex = '1000';
            clone.classList.add('projects-images-clone');
            
            // Remove cursor pointer from clone since it's not interactive
            clone.style.cursor = 'default';
            
            // Ensure all child elements also don't capture events
            const cloneChildren = clone.querySelectorAll('*');
            cloneChildren.forEach(child => {
                child.style.pointerEvents = 'none';
            });
            
            // Hide the original (clone will be visible instead)
            original.style.opacity = '0';
            
            // Append clone to the container (not body)
            clonesContainer.appendChild(clone);
            
            // Store reference
            imageClones.push({
                original,
                clone
            });
        });
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

        imageClones.forEach(({ original, clone }) => {
            // Get the position of the original element
            const rect = original.getBoundingClientRect();
            
            // Position the clone to match the original
            clone.style.width = rect.width + 'px';
            clone.style.height = rect.height + 'px';
            clone.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
            
            // Control visibility based on whether it's in or near viewport
            const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
            clone.style.opacity = isInViewport ? '1' : '0';
        });
    }

    // Handle resize - recreate clones if switching between mobile/desktop
    let wasMobile = isMobile();
    function handleResize() {
        const nowMobile = isMobile();
        
        if (wasMobile !== nowMobile) {
            // Mode changed, recreate clones
            createClones();
            wasMobile = nowMobile;
        }
        
        updateClonePositions();
    }

    // Initialize
    createClones();
    updateClonePositions();

    // Update on scroll
    scroller.addEventListener('scroll', updateClonePositions);
    
    // Update on resize
    window.addEventListener('resize', handleResize);
});

