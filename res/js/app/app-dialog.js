function showInfo(text){
    app.dialog = {
        text: text,
        error: false
    };
}

function showError(text){
    app.dialog = {
        text: "Fehler: " + text,
        error: true
    };
}