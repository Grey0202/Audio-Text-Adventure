import {loadScript} from './script_loader.js'
import * as save from './save_offline.js'
import {play} from './play.js'
import fs from 'fs'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import * as stt from "./ibmSTT.js"

const app = express()

// local variables
const path = "./scripts/"
const hostname = '127.0.0.1'
const port = 1890

var speechToTextEnabled = true

// Game handler part

function getGameOutput(body) {
	if (!body) {
		console.log("Error: no body")
		return "No Input"
	}
	// console.log("[debug] In getGameOutput Alter \n    body = " +body)
	return gameInputHandler((body.input).toString())
}

function gameInputHandler(input) {
	// output = ''
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

	// Return the output
	// console.log("[Debug] Finish Input Handler")
	return scene.output
}

function voiceInputHandler(body) {
	if (!body.file) {
		console.log("Error: no voice file")
		return "No Input"
	}
	else{
		var vfile = (body.file).toString()
		console.log("\nvoice file in:", vfile)
	}

	// TODO add file real address
	vfile = "./audio-file.flac"
	var voiceInput = stt.sop_test(vfile);
	// 可能会异步
	return voiceInput
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
	var scriptUse = "DragonRaja.yaml"
	// var scriptUse = "harrypotter.yaml"
	var script = loadScript(path+scriptUse)
	if (!script) {
		console.error("Failed to load script!")
	}
	else {
		console.log("Loaded script: " + scriptUse)
	}
	// else break
// }
var profileFileName = scriptUse + ".save"
var profile = save.loadFromDisk(path+profileFileName)

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

app.all('*', function(req, res, next) {
    // res.header("Access-Control-Allow-Origin", "*");
	console.log("Request received\n##",req.url,"\n\n",req.body)
    next();
});

app.post("/",function(req,res){
	// console.log(JSON.stringify(req.body));
    res.send({hello:'world'});
	next();
})

app.post("/audio",function(req,res){
	console.log(req.headers);
	res.header("Access-Control-Allow-Origin", "*")
	console.log("\nAudio route log body:",req.body);
	if(speechToTextEnabled){
		var gameOut = voiceInputHandler(req.body)
	}
    res.send(gameOut);
})

app.post("/game",function(req,res){
	app.use(bodyParser.json())
	console.log(req.headers);
	res.header("Access-Control-Allow-Origin", "*")
	console.log("\n log body:",req.body);
	var gameOut = getGameOutput(req.body)
    res.send(gameOut);
})

app.listen(port,() =>
	console.log(`Server running at http://${hostname}:${port}/`)
)