// Click handler for website title container
document.addEventListener('DOMContentLoaded', function() {
    const websiteTitleContainer = document.querySelector('.website-title-container');
    const scroller = document.querySelector('.scroller');
    const innerScrollers = document.querySelectorAll('.inner-scroller');
    const numberContainers = document.querySelectorAll('.number-container');
    
    if (!websiteTitleContainer || !scroller || innerScrollers.length === 0 || numberContainers.length === 0) return;
    
    let initialPositions = [];
    
    // Function to capture initial top positions from CSS
    function captureInitialPositions() {
        // Temporarily remove inline styles to get CSS values
        numberContainers.forEach(container => {
            const currentTop = container.style.top;
            container.style.top = '';
            const computedStyle = window.getComputedStyle(container);
            initialPositions.push(parseFloat(computedStyle.top));
            container.style.top = currentTop;
        });
    }
    
    // Scroll speed in pixels per millisecond
    const SCROLL_SPEED = 2;
    let scrollAnimation = null;
    
    // Custom smooth scroll function
    function smoothScrollTo(targetPosition) {
        const startPosition = scroller.scrollTop;
        const distance = targetPosition - startPosition;
        const duration = Math.abs(distance) / SCROLL_SPEED;
        
        let startTime = null;
        
        // Cancel any existing scroll animation
        if (scrollAnimation) {
            cancelAnimationFrame(scrollAnimation);
        }
        
        // Easing function
        function easeAlmostLinear(t) {
            const sineEasing = -(Math.cos(Math.PI * t) - 1) / 2;
            const linearProgress = t;
            return linearProgress * 0.9 + sineEasing * 0.1;
        }
        
        function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easedProgress = easeAlmostLinear(progress);
            const currentPosition = startPosition + (distance * easedProgress);
            
            scroller.scrollTop = currentPosition;
            
            if (progress < 1) {
                scrollAnimation = requestAnimationFrame(animate);
            } else {
                scrollAnimation = null;
            }
        }
        
        scrollAnimation = requestAnimationFrame(animate);
    }
    
    // Click handler
    websiteTitleContainer.addEventListener('click', function() {
        // Get CSS variables
        const rootStyles = getComputedStyle(document.documentElement);
        const rootFontSize = parseFloat(rootStyles.fontSize);
        const pageTitleSize = parseFloat(rootStyles.getPropertyValue('--page-title-size')) * rootFontSize;
        const menuItemHeight = parseFloat(rootStyles.getPropertyValue('--menu-item-height')) * rootFontSize;
        const menuItemSpacing = parseFloat(rootStyles.getPropertyValue('--container-gap')) * rootFontSize;
        
        let inBetweenIndex = -1;
        
        // Check each number container's state
        numberContainers.forEach((numberContainer, index) => {
            const innerScroller = innerScrollers[index];
            if (!innerScroller) return;
            
            const initialTop = initialPositions[index];
            const innerScrollerRect = innerScroller.getBoundingClientRect();
            const innerScrollerTop = innerScrollerRect.top;
            
            // Check if number is moving with scroller
            const isMovingWithScroller = innerScrollerTop <= initialTop;
            
            // Calculate the clamped min position for this number
            const minTop = pageTitleSize + (index * (menuItemHeight + menuItemSpacing));
            const currentTop = parseFloat(numberContainer.style.top) || initialTop;
            const isAtMinPosition = Math.abs(currentTop - minTop) < 1;
            
            // Determine if in-between state
            const isInBetween = isMovingWithScroller && !isAtMinPosition;
            
            if (isInBetween && inBetweenIndex === -1) {
                inBetweenIndex = index;
            }
        });
        
        // If an in-between element is found, scroll its inner-scroller to top
        if (inBetweenIndex !== -1) {
            const targetInnerScroller = innerScrollers[inBetweenIndex];
            const scrollerRect = scroller.getBoundingClientRect();
            const innerScrollerRect = targetInnerScroller.getBoundingClientRect();
            
            // Calculate scroll position needed to bring inner-scroller to top of scroller
            const targetScrollTop = scroller.scrollTop + (innerScrollerRect.top - scrollerRect.top) + 1;
            
            smoothScrollTo(targetScrollTop);
        }
    });
    
    // Initial setup
    captureInitialPositions();
});

