// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Only run on mobile devices
    if (!isMobile()) return;
    
    const scroller = document.querySelector('.scroller');
    const innerScrollers = document.querySelectorAll('.inner-scroller');
    const numberContainers = document.querySelectorAll('.number-container');

    if (!scroller || innerScrollers.length === 0 || numberContainers.length === 0) return;
    
    let initialPositions = [];
    
    // Function to capture initial left positions from CSS
    function captureInitialPositions() {
        // Temporarily remove inline styles to get CSS values
        numberContainers.forEach(container => {
            container.style.left = '';
        });
        
        // Capture the CSS-defined positions
        initialPositions = Array.from(numberContainers).map(container => {
            const computedStyle = window.getComputedStyle(container);
            return parseFloat(computedStyle.left);
        });
    }
    
    function updateNumberPositions() {
        // Get CSS variables
        const rootStyles = getComputedStyle(document.documentElement);
        
        // Get root font size for rem to px conversion
        const rootFontSize = parseFloat(rootStyles.fontSize);
        
        // Convert rem values to px
        const pagePadding = parseFloat(rootStyles.getPropertyValue('--page-padding')) * rootFontSize;
        const menuItemHeight = parseFloat(rootStyles.getPropertyValue('--menu-item-height')) * rootFontSize;
        const containerGap = parseFloat(rootStyles.getPropertyValue('--container-gap')) * rootFontSize;
        
        // Get the scroller's position
        const scrollerRect = scroller.getBoundingClientRect();
        const scrollerTop = scrollerRect.top;
        
        // Check each inner-scroller and move the corresponding number-container when it passes threshold
        numberContainers.forEach((numberContainer, index) => {
            // Skip the first number container (index 0) - it stays in place
            if (index === 0) return;
            
            // For each number-container (starting from index 1), check if its corresponding inner-scroller reached top
            const correspondingScroller = innerScrollers[index];
            if (!correspondingScroller) return;
            
            const initialLeft = initialPositions[index];
            
            // Get the inner-scroller's position in the viewport
            const innerScrollerRect = correspondingScroller.getBoundingClientRect();
            const innerScrollerTop = innerScrollerRect.top;
            
            // Check if inner-scroller has reached the top of the scroller
            // Threshold is when the top of inner-scroller reaches the scroller top
            const hasReachedTop = innerScrollerTop <= scrollerTop;
            
            if (hasReachedTop) {
                // Move this number container to align next to previous containers
                // Calculate final left position: pagePadding + (index * (menuItemHeight + containerGap))
                const finalLeft = pagePadding + (index * (menuItemHeight + containerGap));
                numberContainer.style.left = `${finalLeft}px`;
                
                // Debug log
                console.log(`Inner-scroller ${index + 1} reached top → Moving Number ${index + 1}:`, {
                    initialLeft: initialLeft.toFixed(2),
                    finalLeft: finalLeft.toFixed(2),
                    innerScrollerTop: innerScrollerTop.toFixed(2),
                    scrollerTop: scrollerTop.toFixed(2),
                    hasReachedTop
                });
            } else {
                // Reset to initial position if inner-scroller hasn't reached top
                numberContainer.style.left = `${initialLeft}px`;
            }
        });
    }
    
    function handleResize() {
        captureInitialPositions();
        updateNumberPositions();
    }
    
    // Update on scroll
    scroller.addEventListener('scroll', function() {
        updateNumberPositions();
    });
    
    // Update on resize
    window.addEventListener('resize', handleResize);
    
    // Initial setup
    captureInitialPositions();
    updateNumberPositions();
});

