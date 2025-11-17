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
        console.log('=== checkConnectedState CALLED ===');
        const isMobileView = isMobile();
        const startMenuItems = document.querySelectorAll('.start-menu-item');
        const startMenu = document.querySelector('.start-menu');
        const startMenuContainer = document.querySelector('.start-menu-container');
        let connectedIndex = -1;
        let isInBetween = false;
        
        // Log current state
        console.log('startMenuContainer exists:', !!startMenuContainer);
        
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
        
        console.log('Connected index:', connectedIndex, 'isMobile:', isMobileView);
        
        // Disable transitions on start-menu-container before adjusting classes
        const innerScrollerPlaceholder = document.querySelector('.inner-scroller-placeholder');
        console.log('Disabling transitions...');
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
                console.log('Adding content-unfolded to start-menu');
                startMenu.classList.add('content-unfolded');
            } else {
                console.log('Removing content-unfolded from start-menu');
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
                console.log('Desktop: Manually adding classes for connected index:', connectedIndex);
                startMenuItems.forEach((item, index) => {
                    if (index <= connectedIndex) {
                        item.classList.add('unfolded');
                    } else {
                        item.classList.remove('unfolded');
                    }
                    
                    if (index !== connectedIndex) {
                        item.classList.add('folded');
                        item.classList.add('no-opacity'); // Add no-opacity manually along with folded
                    } else {
                        item.classList.remove('folded');
                        item.classList.remove('no-opacity');
                    }
                    
                    if (index === connectedIndex) {
                        item.classList.add('clicked-menu-item');
                        item.classList.add('connected');
                        console.log(`Item ${index + 1}: Added clicked-menu-item and connected`);
                    } else {
                        item.classList.remove('clicked-menu-item');
                        item.classList.remove('connected');
                    }
                });
            }
        }
        
        // Re-enable transitions after a frame and remove display-none
        requestAnimationFrame(() => {
            console.log('Re-enabling transitions...');
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
            
            // Add hidden class to content-container and reverse start menu animation on mobile
            const contentContainer = document.querySelector('.content-container');
            if (contentContainer) {
                contentContainer.classList.add('hidden');
                
                // Reverse animation sequence for mobile
                if (isMobileView) {
                    // Remove "display-none" from start-menu-container after 100ms
                    setTimeout(() => {
                        if (startMenuContainer) {
                            startMenuContainer.classList.remove('display-none');
                            console.log('Removed "display-none" from start-menu-container');
                        }
                        
                        // Remove "connected" class after another 75ms (175ms total)
                        setTimeout(() => {
                            startMenuItems.forEach(item => {
                                item.classList.remove('connected');
                            });
                            console.log('Removed "connected" from all items');
                            
                            // Remove "to-top" class after another 800ms (975ms total)
                            setTimeout(() => {
                                startMenuItems.forEach(item => {
                                    item.classList.remove('to-top');
                                });
                                if (innerScrollerPlaceholder) {
                                    innerScrollerPlaceholder.classList.remove('to-top');
                                    innerScrollerPlaceholder.classList.remove('no-radius');
                                }
                                console.log('Removed "to-top" from all items');
                                
                                // Reset positioning after another 1000ms (1975ms total)
                                setTimeout(() => {
                                    const rootStyles = getComputedStyle(document.documentElement);
                                    const rootFontSize = parseFloat(rootStyles.fontSize);
                                    const pagePadding = parseFloat(rootStyles.getPropertyValue('--page-padding')) * rootFontSize;
                                    
                                    startMenuItems.forEach((item, index) => {
                                        item.style.left = `${pagePadding}px`;
                                        item.classList.remove('folded-mobile');
                                        item.classList.remove('clicked-menu-item-mobile');
                                    });
                                    
                                    // Remove no-opacity class after 700ms
                                    setTimeout(() => {
                                        startMenuItems.forEach(item => {
                                            item.classList.remove('no-opacity');
                                        });
                                        console.log('Mobile: Removed "no-opacity" class');
                                    }, 400);
                                    
                                    // Remove no-radius class after 400ms
                                    setTimeout(() => {
                                        startMenuItems.forEach(item => {
                                            item.classList.remove('no-radius');
                                        });
                                        console.log('Mobile: Removed "no-radius" class');
                                    }, 350);
                                    
                                    // Add start-menu-opened class back to body
                                    document.body.classList.add('start-menu-opened');
                                    
                                    // Reset Alpine.js activeItem at the very end (after all cleanup)
                                    setTimeout(() => {
                                        console.log('Mobile: 800ms timeout fired - dispatching reset-menu event');
                                        window.dispatchEvent(new CustomEvent('reset-menu'));
                                    }, 800);
                                    
                                    console.log('Reset all items to initial position');
                                }, 500);
                            }, 0);
                        }, 75);
                    }, 100);
                } else {
                    // Reverse animation sequence for desktop
                    // Remove "display-none" from start-menu-container after 100ms
                    setTimeout(() => {
                        if (startMenuContainer) {
                            startMenuContainer.classList.remove('display-none');
                            console.log('Desktop: Removed "display-none" from start-menu-container');
                        }
                        
                        // Remove desktop classes after 100ms
                        setTimeout(() => {
                            console.log('Desktop: Starting class removal...');
                            // Remove desktop classes from start menu
                            if (startMenu) {
                                startMenu.classList.remove('content-unfolded');
                                console.log('Removed content-unfolded from start-menu');
                            }
                            
                            // Remove desktop classes from all start-menu-items
                            startMenuItems.forEach(item => {
                                item.classList.remove('unfolded');
                                item.classList.remove('folded');
                                item.classList.remove('clicked-menu-item');
                                item.classList.remove('connected');
                            });
                            console.log('Removed all desktop classes from items');

                            // Add start-menu-opened class back to body
                            document.body.classList.add('start-menu-opened');
                            console.log('Added start-menu-opened back to body');
                            
                            // Remove no-opacity class after 700ms
                            setTimeout(() => {
                                startMenuItems.forEach(item => {
                                    item.classList.remove('no-opacity');
                                });
                                console.log('Desktop: Removed "no-opacity" class');
                            }, 300);
                            
                            // Remove no-radius class after 500ms
                            setTimeout(() => {
                                startMenuItems.forEach(item => {
                                    item.classList.remove('no-radius');
                                });
                                console.log('Desktop: Removed "no-radius" class');
                            }, 400);
                            
                            // Reset Alpine.js activeItem at the very end (after all cleanup)
                            setTimeout(() => {
                                console.log('1500ms timeout fired - dispatching reset-menu event');
                                window.dispatchEvent(new CustomEvent('reset-menu'));
                            }, 1000);
                             
                             console.log('Desktop: Reset activeItem and removed all desktop classes');
                        }, 100);
                    }, 10);
                }
            }
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

