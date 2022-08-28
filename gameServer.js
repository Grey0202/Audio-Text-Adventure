import { loadScript } from './script_loader.js'
import * as save from './save_offline.js'
import { play } from './play.js'
import fs from 'fs'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import * as sao from "./ibmSTT.js"
import * as tpd from "./templatePreDefines.js"
import { tmpdir } from 'os'

const app = express()

// local variables
const scriptPath = "./scripts/"
const hostname = '127.0.0.1'
const port = 1890
const speechToTextEnabled = true

// Both text and voice input handler
function gameInputHandler(input) {
	// output = ''
	if (!input) {
		console.log("Error: no body")
		return "No Input"
	}
	if (input == "exit" || input == "quit" || input == "退出") {
		return -1
	}
	// Call main function.
	profile.inputs.push(input)
	save.saveToDisk(profileFileName, profile)
	scene = play(input, profile, script)
	// Save the scene
	profile.chapter = scene.chapter
	profile.variables = scene.variables
	save.saveToDisk(profileFileName, profile)

	// console.log("[Debug] Finish Input Handler")
	return scene.output
}

// TODO: move to stt file.
async function voiceInputHandler(vfile) {
	if (!vfile) {
		console.log("Error: No Voice File")
		return "No File Input"
	}
	else {
		console.log("\nVoice File In:", vfile)
	}

	// TODO: change to file real address
	vfile = "./audio-file.flac"

	return sao.parseAduioFile(vfile).then(result => {
		// console.log("\n[debug]!!!!!!voice input: ", result)
		return (gameInputHandler(result))
	}).catch(err => { return err })
}

var scriptList = []
var readDir = fs.readdirSync(scriptPath);
for (var i in readDir) {
	if (readDir[i].endsWith(".yaml")) {
		console.log(readDir[i])
		scriptList.push(readDir[i])
	}
}

// Todo: return scriptList to front end
// while (true) {
// var scriptUse = "DragonRaja.yaml"
var scriptUse = "harrypotter.yaml"
var script = loadScript(scriptPath + scriptUse)
if (!script) {
	console.error("Failed to load script!")
}
else {
	console.log("Loaded script: " + scriptUse)
}
// else break
// }
var profileFileName = scriptUse + ".save"
var profile = save.loadFromDisk(scriptPath + profileFileName)

// TODO: change default chapter
if (!profile) {
	profile = {
		player: tpd.defaultPlayerName,
		chapter: tpd.defaultChapter,
		variables: {},
		inputs: []
	}
	save.saveToDisk(profileFileName, profile)
}


var scene = play("", profile, script)

// Server Part
app.use(bodyParser.json())
app.use(cors())

app.options('/game', cors())

app.all('*', function (req, res, next) {
	// res.header("Access-Control-Allow-Origin", "*");
	console.log("Request received\n##", req.url, "\n\n", req.body)
	next();
});

app.post("/", function (req, res) {
	// console.log(JSON.stringify(req.body));
	res.send({ hello: 'world' });
	next();
})

app.post("/audio", function (req, res) {
	console.log(req.headers);
	res.header("Access-Control-Allow-Origin", "*")
	console.log("\nAudio route log body:", req.body);
	if (speechToTextEnabled) {
		voiceInputHandler(req.body.file).
			then(result => {
				console.log("[DEBUG] Audio RES will be sent:\n", result);
				res.send(result)
			}).catch(err => {
				console.log("[DEBUG] Audio ERR will be sent:\n", err);
				res.send(err)
			})
	}
	else {
		return res.send("Speech to text is disabled")
	}
})

app.post("/game", function (req, res) {
	app.use(bodyParser.json())
	// console.log("[DEBUG] Reqest Header:\n", req.headers);
	res.header("Access-Control-Allow-Origin", "*")
	// console.log("\n[DEBUG] log body:\n", req.body);
	var gameOut = gameInputHandler(req.body.input)
	res.send(gameOut);
})

app.listen(port, () =>
	console.log(`Server running at http://${hostname}:${port}/`)
)