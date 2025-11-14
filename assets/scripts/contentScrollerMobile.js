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
                console.log('No inner-scroller at top, removing all connected classes');
                numberContainers.forEach((container) => {
                    container.classList.remove('connected');
                });
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

