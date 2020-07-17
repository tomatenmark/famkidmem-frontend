let app;
Vue.config.devtools = config.vueDevToolsEnabled;


const data = {
    menuOpen: false,
    loggedIn: false,
    view: "login",
    username: '',
    newUsername: '',
    password: '',
    passwordRepeat:'',
    accessToken: '',
    passwordKey: '',
    passwordKeySalt: '',
    masterKey: '',
    userKey: '',
    permanentLogin: false,
    dialog: null,
    processing: false,
    processingEnd: false,
    videos: [],
    persons: [],
    years: [],
    videoMap: null,
    videoIndexReady: false,
    filterMap: null,
    video: false,
    videoLink: ''
};

const methods = {
    prepareChangePassword: function (){prepareChangePassword()},
    prepareChangeUsername: function (){prepareChangeUsername()},
    login: function (){login()},
    register: function (){register()},
    changeUsername: function (){changeUsername()},
    changePassword: function (){changePassword()},
    logoutLocal: function (){logout(false)},
    logoutGlobal: function (){logout(true)},
    showInfo: function (text){showInfo(text)},
    clearSensitiveDataAndBackToIndexView: function () {cancelChangeCredential()},
    initPlayVideo: function (title) {initPlayVideo(title)},
    closeVideo: function () {closeVideo()},
    showDate: function (timestamp, showDateValues) { return showDate(timestamp, showDateValues)},
    showDuration: function (durationInSeconds) { return showDuration(durationInSeconds)}
};

app = new Vue({
    el: '#app',
    data: data,
    methods: methods
});

function init(){
    let hashKey = location.hash.substring(1, location.hash.indexOf('/'));

    if(hashKey === 'init' || hashKey === 'reset'){
        startProcessingAnimation();
        setUserLinkValues();
        login();
    }
    if(hashKey === 'video'){
        app.videoLink = location.hash.substring(location.hash.indexOf('/')+1);
    }

    initView(hashKey);
    document.getElementById('app').style.display = 'block';
}

function initView(hashKey){
    let loggedInPermanent = localStorage.getItem('accessToken') !== null;
    let loggedIn = loggedInPermanent || sessionStorage.getItem('accessToken') !== null;
    app.view = loggedIn ? 'index' : 'login';
    if(loggedIn){
        const storage = loggedInPermanent ? localStorage : sessionStorage;
        app.loggedIn = true;
        app.accessToken = storage.getItem('accessToken');
        app.username = storage.getItem('username');
        app.passwordKey = storage.getItem('passwordKey');
        app.permanentLogin = loggedInPermanent;
    }

    if(hashKey === 'init' || hashKey === 'reset'){
        app.view = hashKey;
        clearIndex();
    } else if(loggedIn){
        loadIndex();
    }
}

function setUserLinkValues(){
    const hashValue = location.hash.substring(location.hash.indexOf('/')+1);
    const binary = CryptoJS.enc.Base64.parse(hashValue);
    const plainJson = CryptoJS.enc.Utf8.stringify(binary);
    const userObject = JSON.parse(plainJson);
    app.username = userObject.username;
    app.password = userObject.password;
    app.userKey = userObject.userKey;
}

window.addEventListener("load", init);