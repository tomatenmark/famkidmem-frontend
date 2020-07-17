function handleRequestSuccess(response, callback, lastStep) {
    console.debug('request successful. calling callback. response: ' + JSON.stringify(response.data));
    if(lastStep){
        stopProcessingAnimation();
    }
    callback(response.data);
}

function handleRequestError(response) {
    console.error("Request-Error: responseObject: " + JSON.stringify(response));
    if(response.status === 502){
        showError('Das Backend ist derzeit nicht erreichbar. Bitte versuche es später erneut.');
    } else if(response.data.details === 'Username or Password is wrong') {
        showError('Das hat nicht geklappt. Falscher Benutzername und/oder falsches Passwort');
    } else if(response.data.details.indexOf('Too much invalid login attempts') >= 0) {
        showError('Aufgrund zu vieler Login-Versuche ist dieser Benutzername für weitere Versuche gesperrt. Versuche es in 5 Minuten wieder.');
    } else if(response.data.details.indexOf('You are not allowed') >= 0){
        setLogout();
    } else {
        copyText(JSON.stringify('Fehler bei den Family Moments. Response stringified: ' + response));
        showError('Da ist etwas schief gelaufen. Details zum Fehler wurden in die Zwischenablage kopiert. ' +
            'Füge sie in WhatsApp ein und schicke sie mir, damit ich der Sache auf den Grund gehen kann.');
    }
    stopProcessingAnimation();
}

function doGetRequest(path, callback, lastStep){
    app.$http.get(config.apiBase+path).then(function (response) {
        handleRequestSuccess(response, callback, lastStep);
    }, handleRequestError);
}

function doPostRequest(path, data, callback, lastStep){
    app.$http.post(config.apiBase+path, JSON.stringify(data)).then(function (response) {
        handleRequestSuccess(response, callback, lastStep);
    }, handleRequestError);
}
