// Start animation sequence
document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    
    setTimeout(() => {
        body.classList.remove('start-animation-1');
        body.classList.add('start-animation-2');
    }, 100);

    setTimeout(() => {
        body.classList.remove('start-animation-2');
        body.classList.add('start-animation-3');
    }, 400);

    setTimeout(() => {
        body.classList.remove('start-animation-3');
    }, 800);
});

