;(function (bs) {
    bs.socket.on('custom-event', function(data) {
        function refresh() {
            var iframe = document.getElementById('banner');
            // check if script is run from within iframe or from main index.html
            if (iframe) {
                // reload iframe while in index.html
                iframe.contentWindow.location.reload(true);
            } else {
                // reload location while in iframe
                location.reload()
            }
        }
        refresh();
    })
})(___browserSync___);