function startProcessingAnimation(){
    app.processing = true;
}

function stopProcessingAnimation(){
    app.processingEnd = true;
    setTimeout(function () {app.processing = false}, 500);
    setTimeout(function () {app.processingEnd = false}, 2000);
}