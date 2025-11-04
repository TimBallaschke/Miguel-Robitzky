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
            
            const numberBeforeCutOut = numberContainer.querySelector('.number-before-cut-out');
            
            const initialTop = initialPositions[index];
            
            // Get the inner-scroller's position in the viewport
            const innerScrollerRect = innerScroller.getBoundingClientRect();
            const innerScrollerTop = innerScrollerRect.top;
            
            // Calculate new position for the number container
            let newTop = initialTop;
            
            // Check if number is moving with scroller
            const isMovingWithScroller = innerScrollerTop <= initialTop;
            
            // If the inner-scroller has moved up past the number's initial position,
            // move the number with it
            if (isMovingWithScroller) {
                newTop = innerScrollerTop;
            }
            
            // Calculate custom clamp value for this number
            // Formula: --page-title-size + (index * (--menu-item-height + --menu-item-spacing))
            const minTop = pageTitleSize + (index * (menuItemHeight + menuItemSpacing));
            newTop = Math.max(minTop, newTop);
            
            // Check if number has reached its final clamped position
            const isAtMinPosition = Math.abs(newTop - minTop) < 1;
            
            // Update the number container's top position first so we can get accurate measurements
            numberContainer.style.top = `${newTop}px`;
            
            // Get updated positions after setting top
            const numberRect = numberContainer.getBoundingClientRect();
            const numberTop = numberRect.top;
            const numberBottom = numberRect.bottom;
            const innerScrollerBottom = innerScrollerRect.bottom;
            
            // Check if scroller is still overlapping the number at all
            const isScrollerOverlapping = innerScrollerBottom > numberTop;
            
            // Check if scroller bottom has reached or passed the disconnect threshold
            const distanceFromBottom = innerScrollerBottom - numberBottom;
            const shouldStayConnected = distanceFromBottom > (2 * menuItemSpacing);
            
            // Check if scroller top has passed above the number top
            const distancePassedTop = numberTop - innerScrollerTop;
            const hasPassedTopThreshold = innerScrollerTop < numberTop;
            
            // Console logs for debugging
            console.log(`Number ${index + 1}:`, {
                isMovingWithScroller,
                isAtMinPosition,
                isScrollerOverlapping,
                distanceFromBottom: distanceFromBottom.toFixed(2),
                distancePassedTop: distancePassedTop.toFixed(2),
                menuItemSpacing: menuItemSpacing.toFixed(2),
                shouldStayConnected,
                hasPassedTopThreshold,
                innerScrollerTop: innerScrollerTop.toFixed(2),
                innerScrollerBottom: innerScrollerBottom.toFixed(2),
                numberTop: numberTop.toFixed(2),
                numberBottom: numberBottom.toFixed(2)
            });
            
            // Update classes based on state
            if (isMovingWithScroller && !isAtMinPosition) {
                // Number is moving with scroller but hasn't reached final position
                console.log(`Number ${index + 1}: Adding connected-top`);
                numberContainer.classList.add('connected-top');
                numberContainer.classList.remove('connected-middle');
                innerScroller.classList.add('connected-top');
                innerScroller.classList.remove('connected-middle');
            } else if (isAtMinPosition && isScrollerOverlapping && shouldStayConnected && !hasPassedTopThreshold) {
                // Number at final position, still connected, but hasn't passed top threshold yet - keep connected-top
                console.log(`Number ${index + 1}: Keeping connected-top`);
                numberContainer.classList.add('connected-top');
                numberContainer.classList.remove('connected-middle');
                innerScroller.classList.add('connected-top');
                innerScroller.classList.remove('connected-middle');
            } else if (isAtMinPosition && isScrollerOverlapping && shouldStayConnected && hasPassedTopThreshold) {
                // Number has reached final position, scroller has passed top threshold, and bottom is still far enough
                console.log(`Number ${index + 1}: Adding connected-middle, removing connected-top`);
                numberContainer.classList.remove('connected-top');
                numberContainer.classList.add('connected-middle');
                innerScroller.classList.remove('connected-top');
                innerScroller.classList.add('connected-middle');
            } else {
                // Number is at initial position, scroller has reached disconnect threshold
                console.log(`Number ${index + 1}: Removing all classes`);
                numberContainer.classList.remove('connected-top', 'connected-middle');
                innerScroller.classList.remove('connected-top', 'connected-middle');
            }
            
            // Animate number-before-cut-out border-radius based on scroll position
            if (numberBeforeCutOut) {
                let beforeCutOutBottomRadius = 0;
                
                const hasConnectedMiddle = numberContainer.classList.contains('connected-middle');
                
                console.log(`Number ${index + 1} border-radius calc:`, {
                    hasConnectedMiddle,
                    isAtMinPosition,
                    distanceFromBottom: distanceFromBottom.toFixed(2),
                    initialRadius: beforeCutOutBottomRadius
                });
                
                // Only animate when connected-middle class is present
                if (hasConnectedMiddle) {
                    // Two animation scenarios:
                    // 1. Scrolling up normally (passedDistance animation)
                    // 2. Scrolling up from disconnected state below (distanceFromBottom animation)
                    
                    const passedDistance = numberTop - innerScrollerTop;
                    
                    // Scenario 1: Animate based on passedDistance (when scroller just passed above)
                    if (passedDistance >= 0 && passedDistance <= borderRadius) {
                        // Within animation range based on how far scroller passed above
                        const passedProgress = passedDistance / borderRadius;
                        const clampedProgress = Math.max(0, Math.min(1, passedProgress));
                        
                        beforeCutOutBottomRadius = menuItemSpacing * clampedProgress;
                        
                        console.log(`  -> Connected-middle (passedDistance): passedDistance=${passedDistance.toFixed(2)}, progress=${clampedProgress.toFixed(3)}, radius=${beforeCutOutBottomRadius.toFixed(2)}`);
                    }
                    // Scenario 2: Animate based on distanceFromBottom (when approaching from below)
                    else if (distanceFromBottom > (2 * menuItemSpacing) && distanceFromBottom <= ((2 * menuItemSpacing) + menuItemHeight)) {
                        // Within animation range based on distance from bottom (longer distance than scenario 1)
                        const bottomProgress = (distanceFromBottom - (2 * menuItemSpacing)) / menuItemHeight;
                        const clampedProgress = Math.max(0, Math.min(1, bottomProgress));
                        
                        beforeCutOutBottomRadius = menuItemSpacing * clampedProgress;
                        
                        console.log(`  -> Connected-middle (distanceFromBottom): distanceFromBottom=${distanceFromBottom.toFixed(2)}, progress=${clampedProgress.toFixed(3)}, radius=${beforeCutOutBottomRadius.toFixed(2)}`);
                    }
                    // Otherwise, stay at full value
                    else {
                        beforeCutOutBottomRadius = menuItemSpacing;
                        console.log(`  -> Connected-middle (full): passedDistance=${passedDistance.toFixed(2)}, distanceFromBottom=${distanceFromBottom.toFixed(2)}, radius at max`);
                    }
                }
                else {
                    console.log(`  -> No animation condition met, radius stays at 0`);
                }
                
                // Always apply the calculated value (including 0 when neither condition is met)
                console.log(`  -> Final applied radius: ${beforeCutOutBottomRadius.toFixed(2)}px`);
                numberBeforeCutOut.style.borderBottomRightRadius = `${beforeCutOutBottomRadius}px`;
            }
            
            // Animate inner-scroller border-top-left-radius (same logic as number-before-cut-out)
            if (innerScroller.classList.contains('connected-middle')) {
                const passedDistance = numberTop - innerScrollerTop;
                
                // Scenario 1: Animate based on passedDistance (when scroller just passed above)
                if (passedDistance >= 0 && passedDistance <= borderRadius) {
                    const passedProgress = passedDistance / borderRadius;
                    const clampedProgress = Math.max(0, Math.min(1, passedProgress));
                    
                    const scrollerTopLeftRadius = borderRadius * clampedProgress;
                    innerScroller.style.borderTopLeftRadius = `${scrollerTopLeftRadius}px`;
                }
                // Scenario 2: Animate based on distanceFromBottom (when approaching from below, longer distance)
                else if (distanceFromBottom > (2 * menuItemSpacing) && distanceFromBottom <= ((2 * menuItemSpacing) + menuItemHeight)) {
                    const bottomProgress = (distanceFromBottom - (2 * menuItemSpacing)) / menuItemHeight;
                    const clampedProgress = Math.max(0, Math.min(1, bottomProgress));
                    
                    const scrollerTopLeftRadius = borderRadius * clampedProgress;
                    innerScroller.style.borderTopLeftRadius = `${scrollerTopLeftRadius}px`;
                }
                // Otherwise, stay at full value
                else {
                    innerScroller.style.borderTopLeftRadius = `${borderRadius}px`;
                }
            } else {
                // Remove inline style to let CSS take over
                innerScroller.style.borderTopLeftRadius = '';
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

