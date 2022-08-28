import SpeechToTextV1 from 'ibm-watson/speech-to-text/v1.js';
import * as auth from 'ibm-watson/auth/index.js';
import fs from 'fs';
import * as config from './config.js';
import * as tpd from './templatePreDefines.js';


export function parseAduioFile(Speechfile, language = 'en') {
    const speechToText = new SpeechToTextV1({
        authenticator: new auth.IamAuthenticator({
            apikey: config.apikey,
        }),
        serviceUrl: 'https://api.au-syd.speech-to-text.watson.cloud.ibm.com/instances/3bf695c6-87fc-4be7-94a9-9124d482dc7e',
        disableSslVerification: true,
    });

    console.log("\n[Debug]Speechfile: ", Speechfile);
    const params = {
        objectMode: true,
        // TDOO: change content type
        contentType: 'audio/flac',
        model: language == "en" ? tpd.ibmSttEnglishModel : tpd.ibmSttChineseModel,
        // keywords: ['colorado', 'tornado', 'tornadoes'],
        // keywordsThreshold: 0.5,
        maxAlternatives: 3,
    };

    // Create the stream.
    console.log("\n[Debug]start pipe");
    const recognizeStream = speechToText.recognizeUsingWebSocket(params);

    // Pipe in the audio.
    fs.createReadStream(Speechfile).pipe(recognizeStream);
    console.log("\n[Debug]pip end");

    return new Promise((resolve, reject) => {
        recognizeStream.on('data', function (event) { onDataEvent('Data:', event); });
        recognizeStream.on('error', function (event) { onCEEvent('Error:', event); });
        recognizeStream.on('close', function (event) { onCEEvent('Close:', event); });
        // when any recognizeStream event is triggered, return the result
        function onCEEvent(name, event) {
            console.log("onCEEvent:");
            console.log(name, JSON.stringify(event, null, 2));
            reject("Something wrong, please try again or check the console log for more details.")
        };
        function onDataEvent(name, event) {
            let result = ""
            console.log("Aduio is in processing: onDataEvent");
            if (event.results) {
                // console.log(resJson)
                var alternatives = event.results[0].alternatives;
                // combine all the alternatives
                for (var i = 0; i < alternatives.length; i++) {
                    result += alternatives[i].transcript;
                }
            }
            // console.log("\n[Debug]alternatives: ", result);
            resolve(result);
        }
    }).then(result => {
        // console.log("\n[Debug]result: ", result);
        return result;
    }).catch(err => {
        // console.log("\n[Debug]err: ", err);
        return err;
    });
}
