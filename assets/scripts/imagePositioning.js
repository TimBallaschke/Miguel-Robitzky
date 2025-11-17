// Image positioning script - clones project images with fixed positioning
// Only applies on desktop (viewport width > 768px)
document.addEventListener('DOMContentLoaded', function() {
    const scroller = document.querySelector('.scroller');
    const projectsImages = document.querySelectorAll('.projects-images');
    
    if (!scroller || !projectsImages.length) return;

    // Store clones and their original elements
    const imageClones = [];

    // Check if device is mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // Create clones for all projects-images
    function createClones() {
        // Remove existing clones if any
        imageClones.forEach(item => {
            if (item.clone && item.clone.parentNode) {
                item.clone.remove();
            }
        });
        imageClones.length = 0;

        // Skip on mobile
        if (isMobile()) return;

        projectsImages.forEach(original => {
            // Clone the element
            const clone = original.cloneNode(true);
            
            // Style the clone
            clone.style.position = 'fixed';
            clone.style.top = '0';
            clone.style.left = '0';
            clone.style.zIndex = '100';
            clone.style.pointerEvents = 'none'; // Don't interfere with interactions
            clone.style.userSelect = 'none'; // Can't select text
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
            
            // Append clone to body
            document.body.appendChild(clone);
            
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

