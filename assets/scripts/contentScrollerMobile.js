// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Only run on mobile devices
    if (!isMobile()) return;
    
    const scroller = document.querySelector('.scroller');
    const innerScrollers = document.querySelectorAll('.inner-scroller');
    const numberContainers = document.querySelectorAll('.number-container');

    if (!scroller || innerScrollers.length === 0 || numberContainers.length === 0) return;
    
    let initialPositions = [];
    let connectionTimeouts = {}; // Track timeouts for each number container
    let reachedTopStates = {}; // Track whether each scroller has reached top to detect state changes
    
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
                
                // Only set timeout if state just changed from false to true (transition happened)
                if (previousState !== true) {
                    console.log(`State changed! Number ${index + 1} just reached top`);
                    
                    // Clear any existing timeout for this container
                    if (connectionTimeouts[index]) {
                        clearTimeout(connectionTimeouts[index]);
                    }
                    
                    // After half the transition duration, add "connected" class to this container
                    // and remove from all others
                    const halfDuration = transitionDuration / 2;
                    console.log(`Setting timeout for Number ${index + 1} with duration:`, halfDuration);
                    connectionTimeouts[index] = setTimeout(() => {
                        console.log(`Timeout fired! Adding "connected" class to Number ${index + 1}`);
                        numberContainers.forEach((container, i) => {
                            if (i === index) {
                                container.classList.add('connected');
                                console.log(`Added "connected" to Number ${i + 1}`);
                            } else {
                                container.classList.remove('connected');
                                console.log(`Removed "connected" from Number ${i + 1}`);
                            }
                        });
                    }, halfDuration);
                }
                
                // Update state
                reachedTopStates[index] = true;
            } else {
                // Reset to initial position if inner-scroller hasn't reached top
                numberContainer.style.left = `${initialLeft}px`;
                
                // If state changed from true to false (scrolling backwards)
                if (previousState === true) {
                    console.log(`State changed! Number ${index + 1} scrolled back down`);
                    
                    // Immediately remove connected class from this container
                    numberContainer.classList.remove('connected');
                    
                    // Find the highest index container that still has hasReachedTop = true
                    // and add connected to that one after transition
                    const halfDuration = transitionDuration / 2;
                    setTimeout(() => {
                        // Find the last container that's still in reached state
                        let lastReachedIndex = -1;
                        for (let i = numberContainers.length - 1; i >= 0; i--) {
                            if (reachedTopStates[i] === true) {
                                lastReachedIndex = i;
                                break;
                            }
                        }
                        
                        // Remove connected from all first
                        numberContainers.forEach((container) => {
                            container.classList.remove('connected');
                        });
                        
                        if (lastReachedIndex >= 0) {
                            // Add to the last reached one
                            numberContainers[lastReachedIndex].classList.add('connected');
                            console.log(`Added "connected" to Number ${lastReachedIndex + 1} (scrolling back)`);
                        } else {
                            // No containers are in moved state, add connected to first number (index 0)
                            numberContainers[0].classList.add('connected');
                            console.log('All scrolled back, added "connected" to Number 1');
                        }
                    }, halfDuration);
                }
                
                // Clear any pending timeout for this container
                if (connectionTimeouts[index]) {
                    clearTimeout(connectionTimeouts[index]);
                    delete connectionTimeouts[index];
                }
                
                // Update state
                reachedTopStates[index] = false;
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
    
    // Add "connected" class to first number container on page load
    if (numberContainers.length > 0) {
        numberContainers[0].classList.add('connected');
        console.log('Initial load: added "connected" to Number 1');
    }
});

