import { loadScript } from './script_loader.js'
import * as save from './save_offline.js'
import play from './play.js'
import fs from 'fs'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import * as sao from "./ibmSTT.js" // Sound Audio Oupter
import * as tpd from "./templates.js"
import { outputObj } from "./playFunc.js"

// var output  = new outputObj()
const app = express()
var script;
// local variables
const scriptPath = "./scripts/"
const hostname = "localhost"
const port = 1890
const speechToTextEnabled = true

var scriptList = []

// console.log("read",readDir)
function getScriptList(scriptPath) {
	return new Promise((resolve, reject) => {
		let scripts = []
		let readDir = fs.readdir(scriptPath, (err, files) => {
			if (err) {
				console.log("[Error]", err)
				reject(err)
			}
			else {
				files.forEach(file => {
					if (file.endsWith(".yaml")) {
						console.log("Script find :", file)
						scripts.push(file)
					}
				})
				if (scripts.length == 0) {
					reject("Failed to read script folder or No script in the folder!")
				}
				else {
					resolve(scripts)
				}
			}
		})
	})
};


var scriptList = getScriptList(scriptPath)
console.log(scriptList)

// var scriptName = "DragonRaja.yaml"
var scriptName = "harrypotter.yaml"
var APcombined = false

// Todo: return scriptList to front end
// while (true) {
// var scriptUse = "DragonRaja.yaml"

//
function tryLoadScript(scriptName) {
	console.log("[TryLoadScript] scriptName:", scriptName)
	return new Promise((resolve, reject) => {
		if (!scriptName) reject("No script")

		let result = loadScript(scriptPath + scriptName)
		if (!result) {
			console.error("Failed to load script!")
			reject("Failed to load script!")
		}
		else {
			console.log("Loaded script: " + scriptName)
			resolve(result)
			// return result
		}
	}).then((result) => { return result; })
		.catch((err) => { return err; })
}

//

// else break
// }
var script = await tryLoadScript(scriptName).then((result) => { return result; }).catch((err) => { return err; })
console.log("Script: " + script)
var profileFileName = scriptName + ".save"
var profile = save.loadFromDisk(scriptPath + profileFileName)
if (!profile) {
	console.log("[IMPORTANT] Created a new profile.")
} else {
	console.log("\n[IMPORTANT] Profile Loaded.", scriptPath + profileFileName, "\n")
}

// TODO: change default chapter
if (!profile) {
	profile = {
		player: tpd.defaultPlayerName,
		chapter: tpd.defaultChapter,
		variables: {},
		inputs: []
	}
	save.saveToDisk(scriptPath + profileFileName, profile)
}

// Both text and voice input handler
// Return a json object
function gameInputHandler(input) {
	// output = ''
	if (input == undefined) {
		console.error("[Error] No Body")
		return "No Input"
	}
	if (input == "exit" || input == "quit" || input == "退出") {
		return -1
	}

	console.log("\n[INFO] Input:", input);
	profile.inputs.push(input)
	save.saveToDisk(scriptPath + profileFileName, profile)

	// Call main function.
	scene = play(input, profile, script)

	// Save the scene
	profile.chapter = scene.chapter
	profile.variables = scene.variables
	save.saveToDisk(scriptPath + profileFileName, profile)

	// console.log("[Debug] Finish Input Handler")
	return scene.output.jsonFormat()
}

// TODO: move to stt file.
// Return the *Result or Err* from <gameInputHandler>
async function voiceInputHandler(speechStream) {

	return sao.parseAduioFile(speechStream).then(result => {
		// console.log("\n[debug]!!!!!!voice input: ", result)
		return (gameInputHandler(result))
	}).catch(err => { return err })

	// Currently it use the stream directly, but it can be changed to use the file.
	// if (!vfile) {
	// 	console.log("Error: No Voice File")
	// 	return "No File Input"
	// }
	// else {
	// 	console.log("\nVoice File In:", vfile)
	// }

	// [Debug] file
	// vfile = "./audio-file.flac"
}


var scene = play("", profile, script)

// Server Part
const jsonParser = bodyParser.json()
const rawParser = bodyParser.raw()
// app.use(bodyParser.json())
app.use(cors())

// app.options('/game', cors())
// app.options('/audio', cors())
// app.options('/changeScript', cors())

app.all('*', function (req, res, next) {
	// res.header("Access-Control-Allow-Origin", "*");
	console.log("Request received\n##", req.url)
	next();
});

app.post("/", function (req, res, next) {
	// console.log(JSON.stringify(req.body));
	res.send({ hello: 'world', good: 'morning' });
	next();
})

app.post("/audio", rawParser, function (req, res) {
	console.log(req.headers);
	res.header("Access-Control-Allow-Origin", "*")
	//Get blob from request
	var blob = req.body;
	// blob.Buffer = Buffer.from(blob)
	console.log("Buffer is", blob.Buffer)

	/** // DEBUG
	var tfileName = "./cttzstkal"
	var ws = fs.createWriteStream(tfileName)
	req.pipe(ws)
	*/
	if (speechToTextEnabled) {
		voiceInputHandler(req).
			then(result => {
				console.log("[DEBUG] Audio RES will be sent:\n", result);
				res.send(result);
			}).catch(err => {
				console.log("[DEBUG] Audio ERR will be sent:\n", err);
				res.send(err)
			})
	}
	else {
		return res.send("Speech to text is disabled")
	}
})

// app.get("/game", jsonParser, function (req, res) {
// 	console.log("[DEBUG] Reqest Header:\n", req.headers);
// 	res.header("Access-Control-Allow-Origin", "*")
// 	console.log("\n[DEBUG] log body:\n", req.body);
// 	// var gameOut = gameInputHandler(req.body.input)
// 	// res.send(gameOut);
// })

app.post("/game", jsonParser, function (req, res) {
	// console.log("[DEBUG] Reqest Header:\n", req.headers);
	res.header("Access-Control-Allow-Origin", "*")
	console.log("\n[DEBUG] log body:\n", req.body);
	var gameOut = gameInputHandler(req.body.input)
	res.send(gameOut);
})

app.post("/changeScript", jsonParser, function (req, res) {
	// res.header("Access-Control-Allow-Origin", "*")
	// console.log("\n[DEBUG] log body:\n", req.body);
	// var scrirptName = req.body.scriptname
	// script = tryLoadScript(scrirptName+".yaml")
	// var gameOut = gameInputHandler("")

	res.send("");

})

app.listen(port, () =>
	console.log(`Server running at http://${hostname}:${port}/`)
)