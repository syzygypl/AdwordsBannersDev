;(function (bs) {
    bs.socket.on('custom-event', function(data) {
        function refresh() {
            var iframes = document.getElementsByClassName('banner');
            [].forEach.call(iframes, function(iframe) {
                // check if script is run from within iframe or from main index.html
                if (iframe) {
                    // reload iframes while in index.html
                    iframe.contentWindow.location.reload(true);
                } else {
                    // reload location while in iframe
                    location.reload();
                }
            });
        }
        refresh();
    })
})(___browserSync___);