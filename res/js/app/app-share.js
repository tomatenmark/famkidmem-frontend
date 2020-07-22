function share() {
    let url = location.href;
    let title = app.videoMap[app.videoTitle].decryptedTitle;
    url = url.replace(/#video/, 'video.html#video');
    if (navigator.share) {
        navigator.share({
            title: 'Schau dir das mal an',
            url: url,
            text: title
        }).then(() => {
            console.log('sharing successful');
        })
            .catch(console.error);
    } else {
        copyText(`${url}\n${title}`);
        showInfo("Link wurde in die Zwischenablage kopiert.")
    }
}