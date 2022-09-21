
import * as tpd from "./templates.js";

export function outputObj(title, content, error, input) {
    this.title = title;
    this.content = content;
    this.error = error;
    this.input = input;
}
/**
 * This function is used to replace whole output object with new one
 * @param outputAdd Replace whole output object with this one
 */
outputObj.prototype.update = function (outputAdd) {
    if (outputAdd.title)
        this.title = outputAdd.title;
    if (outputAdd.content)
        this.content = outputAdd.content;
    if (outputAdd.error)
        this.error = outputAdd.error;
};
outputObj.prototype.addToContent = function (content) {
    if (typeof content == 'string' && content != tpd.emptyStoryMsg) {
        this.content.push(content);
    }
    else if (typeof content == 'object') {
        content.forEach(function (item) {
            if (item != tpd.emptyStoryMsg)
                this.content.push(item);
        });
    }
};
outputObj.prototype.addToErr = function (error) {
    this.error.push(error);
};
outputObj.prototype.setInput = function (input) {
    this.input = input;
};
outputObj.prototype.updateTitle = function (title) {
    if (title != tpd.emptyChapter)
        this.title = title;
};
/**
 * This function converts output object to json format for sending
 * @returns
 */
outputObj.prototype.jsonFormat = function () {
    if (this.error.length == 0){
        this.content = this.content.join("\n");
        return JSON.stringify(this,null,4);
    }
    // @diabled currently for front-end can't handle error now.
    // TODO: enable this when front-end can handle error
    // else return JSON.stringify({error:this.error});
    else{
        return JSON.stringify({content:this.error});
    }
        
};
outputObj.prototype.checkForSend = function () {
    this.content.forEach(function (element) {
        if (element == tpd.emptyStoryMsg)
            return false;
    });
    return this;
};


// var out = new outputObj(tpd.emptyChapter, [tpd.emptyStoryMsg], ["abd"]);
// out.checkForSend();
// console.log(out.jsonFormat());
