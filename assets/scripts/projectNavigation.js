// Project navigation - scroll to next/previous project
document.addEventListener('DOMContentLoaded', function() {
    const scroller = document.querySelector('.scroller');
    
    if (!scroller) return;
    
    // Get all projects
    const projects = document.querySelectorAll('.project');
    
    if (projects.length === 0) return;
    
    // Function to scroll to a specific project
    function scrollToProject(targetProject) {
        if (!targetProject) return;
        
        const scrollerRect = scroller.getBoundingClientRect();
        const projectRect = targetProject.getBoundingClientRect();
        
        // Calculate the scroll position needed
        const targetScrollTop = scroller.scrollTop + (projectRect.top - scrollerRect.top);
        
        // Smooth scroll to target
        scroller.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
        });
    }
    
    // Function to handle navigation button clicks
    function handleNavClick(button, direction) {
        // Find the parent project (works for both original and clone buttons)
        let parentElement = button.closest('.project');
        
        if (!parentElement) {
            // If not found in original, find index from clone
            const cloneTextContainer = button.closest('.project-text-clone');
            if (cloneTextContainer) {
                // Find index of this clone
                const allClones = document.querySelectorAll('.project-text-clone');
                const cloneIndex = Array.from(allClones).indexOf(cloneTextContainer);
                
                if (cloneIndex !== -1) {
                    parentElement = projects[cloneIndex];
                }
            }
        }
        
        if (!parentElement) return;
        
        // Find current project index
        const currentIndex = Array.from(projects).indexOf(parentElement);
        
        if (currentIndex === -1) return;
        
        // Get target project
        let targetProject = null;
        
        if (direction === 'prev' && currentIndex > 0) {
            targetProject = projects[currentIndex - 1];
        } else if (direction === 'next' && currentIndex < projects.length - 1) {
            targetProject = projects[currentIndex + 1];
        }
        
        if (targetProject) {
            scrollToProject(targetProject);
        }
    }
    
    // Attach handlers to all prev buttons (originals)
    const prevButtonsOriginal = document.querySelectorAll('.project .project-nav-prev');
    prevButtonsOriginal.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            handleNavClick(button, 'prev');
        });
    });
    
    // Attach handlers to all next buttons (originals)
    const nextButtonsOriginal = document.querySelectorAll('.project .project-nav-next');
    nextButtonsOriginal.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            handleNavClick(button, 'next');
        });
    });
    
    // Attach handlers to clone buttons
    const prevButtonsClone = document.querySelectorAll('.project-text-clone .project-nav-prev');
    prevButtonsClone.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            handleNavClick(button, 'prev');
        });
    });
    
    const nextButtonsClone = document.querySelectorAll('.project-text-clone .project-nav-next');
    nextButtonsClone.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            handleNavClick(button, 'next');
        });
    });
});

