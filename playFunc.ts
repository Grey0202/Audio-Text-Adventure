import tpd from './templates';

export class outputObj{
    title: string = tpd.emptyChapter;
    content: string[];
    error: string[];

    /** 
     * This function is used to replace whole output object with new one
     * @param outputAdd Replace whole output object with this one
     */
    update(outputAdd: outputObj){
        if (outputAdd.title) this.title = outputAdd.title;
        if (outputAdd.content) this.content = outputAdd.content;
        if (outputAdd.error) this.error = outputAdd.error;
    }
    
    addToContent(content: string|string[]){
        if (typeof content == 'string' && content != tpd.emptyStoryMsg) {
            this.content.push(content);
        }
        else if (typeof content == 'object') {
            content.forEach(function(item){
                if (item != tpd.emptyStoryMsg) this.content.push(item);
            });
        }
    }

    addToErr(error: string){
        this.error.push(error);
    }

    updateTitle(title: string){
        if (title != tpd.emptyChapter) this.title = title;
    }

    /**
     * This function converts output object to json format for sending
     * @returns 
     */
    jsonFormat(){
        if (this.error.length == 0) return JSON.stringify(this);

        // @diabled currently for front-end can't handle error now.
        // TODO: enable this when front-end can handle error
        // else return JSON.stringify({error:this.error});
        else return JSON.stringify(this.error);
    }
    
    /**
     * Note: this function is not working currently
     * @returns 
     */
    checkForSend(){
        this.content.forEach(element => {
            if (element == tpd.emptyStoryMsg) return false; 
        });
        // return this
    }

    constructor(title: string, content: string[], error: string[]){
        this.title = title;
        this.content = content;
        this.error = error;
    }
}

var out = new outputObj(tpd.emptyChapter, [tpd.emptyStoryMsg], ["abd"]);

console.log(out.jsonFormat());