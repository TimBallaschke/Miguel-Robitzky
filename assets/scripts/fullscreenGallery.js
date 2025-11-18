// Fullscreen gallery functionality
console.log('Fullscreen gallery script file loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Fullscreen gallery DOMContentLoaded fired');
    
    // Get all projects and fullscreen overlays
    const projects = document.querySelectorAll('.project');
    const fullscreenOverlays = document.querySelectorAll('.fullscreen-overlay');
    console.log('Found projects:', projects.length);
    console.log('Found fullscreen overlays:', fullscreenOverlays.length);
    
    projects.forEach((project, projectIndex) => {
        console.log(`Processing project ${projectIndex + 1}`);
        const fullscreenButton = project.querySelector('.carousel-fullscreen');
        const fullscreenOverlay = fullscreenOverlays[projectIndex]; // Get matching overlay by index
        
        if (!fullscreenOverlay) {
            console.log('No overlay found for project', projectIndex);
            return;
        }
        
        const fullscreenClose = fullscreenOverlay.querySelector('.fullscreen-close');
        const fullscreenLeftArrow = fullscreenOverlay.querySelector('.fullscreen-arrow-left');
        const fullscreenRightArrow = fullscreenOverlay.querySelector('.fullscreen-arrow-right');
        
        console.log('Fullscreen button:', fullscreenButton);
        console.log('Fullscreen overlay:', fullscreenOverlay);
        
        if (!fullscreenButton || !fullscreenOverlay) {
            console.log('Missing button or overlay, skipping project');
            return;
        }
        
        // Also find the clone button for this project
        const cloneButtons = document.querySelectorAll('.projects-images-clone .carousel-fullscreen');
        const cloneButton = cloneButtons[projectIndex];
        console.log('Clone button:', cloneButton);
        
        const fullscreenImages = fullscreenOverlay.querySelectorAll('.fullscreen-image');
        const carouselImages = project.querySelectorAll('.project-image');
        
        let currentIndex = 0;
        
        // Function to sync with carousel's current active image
        function syncWithCarousel() {
            carouselImages.forEach((img, index) => {
                if (img.classList.contains('active')) {
                    currentIndex = index;
                }
            });
        }
        
        // Function to show image at index
        function showImage(index) {
            fullscreenImages.forEach((img, i) => {
                if (i === index) {
                    img.classList.add('active');
                } else {
                    img.classList.remove('active');
                }
            });
            currentIndex = index;
        }
        
        // Function to open fullscreen
        function openFullscreen(e) {
            console.log('Fullscreen button clicked!');
            e.stopPropagation();
            syncWithCarousel();
            showImage(currentIndex);
            console.log('Adding active class to overlay');
            fullscreenOverlay.classList.add('active');
            console.log('Overlay classList:', fullscreenOverlay.classList);
            // Add class to body and prevent scroll
            document.body.classList.add('fullscreen-gallery');
            document.body.style.overflow = 'hidden';
        }
        
        // Attach to original button
        fullscreenButton.addEventListener('click', openFullscreen);
        
        // Also attach to clone button if it exists
        if (cloneButton) {
            cloneButton.addEventListener('click', openFullscreen);
            console.log('Attached handler to clone button');
        }
        
        // Function to close fullscreen
        function closeFullscreen() {
            fullscreenOverlay.classList.remove('active');
            // Remove class from body and restore scroll
            document.body.classList.remove('fullscreen-gallery');
            document.body.style.overflow = '';
        }
        
        // Close fullscreen
        if (fullscreenClose) {
            fullscreenClose.addEventListener('click', (e) => {
                e.stopPropagation();
                closeFullscreen();
            });
        }
        
        // Close on overlay click (but not on content)
        fullscreenOverlay.addEventListener('click', (e) => {
            if (e.target === fullscreenOverlay) {
                closeFullscreen();
            }
        });
        
        // Navigate left
        if (fullscreenLeftArrow) {
            fullscreenLeftArrow.addEventListener('click', (e) => {
                e.stopPropagation();
                const newIndex = (currentIndex - 1 + fullscreenImages.length) % fullscreenImages.length;
                showImage(newIndex);
            });
        }
        
        // Navigate right
        if (fullscreenRightArrow) {
            fullscreenRightArrow.addEventListener('click', (e) => {
                e.stopPropagation();
                const newIndex = (currentIndex + 1) % fullscreenImages.length;
                showImage(newIndex);
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!fullscreenOverlay.classList.contains('active')) return;
            
            if (e.key === 'Escape') {
                closeFullscreen();
            } else if (e.key === 'ArrowLeft') {
                const newIndex = (currentIndex - 1 + fullscreenImages.length) % fullscreenImages.length;
                showImage(newIndex);
            } else if (e.key === 'ArrowRight') {
                const newIndex = (currentIndex + 1) % fullscreenImages.length;
                showImage(newIndex);
            }
        });
    });
});

