// Image Carousel - Click to flip through images
(function() {
    'use strict';
    
    function initImageCarousel() {
        const carousels = document.querySelectorAll('.projects-images');
        
        carousels.forEach(carousel => {
            const images = carousel.querySelectorAll('.project-image');
            
            // Skip if only one or no images
            if (images.length <= 1) return;
            
            let currentIndex = 0;
            
            // Function to show specific image
            function showImage(index) {
                // Remove active class from all images
                images.forEach(img => img.classList.remove('active'));
                
                // Add active class to current image
                images[index].classList.add('active');
                
                currentIndex = index;
            }
            
            // Click handler - advance to next image
            carousel.addEventListener('click', () => {
                const nextIndex = (currentIndex + 1) % images.length;
                showImage(nextIndex);
            });
            
            // Optional: Keyboard navigation
            carousel.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight' || e.key === ' ') {
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % images.length;
                    showImage(nextIndex);
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prevIndex = (currentIndex - 1 + images.length) % images.length;
                    showImage(prevIndex);
                }
            });
            
            // Make carousel focusable for keyboard navigation
            carousel.setAttribute('tabindex', '0');
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImageCarousel);
    } else {
        initImageCarousel();
    }
})();

