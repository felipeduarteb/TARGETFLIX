(() => {
  const keyImdbID = 'pk_vqxisdlfsz9m4sd4q';
  const URLOmdbApi = 'https://www.omdbapi.com/?apikey=fd904a8f&';
  const UrlTop250Movies = `https://imdb-api.com/en/API/Top250Movies/${keyImdbID}`;
  const UrlMostPopularMovies = `https://imdb-api.com/en/API/MostPopularMovies/${keyImdbID}`;
  const UrlReleases = `https://imdb-api.com/API/AdvancedSearch/${keyImdbID}?title_type=tv_movie,tv_series&release_date=2021-01-01,2022-04-01`;
  const UrlSciFi = `https://imdb-api.com/API/AdvancedSearch/${keyImdbID}?title_type=tv_movie,tv_series&genres=sci_fi`;
  const UrlSearchTrailer = `https://imdb-api.com/en/API/YouTubeTrailer/${keyImdbID}/`;
  const UrlSearch = `https://imdb-api.com/en/API/Search/${keyImdbID}/`;
  const UrlActionAdventure = `https://imdb-api.com/API/AdvancedSearch/${keyImdbID}?title_type=tv_movie&release_date=2017-01-01,2022-01-01&genres=action,adventure`
  const topVideosToRandomID = 50;
  let dataReleasesVideos = [];
  let dataPopularVideos = [];
  let dataSciFiVideos = [];
  let dataActionVideos = [];
  let pausePlayer = true;
  let playPlayer = true;
  let player;
  let videoAtual;
  let trailerIdVideoAtual;
  let criarScriptPlayer = true;
  let top100Videos = [];
  let userData = {
    userName: 'user',
    previewedRecommendedVideos: [],
    trailerVideoId: [],
    userList: [],
  };
  let indexNumberCards = {
    releases: { index: 0 },
    popular: { index: 0 },
    userList: { index: 0 },
    national: { index: 0 },
    actionAdventure: { index: 0 },
    seriesAndMovies: { index: 0 },
  }
  let playerInformationsMovie = { value: {} };
  const isSmallScreen = () => {
    return window.matchMedia('(max-width: 767px)').matches;
  }
  let numberOfCards = isSmallScreen() ? 2 : 6;
  // api principal responsável por trazer informações
  const principalSearchAPI = async (argumentToSearch) => {
    try {
      const response = await fetch(URLOmdbApi + argumentToSearch);
      const data = await response.json();
      return data;

    } catch (error) {
      alert(error);
    }
  }
  const handleLoading = (container) => {
    const containerCards = document.querySelector('.sectionActive .containerCardsList');
    const htmlLoading = `
    <div class="containerLoading">
    <div class="holder">
    <div class="preloader"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    </div>
    </div>
  `;
    if (containerCards) {
      containerCards.innerHTML = htmlLoading;
    } else {
      return htmlLoading;
    }
  }
  const reserveSearchAPI = async (argumentToSearch) => {
    try {
      const response = await fetch(argumentToSearch);
      const data = await response.json();
      return data;
    } catch (error) {

    }
  }
  // api resonsável por pesquisar trailers por id
  // recebe o imdbID e o local do player
  const searchTrailerID = async (IDTrailerToSearch, localPlayer) => {
    const dataTrailer = await reserveSearchAPI(UrlSearchTrailer + IDTrailerToSearch);
    userData.trailerVideoId.push(dataTrailer);
    playerForYouTubeVideo(dataTrailer.videoId, localPlayer);
  }
  // função responsável por tratar resposta vinda da função 'recommendedAPISearchVideos' e enviar array ordenado pesquisa ID do trailer
  // recebe como argumento a resposta da API e o local onde o player sera inserido. 
  const handleSearchTop250Movies = async () => {
    const dataTopMovies = await reserveSearchAPI(UrlTop250Movies);
    const top250Movies = dataTopMovies.items.sort((beforeYearMovie, afterYearMovie) => {
      return afterYearMovie.year - beforeYearMovie.year;
    });
    top100Videos = top250Movies.filter((item, indexOf) => {
      if (indexOf < (top250Movies.length / 3)) {
        return item;
      }
    });
    recommendedVideoTrailer();
  }
  const containerCreate = (container, typeTransition, localPosition) => {
    container.innerHTML += `
  <div class="transitionVideoContainer1 ${typeTransition} ${localPosition}">

  </div>`;
  }
  const createBoxMovies = (containersToCreate, localContainer, dataVideos, typeContent, indexPage) => {
    let visibilitBtnPrev = indexPage.index < (numberOfCards * 2) ? 'none' : 'block';

    localContainer.previousElementSibling.style.display = visibilitBtnPrev;
    if (indexPage.index >= 24) {
      indexPage.index += numberOfCards;
    }
    if (indexPage.index < 24) {
      let locationContainer;
      const sizePoster = '384x528';
      for (let i = 1; i <= containersToCreate; i++) {
        if (i === 1 && i !== containersToCreate) {
          locationContainer = 'center';
          containerCreate(localContainer, '', locationContainer);
        } else {
          locationContainer = 'right';
          containerCreate(localContainer, 'transitionRightToLeft', locationContainer);
        }
        let containerTransition = localContainer.querySelector(`.${locationContainer}`);
        let boxCards = dataVideos.slice(indexPage.index, (indexPage.index + numberOfCards));
        indexPage.index += numberOfCards;
        boxCards.forEach((itemMovie) => {
          const imagePoster = itemMovie.image.includes('original') ? itemMovie.image.replace('original', sizePoster) 
          : itemMovie.image.includes('UX128_CR0,3,128,176') ? itemMovie.image.replace('UX128_CR0,3,128,176', 'UX384_CR0,8,384,528')
          : itemMovie.image;
          if (itemMovie.image !== 'N/A') {
            containerTransition.innerHTML +=
              `
          <div class="${typeContent}">
            <img src="${imagePoster}" id="${itemMovie.id}" alt="poster">
          </div>
        `
          }
        });
        listenerToGetVideoID(localContainer, boxCards);
      }

    } else {
      localContainer.nextElementSibling.style.display = 'none';
    }
  }
  const createReleasesCards = async (containersToCreate, heandleSearch = false, clearContainer = false) => {
    const containerReleases = document.querySelector('.videoReleasesContainer');
    const htmlLoading = handleLoading();
    if (clearContainer) containerReleases.innerHTML = htmlLoading;
    if (heandleSearch) dataReleasesVideos = await reserveSearchAPI(UrlReleases);
    if (clearContainer) containerReleases.innerHTML = '';
    createBoxMovies(containersToCreate, containerReleases, dataReleasesVideos.results, 'contentReleases', indexNumberCards.releases);
  }
  // cria cards de filmes/séries populares na tela principal
  // recebe array de videos e controle de pesquisa
  const createSciFiCards = async (containersToCreate, handleSearch = false, clearContainer = false) => {
    const containerNational = document.querySelector('.videoNationalContainer');
    const htmlLoading = handleLoading();
    if (clearContainer) containerNational.innerHTML = htmlLoading;
    if (handleSearch) dataSciFiVideos = await reserveSearchAPI(UrlSciFi);
    if (clearContainer) containerNational.innerHTML = '';
    createBoxMovies(containersToCreate, containerNational, dataSciFiVideos.results, 'contentNational', indexNumberCards.national);
  }
  const createPopularCards = async (containersToCreate, handleSearch = false, clearContainer = false) => {
    const containerPopular = document.querySelector('.videoPopularContainer');
    const htmlLoading = handleLoading();
    if (clearContainer) containerPopular.innerHTML = htmlLoading;
    if (handleSearch) dataPopularVideos = await reserveSearchAPI(UrlMostPopularMovies);
    if (clearContainer) containerPopular.innerHTML = '';
    createBoxMovies(containersToCreate, containerPopular, dataPopularVideos.items, 'contentPopular', indexNumberCards.popular);
  }
  // cria cards de videos que estão sendo assistidos na tela principal
  // recebe array de videos e controle de pesquisa
  const createAcitonAdventureCards = async (containersToCreate, handleSearch = false, clearContainer = false) => {
    const actionContainer = document.querySelector('.videoActionAdventureContainer');
    const htmlLoading = handleLoading();
    if (clearContainer) actionContainer.innerHTML = htmlLoading;
    if (handleSearch) dataActionVideos = await reserveSearchAPI(UrlActionAdventure);
    if (clearContainer) actionContainer.innerHTML = '';
    createBoxMovies(containersToCreate, actionContainer, dataActionVideos.results, 'contentActionAdventure', indexNumberCards.actionAdventure);
  }
  const createCardsUserList = () => {
    let locationContainer;
    const containerUserList = document.querySelector('.videoUserList');
    locationContainer = indexNumberCards.userList.index >= numberOfCards ? 'right' : 'center';
    if ((indexNumberCards.userList.index % 2) === 0 || indexNumberCards.userList.index === 0) {
      containerCreate(containerUserList, '', locationContainer);
    }
    let itemMovie = userData.userList[indexNumberCards.userList.index];
    const posterMovie = itemMovie.Poster ? itemMovie.Poster : itemMovie.image;
    const idMovie = itemMovie.imdbID ? itemMovie.imdbID : itemMovie.id;
    if (itemMovie.image !== 'N/A') {
      containerUserList.querySelector(`.${locationContainer}`).innerHTML +=
        `
          <div class="contentUserList videoInfosBox">
          <img src="${posterMovie}" id="${idMovie}" alt="poster">
          </div>`

    }
    indexNumberCards.userList.index++;
  }
  // busca e exibe informações do video selecionado
  // recebe array de infos e controle de pesquisa
  const showMoreInformationsVideo = async (informationsVideo) => {
    const dataInformations = await principalSearchAPI(`i=${informationsVideo}&plot=full`);
    const modalMoreInfosVideo = document.querySelector('.modalMoreInfosVideo');
    const containerModal = document.querySelector('.modalContainer');
    modalMoreInfosVideo.innerHTML =
      `
          <div class="infoModalContainer">
          <div class="imageModalContainer">
            <img src="${dataInformations.Poster}" alt="">
        </div>
        <h3 class="titleDescriptionModal">Título:</h3>
        <p>${dataInformations.Title}</p>
        <h3 class="titleDescriptionModal">Ano de lançamento:</h3>
        <p>${dataInformations.Year}</p>
        <h3 class="titleDescriptionModal">Descrição:</h3>
            <p>${dataInformations.Plot}</p>
        </div >
    <span>&times;</span>
  `;
    containerModal.classList.add('showMoreInfosVideo');
    const btnCloseMoreInfosModal = modalMoreInfosVideo.querySelector('span');
    btnCloseMoreInfosModal.addEventListener('click', () => {
      containerModal.classList.remove('showMoreInfosVideo');
    });
  }
  const createModalTrailer = (local, informationsVideo) => {
    const title = informationsVideo.title ? informationsVideo.title : '-';
    const rating = informationsVideo.imDbRating ? informationsVideo.imDbRating : '-';
    const year = informationsVideo.year ? informationsVideo.year : '-';
    local.innerHTML += `
      <div id="modalTrailerBox">
      <button id="btnCloseModalTrailer">x</button>
      <div class="onmouseoverModalTrailer">
        <div class="playerBoxTrailer">
          <div id="containerModalTrailerVideo"></div>
        </div>
        <div class="frontalPlayer">
      </div>
        <div class="containerFooterBoxModal">
          <div class="containerBtnsModalTrailer">
              <button id="btnModalBoxToPlay" class="btnHidden">
                <img src="./img/play-icon.png" alt="ícone para play">
              </button>
              <button id="btnModalBoxToPause" class="btnHidden">
                <img src="./img/pause-icon.png" alt="">
              </button>
              <button id="btnModalBoxToAddToList">
                  <img src="./img/add-icon.png" alt="ícone para adicionar a minha lista">
              </button>
              <button id="btnModalBoxToMoreInformations">
                  <img src="./img/more-icon.svg" alt="ícone para mais informações">
              </button>
              <button id="btnModalBoxToExpand">
                  <img src="./img/expand-icon.png" alt="">
              </button>
          </div>
          <h2>${title}</h2>
          <h2><span>Classificação: </span> ${rating}/10</h2>
          <h2><span>Lançamento: </span> ${year}</h2>
        </div>
    </div>
      </div>
    `;
  }
  const removeModalTrailer = () => {
    const modal = document.querySelector('#modalTrailerBox') ? document.querySelector('#modalTrailerBox') : '';
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }
  const stopVideoPlayer = () => {
    const playerActive = document.querySelector('iframe');
    const onPlay = player;
    playPlayer = true;
    if (playerActive && onPlay) {
      player.stopVideo();
    } else {
      return false;
    }

  }
  // pesquisa e cria modal do treiler em que o mouse está em foco
  // recebe id do video em foco e array de itens onde ele está inserido
  const modalVideoTrailerCard = (idVideoToModalTrailer, getedListVideos) => {
    if (stopVideoPlayer()) stopVideoPlayer();
    const informationsVideo = getedListVideos.find((item) => {
      if (item.id === idVideoToModalTrailer.id) return item;
    });
    const containerActive = document.querySelector('.sectionActive');
    const containerToTrailerModal = containerActive.querySelector(`#${idVideoToModalTrailer.id}`).parentElement;
    const principalContainer = containerToTrailerModal.parentElement;
    const locationBoxContainer = containerToTrailerModal.getBoundingClientRect();
    const positionCardSides = containerActive.classList.contains('contentHomeContainer') ? '0' : '1.5vw';
    let left = locationBoxContainer.left - (locationBoxContainer.width / 2);
    let top = containerActive.classList.contains('contentHomeContainer') ?
      locationBoxContainer.height - (locationBoxContainer.height + (locationBoxContainer.height / 4))
      : locationBoxContainer.top + window.scrollY - (locationBoxContainer.height / 4);
    removeModalTrailer();
    createModalTrailer(principalContainer, informationsVideo);
    const containerModalBoxTrailer = document.querySelector('#modalTrailerBox');
    containerModalBoxTrailer.style.top = `${top}px`;
    if (locationBoxContainer.right + (containerModalBoxTrailer.getBoundingClientRect().width / 2) > window.innerWidth) {
      containerModalBoxTrailer.style.right = positionCardSides;
    } else if (locationBoxContainer.left - (containerModalBoxTrailer.getBoundingClientRect().width / 2) < 0) {
      containerModalBoxTrailer.style.left = positionCardSides;
    } else {
      containerModalBoxTrailer.style.left = `${left}px`;
    }
    containerModalBoxTrailer.classList.add('showMoreInfosVideo');
    if (!isSmallScreen()) {
      let timeoutMouseOut;
      containerModalBoxTrailer.addEventListener('mouseover', () => clearTimeout(timeoutMouseOut));
      containerModalBoxTrailer.addEventListener('mouseout', () => {
        timeoutMouseOut = setTimeout(() => {
          removeModalTrailer();
        }, 200);
      });
    } else {
      const btnClose = document.querySelector('#btnCloseModalTrailer');
      btnClose.addEventListener('click', () => {
        containerModalBoxTrailer.parentNode.removeChild(containerModalBoxTrailer);
      })
    }
    listenerBtnsTrailerBox(containerModalBoxTrailer, informationsVideo);
    searchTrailerID(informationsVideo.id, 'containerModalTrailerVideo');
    // playerForYouTubeVideo('M7lc1UVf-VE', 'containerModalTrailerVideo');
    // playerForYouTubeVideo('aLqc8TdoLJ0', 'containerModalTrailerVideo');
  }
  // cria eventos de listener com base em argumentos recebidos
  // recebe elemento onde os videos estão e array de videos par abusca de ID
  const listenerToGetVideoID = (elementToGetVideoID, videoListToFindVideoID) => {
    const getedElementVideo = elementToGetVideoID;
    const getedListVideos = videoListToFindVideoID;
    const typeEvent = isSmallScreen() ? 'click' : 'mouseover';
    const timeToModal = isSmallScreen() ? 1 : 1000;
    const handleClickBox = (elementItemCardVideo) => {
      const foundElementClick = getedListVideos.find((itemArray) => itemArray.id === elementItemCardVideo.target.id);
      showMoreInformationsVideo(foundElementClick.id);
    }
    const handleEventToOpenModal = (elementItemCardVideo) => {
      let timeoutToTrailerVideo;
      timeoutToTrailerVideo = setTimeout(() => {
        const foundElementOver = getedListVideos.find((itemArray) => itemArray.id === elementItemCardVideo.target.id);
        if (foundElementOver) {
          modalVideoTrailerCard(foundElementOver, getedListVideos, getedElementVideo)
        }
      }, timeToModal);
      getedElementVideo.addEventListener('mouseout', () => {
        clearTimeout(timeoutToTrailerVideo);
      });
    }
    if (!isSmallScreen()) getedElementVideo.addEventListener('click', handleClickBox);
    getedElementVideo.addEventListener(typeEvent, handleEventToOpenModal);
    handleChangeScreen(handleEventToOpenModal, handleClickBox);
  }

  const removeIframe = () => {
    const iframeToRemove = document.querySelector('#playerRecommendedVideo');
    if (iframeToRemove) iframeToRemove.remove(iframeToRemove);
  }
  const createContainerRecommendedVideo = () => {
    document.querySelector('.recommendedVideoContainer').innerHTML =
      `<div id="playerRecommendedVideo">
        </div>`
  }
  //
  const IdRandom = () => {
    const topRandom = (num) => Math.floor(Math.random() * num);
    return top100Videos[topRandom(topVideosToRandomID)];
  }
  const innerHTMLToInformationsRecommendedVideo = (informationsVideoRecommended) => {
    const recommendedHeaderContainer = document.querySelector('.headerRecommendedVideoInitial');
    const containerFooterRecommended = document.querySelector('.informationsFooterRecommendedVideo');
    recommendedHeaderContainer.innerHTML =
      `
    <h2>${informationsVideoRecommended.Title}</h2>
      `;
    containerFooterRecommended.innerHTML =
      `
      <h3> Classificação:<span>${informationsVideoRecommended.Ratings[0].Value}</span></h3> 
        <h3>Gênero:<span>${informationsVideoRecommended.Genre}</span></h3>
        <h3>Duração:<span>${informationsVideoRecommended.Runtime}</span></h3>
  `;
  }
  const recommendedVideoTrailer = async () => {
    pausePlayer = true;
    // let IDVideoRandom = IdRandom();
    let IDVideoRandom = IdRandom((item) => {
      if (item.id !== videoAtual.imdbID || videoAtual.length === 0) {
        return item;
      }
    });
    const dataInformations = await principalSearchAPI(`i=${IDVideoRandom.id}&plot=full`);
    const dataTrailer = await reserveSearchAPI(UrlSearchTrailer + dataInformations.imdbID);
    videoAtual = dataInformations;
    userData.previewedRecommendedVideos.push(dataInformations);
    innerHTMLToInformationsRecommendedVideo(dataInformations);
    userData.trailerVideoId.push(dataTrailer);
    trailerIdVideoAtual = dataTrailer;
    playerForYouTubeVideo(dataTrailer.videoId, 'playerRecommendedVideo');
    // searchTrailerID(dataInformations.imdbID, 'playerRecommendedVideo');


  }
  const playVideo = () => {
    player.playVideo();
  }
  const playerForYouTubeVideo = (videoIDTrailer, localPlayer) => {
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
          'loop': 1, 'showinfo': 0, 'autoplay': 1, 'controls': 0, 'rel': 0, 'modestbranding': 1, 'disablekb': 1, 'iv_load_policy': 3, 'listType': id,
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
      // if (event.data == YT.PlayerState.PLAYING && !done) {
      //   done = true;
      // }
      if (event.data === YT.PlayerState.ENDED && localPlayer === 'playerRecommendedVideo') {
        pausePlayer = true;
        playPlayer = false;
        removeIframe();
        createContainerRecommendedVideo();
        recommendedVideoTrailer();
      }
    }

  }
  //
  // let activeVideo = userData.previewedRecommendedVideos.indexOf(previewedRecommendedVideos[userData.previewedVideos.length]);
  const getFullscreenElement = () => {
    return document.fullscreenElement
      || document.webkitFullscreenElement
      || document.mozFullscreenElement
      || document.msFullscreenElement;
  }
  const fullScreen = (containerVideo) => {
    if (getFullscreenElement()) {
      document.exitFullscreen();

    } else {
      containerVideo.requestFullscreen();
    }
  }
  const listenerBtnsRecommendedVideos = (() => {
    const btnPlayVideo = document.querySelector('#playFullScreenFooterRecommendedVideoInitial')
    const btnPauseVideo = document.querySelector('#btnFooterRecommendedPause');
    const btnAddToList = document.querySelector('#btnFooterRecommendedToAddToList');
    const btnMoreInformations = document.querySelector('#btnFooterRecommendedToMoreInformations');
    const btnExpandVideo = document.querySelector('#btnFooterRecommendedToExpand');
    const btnPrev = document.querySelector('#prevVideoRecommended');
    const btnNext = document.querySelector('#nextVideoRecommended');
    const containerRecommended = document.querySelector('.informationsRecommendedVideo');
    let removeControls;
    containerRecommended.addEventListener('mousemove', () => {
      containerRecommended.classList.add('recommendedVideoActive');
      containerRecommended.classList.remove('cursorNone');
      clearTimeout(removeControls);
      removeControls = setTimeout(() => {
        containerRecommended.classList.add('cursorNone');
        containerRecommended.classList.remove('recommendedVideoActive');
      }, 1500);

    });
    btnPlayVideo.addEventListener('click', () => {
      if (playPlayer) {
        pausePlayer = true;
        playPlayer = false;
        removeIframe();
        createContainerRecommendedVideo();
        playerForYouTubeVideo(trailerIdVideoAtual.videoId, 'playerRecommendedVideo');
      } else if (!playPlayer) {
        stopVideoPlayer();
      } else {
        playPlayer = false;
        playVideo();
      }
    });
    btnPauseVideo.addEventListener('click', () => {
      if (playPlayer) {
        playPlayer = false;
        playVideo();
      }
      else {
        stopVideoPlayer();
      }
    });
    btnAddToList.addEventListener('click', () => {
      userData.userList.push(videoAtual);
      createCardsUserList();

    });
    btnMoreInformations.addEventListener('click', () => {
      showMoreInformationsVideo(videoAtual.imdbID);
    });
    btnExpandVideo.addEventListener('click', () => {

      fullScreen(document.querySelector('.containerRecommendedVideo'), false);
    });
    btnPrev.addEventListener('click', () => {
      if (userData.previewedRecommendedVideos.length > 0) {
        removeIframe();
        createContainerRecommendedVideo();
        userData.trailerVideoId.find((itemArray, index) => {
          if (itemArray.imDbId === videoAtual.imdbID) {
            videoAtual = userData.previewedRecommendedVideos[index - 1];
            innerHTMLToInformationsRecommendedVideo(userData.previewedRecommendedVideos[index - 1]);
            playerForYouTubeVideo(userData.trailerVideoId[index - 1].videoId, 'playerRecommendedVideo');
          }
        });
      }
    });
    btnNext.addEventListener('click', () => {
      removeIframe();
      createContainerRecommendedVideo();
      recommendedVideoTrailer();
    });

  })();
  const handleChangeMediaScreen = (event) => {
    if (!getFullscreenElement()) {
      numberOfCards = (event.matches || (isSmallScreen() && event.bubbles)) ? 2 : 6;
      for (let [, value] of Object.entries(indexNumberCards)) {
        value.index = 0;
      }
      createReleasesCards(2, false, true);
      createPopularCards(2, false, true);
      createSciFiCards(2, false, true);
      createAcitonAdventureCards(2, false, true);
    }
  }
  const modalFullscreen = (container) => {
    let removeControls;
    const containerFooterBoxModal = container.querySelector('.containerFooterBoxModal');
    containerFooterBoxModal.style.height = '25vh';
    containerFooterBoxModal.style.position = 'absolute';
    container.querySelector('#btnModalBoxToPlay').classList.remove('btnHidden');
    container.querySelector('#btnModalBoxToPause').classList.remove('btnHidden');

    const eventMouseMove = () => {
      clearTimeout(removeControls);
      containerFooterBoxModal.classList.remove('footerModalBoxTrailer');
      container.classList.remove('cursorNone');
      removeControls = setTimeout(() => {
        container.classList.add('cursorNone');
        containerFooterBoxModal.classList.add('footerModalBoxTrailer');
      }, 1500);
    }
    fullScreen(container);
    container.addEventListener('mousemove', eventMouseMove);
    setTimeout(() => {
      container.addEventListener('fullscreenchange', (event) => {
        container.removeEventListener('mousemove', eventMouseMove);
        clearTimeout(removeControls);
        containerFooterBoxModal.style.height = 'initial';
        containerFooterBoxModal.style.position = 'initial';
        container.querySelector('#btnModalBoxToPlay').classList.add('btnHidden');
        container.querySelector('#btnModalBoxToPause').classList.add('btnHidden');
        containerFooterBoxModal.classList.remove('footerModalBoxTrailer');
        container.classList.remove('cursorNone');
        handleChangeMediaScreen(event);
      });
    }, 200);

  }

  const listenerBtnsTrailerBox = async (container, informationsMovie) => {
    let controlBtnFullScreen = true;
    const arrayBtns = Array.from(container.querySelectorAll('button'));
    arrayBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        switch (btn.id) {
          case 'btnModalBoxToAddToList':
            userData.userList.push(informationsMovie);
            createCardsUserList()
            break;
          case 'btnModalBoxToMoreInformations':
            showMoreInformationsVideo(informationsMovie.id);
            break;
          case 'btnModalBoxToExpand':
            modalFullscreen(container);
            break;
          case 'btnModalBoxToPlay':
            playVideo();
            break;
          case 'btnModalBoxToPause':
            stopVideoPlayer();
            break;
          default:
            break;
        }
      });
    });
  }
  const addTransitionsOnBtnPrev = (pageIndex, areaContainerTransitions, btnTarget) => {
    const btnNext = areaContainerTransitions.parentElement.querySelector('.btnNextBox');
    pageIndex.index -= numberOfCards;
    let containerRightToRemove;
    let centerBoxContainer;
    let boxContainerLeft;
    if (pageIndex.index < 24) {
      containerRightToRemove = areaContainerTransitions.querySelector('.right');
      containerRightToRemove.remove(containerRightToRemove);
    }
    centerBoxContainer = areaContainerTransitions.querySelector('.center');
    centerBoxContainer.classList.remove('center', 'transitionRightToCenter', 'transitionLeftToCenter');
    centerBoxContainer.classList.add('transitionCenterToRight', 'right');
    boxContainerLeft = centerBoxContainer.previousElementSibling;
    boxContainerLeft.classList.remove('prevContainerVideosBox', 'transitionCenterToLeft', 'left');
    boxContainerLeft.classList.add('center', 'transitionVideoContainer1', 'transitionLeftToCenter');
    if (pageIndex.index <= (numberOfCards * 2)) btnTarget.style.display = 'none';
    if (btnNext.style.display === 'none') btnNext.style.display = 'block';
  }

  const listenerBtnsNextPrevBox = (() => {
    const btnsNextBoxArea = Array.from(document.querySelectorAll('.btnNextBox'));
    const btnsPrevBoxArea = Array.from(document.querySelectorAll('.btnPrevBox'));
    btnsNextBoxArea.forEach((btnNext) => {
      btnNext.addEventListener('click', () => {
        let areaContainerTransitions = btnNext.previousElementSibling;
        const boxContainerCenter = areaContainerTransitions.querySelector('.center');
        boxContainerCenter.classList.remove('transitionVideoContainer1', 'transitionRightToCenter', 'transitionLeftToCenter', 'center');
        boxContainerCenter.classList.add('prevContainerVideosBox', 'transitionCenterToLeft', 'left');

        const boxContainerRight = areaContainerTransitions.querySelector('.right');
        boxContainerRight.classList.remove('transitionRightToLeft', 'transitionCenterToRight', 'right');
        boxContainerRight.classList.add('transitionRightToCenter', 'center');
        switch (btnNext.id) {
          case 'nextReleases':
            createReleasesCards(1);
            break;
          case 'nextPopular':
            createPopularCards(1);
            break;
          case 'nextNational':
            createSciFiCards(1);
            break;
          case 'nextActionAdventure':
            createAcitonAdventureCards(1);
            break;
          case 'moreInformationsVideo':
            break;
          case 'informationsRecommended':
            break;
          default:
            break;
        }
      })
    });
    btnsPrevBoxArea.forEach((btnPrev) => {
      btnPrev.addEventListener('click', (btn) => {
        let areaContainerTransitions = btnPrev.nextElementSibling;
        switch (btnPrev.id) {
          case 'prevReleases':
            addTransitionsOnBtnPrev(indexNumberCards.releases, areaContainerTransitions, btn.target);
            break;
          case 'prevPopular':
            addTransitionsOnBtnPrev(indexNumberCards.popular, areaContainerTransitions, btn.target);
            break;
          case 'prevNational':
            addTransitionsOnBtnPrev(indexNumberCards.national, areaContainerTransitions, btn.target);
            break;
          case 'prevActionAdventure':
            addTransitionsOnBtnPrev(indexNumberCards.actionAdventure, areaContainerTransitions, btn.target);
            break;
          case 'prevUserList':

            break;
          case 'informationsRecommended':
            break;
          default:
            break;
        }
      })
    })
  })();

  const toggleMenu = (() => {
    const btnMobile = document.querySelector('#btnMenuMobile');
    btnMobile.addEventListener('click', () => {
      const nav = document.querySelector('.navHeader');
      nav.classList.toggle('navActive');
    })
  })();

  const handleChangeScreen = (functionOver, functionClick) => {
    window.matchMedia('(max-width: 767px)').addEventListener('change', () => {
      const containers = document.querySelectorAll('.toggleEvent');
      containers.forEach((item) => {
        item.removeEventListener('mouseover', functionOver);
        item.removeEventListener('click', functionClick);
      });

    });
  }

  // playerForYouTubeVideo('aLqc8TdoLJ0', 'playerRecommendedVideo');

  //////////////////////////////////////////////////////////////////////////
  ////////////////////// CONFIGURAÇÕES SECTION SERIES //////////////////////
  //////////////////////////////////////////////////////////////////////////
  const optionsGenreSeries = document.querySelector('#optionsGenreSeries');
  const optionsGenreMovies = document.querySelector('#optionsGenreMovies');
  const baseUrlAdvancedSearch = `https://imdb-api.com/API/AdvancedSearch/${keyImdbID}?`;
  const numberCardsToCreate = 10;
  let dataGenre = [];
  const handleSearchData = async (genre, tvType) => {
    try {
      handleLoading();
      const response = await fetch(`${baseUrlAdvancedSearch}title_type=${tvType}&genres=${genre}&count=100`);
      const data = await response.json();
      return data.results;
    } catch (error) {

    }
  }
  const creatCardsBox = (dataSeries, clearContainer = true) => {
    if (removeIframe()) removeIframe();
    const containerCards = document.querySelector('.sectionActive .containerCardsList');
    const sizePoster = '384x528';
    const indexPage = indexNumberCards.seriesAndMovies.index;
    if (clearContainer) containerCards.innerHTML = '';
    if (indexPage < dataSeries.length) {
      const boxCards = dataSeries.slice(indexPage, (indexPage + numberCardsToCreate));
      indexNumberCards.seriesAndMovies.index += numberCardsToCreate;
      boxCards.map((item) => {
        const imagePoster = item.image.replace("original", sizePoster);
        if (item.image !== 'N/A') {
          containerCards.innerHTML += `
          <div class="cardBox">
            <img src="${imagePoster}" id="${item.id}" alt="poster ${item.title}">
          </div>`
        }
      });
      if (clearContainer) listenerToGetVideoID(containerCards, dataSeries);
    }
  }
  const gerenateReleasesCards = async (sectionType) => {
    dataGenre = await handleSearchData('', sectionType);
    creatCardsBox(dataGenre);
  }
  const handleOptionToSearchTypeSerie = async (event) => {
    const targetGenre = event.target.value;
    const sectionId = event.target.id;
    const sectionType = sectionId === 'optionsGenreSeries' ? 'tv_series'
      : 'optionsGenreMovies' ? 'tv_movie'
        : '';
    const genreToSearch = (targetGenre === 'releases') ? 'releases'
      : (targetGenre === 'actionAdventure') ? 'action,adventure'
        : (targetGenre === 'animation') ? 'animation'
          : (targetGenre === 'comedy') ? 'comedy'
            : (targetGenre === 'documentary') ? 'documentary'
              : (targetGenre === 'fantasy') ? 'fantasy'
                : (targetGenre === 'sciFi') ? 'sci_fi'
                  : (targetGenre === 'horror') ? 'horror'
                    : '';
    indexNumberCards.seriesAndMovies.index = 0;
    if (genreToSearch && sectionType) {
      if (genreToSearch === 'releases') {
        gerenateReleasesCards(sectionType);
      } else {
        dataGenre = await handleSearchData(genreToSearch, sectionType);
        creatCardsBox(dataGenre);
      }
    }
  }
  const routerPages = (page) => {
    if (stopVideoPlayer()) stopVideoPlayer()
    removeModalTrailer();
    const pageActive = document.querySelector(`.${page}`);
    const prevPageToDesactive = document.querySelector('.sectionActive');
    if (prevPageToDesactive) {
      prevPageToDesactive.classList.add('sectionDesactive');
      prevPageToDesactive.classList.remove('sectionActive');
    }
    pageActive.classList.remove('sectionDesactive');
    pageActive.classList.add('sectionActive');
    if (page === 'contentSeriesContainer') {
      gerenateReleasesCards('tv_series');
    } else if (page === 'contentMoviesContainer') {
      gerenateReleasesCards('tv_movie');
    } else if (page === 'contentUserListContainer') {
      generateUserList
    }
    if (isSmallScreen()) document.querySelector('.navHeader').classList.remove('navActive');
  }
  const navigationHeader = (() => {
    const linksNavigation = Array.from(document.querySelectorAll('.linksListHeader  a'));
    linksNavigation.map((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        (e.target.id === 'pageHome') ? routerPages('contentHomeContainer')
          : (e.target.id === 'pageSeries') ? routerPages('contentSeriesContainer')
            : (e.target.id === 'pageMovies') ? routerPages('contentMoviesContainer')
              : (e.target.id === 'pageUserList') ? routerPages('contentUserListContainer')
                : (e.target.id === 'pageUserList') ? routerPages('contentUserListContainer')
                  : routerPages('contentHomeContainer');
      });
    });
  })();

  optionsGenreSeries.addEventListener('change', handleOptionToSearchTypeSerie);
  optionsGenreMovies.addEventListener('change', handleOptionToSearchTypeSerie);
  const handlePausePlayerOnScroll = () => {
    const mainContainerPositions = document.body.getBoundingClientRect();
    const isSectionHome = document.querySelector('.sectionActive').classList.contains('contentHomeContainer');
    const isBottom = window.scrollY + window.innerHeight >= parseInt(mainContainerPositions.height);
    if (isBottom && !isSectionHome) {
      // removeModalTrailer();
      setTimeout(() => {creatCardsBox(dataGenre, false);}, 300);
    }
    if (pausePlayer) {
      if (window.scrollY > document.querySelector('.containerRecommendedVideo').clientHeight) {
        document.querySelector('.navHeader').classList.remove('navActive');
        pausePlayer = false;
        removeModalTrailer();
      }
    }
  }

  const handleSearch = async (event) => {
    if (stopVideoPlayer()) stopVideoPlayer();
    event.preventDefault();
    routerPages('contentSearchContainer');
    handleLoading();
    const resultSearch = document.querySelector('#inputSearchHeader');
    const titleSection = document.querySelector('.sectionActive .titleSection');
    titleSection.innerHTML = `Resultados de "${resultSearch.value}"`;
    const dataSearch = await reserveSearchAPI(UrlSearch + resultSearch.value);
    resultSearch.value = '';
    indexNumberCards.seriesAndMovies.index = 0;
    creatCardsBox(dataSearch.results);
  }
  const iconSearch = document.querySelector('#btnSearchHeader');
  iconSearch.addEventListener('click', handleSearch);
  window.addEventListener('scroll', handlePausePlayerOnScroll);
  window.matchMedia('(max-width: 767px)').addEventListener('change', handleChangeMediaScreen);
  // ///////////
  handleSearchTop250Movies();
  createReleasesCards(2, true, true);
  createPopularCards(2, true, true);
  createAcitonAdventureCards(2, true, true);
  createSciFiCards(2, true, true);
  routerPages('contentHomeContainer');
})();



