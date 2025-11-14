// Click handler for number containers - works on both desktop and mobile
document.addEventListener('DOMContentLoaded', function() {
    const scroller = document.querySelector('.scroller');
    const innerScrollers = document.querySelectorAll('.inner-scroller');
    const numberContainers = document.querySelectorAll('.number-container');

    if (!scroller || innerScrollers.length === 0 || numberContainers.length === 0) return;

    // Scroll speed in pixels per millisecond (adjust this to control speed)
    const SCROLL_SPEED = 3; // 2px per ms = 2000px per second
    
    let scrollAnimation = null; // Track current animation
    
    /**
     * Custom smooth scroll with consistent speed
     * @param {number} targetPosition - Target scroll position
     */
    function smoothScrollTo(targetPosition) {
        const startPosition = scroller.scrollTop;
        const distance = targetPosition - startPosition;
        const duration = Math.abs(distance) / SCROLL_SPEED; // Duration based on distance
        
        let startTime = null;
        
        // Cancel any existing scroll animation
        if (scrollAnimation) {
            cancelAnimationFrame(scrollAnimation);
        }
        
        // Easing function for smooth acceleration/deceleration
        // Almost linear with tiny easing at start/end
        function easeAlmostLinear(t) {
            const sineEasing = -(Math.cos(Math.PI * t) - 1) / 2;
            const linearProgress = t;
            // Blend 90% linear with 10% sine for minimal easing
            return linearProgress * 0.9 + sineEasing * 0.1;
        }
        
        function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Apply easing
            const easedProgress = easeAlmostLinear(progress);
            const currentPosition = startPosition + (distance * easedProgress);
            
            scroller.scrollTop = currentPosition;
            
            if (progress < 1) {
                scrollAnimation = requestAnimationFrame(animate);
            } else {
                scrollAnimation = null;
                console.log(`Scroll complete at position: ${scroller.scrollTop}`);
            }
        }
        
        scrollAnimation = requestAnimationFrame(animate);
        console.log(`Scrolling ${Math.abs(distance).toFixed(0)}px over ${duration.toFixed(0)}ms`);
    }

    // Add click event to each number container
    numberContainers.forEach((numberContainer, index) => {
        numberContainer.addEventListener('click', function() {
            const correspondingScroller = innerScrollers[index];
            if (!correspondingScroller) return;

            console.log(`Number ${index + 1} clicked, scrolling to corresponding inner-scroller`);

            // Get the position of the inner-scroller relative to the scroller container
            const scrollerRect = scroller.getBoundingClientRect();
            const innerScrollerRect = correspondingScroller.getBoundingClientRect();
            
            // Calculate the scroll position needed to bring inner-scroller to top of scroller
            // Current scroll position + (inner-scroller top - scroller top) + 1px extra
            const targetScrollTop = scroller.scrollTop + (innerScrollerRect.top - scrollerRect.top) + 1;

            // Smooth scroll to the target position with consistent speed
            smoothScrollTo(targetScrollTop);
        });

        // Add cursor pointer style
        numberContainer.style.cursor = 'pointer';
    });
});

