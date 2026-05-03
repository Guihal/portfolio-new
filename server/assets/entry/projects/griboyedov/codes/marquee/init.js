(function () {
    var marquee = document.querySelector('.marquee');
    if (!marquee) return;
    var track = marquee.querySelector('.marquee__track');
    if (!track) return;
    marquee.addEventListener('mouseenter', function () {
        track.style.animationPlayState = 'paused';
    });
    marquee.addEventListener('mouseleave', function () {
        track.style.animationPlayState = 'running';
    });
})();
