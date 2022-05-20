export const IdRandom = () => {
    const topRandom = (num) => Math.floor(Math.random() * num);
    return top100Videos[topRandom(topVideosToRandomID)];
}
export const innerHTMLToInformationsRecommendedVideo = (informationsVideoRecommended) => {
    const recommendedHeaderContainer = document.querySelector('.headerRecommendedVideoInitial');
    const containerFooterRecommended = document.querySelector('.informationsFooterRecommendedVideo');
    recommendedHeaderContainer.innerHTML =
        `
        <h2>${informationsVideoRecommended.Title}</h2>
      `;
    containerFooterRecommended.innerHTML =
        `
        <h3>Classificação: <span> ${informationsVideoRecommended.Ratings[0].Value} </span> </h3> 
        <h3>Gênero: <span> ${informationsVideoRecommended.Genre} </span> </h3>
        <h3>Duração: <span> ${informationsVideoRecommended.Runtime} </span> </h3>
      `;
}
export const recommendedVideoTrailer = (informationsVideoRecommended, fetchControl) => {
    // let IDVideoRandom = IdRandom();
    let IDVideoRandom = IdRandom((item) => {
        if (item.id !== videoAtual.imdbID || videoAtual.length === 0) {
            return item;
        }
    });
    if (!fetchControl) {
        principalSearchAPI(`i=${IDVideoRandom.id}&plot=full`, 'informationsRecommended');
    } else {
        videoAtual = informationsVideoRecommended;
        userData.previewedRecommendedVideos.push(informationsVideoRecommended);
        innerHTMLToInformationsRecommendedVideo(informationsVideoRecommended);
        searchTrailerID(informationsVideoRecommended.imdbID, 'playerRecommendedVideo');
    }
}
export const removeIframe = () => {
    const iframeToRemove = document.querySelector('#playerRecommendedVideo');
    return iframeToRemove.remove(iframeToRemove);
}
export const createContainerRecommendedVideo = () => {
    document.querySelector('.recommendedVideoContainer').innerHTML =
        `<div id="playerRecommendedVideo">
        </div>`
}