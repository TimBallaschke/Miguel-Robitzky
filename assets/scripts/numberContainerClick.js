// Click handler for number containers - works on both desktop and mobile
document.addEventListener('DOMContentLoaded', function() {
    const scroller = document.querySelector('.scroller');
    const innerScrollers = document.querySelectorAll('.inner-scroller');
    const numberContainers = document.querySelectorAll('.number-container');

    if (!scroller || innerScrollers.length === 0 || numberContainers.length === 0) return;

    // Add click event to each number container
    numberContainers.forEach((numberContainer, index) => {
        numberContainer.addEventListener('click', function() {
            const correspondingScroller = innerScrollers[index];
            if (!correspondingScroller) return;

            console.log(`Number ${index + 1} clicked, scrolling to corresponding inner-scroller`);

            // Get the position of the inner-scroller relative to the scroller container
            const scrollerRect = scroller.getBoundingClientRect();
            const innerScrollerRect = correspondingScroller.getBoundingClientRect();
            
            // Calculate the scroll position needed to bring inner-scroller to top of scroller
            // Current scroll position + (inner-scroller top - scroller top)
            const targetScrollTop = scroller.scrollTop + (innerScrollerRect.top - scrollerRect.top);

            // Smooth scroll to the target position
            scroller.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });

            console.log(`Scrolling to position: ${targetScrollTop}`);
        });

        // Add cursor pointer style
        numberContainer.style.cursor = 'pointer';
    });
});

