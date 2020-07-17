function share() {
    let url = location.href;
    url = url.replace(/#video/, 'video.html#video');
    if (navigator.share) {
        navigator.share({
            title: 'Schau dir das mal an',
            url: url
        }).then(() => {
            console.log('sharing successful');
        })
            .catch(console.error);
    } else {
        copyText(url);
        showInfo("Link wurde in die Zwischenablage kopiert.")
    }
}