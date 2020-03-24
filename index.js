var http = require('http')
var express = require('express')
var request = require('request')
var cors = require('cors')
var app = express()

app.use(cors())

function getAudioURL(raw) {
    var pairs = raw.split('&')
    var body = pairs.reduce((obj, pair) => { 
      var [key, value] = pair.split('=')
      return Object.assign({}, obj, { [key]: value })
    }, {})

    var response = JSON.parse(unescape(body.player_response))
    if (response.playabilityStatus.status === 'UNPLAYABLE') return null

    var formats = response.streamingData.adaptiveFormats
    if (!formats) return null

    var audioFormat = formats.find(format => format.itag === 140)
    return audioFormat.url
}

app.get("/api/audios/:id", function(req, res) {
    request.get(`https://www.youtube.com/get_video_info?video_id=${req.params.id}`, {}, 
        function(err, innerRes, body) {
            if (/status=ok/.test(body)) {
                res.send({ url: getAudioURL(body) })
            } else {
                res.send({ url: null })
            }
        }
    )
})

var PORT = 4001
http.createServer(app).listen(PORT, function() {
    console.log(`Express server listening on port ${PORT}`)
})