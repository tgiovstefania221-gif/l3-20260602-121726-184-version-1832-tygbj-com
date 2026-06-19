(function () {
  var shell = document.querySelector('[data-player]');
  if (!shell) {
    return;
  }
  var video = shell.querySelector('video');
  var overlay = document.getElementById('playOverlay');
  var stream = shell.getAttribute('data-stream');
  var loaded = false;
  var hlsInstance = null;

  var attach = function () {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
      return;
    }
    video.src = stream;
  };

  var play = function () {
    attach();
    shell.classList.add('is-playing');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        shell.classList.remove('is-playing');
      });
    }
  };

  if (overlay) {
    overlay.addEventListener('click', play);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });
  video.addEventListener('pause', function () {
    if (video.currentTime === 0) {
      shell.classList.remove('is-playing');
    }
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
