export const playerForYouTubeVideo = (videoIDTrailer, localPlayer) => {
    let criarScriptPlayer = true;
    let player;
    if (criarScriptPlayer === true) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.querySelector('script');
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        criarScriptPlayer = false;
        onYouTubeIframeAPIReady = () => {
            createPlayerVideoYouTube(videoIDTrailer, localPlayer);
        }
    } else {
        createPlayerVideoYouTube(videoIDTrailer, localPlayer);
    }
    createPlayerVideoYouTube = (id, local) => {
        player = new YT.Player(local, {
            height: '360',
            width: '640',
            videoId: id,
            playerVars: {
                'loop': 1, 'showinfo': 0, 'autoplay': 1, 'controls': 1, 'rel': 0, 'modestbranding': 1, 'disablekb': 1, 'iv_load_policy': 3, 'listType': id,
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
            }
        });
    }
    onPlayerReady = (event) => {
        event.target.playVideo();
    }
    onPlayerStateChange = (event) => {
        // console.log(event);
        // if (event.data == YT.PlayerState.PLAYING && !done) {
        //   done = true;
        // }
        if (event.data === YT.PlayerState.ENDED) {
            removeIframe();
            createContainerRecommendedVideo();
            recommendedVideoTrailer();
        }
    }
    const stopVideo = () => {
        player.stopVideo();
    }
}
const stopVideo = () => {
    player.pauseVideo();
}
const playVideo = () => {
    player.playVideo();
}