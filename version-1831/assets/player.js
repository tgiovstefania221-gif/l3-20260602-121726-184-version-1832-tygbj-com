(function () {
  function setupPlayer(card) {
    var video = card.querySelector("video");
    var cover = card.querySelector("[data-play-cover]");
    var streamUrl = card.getAttribute("data-stream-url");
    var attached = false;
    var hlsInstance = null;

    function attachStream() {
      if (!video || !streamUrl || attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function startPlayback() {
      attachStream();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (video) {
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener("click", function (event) {
        event.preventDefault();
        startPlayback();
      });
    }

    card.addEventListener("click", function (event) {
      if (event.target === video) {
        startPlayback();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll(".js-player-card")).forEach(setupPlayer);
  });
})();
