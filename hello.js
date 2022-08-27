// const { NONAME } = require('dns')
import * as http from 'http'
import {loadScript} from './script_loader.js'
import * as save from './save_offline.js'
import {play} from './play.js'
import * as fs from 'fs'

// local variables
const path = "./scripts/"
const hostname = '127.0.0.1'
const port = 1890

const gameData = {
	"chapter": "",
	"output": "",
}
function getGameOutput(body) {
	if (!body) {
		console.log("Error: no body")
		return "No Input"
	}
	console.log("body = " +body)
	body = JSON.parse(body);

	return gameInputHandler(body.input)
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
	console.log("Finish Input Handler")
	return scene.output
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
// 继续游戏
var scene = play("", profile, script)


// startServer()
// function startServer() {
const server = http.createServer((req, res) => {
	const { headers, method, url } = req;
	let body = '';
	res.statusCode = 200
	req.on('error', (err) => {
		console.error(err);
	})
	req.on('data', (chunk) => {
		console.log("chunk = ",chunk)
		body += chunk.toString();
		switch (method) {
			case 'GET':
				res.write('Please use POST method')
				break
			case 'POST':
				switch (url) {
					case '/game':
						console.log("喵喵喵?")
						res.write(getGameOutput(body))
						res.end()
						console.log("喵喵喵!")
						break
					default:
						res.write('Please use /game')
						break
				}
				break
			default:
				res.write('Please use POST method')
				break
		}
	})
	req.on('end', () => {
	})




	// res.setHeader('Content-Type', 'text/plain')

})

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`)
})
// }
