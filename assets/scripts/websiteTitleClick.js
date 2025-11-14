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
    
    let inBetweenTimeout = null;
    
    // Function to check and log connected state
    function checkConnectedState() {
        const isMobileView = isMobile();
        const startMenuItems = document.querySelectorAll('.start-menu-item');
        const startMenu = document.querySelector('.start-menu');
        const startMenuContainer = document.querySelector('.start-menu-container');
        let connectedIndex = -1;
        let isInBetween = false;
        
        if (isMobileView) {
            // Mobile: check for "connected" class
            numberContainers.forEach((container, index) => {
                if (container.classList.contains('connected')) {
                    connectedIndex = index;
                }
            });
        } else {
            // Desktop: check for "connected-top" or "connected-middle" classes
            numberContainers.forEach((container, index) => {
                if (container.classList.contains('connected-top')) {
                    isInBetween = true;
                    connectedIndex = index;
                } else if (container.classList.contains('connected-middle')) {
                    connectedIndex = index;
                }
            });
        }
        
        // Disable transitions on start-menu-container before adjusting classes
        const innerScrollerPlaceholder = document.querySelector('.inner-scroller-placeholder');
        if (startMenuContainer) {
            startMenuContainer.style.transition = 'none';
        }
        if (startMenu) {
            startMenu.style.transition = 'none';
        }
        if (innerScrollerPlaceholder) {
            innerScrollerPlaceholder.style.transition = 'none';
        }
        startMenuItems.forEach(item => {
            item.style.transition = 'none';
        });
        
        // Update start-menu container class
        if (startMenu) {
            if (connectedIndex !== -1 && !isMobileView) {
                startMenu.classList.add('content-unfolded');
            } else {
                startMenu.classList.remove('content-unfolded');
            }
        }
        
        // Update start-menu-item classes based on connected state
        if (connectedIndex !== -1 && startMenuItems.length > 0) {
            if (isMobileView) {
                // Get CSS variables for positioning
                const rootStyles = getComputedStyle(document.documentElement);
                const rootFontSize = parseFloat(rootStyles.fontSize);
                const pagePadding = parseFloat(rootStyles.getPropertyValue('--page-padding')) * rootFontSize;
                const menuItemHeight = parseFloat(rootStyles.getPropertyValue('--menu-item-height')) * rootFontSize;
                const containerGap = parseFloat(rootStyles.getPropertyValue('--container-gap')) * rootFontSize;
                const viewportWidth = window.innerWidth;
                
                startMenuItems.forEach((item, index) => {
                    // Mobile: all items get folded-mobile, connected item gets clicked-menu-item-mobile
                    item.classList.add('folded-mobile');
                    item.classList.add('to-top');
                    if (index === connectedIndex) {
                        item.classList.add('clicked-menu-item-mobile');
                        item.classList.add('connected');
                    } else {
                        item.classList.remove('clicked-menu-item-mobile');
                        item.classList.remove('connected');
                    }
                    
                    // Position items horizontally
                    if (index <= connectedIndex) {
                        // Items up to and including the connected one: position from the left
                        const finalLeft = pagePadding + (index * (menuItemHeight + containerGap));
                        item.style.left = `${finalLeft}px`;
                    } else {
                        // Items after the connected one: position from the right edge
                        const positionFromRight = startMenuItems.length - index - 1;
                        const finalLeft = viewportWidth - pagePadding - menuItemHeight - (positionFromRight * (menuItemHeight + containerGap));
                        item.style.left = `${finalLeft}px`;
                    }
                });
                
                // Update inner-scroller-placeholder classes
                if (innerScrollerPlaceholder) {
                    innerScrollerPlaceholder.classList.add('to-top');
                    if (connectedIndex === 0) {
                        innerScrollerPlaceholder.classList.add('no-radius');
                    } else {
                        innerScrollerPlaceholder.classList.remove('no-radius');
                    }
                }
            } else {
                // Desktop: items up to connected get unfolded, non-connected get folded, connected gets clicked-menu-item
                startMenuItems.forEach((item, index) => {
                    if (index <= connectedIndex) {
                        item.classList.add('unfolded');
                    } else {
                        item.classList.remove('unfolded');
                    }
                    
                    if (index !== connectedIndex) {
                        item.classList.add('folded');
                    } else {
                        item.classList.remove('folded');
                    }
                    
                    if (index === connectedIndex) {
                        item.classList.add('clicked-menu-item');
                        item.classList.add('connected');
                    } else {
                        item.classList.remove('clicked-menu-item');
                        item.classList.remove('connected');
                    }
                });
            }
        }
        
        // Re-enable transitions after a frame and remove display-none
        requestAnimationFrame(() => {
            if (startMenuContainer) {
                startMenuContainer.style.transition = '';
                startMenuContainer.classList.remove('display-none');
            }
            if (startMenu) {
                startMenu.style.transition = '';
            }
            if (innerScrollerPlaceholder) {
                innerScrollerPlaceholder.style.transition = '';
            }
            startMenuItems.forEach(item => {
                item.style.transition = '';
            });
        });
        
        // Clear any existing timeout
        if (inBetweenTimeout) {
            clearTimeout(inBetweenTimeout);
            inBetweenTimeout = null;
        }
        
        if (isInBetween && !isMobileView) {
            // Desktop in-between state: wait before logging
            inBetweenTimeout = setTimeout(() => {
                console.log(`[${isMobileView ? 'MOBILE' : 'DESKTOP'}] Connected:`, {
                    numberContainerIndex: connectedIndex,
                    numberContainerId: `number-${connectedIndex + 1}-container`,
                    innerScrollerId: `inner-scroller-${connectedIndex + 1}`,
                    state: 'in-between (connected-top)'
                });
            }, 100); // Small delay to let the state stabilize
        } else {
            // Stable connected state or mobile: log immediately
            if (connectedIndex !== -1) {
                console.log(`[${isMobileView ? 'MOBILE' : 'DESKTOP'}] Connected:`, {
                    numberContainerIndex: connectedIndex,
                    numberContainerId: `number-${connectedIndex + 1}-container`,
                    innerScrollerId: `inner-scroller-${connectedIndex + 1}`,
                    state: isMobileView ? 'connected' : 'connected-middle'
                });
            } else {
                console.log(`[${isMobileView ? 'MOBILE' : 'DESKTOP'}] No connected elements`);
            }
        }
    }
    
    // Custom smooth scroll function with specific duration
    function smoothScrollToWithDuration(targetPosition, duration) {
        const startPosition = scroller.scrollTop;
        const distance = targetPosition - startPosition;
        
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
        
        return new Promise((resolve) => {
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
                    resolve();
                }
            }
            
            scrollAnimation = requestAnimationFrame(animate);
        });
    }
    
    // Click handler
    websiteTitleContainer.addEventListener('click', function() {
        // On mobile, skip in-between checks and go straight to connected state
        if (isMobile()) {
            checkConnectedState();
            return;
        }
        
        // Desktop only: Check for in-between states
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
        
        // If an in-between element is found, scroll it to top then check connected state
        if (inBetweenIndex !== -1) {
            const targetInnerScroller = innerScrollers[inBetweenIndex];
            const scrollerRect = scroller.getBoundingClientRect();
            const innerScrollerRect = targetInnerScroller.getBoundingClientRect();
            
            // Calculate scroll position needed to bring inner-scroller to top of scroller
            const targetScrollTop = scroller.scrollTop + (innerScrollerRect.top - scrollerRect.top) + 1;
            
            // Scroll with 500ms duration, wait for classes to update, then check connected state
            smoothScrollToWithDuration(targetScrollTop, 400).then(() => {
                // Wait an additional 100ms for classes to update from connected-top to connected-middle
                setTimeout(() => {
                    checkConnectedState();
                }, 100);
            });
        } else {
            // No in-between state: check connected state immediately
            checkConnectedState();
        }
    });
    
    // Initial setup
    captureInitialPositions();
});

