import SpeechToTextV1 from 'ibm-watson/speech-to-text/v1.js';
import * as auth from 'ibm-watson/auth/index.js';
import fs from 'fs';

export function sop_test(Speechfile) {
    const speechToText = new SpeechToTextV1({
    authenticator: new auth.IamAuthenticator({
        apikey: 'BqQcCo2DY8qqw4DWcy7EW2u6HqqLNNWN-x88-HRU10um',
    }),
    serviceUrl: 'https://api.au-syd.speech-to-text.watson.cloud.ibm.com/instances/3bf695c6-87fc-4be7-94a9-9124d482dc7e',
    disableSslVerification: true,
    });


    // speechToText.method(params)
    //   .catch(err => {
    //     console.log('error:', err);
    //   });

    const params = {
        objectMode: true,
        contentType: 'audio/flac',
        model: 'en-US_BroadbandModel',
        keywords: ['colorado', 'tornado', 'tornadoes'],
        keywordsThreshold: 0.5,
        maxAlternatives: 3,
    };

    // Create the stream.
    const recognizeStream = speechToText.recognizeUsingWebSocket(params);

    // Pipe in the audio.
    fs.createReadStream(Speechfile).pipe(recognizeStream);

    recognizeStream.on('data', function(event) { onEvent('Data:', event); });
    recognizeStream.on('error', function(event) { onEvent('Error:', event); });
    recognizeStream.on('close', function(event) { onEvent('Close:', event); });

    // Display events on the console.
    function onEvent(name, event) {
        console.log(name, JSON.stringify(event, null, 2));
    };
}