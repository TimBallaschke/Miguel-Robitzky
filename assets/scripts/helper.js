/**
 * Check if current screen width is mobile (768px or less)
 * @returns {boolean}
 */
function isMobile() {
    return window.innerWidth <= 768;
}

let useNativeScroll = false;
console.log('Helper: useNativeScroll', useNativeScroll);

setInterval(() => {
    console.log('Helper: useNativeScroll', useNativeScroll);
}, 1000);

