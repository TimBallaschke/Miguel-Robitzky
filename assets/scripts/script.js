// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    const scroller = document.querySelector('.scroller');
    const innerScrollers = document.querySelectorAll('.inner-scroller');
    const numberContainers = document.querySelectorAll('.number-container');
    
    if (!scroller || innerScrollers.length === 0 || numberContainers.length === 0) return;
    
    let initialPositions = [];
    
    // Function to capture initial top positions from CSS
    function captureInitialPositions() {
        // Temporarily remove inline styles to get CSS values
        numberContainers.forEach(container => {
            container.style.top = '';
        });
        
        // Capture the CSS-defined positions
        initialPositions = Array.from(numberContainers).map(container => {
            const computedStyle = window.getComputedStyle(container);
            return parseFloat(computedStyle.top);
        });
    }
    
    function updateNumberPositions() {
        // Get CSS variables
        const rootStyles = getComputedStyle(document.documentElement);
        
        // Get root font size for rem to px conversion
        const rootFontSize = parseFloat(rootStyles.fontSize);
        
        // Convert rem values to px
        const pageTitleSize = parseFloat(rootStyles.getPropertyValue('--page-title-size')) * rootFontSize;
        const menuItemHeight = parseFloat(rootStyles.getPropertyValue('--menu-item-height')) * rootFontSize;
        const menuItemSpacing = parseFloat(rootStyles.getPropertyValue('--container-gap')) * rootFontSize;
        const borderRadius = parseFloat(rootStyles.getPropertyValue('--border-radius')) * rootFontSize;
        
        innerScrollers.forEach((innerScroller, index) => {
            const numberContainer = numberContainers[index];
            if (!numberContainer) return;
            
            const numberAfterCutOut = numberContainer.querySelector('.number-after-cut-out');
            const numberBeforeCutOut = numberContainer.querySelector('.number-before-cut-out');
            
            const initialTop = initialPositions[index];
            
            // Get the inner-scroller's position in the viewport
            const innerScrollerRect = innerScroller.getBoundingClientRect();
            const innerScrollerTop = innerScrollerRect.top;
            const innerScrollerBottom = innerScrollerRect.bottom;
            
            // Calculate new position for the number container
            let newTop = initialTop;
            
            // If the inner-scroller has moved up past the number's initial position,
            // move the number with it
            if (innerScrollerTop <= initialTop) {
                newTop = innerScrollerTop;
            }
            
            // Calculate custom clamp value for this number
            // Formula: --page-title-size + (index * (--menu-item-height + --menu-item-spacing))
            const minTop = pageTitleSize + (index * (menuItemHeight + menuItemSpacing));
            newTop = Math.max(minTop, newTop);
            
            // Update the number container's top position
            numberContainer.style.top = `${newTop}px`;
            
            // Calculate border-radius based on inner-scroller position relative to number container
            const numberRect = numberContainer.getBoundingClientRect();
            const numberTop = numberRect.top;
            const numberBottom = numberRect.bottom;
            const numberHeight = numberRect.height;
            
            // Check if number is at its final clamped position
            const isAtMinPosition = Math.abs(newTop - minTop) < 1;
            
            let progress = 0;
            
            // Phase 1: Inner-scroller approaching and overlapping (number still moving)
            if (!isAtMinPosition) {
                if (innerScrollerBottom >= numberBottom && innerScrollerTop <= numberBottom) {
                    // Inner-scroller is entering from below
                    const overlap = numberBottom - innerScrollerTop;
                    progress = Math.min(overlap / numberHeight, 1);
                } else if (innerScrollerTop <= numberTop) {
                    // Fully overlapped
                    progress = 1;
                }
            }
            // Phase 2: Number is stuck at final position, inner-scroller continues past it
            else {
                // Number is at minimum position
                if (innerScrollerTop > numberTop) {
                    // Inner-scroller hasn't reached the number yet or has passed
                    progress = 0;
                } else if (innerScrollerTop <= numberTop && innerScrollerBottom >= numberBottom) {
                    // Inner-scroller is passing through - keep radius at 0
                    progress = 1;
                } else if (innerScrollerBottom < numberBottom && innerScrollerBottom > numberTop) {
                    // Inner-scroller is exiting - animate back to full radius
                    const exitProgress = (numberBottom - innerScrollerBottom) / numberHeight;
                    progress = 1 - exitProgress;
                }
            }
            
            // Interpolate border-radius from full value to 0
            const currentRadius = borderRadius * (1 - progress);
            
            // Interpolate width from --menu-item-height to (--menu-item-height + --container-gap)
            const currentWidth = menuItemHeight + (progress * menuItemSpacing);
            
            // Apply width to number container
            numberContainer.style.width = `${currentWidth}px`;
            
            // Apply border-radius to number container (only right corners animate, left corners stay full)
            numberContainer.style.borderTopLeftRadius = `${borderRadius}px`;
            numberContainer.style.borderTopRightRadius = `${currentRadius}px`;
            numberContainer.style.borderBottomLeftRadius = `${borderRadius}px`;
            numberContainer.style.borderBottomRightRadius = `${currentRadius}px`;
            
            // Calculate border-radius for inner-scroller top-left corner
            let scrollerTopLeftRadius = currentRadius;
            
            // When number is stuck and scroller passes above, animate from 0 to full border-radius
            if (isAtMinPosition && innerScrollerTop < numberTop) {
                const passedDistance = numberTop - innerScrollerTop;
                const topLeftProgress = Math.min(passedDistance / menuItemHeight, 1);
                
                // Animate from 0 to full border-radius
                scrollerTopLeftRadius = borderRadius * topLeftProgress;
            }
            
            // Apply border-radius to inner-scroller (only top-left animates, others stay full)
            innerScroller.style.borderTopLeftRadius = `${scrollerTopLeftRadius}px`;
            innerScroller.style.borderTopRightRadius = `${borderRadius}px`;
            innerScroller.style.borderBottomLeftRadius = `${borderRadius}px`;
            innerScroller.style.borderBottomRightRadius = `${borderRadius}px`;
            
            // Animate number-after-cut-out based on connection state
            if (numberAfterCutOut) {
                let afterCutOutRadius = 0;
                
                // Phase 1: Number moving with scroller, animate in
                if (!isAtMinPosition && progress === 1) {
                    // Calculate how far the number has moved from its initial position
                    const scrolledDistance = initialTop - newTop;
                    
                    // Animate over menuItemHeight distance
                    const afterCutOutProgress = Math.min(Math.max(scrolledDistance / menuItemHeight, 0), 1);
                    
                    // Interpolate border-radius from 0 to --container-gap
                    afterCutOutRadius = menuItemSpacing * afterCutOutProgress;
                }
                // Phase 2: Number at final position, scroller approaching disconnect - animate out
                else if (isAtMinPosition) {
                    // Calculate distance from disconnect point
                    const distanceFromDisconnect = innerScrollerBottom - numberBottom;
                    
                    // Start shrinking when scroller bottom is within menuItemHeight of number bottom
                    if (distanceFromDisconnect <= menuItemHeight && distanceFromDisconnect > 0) {
                        // exitProgress: 0 when far away (menuItemHeight), 1 when at disconnect point (0)
                        const exitProgress = 1 - (distanceFromDisconnect / menuItemHeight);
                        
                        // Reverse: goes from full value to 0
                        afterCutOutRadius = menuItemSpacing * (1 - exitProgress);
                    } else if (distanceFromDisconnect > menuItemHeight) {
                        // Still far from disconnect, keep at full radius
                        afterCutOutRadius = menuItemSpacing;
                    }
                    // If distanceFromDisconnect <= 0, already disconnected, radius stays at 0
                }
                
                numberAfterCutOut.style.borderTopRightRadius = `${afterCutOutRadius}px`;
            }
            
            // Animate number-before-cut-out when scroller passes above the number
            if (numberBeforeCutOut) {
                let beforeCutOutRadius = 0;
                
                // Only animate when number is at final position
                if (isAtMinPosition && innerScrollerTop < numberTop) {
                    // Calculate how far the scroller has passed above the number
                    const passedDistance = numberTop - innerScrollerTop;
                    
                    // Animate from 0 to full over menuItemHeight distance
                    const beforeCutOutProgress = Math.min(passedDistance / menuItemHeight, 1);
                    
                    // Interpolate border-radius from 0 to --container-gap
                    beforeCutOutRadius = menuItemSpacing * beforeCutOutProgress;
                }
                
                numberBeforeCutOut.style.borderBottomRightRadius = `${beforeCutOutRadius}px`;
            }
        });
    }
    
    function handleResize() {
        captureInitialPositions();
        updateNumberPositions();
    }
    
    // Update on scroll
    scroller.addEventListener('scroll', updateNumberPositions);
    
    // Update on resize
    window.addEventListener('resize', handleResize);
    
    // Initial setup
    captureInitialPositions();
    updateNumberPositions();
});

