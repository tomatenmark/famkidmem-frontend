
const loginPepper = "ee/ZUOqS8i30+TKZ5mU9dA==";

function togglePasswordVisible(fieldId){
    let caretPosition = document.getElementById(fieldId).selectionStart;
    app.passwordVisible = !app.passwordVisible;
    document.getElementById(fieldId).focus();
    setTimeout(`document.getElementById('${fieldId}').setSelectionRange(${caretPosition}, ${caretPosition})`, 10);
}

const registerCallback = function(){
    userModificationCallback('Erfolgreich registriert. Viel Spaß mit den Family Moments');
    self.location.replace('#view');
    logout(false);
};

const changeUsernameCallback = function(){
    userModificationCallback('Benutzername erfolgreich geändert.');
    app.newUsername = '';
    logout(true);
};

const changePasswordCallback = function(){
    userModificationCallback('Passwort erfolgreich geändert.');
    self.location.replace('#view');
    logout(true);
};

function prepareChangePassword(){
    startProcessingAnimation();
    getUserKey(setPreparedChangePassword);
}

function setPreparedChangePassword(data){
    app.userKey = data.details;
    app.view = 'changePassword';
    app.newUsername = '';
    app.menuOpen = false;
}

function prepareChangeUsername(){
    app.newUsername = app.username;
    app.view = 'changeUsername';
    app.userKey = '';
    app.menuOpen = false;
}

function getUserKey(callback){
    doGetRequest(`user/key/${app.accessToken}`, callback, true);
}

function login(){
    startProcessingAnimation();
    const loginHash = createLoginHash(app.username);
    const data = {
        username: app.username,
        loginHash: loginHash,
        permanent: app.permanentLogin
    };
    doPostRequest('user/login', data, setLogin, true);
}

function setLogin(data){
    if(data.message === 'ok'){
        app.accessToken = data.accessToken;
        app.passwordKeySalt = data.passwordKeySalt;
        app.passwordKey = createPasswordKey(app.password);
        const storage = app.permanentLogin ? localStorage : sessionStorage;
        storage.setItem('accessToken', app.accessToken);
        storage.setItem('username', app.username);
        storage.setItem('passwordKey', app.passwordKey);
        storage.setItem('passwordKeySalt', app.passwordKeySalt);
        app.password = '';
        if(app.view === 'init'){
            app.username = '';
        }
        if(app.view !== 'reset' && app.view !== 'init'){
            app.view = 'index';
            loadIndex();
        }
        app.loggedIn = true;
    }
}

function register(){
    if(!checkPassword() || !checkUsername(app.username)){
        return;
    }
    startProcessingAnimation();
    const data = createDataForChangePassword();
    data.accessToken = app.accessToken;
    data.newUsername = app.username;
    doPostRequest('user/change/both', data, registerCallback, true);
}


function changeUsername(){
    if(!checkUsername(app.newUsername) || !checkOldPassword(app.password)){
        return;
    }
    startProcessingAnimation();
    const data = {
        accessToken: app.accessToken,
        newUsername: app.newUsername,
        newLoginHash: createLoginHash(app.newUsername)
    };
    doPostRequest('user/change/username', data, changeUsernameCallback, true);
}

function changePassword(){
    if(!checkPassword() || !checkOldPassword(app.oldPassword)){
        return;
    }
    startProcessingAnimation();
    const data = createDataForChangePassword();
    data.accessToken = app.accessToken;
    doPostRequest('user/change/password', data, changePasswordCallback, true);
}

function createDataForChangePassword(){
    const passwordKeyOld = app.passwordKey;
    const loginHash = createLoginHash(app.username);
    app.passwordKeySalt = createPasswordKeySalt();
    const passwordKey = createPasswordKey(app.password);
    const userKey = createUserKey(passwordKeyOld, passwordKey);
    return {
        newLoginHash: loginHash,
        newPasswordKeySalt: app.passwordKeySalt,
        newMasterKey: userKey
    }
}

function checkPassword(){
    if(!app.passwordVisible && app.password !== app.passwordRepeat){
        showError('Die Passwörter müssen übereinstimmen.');
        return false;
    }
    let outOfFour = 0;
    outOfFour += new RegExp("^.*[a-zäöüß]+.*$").test(app.password) ? 1 : 0;
    outOfFour += new RegExp("^.*[A-ZÄÖÜ]+.*$").test(app.password) ? 1 : 0;
    outOfFour += new RegExp("^.*[0-9]+.*$").test(app.password) ? 1 : 0;
    outOfFour += new RegExp("^.*[^a-zA-Z0-9äöüÄÖÜß]+.*$").test(app.password) ? 1 : 0;
    if(app.password.length < 10 || outOfFour < 3){
        showError('Das Passwort muss mindestens 10 Zeichen lang sein. Es muss mindestens 3 der 4 Zeichen-Arten (Großbuchstaben, Kleinbuchstaben, Zahlen, Sonderzeichen) enthalten.');
        return false;
    }
    return true;
}

function checkOldPassword(oldPassword){
    const keyToCheck = createPasswordKey(oldPassword);
    const trueKey = app.passwordKey;
    const valid = trueKey === keyToCheck;
    if(!valid){
        showError('Falsches Passwort');
        return false;
    }
    return true;
}

function checkUsername(username){
    const badChars = new RegExp("[^a-zA-Z0-9._=\\-]").test(username);
    if(badChars){
        showError('Der Benutzername darf nur Buchstaben, Zahlen, Punkte, Striche und/oder = enthalten. (a-zA-Z0-9_-.=)');
        return false;
    }
    return true;
}

function fixUsername(){
    const fixed = app.username.replace(/[^a-zA-Z0-9._=\-]/g, '_');
    app.username = fixed;
}

function fixNewUsername(){
    const fixed = app.newUsername.replace(/[^a-zA-Z0-9._=\-]/g, '_');
    app.newUsername = fixed;
}

function logout(global){
    startProcessingAnimation();
    app.menuOpen = false;
    const data = {
        accessToken: app.accessToken,
        global: global
    };
    doPostRequest('user/logout', data, setLogout, true);
}

function setLogout(){
    const storage = app.permanentLogin ? localStorage : sessionStorage;
    storage.clear();
    app.view = 'login';
    app.loggedIn = false;
    app.permanentLogin = false;
    app.passwordKey = '';
    app.username = '';
    app.accessToken = '';
    app.oldPassword = '';
    clearSensitiveData();
    clearIndex();
}

function cancelChangeCredential(){
    clearSensitiveData();
    app.newUsername = '';
    app.view = 'index';
}

function clearSensitiveData(){
    app.password = '';
    app.passwordRepeat = '';
    app.userKey = '';
}

function userModificationCallback(text){
    showInfo(text);
    app.view = 'index';
}

function createUserKey(passwordKeyOldBase64, passwordKeyBase64){
    const passwordKeyOld = CryptoJS.enc.Base64.parse(passwordKeyOldBase64);
    const passwordKey = CryptoJS.enc.Base64.parse(passwordKeyBase64);
    const masterKeyEncrypted = CryptoJS.enc.Base64.parse(app.userKey);
    const masterKey = CryptoJS.AES.decrypt({ciphertext:masterKeyEncrypted}, passwordKeyOld,{mode:CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding});
    const newUserKey = CryptoJS.AES.encrypt(masterKey, passwordKey,{mode:CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding});
    return CryptoJS.enc.Base64.stringify(newUserKey.ciphertext);
}

function createPasswordKey(passwordStr){
    const passwordKeySalt =  CryptoJS.enc.Base64.parse(app.passwordKeySalt);
    const password = CryptoJS.enc.Utf8.parse(passwordStr);
    const passwordKey = CryptoJS.PBKDF2(password, passwordKeySalt, {keySize: 128 / 32, iterations: 2500});
    return CryptoJS.enc.Base64.stringify(passwordKey);
}

function createPasswordKeySalt(){
    let randomArray = new Uint8Array(16);
    window.crypto.getRandomValues(randomArray);
    return arrayToBase64(randomArray);
}

function createLoginHash(username){
    const secret = CryptoJS.enc.Utf8.parse(app.password);
    const loginSpice = CryptoJS.enc.Utf8.parse(loginPepper+username);
    const loginHash = CryptoJS.PBKDF2(secret, loginSpice, {keySize: 128 / 32, iterations: 1250});
    return CryptoJS.enc.Base64.stringify(loginHash);
}

function arrayToBase64(array) {
    const binaryString = Array.prototype.map.call(array, function (character) {
        return String.fromCharCode(character);
    }).join('');
    return btoa(binaryString);
}
