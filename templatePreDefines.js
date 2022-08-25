//！ This file contains pre-defined templates for the game engine.

// export namespace OutputTemplate {}

// Comment for set emptySetting as default value.
// const chapterNamePositon = `[chapterNamePositon]`
// const storyPositon = `[storyPostion]`
const senderTemplate = '@sender';
const titleTemplate = '@title';

const emptyChapter = "Unknown Chapter";
const emptyChapter_CN = "未知章节";
const emptyStoryMsg = 'No story content in this section';
const outputTemplate = `#### ${emptyChapter}\n\n${emptyStoryMsg}\n`;
const matchChapterErr = "No match stage/chapter, please check the game tree."
const gotoAction = "goto"

// console.log(outputTemplate) // debug

export {senderTemplate, titleTemplate, emptyChapter, emptyChapter_CN, emptyStoryMsg, outputTemplate, matchChapterErr, gotoAction};

