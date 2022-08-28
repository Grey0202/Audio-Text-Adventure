//！ This file contains pre-defined templates for the game engine.

/// Comment for set emptySetting as default value.
// const chapterNamePositon = `[chapterNamePositon]`
// const storyPositon = `[storyPostion]`
export const senderTemplate = '@sender';
export const titleTemplate = '@title';
export const resetChapter = "1.1" // Also the beginning of the story.

export const emptyChapter = "Unknown Chapter";
export const emptyChapter_CN = "未知章节";
export const emptyStoryMsg = 'No story content in this section';
export const outputTemplate = `#### ${emptyChapter}\n\n${emptyStoryMsg}\n`;
export const matchChapterErr = "No match stage/chapter, please check the game tree."
export const gameTreeCrashErr = "Game tree crashed because of unexpect wrong chapter setting."
export const noneActionErr = "Unprocessed [none] action type"
export const singleStringActionErr = "Unprocessed [string] action type"
export const emptyDynamicsErr = "Dynamics is undefined/emtpy!"
export const gotoAction = "goto"
export const resetAction = "reset"
export const evalAction = "eval"
export const calcAction = "calc"
export const decrAction = "decr"
export const incrAction = "incr"
export const noneAction = "none"
export const gotoxAction = "gotox"



