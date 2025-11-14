// Handle start menu mobile positioning
document.addEventListener('DOMContentLoaded', function() {
    // Only run on mobile devices
    if (!isMobile()) return;
    
    const startMenuItems = document.querySelectorAll('.start-menu-item');
    if (startMenuItems.length === 0) return;
    
    let initialPositions = [];
    
    // Function to capture initial left positions from CSS
    function captureInitialPositions() {
        // Temporarily remove inline styles to get CSS values
        startMenuItems.forEach(item => {
            item.style.left = '';
        });
        
        // Capture the CSS-defined positions
        initialPositions = Array.from(startMenuItems).map(item => {
            const computedStyle = window.getComputedStyle(item);
            return parseFloat(computedStyle.left);
        });
    }
    
    function updateMenuPositions() {
        // Get CSS variables
        const rootStyles = getComputedStyle(document.documentElement);
        
        // Get root font size for rem to px conversion
        const rootFontSize = parseFloat(rootStyles.fontSize);
        
        // Convert rem values to px
        const pagePadding = parseFloat(rootStyles.getPropertyValue('--page-padding')) * rootFontSize;
        const menuItemHeight = parseFloat(rootStyles.getPropertyValue('--menu-item-height')) * rootFontSize;
        const containerGap = parseFloat(rootStyles.getPropertyValue('--container-gap')) * rootFontSize;
        
        // Calculate the viewport width and available space
        const viewportWidth = window.innerWidth;
        const availableWidth = viewportWidth - (2 * pagePadding);
        
        console.log('Start Menu Positioning Debug:', {
            pagePadding,
            menuItemHeight,
            containerGap,
            rootFontSize,
            viewportWidth,
            availableWidth
        });
        
        // Find which item is clicked (has clicked-menu-item-mobile class)
        let clickedIndex = -1;
        startMenuItems.forEach((item, index) => {
            if (item.classList.contains('clicked-menu-item-mobile')) {
                clickedIndex = index;
            }
        });
        
        console.log('Clicked index:', clickedIndex);
        
        // If an item is clicked, position all items
        if (clickedIndex !== -1) {
            // Count how many items are after the clicked one
            const itemsAfterClicked = startMenuItems.length - clickedIndex - 1;
            
            startMenuItems.forEach((item, index) => {
                if (index <= clickedIndex) {
                    // Items up to and including the clicked one: position them from the left
                    const finalLeft = pagePadding + (index * (menuItemHeight + containerGap));
                    console.log(`Setting item ${index + 1} left to: ${finalLeft}px (left-aligned)`);
                    item.style.left = `${finalLeft}px`;
                } else {
                    // Items after the clicked one: position them from the right edge
                    // Calculate how many positions from the right this item is
                    const positionFromRight = startMenuItems.length - index - 1;
                    const finalLeft = viewportWidth - pagePadding - menuItemHeight - (positionFromRight * (menuItemHeight + containerGap));
                    console.log(`Setting item ${index + 1} left to: ${finalLeft}px (right-aligned, position ${positionFromRight} from right)`);
                    item.style.left = `${finalLeft}px`;
                }
            });
        } else {
            // No item clicked, reset all to pagePadding (stacked position)
            startMenuItems.forEach((item, index) => {
                item.style.left = `${pagePadding}px`;
            });
        }
    }
    
    function handleResize() {
        captureInitialPositions();
        updateMenuPositions();
    }
    
    // Use MutationObserver to watch for class changes on menu items
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                updateMenuPositions();
            }
        });
    });
    
    // Observe each menu item for class changes
    startMenuItems.forEach(item => {
        observer.observe(item, { attributes: true });
    });
    
    // Update on resize
    window.addEventListener('resize', handleResize);
    
    // Initial setup
    captureInitialPositions();
    updateMenuPositions();
});

