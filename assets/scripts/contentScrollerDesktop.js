// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Skip all functionality on mobile devices
    if (isMobile()) return;
    
    const scroller = document.querySelector('.scroller');
    const innerScrollers = document.querySelectorAll('.inner-scroller');
    const numberContainers = document.querySelectorAll('.number-container');

    if (!scroller || innerScrollers.length === 0 || numberContainers.length === 0) return;
    
            // Create SVG overlay for visualizing shapes and masks
            const svgNS = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(svgNS, 'svg');
            svg.style.position = 'fixed';
            svg.style.top = '0';
            svg.style.left = '0';
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.pointerEvents = 'none';
            svg.style.zIndex = '9999';
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            document.body.appendChild(svg);
            
            // Create a defs section for masks
            const defs = document.createElementNS(svgNS, 'defs');
            svg.appendChild(defs);
            
            // Create a master mask for the entire SVG to limit it to the scroller shape
            const masterMask = document.createElementNS(svgNS, 'mask');
            masterMask.setAttribute('id', 'scroller-boundary-mask');
            masterMask.setAttribute('maskUnits', 'userSpaceOnUse');
            defs.appendChild(masterMask);
            
            const masterMaskPath = document.createElementNS(svgNS, 'path');
            masterMaskPath.setAttribute('id', 'scroller-boundary-path');
            masterMaskPath.setAttribute('fill', 'white');
            masterMask.appendChild(masterMaskPath);
            
            // Create a clipPath for the scroller boundary (to constrain image masks)
            const scrollerClipPath = document.createElementNS(svgNS, 'clipPath');
            scrollerClipPath.setAttribute('id', 'scroller-boundary-clip');
            scrollerClipPath.setAttribute('clipPathUnits', 'userSpaceOnUse');
            defs.appendChild(scrollerClipPath);
            
            const scrollerClipPathElement = document.createElementNS(svgNS, 'path');
            scrollerClipPathElement.setAttribute('id', 'scroller-boundary-clip-path');
            scrollerClipPath.appendChild(scrollerClipPathElement);
            
            // Note: Master mask will be applied to individual groups, not the entire SVG
            
            // Create a mask for each number-scroller pair
            // These will be filled with white copies of the red visualization shapes
            const svgMasks = [];
            const maskClippedGroups = []; // Groups for shapes that should be clipped by scroller boundary
            numberContainers.forEach((container, index) => {
                const mask = document.createElementNS(svgNS, 'mask');
                mask.setAttribute('id', `combined-mask-${index + 1}`);
                mask.setAttribute('maskUnits', 'userSpaceOnUse');
                mask.setAttribute('x', '0');
                mask.setAttribute('y', '0');
                mask.setAttribute('width', window.innerWidth);
                mask.setAttribute('height', window.innerHeight);
                defs.appendChild(mask);
                svgMasks.push(mask);
                
                // Create a group inside the mask that will be clipped (like the red 'group')
                const clippedGroup = document.createElementNS(svgNS, 'g');
                clippedGroup.setAttribute('id', `mask-clipped-${index + 1}`);
                clippedGroup.setAttribute('clip-path', 'url(#scroller-boundary-clip)');
                mask.appendChild(clippedGroup);
                maskClippedGroups.push(clippedGroup);
            });
            
            // Create a group for visualization (combined red shape) - masked by scroller boundary
            const svgGroups = [];
            numberContainers.forEach((container, index) => {
                const group = document.createElementNS(svgNS, 'g');
                group.setAttribute('id', `shape-group-${index + 1}`);
                group.style.mask = 'url(#scroller-boundary-mask)';
                group.style.webkitMask = 'url(#scroller-boundary-mask)';
                svg.appendChild(group);
                svgGroups.push(group);
            });
            
            // Create separate groups for number containers (NOT masked by scroller boundary)
            const numberGroups = [];
            numberContainers.forEach((container, index) => {
                const group = document.createElementNS(svgNS, 'g');
                group.setAttribute('id', `number-group-${index + 1}`);
                // No mask applied - these will be visible outside scroller boundaries
                svg.appendChild(group);
                numberGroups.push(group);
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
        
        // Check if number-1-container has connected classes and update scroller accordingly
        // This needs to happen AFTER the classes are applied in the forEach loop above
        const number1Container = document.querySelector('#number-1-container');
        if (number1Container) {
            const hasConnectedClass = number1Container.classList.contains('connected-middle') || 
                                     number1Container.classList.contains('connected-top');
            
            if (hasConnectedClass) {
                scroller.style.borderTopLeftRadius = '0';
            } else {
                // Remove inline style to let CSS take over
                scroller.style.borderTopLeftRadius = '';
            }
        }
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
                // Update the master mask to match scroller's shape and position
                const scrollerRect = scroller.getBoundingClientRect();
                const scrollerStyle = window.getComputedStyle(scroller);
                const topLeftRadius = parseFloat(scrollerStyle.borderTopLeftRadius) || 0;
                const topRightRadius = parseFloat(scrollerStyle.borderTopRightRadius) || 0;
                const bottomLeftRadius = parseFloat(scrollerStyle.borderBottomLeftRadius) || 0;
                const bottomRightRadius = parseFloat(scrollerStyle.borderBottomRightRadius) || 0;
                
                const masterMaskPath = document.getElementById('scroller-boundary-path');
                if (masterMaskPath) {
                    const scrollerMaskPath = createRoundedRectPath(
                        scrollerRect.left,
                        scrollerRect.top,
                        scrollerRect.width,
                        scrollerRect.height,
                        topLeftRadius,
                        topRightRadius,
                        bottomRightRadius,
                        bottomLeftRadius
                    );
                    masterMaskPath.setAttribute('d', scrollerMaskPath);
                }
                
                // Also update the clipPath with the same scroller boundary
                const scrollerClipPathElement = document.getElementById('scroller-boundary-clip-path');
                if (scrollerClipPathElement) {
                    const scrollerClipPath = createRoundedRectPath(
                        scrollerRect.left,
                        scrollerRect.top,
                        scrollerRect.width,
                        scrollerRect.height,
                        topLeftRadius,
                        topRightRadius,
                        bottomRightRadius,
                        bottomLeftRadius
                    );
                    scrollerClipPathElement.setAttribute('d', scrollerClipPath);
                }
                
                numberContainers.forEach((numberContainer, index) => {
                    const innerScroller = innerScrollers[index];
                    const group = svgGroups[index];
                    const mask = svgMasks[index];
                    const maskClippedGroup = maskClippedGroups[index];
                    const numberGroup = numberGroups[index];
                    
                    if (!innerScroller || !group || !mask || !maskClippedGroup || !numberGroup) return;
                    
                    // Clear previous shapes
                    group.innerHTML = '';
                    maskClippedGroup.innerHTML = ''; // Clear the clipped group inside the mask
                    numberGroup.innerHTML = '';
                    
                    // Also clear any direct children of mask (unclipped shapes)
                    Array.from(mask.children).forEach(child => {
                        if (child.id !== `mask-clipped-${index + 1}`) {
                            child.remove();
                        }
                    });
                    
                    // Get element positions and dimensions
                    const numberRect = numberContainer.getBoundingClientRect();
                    const scrollerRect = innerScroller.getBoundingClientRect();
                    
                    // Get computed styles
                    const numberStyle = window.getComputedStyle(numberContainer);
                    const scrollerStyle = window.getComputedStyle(innerScroller);
                    
                    // Check if elements are connected
                    const hasConnectedTop = numberContainer.classList.contains('connected-top');
                    const hasConnectedMiddle = numberContainer.classList.contains('connected-middle');
                    
                    // Only draw the number container when it's connected
                    if (hasConnectedTop || hasConnectedMiddle) {
                        // Define offset to shift number container + connectors right to cover edge
                        const maskOffset = 0; // No offset needed with stroke-width: 0
                        
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
                        
                        // Create shifted version for mask
                        const numberPathShifted = createRoundedRectPath(
                            numberRect.left + maskOffset,
                            numberRect.top,
                            numberRect.width,
                            numberRect.height,
                            parseFloat(numberStyle.borderTopLeftRadius) || 0,
                            parseFloat(numberStyle.borderTopRightRadius) || 0,
                            parseFloat(numberStyle.borderBottomRightRadius) || 0,
                            parseFloat(numberStyle.borderBottomLeftRadius) || 0
                        );
                        
                        // Add number to unmasked group (visible outside scroller boundaries) - TRANSPARENT
                        const numberVisPath = document.createElementNS(svgNS, 'path');
                        numberVisPath.setAttribute('d', numberPath);
                        numberVisPath.setAttribute('fill', 'red');
                        numberVisPath.setAttribute('opacity', '0');
                        numberGroup.appendChild(numberVisPath);
                        
                        // Helper functions that mirror the red visualization structure
                        
                        // Add to red 'group' (clipped) AND white maskClippedGroup (clipped)
                        // pathDataShifted is optional for mask (shifted right)
                        const addShape = (pathData, pathDataShifted = null) => {
                            // Red visualization - clipped by scroller boundary (TRANSPARENT)
                            const visPath = document.createElementNS(svgNS, 'path');
                            visPath.setAttribute('d', pathData);
                            visPath.setAttribute('fill', 'red');
                            visPath.setAttribute('opacity', '0');
                            group.appendChild(visPath);
                            
                            // White mask - clipped by scroller boundary (use shifted version if provided)
                            const maskPath = document.createElementNS(svgNS, 'path');
                            maskPath.setAttribute('d', pathDataShifted || pathData);
                            maskPath.setAttribute('fill', 'white');
                            maskPath.setAttribute('stroke', 'white');
                            maskPath.setAttribute('stroke-width', '0');
                            maskPath.setAttribute('shape-rendering', 'geometricPrecision'); // Better quality rendering
                            maskPath.setAttribute('stroke-linejoin', 'round'); // Smooth joins
                            maskPath.setAttribute('stroke-linecap', 'round'); // Smooth caps
                            maskClippedGroup.appendChild(maskPath);
                        };
                        
                        // Add to red 'numberGroup' (NOT clipped) AND white mask root (NOT clipped)
                        // pathData is for red vis, pathDataShifted is optional for mask (shifted right)
                        const addUnclippedShape = (pathData, pathDataShifted = null) => {
                            // Red visualization - NOT clipped (TRANSPARENT)
                            const visPath = document.createElementNS(svgNS, 'path');
                            visPath.setAttribute('d', pathData);
                            visPath.setAttribute('fill', 'red');
                            visPath.setAttribute('opacity', '0');
                            numberGroup.appendChild(visPath);
                            
                            // White mask - NOT clipped (use shifted version if provided)
                            const maskPath = document.createElementNS(svgNS, 'path');
                            maskPath.setAttribute('d', pathDataShifted || pathData);
                            maskPath.setAttribute('fill', 'white');
                            maskPath.setAttribute('stroke', 'white');
                            maskPath.setAttribute('stroke-width', '0'); // Reduced stroke to prevent top cutoff
                            maskPath.setAttribute('shape-rendering', 'geometricPrecision'); // Better quality rendering
                            maskPath.setAttribute('stroke-linejoin', 'round'); // Smooth joins
                            maskPath.setAttribute('stroke-linecap', 'round'); // Smooth caps
                            mask.appendChild(maskPath);
                        };
                        
                        // Add number container to both red numberGroup and white mask (NOT clipped)
                        // Use shifted version for mask
                        addUnclippedShape(numberPath, numberPathShifted);
                        
                        // Get connector elements
                        const numberBefore = numberContainer.querySelector('.number-before');
                        const numberBeforeCutOut = numberContainer.querySelector('.number-before-cut-out');
                        const numberAfter = numberContainer.querySelector('.number-after');
                        const numberAfterCutOut = numberContainer.querySelector('.number-after-cut-out');
                        
                        // Draw number-before (full rectangle) - only for mask
                        if (numberBefore) {
                            const beforeRect = numberBefore.getBoundingClientRect();
                            if (beforeRect.width > 0 && beforeRect.height > 0) {
                                const beforePath = `
                                    M ${beforeRect.left} ${beforeRect.top}
                                    L ${beforeRect.right} ${beforeRect.top}
                                    L ${beforeRect.right} ${beforeRect.bottom}
                                    L ${beforeRect.left} ${beforeRect.bottom}
                                    Z
                                `.trim();
                                const beforePathShifted = `
                                    M ${beforeRect.left + maskOffset} ${beforeRect.top}
                                    L ${beforeRect.right + maskOffset} ${beforeRect.top}
                                    L ${beforeRect.right + maskOffset} ${beforeRect.bottom}
                                    L ${beforeRect.left + maskOffset} ${beforeRect.bottom}
                                    Z
                                `.trim();
                                addShape(beforePath, beforePathShifted);
                                // Don't add to numberGroup - only the curved corner should be visible
                            }
                        }
                        
                        // Subtract number-before-cut-out from mask (add as black)
                        if (numberBeforeCutOut) {
                            const cutOutRect = numberBeforeCutOut.getBoundingClientRect();
                            const cutOutStyle = window.getComputedStyle(numberBeforeCutOut);
                            const cutOutRadius = parseFloat(cutOutStyle.borderBottomRightRadius) || 0;
                            
                            if (cutOutRect.width > 0 && cutOutRect.height > 0) {
                                // Create the cut-out shape with rounded corner (shifted)
                                const cutOutPath = `
                                    M ${cutOutRect.left + maskOffset} ${cutOutRect.top}
                                    L ${cutOutRect.right + maskOffset} ${cutOutRect.top}
                                    L ${cutOutRect.right + maskOffset} ${cutOutRect.bottom - cutOutRadius}
                                    Q ${cutOutRect.right + maskOffset} ${cutOutRect.bottom} ${cutOutRect.right + maskOffset - cutOutRadius} ${cutOutRect.bottom}
                                    L ${cutOutRect.left + maskOffset} ${cutOutRect.bottom}
                                    Z
                                `.trim();
                                
                                // Add as BLACK to maskClippedGroup to subtract it
                                const maskCutOut = document.createElementNS(svgNS, 'path');
                                maskCutOut.setAttribute('d', cutOutPath);
                                maskCutOut.setAttribute('fill', 'black');
                                maskClippedGroup.appendChild(maskCutOut);
                            }
                        }
                        
                        // Draw number-before-cut-out curved corner piece (for visualization)
                        if (numberBefore && numberBeforeCutOut) {
                            const beforeRect = numberBefore.getBoundingClientRect();
                            const beforeCutOutStyle = window.getComputedStyle(numberBeforeCutOut);
                            const cutOutRadius = parseFloat(beforeCutOutStyle.borderBottomRightRadius) || 0;
                            
                            if (beforeRect.width > 0 && beforeRect.height > 0 && cutOutRadius > 0) {
                                // This is the small curved piece that connects to the scroller
                                const pathData = `
                                    M ${beforeRect.right - cutOutRadius} ${beforeRect.bottom}
                                    L ${beforeRect.right} ${beforeRect.bottom}
                                    L ${beforeRect.right} ${beforeRect.bottom - cutOutRadius}
                                    Q ${beforeRect.right} ${beforeRect.bottom} ${beforeRect.right - cutOutRadius} ${beforeRect.bottom}
                                    Z
                                `.trim();
                                
                                const pathDataShifted = `
                                    M ${beforeRect.right + maskOffset - cutOutRadius} ${beforeRect.bottom}
                                    L ${beforeRect.right + maskOffset} ${beforeRect.bottom}
                                    L ${beforeRect.right + maskOffset} ${beforeRect.bottom - cutOutRadius}
                                    Q ${beforeRect.right + maskOffset} ${beforeRect.bottom} ${beforeRect.right + maskOffset - cutOutRadius} ${beforeRect.bottom}
                                    Z
                                `.trim();
                                
                                addShape(pathData, pathDataShifted);
                                
                                // Also add corner to numberGroup and mask (NOT clipped - visible outside scroller)
                                addUnclippedShape(pathData, pathDataShifted);
                            }
                        }
                
                        // Draw number-after (full rectangle) - only for mask
                        if (numberAfter) {
                            const afterRect = numberAfter.getBoundingClientRect();
                            if (afterRect.width > 0 && afterRect.height > 0) {
                                const afterPath = `
                                    M ${afterRect.left} ${afterRect.top}
                                    L ${afterRect.right} ${afterRect.top}
                                    L ${afterRect.right} ${afterRect.bottom}
                                    L ${afterRect.left} ${afterRect.bottom}
                                    Z
                                `.trim();
                                const afterPathShifted = `
                                    M ${afterRect.left + maskOffset} ${afterRect.top}
                                    L ${afterRect.right + maskOffset} ${afterRect.top}
                                    L ${afterRect.right + maskOffset} ${afterRect.bottom}
                                    L ${afterRect.left + maskOffset} ${afterRect.bottom}
                                    Z
                                `.trim();
                                addShape(afterPath, afterPathShifted);
                                // Don't add to numberGroup - only the curved corner should be visible
                            }
                        }
                        
                        // Subtract number-after-cut-out from mask (add as black)
                        if (numberAfterCutOut) {
                            const cutOutRect = numberAfterCutOut.getBoundingClientRect();
                            const cutOutStyle = window.getComputedStyle(numberAfterCutOut);
                            const cutOutRadius = parseFloat(cutOutStyle.borderTopRightRadius) || 0;
                            
                            if (cutOutRect.width > 0 && cutOutRect.height > 0) {
                                // Create the cut-out shape with rounded corner (shifted)
                                const cutOutPath = `
                                    M ${cutOutRect.left + maskOffset} ${cutOutRect.top}
                                    L ${cutOutRect.right + maskOffset - cutOutRadius} ${cutOutRect.top}
                                    Q ${cutOutRect.right + maskOffset} ${cutOutRect.top} ${cutOutRect.right + maskOffset} ${cutOutRect.top + cutOutRadius}
                                    L ${cutOutRect.right + maskOffset} ${cutOutRect.bottom}
                                    L ${cutOutRect.left + maskOffset} ${cutOutRect.bottom}
                                    Z
                                `.trim();
                                
                                // Add as BLACK to maskClippedGroup to subtract it
                                const maskCutOut = document.createElementNS(svgNS, 'path');
                                maskCutOut.setAttribute('d', cutOutPath);
                                maskCutOut.setAttribute('fill', 'black');
                                maskClippedGroup.appendChild(maskCutOut);
                            }
                        }
                        
                        // Draw number-after-cut-out curved corner piece (for visualization)
                        if (numberAfter && numberAfterCutOut) {
                            const afterRect = numberAfter.getBoundingClientRect();
                            const afterCutOutStyle = window.getComputedStyle(numberAfterCutOut);
                            const cutOutRadius = parseFloat(afterCutOutStyle.borderTopRightRadius) || 0;
                            
                            if (afterRect.width > 0 && afterRect.height > 0 && cutOutRadius > 0) {
                                // This is the small curved piece that connects to the scroller
                                const pathData = `
                                    M ${afterRect.right - cutOutRadius} ${afterRect.top}
                                    L ${afterRect.right} ${afterRect.top}
                                    L ${afterRect.right} ${afterRect.top + cutOutRadius}
                                    Q ${afterRect.right} ${afterRect.top} ${afterRect.right - cutOutRadius} ${afterRect.top}
                                    Z
                                `.trim();
                                
                                const pathDataShifted = `
                                    M ${afterRect.right + maskOffset - cutOutRadius} ${afterRect.top}
                                    L ${afterRect.right + maskOffset} ${afterRect.top}
                                    L ${afterRect.right + maskOffset} ${afterRect.top + cutOutRadius}
                                    Q ${afterRect.right + maskOffset} ${afterRect.top} ${afterRect.right + maskOffset - cutOutRadius} ${afterRect.top}
                                    Z
                                `.trim();
                                
                                addShape(pathData, pathDataShifted);
                                
                                // Also add corner to numberGroup and mask (NOT clipped - visible outside scroller)
                                addUnclippedShape(pathData, pathDataShifted);
                            }
                        }
                        
                        // Add inner-scroller shape
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
                        
                        addShape(scrollerPathData);
                    }
                });
            }
    
    function handleResize() {
        // Update mask dimensions on resize
        svgMasks.forEach(mask => {
            mask.setAttribute('width', window.innerWidth);
            mask.setAttribute('height', window.innerHeight);
        });
        
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

