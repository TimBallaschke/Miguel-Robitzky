// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Only run on mobile devices
    if (!isMobile()) return;
    
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
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    // document.body.appendChild(svg);
    
    // Create a defs section for clipPath
    const defs = document.createElementNS(svgNS, 'defs');
    svg.appendChild(defs);
    
    // Create a clipPath for the scroller boundary
    const scrollerClipPath = document.createElementNS(svgNS, 'clipPath');
    scrollerClipPath.setAttribute('id', 'mobile-scroller-clip');
    scrollerClipPath.setAttribute('clipPathUnits', 'userSpaceOnUse');
    defs.appendChild(scrollerClipPath);
    
    const scrollerClipPathElement = document.createElementNS(svgNS, 'path');
    scrollerClipPathElement.setAttribute('id', 'mobile-scroller-clip-path');
    scrollerClipPath.appendChild(scrollerClipPathElement);
    
    // Create clipped groups for inner-scroller (constrained to scroller boundary)
    const svgGroups = [];
    numberContainers.forEach((container, index) => {
        const group = document.createElementNS(svgNS, 'g');
        group.setAttribute('id', `mobile-clipped-group-${index + 1}`);
        // Apply clipPath to constrain shapes to scroller boundary
        group.setAttribute('clip-path', 'url(#mobile-scroller-clip)');
        svg.appendChild(group);
        svgGroups.push(group);
    });
    
    // Create unclipped groups for number containers (visible outside scroller boundaries)
    const numberGroups = [];
    numberContainers.forEach((container, index) => {
        const group = document.createElementNS(svgNS, 'g');
        group.setAttribute('id', `mobile-number-group-${index + 1}`);
        // No clip applied - these will be visible outside scroller boundaries
        svg.appendChild(group);
        numberGroups.push(group);
    });
    
    let initialPositions = [];
    let connectionTimeouts = {}; // Track timeouts for each number container
    let reachedTopStates = {}; // Track whether each scroller has reached top to detect state changes
    let atTopStates = {}; // Track which inner-scroller is currently at the top of scroller
    
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
    
    function updateNumberPositions() {
        // Get CSS variables
        const rootStyles = getComputedStyle(document.documentElement);
        
        // Get root font size for rem to px conversion
        const rootFontSize = parseFloat(rootStyles.fontSize);
        
        // Convert rem values to px
        const pagePadding = parseFloat(rootStyles.getPropertyValue('--page-padding')) * rootFontSize;
        const menuItemHeight = parseFloat(rootStyles.getPropertyValue('--menu-item-height')) * rootFontSize;
        const containerGap = parseFloat(rootStyles.getPropertyValue('--container-gap')) * rootFontSize;
        
        // Get transition duration in milliseconds
        const transitionDurationValue = rootStyles.getPropertyValue('--transition-duration-1').trim();
        let transitionDuration;
        
        if (transitionDurationValue.endsWith('ms')) {
            // Already in milliseconds, just parse the number
            transitionDuration = parseFloat(transitionDurationValue);
        } else if (transitionDurationValue.endsWith('s')) {
            // In seconds, convert to milliseconds
            transitionDuration = parseFloat(transitionDurationValue) * 1000;
        } else {
            // No unit or invalid, default to 300ms
            transitionDuration = 300;
        }
        
        // If transition duration is 0 or NaN, default to 300ms
        if (!transitionDuration || transitionDuration === 0) {
            transitionDuration = 300;
        }
        
        console.log('Transition duration:', transitionDuration, 'ms');
        
        // Get the scroller's position
        const scrollerRect = scroller.getBoundingClientRect();
        const scrollerTop = scrollerRect.top;
        
        // First, check which inner-scroller is currently at the top of scroller
        let currentTopIndex = -1;
        innerScrollers.forEach((innerScroller, index) => {
            const innerScrollerRect = innerScroller.getBoundingClientRect();
            const innerScrollerTop = innerScrollerRect.top;
            const innerScrollerBottom = innerScrollerRect.bottom;
            
            // Inner-scroller is at the top if its top has reached scroller top
            // and its bottom is still below scroller top (still visible)
            const isAtTop = innerScrollerTop <= scrollerTop && innerScrollerBottom > scrollerTop;
            
            if (isAtTop) {
                currentTopIndex = index;
            }
        });
        
        // Handle "connected" class based on which inner-scroller is at top
        if (currentTopIndex !== -1) {
            const previousTopIndex = Object.keys(atTopStates).find(key => atTopStates[key] === true);
            
            // If the top scroller changed, update connected class
            if (previousTopIndex != currentTopIndex) {
                console.log(`Inner-scroller ${currentTopIndex + 1} is now at top`);
                
                // Clear all previous timeouts
                Object.keys(connectionTimeouts).forEach(key => {
                    clearTimeout(connectionTimeouts[key]);
                    delete connectionTimeouts[key];
                });
                
                // After half transition duration, update connected class
                const halfDuration = transitionDuration / 2;
                connectionTimeouts[currentTopIndex] = setTimeout(() => {
                    // Remove connected from all
                    numberContainers.forEach((container) => {
                        container.classList.remove('connected');
                    });
                    
                    // Add to current top
                    numberContainers[currentTopIndex].classList.add('connected');
                    console.log(`Added "connected" to Number ${currentTopIndex + 1}`);
                    
                    // Add/remove "first-connected" class to scroller based on first number-container
                    if (currentTopIndex === 0) {
                        scroller.classList.add('first-connected');
                        console.log('Added "first-connected" to scroller');
                    } else {
                        scroller.classList.remove('first-connected');
                        console.log('Removed "first-connected" from scroller');
                    }
                }, halfDuration);
                
                // Update states
                Object.keys(atTopStates).forEach(key => {
                    atTopStates[key] = false;
                });
                atTopStates[currentTopIndex] = true;
            }
        } else {
            // No inner-scroller is at top, remove connected from all
            const hadConnected = Object.keys(atTopStates).some(key => atTopStates[key] === true);
            if (hadConnected) {
                numberContainers.forEach((container) => {
                    container.classList.remove('connected');
                });
                scroller.classList.remove('first-connected');
                Object.keys(atTopStates).forEach(key => {
                    atTopStates[key] = false;
                });
            }
        }
        
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
            const previousState = reachedTopStates[index];
            
            if (hasReachedTop) {
                // Move this number container to align next to previous containers
                // Calculate final left position: pagePadding + (index * (menuItemHeight + containerGap))
                const finalLeft = pagePadding + (index * (menuItemHeight + containerGap));
                numberContainer.style.left = `${finalLeft}px`;
                
                // Update state
                reachedTopStates[index] = true;
            } else {
                // Reset to initial position if inner-scroller hasn't reached top
                numberContainer.style.left = `${initialLeft}px`;
                
                // Update state
                reachedTopStates[index] = false;
            }
        });
        
        // Update SVG shapes
        updateSVGShapes();
    }
    
    // Function to update SVG shapes based on current element positions
    function updateSVGShapes() {
        // Update the scroller clipPath to match current scroller shape and position
        const scrollerRect = scroller.getBoundingClientRect();
        const scrollerStyle = window.getComputedStyle(scroller);
        const topLeftRadius = parseFloat(scrollerStyle.borderTopLeftRadius) || 0;
        const topRightRadius = parseFloat(scrollerStyle.borderTopRightRadius) || 0;
        const bottomLeftRadius = parseFloat(scrollerStyle.borderBottomLeftRadius) || 0;
        const bottomRightRadius = parseFloat(scrollerStyle.borderBottomRightRadius) || 0;
        
        const scrollerClipPathElement = document.getElementById('mobile-scroller-clip-path');
        if (scrollerClipPathElement) {
            const scrollerClipPathData = createRoundedRectPath(
                scrollerRect.left,
                scrollerRect.top,
                scrollerRect.width,
                scrollerRect.height,
                topLeftRadius,
                topRightRadius,
                bottomRightRadius,
                bottomLeftRadius
            );
            scrollerClipPathElement.setAttribute('d', scrollerClipPathData);
        }
        
        numberContainers.forEach((numberContainer, index) => {
            const innerScroller = innerScrollers[index];
            const clippedGroup = svgGroups[index];
            const numberGroup = numberGroups[index];
            
            if (!innerScroller || !clippedGroup || !numberGroup) return;
            
            // Clear previous shapes
            clippedGroup.innerHTML = '';
            numberGroup.innerHTML = '';
            
            // Get element positions and dimensions
            const numberRect = numberContainer.getBoundingClientRect();
            const scrollerRect = innerScroller.getBoundingClientRect();
            
            // Get computed styles
            const numberStyle = window.getComputedStyle(numberContainer);
            const scrollerStyle = window.getComputedStyle(innerScroller);
            
            // Check if number container is connected
            const hasConnected = numberContainer.classList.contains('connected');
            
            // Only draw shapes when connected
            if (hasConnected) {
                // Draw number container (unclipped - visible outside scroller)
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
                
                const numberVisPath = document.createElementNS(svgNS, 'path');
                numberVisPath.setAttribute('d', numberPath);
                numberVisPath.setAttribute('fill', 'red');
                numberVisPath.setAttribute('opacity', '0.3');
                numberGroup.appendChild(numberVisPath);
                
                // Get connector elements
                const numberBefore = numberContainer.querySelector('.number-before');
                const numberBeforeCutOut = numberContainer.querySelector('.number-before-cut-out');
                const numberAfter = numberContainer.querySelector('.number-after');
                const numberAfterCutOut = numberContainer.querySelector('.number-after-cut-out');
                
                // Draw number-before (unclipped - visible outside scroller)
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
                        
                        const beforeVisPath = document.createElementNS(svgNS, 'path');
                        beforeVisPath.setAttribute('d', beforePath);
                        beforeVisPath.setAttribute('fill', 'red');
                        beforeVisPath.setAttribute('opacity', '0.3');
                        numberGroup.appendChild(beforeVisPath);
                    }
                }
                
                // Draw number-before-cut-out curved corner piece (unclipped)
                if (numberBefore && numberBeforeCutOut) {
                    const beforeRect = numberBefore.getBoundingClientRect();
                    const beforeCutOutStyle = window.getComputedStyle(numberBeforeCutOut);
                    const cutOutRadius = parseFloat(beforeCutOutStyle.borderBottomRightRadius) || 0;
                    
                    if (beforeRect.width > 0 && beforeRect.height > 0 && cutOutRadius > 0) {
                        const pathData = `
                            M ${beforeRect.right - cutOutRadius} ${beforeRect.bottom}
                            L ${beforeRect.right} ${beforeRect.bottom}
                            L ${beforeRect.right} ${beforeRect.bottom - cutOutRadius}
                            Q ${beforeRect.right} ${beforeRect.bottom} ${beforeRect.right - cutOutRadius} ${beforeRect.bottom}
                            Z
                        `.trim();
                        
                        const cornerPath = document.createElementNS(svgNS, 'path');
                        cornerPath.setAttribute('d', pathData);
                        cornerPath.setAttribute('fill', 'red');
                        cornerPath.setAttribute('opacity', '0.3');
                        numberGroup.appendChild(cornerPath);
                    }
                }
                
                // Draw number-after (unclipped - visible outside scroller)
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
                        
                        const afterVisPath = document.createElementNS(svgNS, 'path');
                        afterVisPath.setAttribute('d', afterPath);
                        afterVisPath.setAttribute('fill', 'red');
                        afterVisPath.setAttribute('opacity', '0.3');
                        numberGroup.appendChild(afterVisPath);
                    }
                }
                
                // Draw number-after-cut-out curved corner piece (unclipped)
                if (numberAfter && numberAfterCutOut) {
                    const afterRect = numberAfter.getBoundingClientRect();
                    const afterCutOutStyle = window.getComputedStyle(numberAfterCutOut);
                    const cutOutRadius = parseFloat(afterCutOutStyle.borderTopRightRadius) || 0;
                    
                    if (afterRect.width > 0 && afterRect.height > 0 && cutOutRadius > 0) {
                        const pathData = `
                            M ${afterRect.right - cutOutRadius} ${afterRect.top}
                            L ${afterRect.right} ${afterRect.top}
                            L ${afterRect.right} ${afterRect.top + cutOutRadius}
                            Q ${afterRect.right} ${afterRect.top} ${afterRect.right - cutOutRadius} ${afterRect.top}
                            Z
                        `.trim();
                        
                        const cornerPath = document.createElementNS(svgNS, 'path');
                        cornerPath.setAttribute('d', pathData);
                        cornerPath.setAttribute('fill', 'red');
                        cornerPath.setAttribute('opacity', '0.3');
                        numberGroup.appendChild(cornerPath);
                    }
                }
                
                // Draw inner-scroller shape (clipped to scroller boundary)
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
                
                const scrollerVisPath = document.createElementNS(svgNS, 'path');
                scrollerVisPath.setAttribute('d', scrollerPathData);
                scrollerVisPath.setAttribute('fill', 'red');
                scrollerVisPath.setAttribute('opacity', '0.3');
                clippedGroup.appendChild(scrollerVisPath);
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
    });
    
    // Update on resize
    window.addEventListener('resize', handleResize);
    
    // Initial setup
    captureInitialPositions();
    updateNumberPositions();
    updateSVGShapes();
});

