(function () {
  function runWhenReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function safePlay(video) {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  window.startMoviePlayer = function (url) {
    runWhenReady(function () {
      var video = document.getElementById("moviePlayer");
      var overlay = document.getElementById("playOverlay");
      var started = false;
      var hls = null;

      if (!video || !overlay || !url) {
        return;
      }

      function begin() {
        overlay.classList.add("is-hidden");
        video.controls = true;

        if (!started) {
          started = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            safePlay(video);
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              safePlay(video);
            });
          } else {
            video.src = url;
            safePlay(video);
          }
        } else {
          safePlay(video);
        }
      }

      overlay.addEventListener("click", begin);
      video.addEventListener("click", function () {
        if (!started || video.paused) {
          begin();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };
})();
