(function() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function(player) {
        var video = player.querySelector('video');
        var layer = player.querySelector('.play-layer');
        var source = video ? video.getAttribute('data-video') : '';
        var hls = null;
        var ready = false;

        function attach() {
            if (!video || !source || ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                ready = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                ready = true;
                return;
            }

            video.src = source;
            ready = true;
        }

        function start() {
            attach();

            if (layer) {
                layer.classList.add('is-hidden');
            }

            var attempt = video.play();

            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function() {
                    if (layer) {
                        layer.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (layer) {
            layer.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function() {
                if (video.paused) {
                    start();
                }
            });

            video.addEventListener('play', function() {
                if (layer) {
                    layer.classList.add('is-hidden');
                }
            });
        }

        window.addEventListener('pagehide', function() {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
