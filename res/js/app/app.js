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
    videoDesignator: '',
    permanentLogin: false,
    dialog: null,
    processing: false,
    processingEnd: false
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
    clearSensitiveDataAndBackToIndexView: function () {cancelChangeCredential()}
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
        startProcessingAnimation();
        setVideoLinkValues();
    }

    initView(hashKey);
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

    if(hashKey === 'video' || hashKey === 'init' || hashKey === 'reset'){
        app.view = hashKey;
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

function setVideoLinkValues(){
    const hashValue = location.hash.substring(location.hash.indexOf('/')+1);
    const binary = CryptoJS.enc.Base64.parse(hashValue);
    app.videoDesignator = CryptoJS.enc.Utf8.stringify(binary);
}

window.addEventListener("load", init);