// Handle start menu desktop class changes
document.addEventListener('DOMContentLoaded', function() {
    // Only run on desktop devices
    if (isMobile()) return;
    
    const startMenuItems = document.querySelectorAll('.start-menu-item');
    const contentContainer = document.querySelector('.content-container');
    const startMenuContainer = document.querySelector('.start-menu-container');
    
    if (startMenuItems.length === 0) return;
    
    let contentVisibleTimeout = null;
    let menuHideTimeout = null;
    
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
            
            // Remove "hidden" class from content-container after 1000ms
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
            
            // Add "display-none" class to start-menu-container after 1100ms total
            menuHideTimeout = setTimeout(() => {
                if (startMenuContainer) {
                    startMenuContainer.classList.add('display-none');
                    console.log('Desktop: Added "display-none" to start-menu-container');
                }
            }, 800);
        });
    });
});

