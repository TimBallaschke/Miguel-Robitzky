// Image Carousel - Click to flip through images
(function() {
    'use strict';
    
    // Store carousel data globally
    const carouselData = [];
    
    function initImageCarousel() {
        const carousels = document.querySelectorAll('.projects-images:not(.projects-images-clone)');
        
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
                
                // Update clones too
                updateClones();
            }
            
            // Store carousel data
            carouselData.push({
                carousel,
                images,
                showImage,
                getCurrentIndex: () => currentIndex
            });
        });
        
        // Global click handler for arrow buttons (works for both originals and clones)
        document.addEventListener('click', (e) => {
            const leftArrow = e.target.closest('.carousel-arrow-left');
            const rightArrow = e.target.closest('.carousel-arrow-right');
            
            if (!leftArrow && !rightArrow) return;
            
            e.stopPropagation(); // Prevent other click handlers
            
            // Find which carousel this arrow belongs to
            const carouselContainer = e.target.closest('.projects-images, .projects-images-clone');
            if (!carouselContainer) return;
            
            // Find the index of this carousel
            let carouselIndex = -1;
            if (carouselContainer.classList.contains('projects-images-clone')) {
                const clones = document.querySelectorAll('.projects-images-clone');
                carouselIndex = Array.from(clones).indexOf(carouselContainer);
            } else {
                const originals = document.querySelectorAll('.projects-images:not(.projects-images-clone)');
                carouselIndex = Array.from(originals).indexOf(carouselContainer);
            }
            
            if (carouselIndex !== -1 && carouselData[carouselIndex]) {
                const data = carouselData[carouselIndex];
                const currentIndex = data.getCurrentIndex();
                
                if (leftArrow) {
                    // Previous image
                    const prevIndex = (currentIndex - 1 + data.images.length) % data.images.length;
                    data.showImage(prevIndex);
                } else if (rightArrow) {
                    // Next image
                    const nextIndex = (currentIndex + 1) % data.images.length;
                    data.showImage(nextIndex);
                }
            }
        });
        
        // Global keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) return;
            
            // Find the visible carousel
            const visibleCarousel = findVisibleCarousel();
            if (!visibleCarousel) return;
            
            e.preventDefault();
            
            const currentIndex = visibleCarousel.getCurrentIndex();
            
            if (e.key === 'ArrowRight' || e.key === ' ') {
                const nextIndex = (currentIndex + 1) % visibleCarousel.images.length;
                visibleCarousel.showImage(nextIndex);
            } else if (e.key === 'ArrowLeft') {
                const prevIndex = (currentIndex - 1 + visibleCarousel.images.length) % visibleCarousel.images.length;
                visibleCarousel.showImage(prevIndex);
            }
        });
    }
    
    // Find the carousel currently most visible in viewport
    function findVisibleCarousel() {
        const viewportMid = window.innerHeight / 2;
        let closestCarousel = null;
        let closestDistance = Infinity;
        
        carouselData.forEach(data => {
            const rect = data.carousel.getBoundingClientRect();
            const carouselMid = rect.top + (rect.height / 2);
            const distance = Math.abs(carouselMid - viewportMid);
            
            // Only consider if in viewport
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestCarousel = data;
                }
            }
        });
        
        return closestCarousel;
    }
    
    // Update clones to match originals
    function updateClones() {
        const clones = document.querySelectorAll('.projects-images-clone');
        clones.forEach((clone, index) => {
            if (carouselData[index]) {
                const original = carouselData[index].carousel;
                const originalImages = original.querySelectorAll('.project-image');
                const cloneImages = clone.querySelectorAll('.project-image');
                
                originalImages.forEach((origImg, imgIndex) => {
                    if (cloneImages[imgIndex]) {
                        if (origImg.classList.contains('active')) {
                            cloneImages[imgIndex].classList.add('active');
                        } else {
                            cloneImages[imgIndex].classList.remove('active');
                        }
                    }
                });
            }
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImageCarousel);
    } else {
        initImageCarousel();
    }
    
    // Export updateClones for imagePositioning.js to use
    window.updateCarouselClones = updateClones;
})();

