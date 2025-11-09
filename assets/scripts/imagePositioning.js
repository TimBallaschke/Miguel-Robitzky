// Image positioning script - makes images stick to specific scrollers
document.addEventListener('DOMContentLoaded', function() {
    const imagesTest = document.querySelector('.images-test');
    const innerScroller2 = document.querySelector('#inner-scroller-2');
    const scroller = document.querySelector('.scroller');

    if (!imagesTest || !innerScroller2 || !scroller) return;

    // Function to update the position of the image to match inner-scroller-2
    function updateImagePosition() {
        // Get the position of inner-scroller-2 relative to the viewport
        const scrollerRect = innerScroller2.getBoundingClientRect();
        
        // Use transform for better performance (GPU accelerated, no layout recalc)
        imagesTest.style.transform = `translateY(${scrollerRect.top}px)`;
    }

    // Update on scroll
    scroller.addEventListener('scroll', updateImagePosition);
    
    // Update on resize
    window.addEventListener('resize', updateImagePosition);
    
    // Initial setup
    updateImagePosition();
});

