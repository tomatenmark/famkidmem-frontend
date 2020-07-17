//TODO: test all

function loadIndex(){
    startProcessingAnimation();
    doGetRequest(`video/index/${app.accessToken}`, setIndex, false);
}

function setIndex(data){
    app.videos = data.videos;
    app.persons = data.persons;
    app.years = data.years;
    let masterKey = decryptKey(data.masterKey, app.passwordKey);
    initFilterMap();
    initVideoMap(masterKey);
    loadThumbnails();
    //TODO: maybe preload m3u8, but wait until all thumbnails loaded
}

function initFilterMap(){
    app.filterMap = {
        recordedFiltered: false,
        personsFiltered: false,
        yearsFiltered: false,
        recordedInCologne: false,
        recordedInGardelegen: false,
        persons: {},
        years: {}
    };
    for(let i = 0; i < app.persons.length; i++){
        let person = app.persons[i];
        app.filterMap.persons[person] = false;
    }
    for(let i = 0; i < app.years.length; i++){
        let year = app.years[i];
        app.filterMap.years[''+year] = false;
    }
}

function initVideoMap(masterKey){
    app.videoMap = {};
    for(let i = 0; i < app.videos.length; i++){
        let video = app.videos[i];
        let key = decryptKey(video.key.key, masterKey);
        app.videoMap[video.title] = {
            video: video,
            decryptedTitle: decryptMeta(video.title, key, video.key.iv),
            decryptedDescription: decryptMeta(video.description, key, video.key.iv),
            thumbnailBase64: '',
            m3u8Base64: ''
        };
    }
    app.videoIndexReady = true;
    stopProcessingAnimation();
    if(app.videoLink !== ''){
        initPlayVideo(app.videoLink);
        app.videoLink = '';
    }
}

function loadThumbnails(){
    for(let i = 0; i < app.videos.length; i++){
        let video = app.videos[i];
        loadThumbnail(video.title, video.thumbnail.filename);
    }
}

function loadThumbnail(title, filename){
    doGetRequest(`video/base64/${app.accessToken}/${filename}`, function(data){setThumbnail(data, title)}, false);
}

function loadM3u8(title, filename){
    if(app.videoMap[title].m3u8Base64 === ''){
        app.videoMap[title].m3u8Base64 = '-';
        doGetRequest(`video/base64/${app.accessToken}/${filename}`, function(data){setM3u8(data, title)}, false);
    } else {
        playVideo(title);
        if(app.processing){
            stopProcessingAnimation();
        }
    }
}

function setThumbnail(data, title){
    let iv = app.videoMap[title].video.thumbnail.key.iv;
    let masterKey = decryptKey(data.masterKey, app.passwordKey);
    let encryptedThumbnailKey = app.videoMap[title].video.thumbnail.key.key;
    let key = decryptKey(encryptedThumbnailKey, masterKey);
    app.videoMap[title].thumbnailBase64 = decryptToBase64String(data.base64, key, iv);
}

function setM3u8(data, title){
    let iv = app.videoMap[title].video.m3u8.key.iv;
    let masterKey = decryptKey(data.masterKey, app.passwordKey);
    let encryptedThumbnailKey = app.videoMap[title].video.m3u8.key.key;
    let key = decryptKey(encryptedThumbnailKey, masterKey);
    app.videoMap[title].m3u8Base64 = decryptToBase64String(data.base64, key, iv);
    playVideo(title);
    if(app.processing){
        stopProcessingAnimation();
    }
}

function initPlayVideo(title){
    startProcessingAnimation();
    app.video = true;
    loadM3u8(title, app.videoMap[title].video.m3u8.filename);
    self.location.href = `#video/${title}`;
}

function playVideo(title){
    console.log(CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(app.videoMap[title].m3u8Base64)));
    tsBaseUrl = `/api/ts/${app.accessToken}/`;
    let hls;
    let error;
    if ( Hls.isSupported() ) {
        let video = document.getElementById('video');
        hls = new Hls();
        hls.on(Hls.Events.ERROR, function (event, data) {
            error = data;
            console.log("there was an error with hls");
        });
        hls.loadSource(`data:application/vnd.apple.mpegurl;base64,${app.videoMap[title].m3u8Base64}`);
        hls.attachMedia(video);
    } else {
        showError('Dein Browser unterstützt kein HLS oder das erforderliche Plugin fehlt. Versuche MSE (Media Source Extensions) zu installieren');
    }
}

function closeVideo(){
    app.video = false;
    document.getElementById('video').src = '';
    self.location.href = '#';
}

function decryptMeta(ciphertextBase64, keyBase64, ivBase64){
    let plaintext = decryptFromBase64String(ciphertextBase64, keyBase64, ivBase64);
    return CryptoJS.enc.Utf8.stringify(plaintext);
}

function showDate(timestamp, showDateValues){
    let months = ["Januar", "Februar", "März", "April", "Mai", "Juni","Juli", "August", "September", "Oktober", "November", "Dezember"];
    let date = new Date(timestamp);
    if(showDateValues === 4){
        return `${date.getFullYear()}`;
    }
    if(showDateValues === 6){
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    }
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function showDuration(durationInSeconds){
    if(durationInSeconds < 60){
        return `0:${durationInSeconds}`;
    }
    let minutes = Math.floor(durationInSeconds/60);
    let seconds = durationInSeconds % 60;
    if(minutes < 60){
        return `${minutes}:${seconds}`.replace(/:([1-9])$/g, ':0$1');
    }
    let hours = Math.floor(durationInSeconds/60/60);
    minutes = minutes % 60;
    return `${hours}:${minutes}:${seconds}`.replace(/:([1-9])(:|$)/g, ':0$1');
}

function clearIndex(){
    app.videos = [];
    app.persons = [];
    app.years = [];
    app.videoMap = null;
    app.videoIndexReady = false;
    app.filterMap = null;
    app.currentVideo = '';
}

function decryptFromBase64String(ciphertextBase64, keyBase64, ivBase64){
    let ciphertext = CryptoJS.enc.Base64.parse(ciphertextBase64);
    let key = CryptoJS.enc.Base64.parse(keyBase64);
    let iv = CryptoJS.enc.Base64.parse(ivBase64);
    return CryptoJS.AES.decrypt({ciphertext:ciphertext}, key, {iv:iv});
}

function decryptToBase64String(ciphertextBase64, keyBase64, ivBase64){
    let plaintext = decryptFromBase64String(ciphertextBase64, keyBase64, ivBase64);
    return CryptoJS.enc.Base64.stringify(plaintext);
}

function decryptKey(encryptedKeyBase64, keyBase64){
    let encryptedKey = CryptoJS.enc.Base64.parse(encryptedKeyBase64);
    let key = CryptoJS.enc.Base64.parse(keyBase64);
    let decryptedKey = CryptoJS.AES.decrypt({ciphertext:encryptedKey}, key, {mode:CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding});
    return CryptoJS.enc.Base64.stringify(decryptedKey);
}