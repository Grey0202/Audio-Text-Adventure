import { loadScript } from './script_loader.js'
import * as save from './save_offline.js'
import { play } from './play.js'
import fs from 'fs'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import * as sao from "./ibmSTT.js"

const app = express()

// local variables
const path = "./scripts/"
const hostname = '127.0.0.1'
const port = 1890

var speechToTextEnabled = true

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
async function voiceInputHandler(body) {
	if (!body.file) {
		console.log("Error: no voice file")
		return "No Input"
	}
	else {
		var vfile = (body.file).toString()
		console.log("\nvoice file in:", vfile)
	}

	// TODO add file real address
	vfile = "./audio-file.flac"

	var voiceInput = await sao.parseAduioFile(vfile);
	console.log("\n[debug]!!!!!!voice input:", voiceInput)
	return new Promise((resolve, reject) => {
		if (typeof voiceInput == "string") {
			resolve(gameInputHandler(voiceInput))
		}
		else {
			reject("error")
		}
	}).then(result => { return result })
		.catch(err => { return err })
	// return gameInputHandler(voiceInput);
}

var scriptList = []
var readDir = fs.readdirSync(path);
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
var script = loadScript(path + scriptUse)
if (!script) {
	console.error("Failed to load script!")
}
else {
	console.log("Loaded script: " + scriptUse)
}
// else break
// }
var profileFileName = scriptUse + ".save"
var profile = save.loadFromDisk(path + profileFileName)

if (!profile) {
	profile = {
		player: "player",
		chapter: "1.1",
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
		voiceInputHandler(req.body).
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