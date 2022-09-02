import * as fs from 'fs';
import yaml from 'js-yaml';
import * as path from 'path';

function loadFromDisk(fileName) {
    var filename = path.join(path.resolve('./'), fileName)
    if (!fs.existsSync(filename)) {
        return undefined
    }
    var sve = yaml.load(fs.readFileSync(filename).toString())
    return sve
}

function saveToDisk(fileName, progress) {
    // console.log("[DEBUG] saving to:", fileName)
    fs.writeFileSync(path.join(path.resolve('./'), fileName), yaml.dump(progress))
}

export {loadFromDisk, saveToDisk}