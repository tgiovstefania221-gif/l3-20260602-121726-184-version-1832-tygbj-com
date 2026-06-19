import { H as Hls } from "./player-dru42stk.js";

document.addEventListener("DOMContentLoaded", () => {
    const players = document.querySelectorAll("[data-hls-player]");
    players.forEach(setupPlayer);
});

function setupPlayer(container) {
    const video = container.querySelector("video");
    const startButton = container.querySelector(".video-start");
    const message = container.querySelector(".player-message");
    const source = container.dataset.src;
    let hls = null;
    let initialized = false;

    if (!video || !source || !startButton) {
        return;
    }

    const setMessage = (text) => {
        if (message) {
            message.textContent = text;
        }
    };

    const startPlayback = async () => {
        container.classList.add("is-playing");
        setMessage("正在初始化播放源...");

        try {
            if (!initialized) {
                initialized = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (Hls && Hls.isSupported()) {
                    hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        setMessage("播放源已就绪");
                        video.play().catch(() => setMessage("请再次点击播放器开始播放"));
                    });
                    hls.on(Hls.Events.ERROR, (_event, data) => {
                        if (data && data.fatal) {
                            setMessage("播放源加载失败，请稍后重试");
                            hls.destroy();
                            hls = null;
                            initialized = false;
                            container.classList.remove("is-playing");
                        }
                    });
                    return;
                } else {
                    setMessage("当前浏览器不支持 HLS 播放");
                    container.classList.remove("is-playing");
                    return;
                }
            }

            await video.play();
            setMessage("播放中");
        } catch (error) {
            setMessage("请再次点击播放器开始播放");
        }
    };

    startButton.addEventListener("click", startPlayback);

    video.addEventListener("play", () => {
        container.classList.add("is-playing");
        setMessage("播放中");
    });

    video.addEventListener("pause", () => {
        if (!video.ended) {
            setMessage("已暂停");
        }
    });

    window.addEventListener("pagehide", () => {
        if (hls) {
            hls.destroy();
        }
    });
}
