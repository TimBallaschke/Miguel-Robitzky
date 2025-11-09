// Image positioning script - makes images stick to specific scrollers
document.addEventListener('DOMContentLoaded', function() {
    const imagesTest = document.querySelector('.images-test');
    const imagesTestImg = imagesTest?.querySelector('img');
    const innerScroller2 = document.querySelector('#inner-scroller-2');
    const scroller = document.querySelector('.scroller');

    if (!imagesTest || !imagesTestImg || !innerScroller2 || !scroller) return;

    // Function to update image position and visibility
    function updateImagePosition() {
        // Get the position of inner-scroller-2 relative to the viewport
        const scrollerRect = innerScroller2.getBoundingClientRect();
        const scrollerTop = scrollerRect.top;
        
        // Transform the IMAGE (not the container) so the mask stays aligned
        // The container stays at 0,0 in viewport coordinates (matching the mask coordinates)
        // But the image inside moves to create parallax/positioning effect
        imagesTestImg.style.transform = `translateY(${scrollerTop}px)`;
        
        // Control visibility based on whether inner-scroller-2 is in or near the viewport
        const isNearViewport = scrollerTop > -window.innerHeight && scrollerTop < window.innerHeight * 2;
        
        if (isNearViewport) {
            imagesTest.style.opacity = '1';
        } else {
            imagesTest.style.opacity = '0';
        }
    }

    // Update on scroll
    scroller.addEventListener('scroll', updateImagePosition);
    
    // Update on resize
    window.addEventListener('resize', updateImagePosition);
    
    // Initial setup
    updateImagePosition();
});

