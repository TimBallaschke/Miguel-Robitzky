// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    const scroller = document.querySelector('.scroller');
    const innerScrollers = document.querySelectorAll('.inner-scroller');
    const numbers = document.querySelectorAll('.number');
    
    if (!scroller || innerScrollers.length === 0 || numbers.length === 0) return;
    
    let initialPositions = [];
    
    // Function to capture initial top positions from CSS
    function captureInitialPositions() {
        // Temporarily remove inline styles to get CSS values
        numbers.forEach(number => {
            number.style.top = '';
        });
        
        // Capture the CSS-defined positions
        initialPositions = Array.from(numbers).map(number => {
            const computedStyle = window.getComputedStyle(number);
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
            const number = numbers[index];
            if (!number) return;
            
            const initialTop = initialPositions[index];
            
            // Get the inner-scroller's position in the viewport
            const innerScrollerRect = innerScroller.getBoundingClientRect();
            const innerScrollerTop = innerScrollerRect.top;
            const innerScrollerBottom = innerScrollerRect.bottom;
            
            // Calculate new position for the number
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
            
            // Update the number's top position
            number.style.top = `${newTop}px`;
            
            // Calculate border-radius based on inner-scroller position relative to number
            const numberRect = number.getBoundingClientRect();
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
            
            // Apply border-radius to both elements
            number.style.borderRadius = `${currentRadius}px`;
            innerScroller.style.borderRadius = `${currentRadius}px`;
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

