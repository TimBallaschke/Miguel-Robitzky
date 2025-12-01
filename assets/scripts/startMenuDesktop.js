// Handle start menu desktop class changes
document.addEventListener('DOMContentLoaded', function() {
    // Only run on desktop devices
    if (isMobile()) return;
    
    const startMenuItems = document.querySelectorAll('.start-menu-item');
    const contentContainer = document.querySelector('.content-container');
    const startMenuContainer = document.querySelector('.start-menu-container');
    const scroller = document.querySelector('.scroller');
    
    if (startMenuItems.length === 0) return;
    
    let contentVisibleTimeout = null;
    let menuHideTimeout = null;
    let scrollTriggered = false; // Flag to prevent multiple triggers during same session
    
    // Function to check if start menu is visible
    function isStartMenuVisible() {
        const isContentHidden = contentContainer && contentContainer.classList.contains('hidden');
        const isMenuHidden = startMenuContainer && startMenuContainer.classList.contains('display-none');
        return isContentHidden && !isMenuHidden;
    }
    
    // Function to trigger first menu item behavior
    function triggerFirstMenuItem() {
        // Prevent multiple triggers during the same transition
        if (scrollTriggered) return;
        scrollTriggered = true;
        
        console.log('Desktop: Scroll detected, triggering first menu item behavior');
        
        // Clear any existing timeouts
        if (contentVisibleTimeout) {
            clearTimeout(contentVisibleTimeout);
        }
        if (menuHideTimeout) {
            clearTimeout(menuHideTimeout);
        }
        
        // Remove "hidden" class from content-container after 500ms
        // This will trigger clone visibility update via MutationObserver
        contentVisibleTimeout = setTimeout(() => {
            if (contentContainer) {
                contentContainer.classList.remove('hidden');
                console.log('Desktop: Removed "hidden" from content-container');
            }

            setTimeout(() => {
                // Remove "offset-top" class from all offset elements
                const offsetElements = document.querySelectorAll('.offset-element');
                offsetElements.forEach(element => {
                    element.classList.remove('offset-top');
                });
                
            }, 200);
            
        }, 500);
        
        // Add "display-none" class to start-menu-container after 800ms
        menuHideTimeout = setTimeout(() => {
            if (startMenuContainer) {
                startMenuContainer.classList.add('display-none');
                console.log('Desktop: Added "display-none" to start-menu-container');
            }
        }, 800);
    }
    
    // Listen for click events on menu items
    startMenuItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            console.log(`Desktop: Start menu item ${index + 1} clicked`);
            
            // Clear any existing timeouts
            if (contentVisibleTimeout) {
                clearTimeout(contentVisibleTimeout);
            }
            if (menuHideTimeout) {
                clearTimeout(menuHideTimeout);
            }
            
            // Remove "hidden" class from content-container after 500ms
            // This will trigger clone visibility update via MutationObserver
            contentVisibleTimeout = setTimeout(() => {
                if (contentContainer) {
                    contentContainer.classList.remove('hidden');
                    console.log('Desktop: Removed "hidden" from content-container');
                }

                setTimeout(() => {
                    // Remove "offset-top" class from all offset elements
                    const offsetElements = document.querySelectorAll('.offset-element');
                    offsetElements.forEach(element => {
                        element.classList.remove('offset-top');
                    });
                    
                }, 200);
                
            }, 500);
            
            // Add "display-none" class to start-menu-container after 800ms
            menuHideTimeout = setTimeout(() => {
                if (startMenuContainer) {
                    startMenuContainer.classList.add('display-none');
                    console.log('Desktop: Added "display-none" to start-menu-container');
                }
            }, 800);
        });
    });
    
    // Reset scroll trigger flag when menu becomes visible again
    if (contentContainer) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    // If content-container gets hidden class back, reset the flag
                    if (contentContainer.classList.contains('hidden')) {
                        scrollTriggered = false;
                    }
                }
            });
        });
        observer.observe(contentContainer, { 
            attributes: true, 
            attributeFilter: ['class'] 
        });
    }
    
    // Listen for scroll events on window when start menu is visible
    let lastScrollY = window.scrollY || window.pageYOffset;
    
    window.addEventListener('scroll', function() {
        // Only trigger if start menu is visible and scroll actually happened
        const currentScrollY = window.scrollY || window.pageYOffset;
        const menuVisible = isStartMenuVisible();
        const scrollChanged = currentScrollY !== lastScrollY;
        
        if (menuVisible && scrollChanged && !scrollTriggered) {
            // Trigger the same behavior as clicking the first menu item
            // This will set activeItem = 1 and remove start-menu-opened from body
            const firstMenuItem = startMenuItems[0];
            if (firstMenuItem) {
                firstMenuItem.click();
            }
        }
        lastScrollY = currentScrollY;
    }, { passive: true });
});

