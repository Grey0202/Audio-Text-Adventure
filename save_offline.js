import * as fs from 'fs';
import YAML from 'yamljs';
import * as path from 'path';

function loadFromDisk(fileName) {
    var filename = path.join(path.resolve('./'), fileName)
    if (!fs.existsSync(filename)) {
        return undefined
    }
    var sve = YAML.parse(fs.readFileSync(filename).toString())
    return sve
}

function saveToDisk(fileName, progress) {
    // console.log("[DEBUG] saving to:", fileName)
    fs.writeFileSync(path.join(path.resolve('./'), fileName), YAML.stringify(progress))
}

export {loadFromDisk, saveToDisk}