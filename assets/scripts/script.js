// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    const scroller = document.querySelector('.scroller');
    const innerScrollers = document.querySelectorAll('.inner-scroller');
    const numberContainers = document.querySelectorAll('.number-container');
    
    if (!scroller || innerScrollers.length === 0 || numberContainers.length === 0) return;
    
    // Create SVG overlay for visualizing shapes
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.style.position = 'fixed';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '9999';
    document.body.appendChild(svg);
    
    // Create a group for each number-scroller pair
    const svgGroups = [];
    numberContainers.forEach((container, index) => {
        const group = document.createElementNS(svgNS, 'g');
        group.setAttribute('id', `shape-group-${index + 1}`);
        svg.appendChild(group);
        svgGroups.push(group);
    });
    
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
                    // Start animation immediately when connected-middle is added
                    // Animate over a distance of --container-gap, but delay the start by --container-gap
                    // So: animation happens from passedDistance = --container-gap to 2 * --container-gap
                    // But to catch the transition reliably, start at 0 with a scaled progress
                    if (passedDistance >= 0 && passedDistance <= (2 * menuItemSpacing)) {
                        // Within animation range
                        // Progress starts at 0 when passedDistance = menuItemSpacing
                        // Progress reaches 1 when passedDistance = 2 * menuItemSpacing
                        let passedProgress;
                        if (passedDistance < menuItemSpacing) {
                            // Before delay point, stay at 0
                            passedProgress = 0;
                        } else {
                            // After delay point, animate from 0 to 1
                            const adjustedDistance = passedDistance - menuItemSpacing;
                            passedProgress = adjustedDistance / menuItemSpacing;
                        }
                        const clampedProgress = Math.max(0, Math.min(1, passedProgress));
                        
                        beforeCutOutBottomRadius = menuItemSpacing * clampedProgress;
                        
                        console.log(`  -> Connected-middle (passedDistance): passedDistance=${passedDistance.toFixed(2)}, progress=${clampedProgress.toFixed(3)}, radius=${beforeCutOutBottomRadius.toFixed(2)}`);
                    }
                    // Scenario 2: Animate based on distanceFromBottom (when approaching from below)
                    // Connected-middle is added at 2 * --container-gap
                    // But animation should only start at 3 * --container-gap
                    // So expand range to catch the transition
                    else if (distanceFromBottom > (2 * menuItemSpacing) && distanceFromBottom <= ((3 * menuItemSpacing) + menuItemHeight)) {
                        // Within animation range based on distance from bottom
                        let bottomProgress;
                        if (distanceFromBottom <= (3 * menuItemSpacing)) {
                            // Before animation start point, stay at 0
                            bottomProgress = 0;
                        } else {
                            // After delay point, animate from 0 to 1 over menuItemHeight distance
                            const adjustedDistance = distanceFromBottom - (3 * menuItemSpacing);
                            bottomProgress = adjustedDistance / menuItemHeight;
                        }
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
                else if (distanceFromBottom > (2 * menuItemSpacing) && distanceFromBottom <= ((3 * menuItemSpacing) + menuItemHeight)) {
                    let bottomProgress;
                    if (distanceFromBottom <= (3 * menuItemSpacing)) {
                        // Before animation start point, stay at 0
                        bottomProgress = 0;
                    } else {
                        // After delay point, animate from 0 to 1
                        const adjustedDistance = distanceFromBottom - (3 * menuItemSpacing);
                        bottomProgress = adjustedDistance / menuItemHeight;
                    }
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
    
    // Helper function to create an SVG path for a rounded rectangle with individual corner radii
    function createRoundedRectPath(x, y, width, height, topLeft, topRight, bottomRight, bottomLeft) {
        return `
            M ${x + topLeft} ${y}
            L ${x + width - topRight} ${y}
            Q ${x + width} ${y} ${x + width} ${y + topRight}
            L ${x + width} ${y + height - bottomRight}
            Q ${x + width} ${y + height} ${x + width - bottomRight} ${y + height}
            L ${x + bottomLeft} ${y + height}
            Q ${x} ${y + height} ${x} ${y + height - bottomLeft}
            L ${x} ${y + topLeft}
            Q ${x} ${y} ${x + topLeft} ${y}
            Z
        `.trim();
    }
    
    // Function to update SVG shapes based on current element positions
    function updateSVGShapes() {
        numberContainers.forEach((numberContainer, index) => {
            const innerScroller = innerScrollers[index];
            const group = svgGroups[index];
            
            if (!innerScroller || !group) return;
            
            // Clear previous shapes
            group.innerHTML = '';
            
            // Get element positions and dimensions
            const numberRect = numberContainer.getBoundingClientRect();
            const scrollerRect = innerScroller.getBoundingClientRect();
            
            // Get computed styles
            const numberStyle = window.getComputedStyle(numberContainer);
            const scrollerStyle = window.getComputedStyle(innerScroller);
            
            // Check if elements are connected
            const hasConnectedTop = numberContainer.classList.contains('connected-top');
            const hasConnectedMiddle = numberContainer.classList.contains('connected-middle');
            
            if (hasConnectedTop || hasConnectedMiddle) {
                // Create combined path for number + scroller
                const path = document.createElementNS(svgNS, 'path');
                
                // For now, create simple rectangles - we'll add corner radii next
                const numberPath = createRoundedRectPath(
                    numberRect.left,
                    numberRect.top,
                    numberRect.width,
                    numberRect.height,
                    parseFloat(numberStyle.borderTopLeftRadius) || 0,
                    parseFloat(numberStyle.borderTopRightRadius) || 0,
                    parseFloat(numberStyle.borderBottomRightRadius) || 0,
                    parseFloat(numberStyle.borderBottomLeftRadius) || 0
                );
                
                path.setAttribute('d', numberPath);
                path.setAttribute('fill', 'red');
                path.setAttribute('opacity', '0.5');
                group.appendChild(path);
                
                // Add inner-scroller shape
                const scrollerPath = document.createElementNS(svgNS, 'path');
                const scrollerPathData = createRoundedRectPath(
                    scrollerRect.left,
                    scrollerRect.top,
                    scrollerRect.width,
                    scrollerRect.height,
                    parseFloat(scrollerStyle.borderTopLeftRadius) || 0,
                    parseFloat(scrollerStyle.borderTopRightRadius) || 0,
                    parseFloat(scrollerStyle.borderBottomRightRadius) || 0,
                    parseFloat(scrollerStyle.borderBottomLeftRadius) || 0
                );
                
                scrollerPath.setAttribute('d', scrollerPathData);
                scrollerPath.setAttribute('fill', 'red');
                scrollerPath.setAttribute('opacity', '0.5');
                group.appendChild(scrollerPath);
            }
        });
    }
    
    function handleResize() {
        captureInitialPositions();
        updateNumberPositions();
        updateSVGShapes();
    }
    
    // Update on scroll
    scroller.addEventListener('scroll', function() {
        updateNumberPositions();
        updateSVGShapes();
    });
    
    // Update on resize
    window.addEventListener('resize', handleResize);
    
    // Initial setup
    captureInitialPositions();
    updateNumberPositions();
    updateSVGShapes();
});

