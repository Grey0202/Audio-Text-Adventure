import * as tpd from "./templates.js"
import {outputObj} from "./playFunc.js"

var script = undefined
var storyMode = false
var APcombined = false
var speechToTextEnabled = false
var language = "en"

// class ScriptFunc {
//     title: string = tpd.emptyChapter;
//     constants: string[] = [];
//     variables: string[] = [];


// }

/**
 * 
 * @param {*} stage 
 * @param {*} unprocStory 
 * @param {*} player 
 * @param {*} vars 
 * @param {*} output 
 * @returns Return an modified outputObj, can just replace previous output.
 */
function displayCustom(stage, unprocStory, player, vars, output = new outputObj()) {

    // Debug
    // console.log("[DEBUG] story ::::: in displayCustom func")
    // console.log("stage\n", stage)
    // console.log("\n\n\ndefmsg\n", unprocStory)
    // console.log('\n\n\n\n\ndebug\n',stage,unprocStory)

    // var output = tpd.outputTemplate
    if (stage != undefined) {
        // unprocStory = stage.story
        unprocStory = unprocStory.replace(tpd.senderTemplate, "@" + player)
            .replace(tpd.titleTemplate, script.title)

        // Replace the variables
        // TODO: Revise this part to avoid wrong-extraction.
        Object.keys(vars).forEach(function (key) {
            unprocStory = unprocStory.replace("@" + key, vars[key])
        })
        Object.keys(script.constants).forEach(function (key) {
            unprocStory = unprocStory.replace("@" + key, script.constants[key])
        })

        output.title = stage.chapter;
        output.content.push(unprocStory);

        // output = output.replace(tpd.emptyChapter, stage.chapter)
        //     .replace(tpd.emptyStoryMsg, unprocStory)
    }
    return output
}


//! Chapter & Condition Match, should be only used at chapter part.
// "1.1" == "1.1"
// "2.2" == "2.*"
function chapterMatch(source, target) {
    // Source is the 
    if (source == undefined || source.trim() == "*") {
        return true
    } else if (source.indexOf(".*") != -1) {
        source = source.replace(".*", "").trim()
        var sourceNum = Number(source)
        var targetNum = Number(target)
        return (sourceNum - targetNum) * (sourceNum - targetNum) < 1
    } else {
        return source.trim() == target.trim()
    }
}

// Proceed the story according to the input.
/**
 * 
 * @param {*} stage 
 * @param {*} input user input, from text or voice
 * @param {*} chapter stirng, the chapter of the stage
 * @param {*} vars the variables array, every time call this function is using the variables keeped in the profile, which is permanent.
 * @returns  return a output object
 */
function proceed(stage, input, chapter, vars) {
    var defaults = script.defaults
    var dynamics = script.dynamics
    var variables = script.variables
    // 处理剧情选项/默认回复
    // Main function, deal with the options and default replies.
    var process = function (choice) {
        var ret = {
            chapter: chapter,
            output: {
                "title": tpd.emptyChapter,
                "content": [],
                "error": ""
            },
            variables: vars
        }
        // Play Rounds: rounds
        var roundsVar = "rounds"
        if (variables.indexOf(roundsVar) != -1) {
            vars[roundsVar] = vars[roundsVar] == undefined ? 0 : vars[roundsVar] + 1
            ret.variables = vars
        }
        // Caclulate the Dynamic Variables
        // 动态执行代码
        var evalEx = function (cmd, savechg = false) {
            var cmdLines = [];
            // This part include the variables initialization, it needs to go through all the variables.
            // TODO: Revise the variable declaration and save strategy.
            variables.forEach(element => {
                cmdLines.push(String("var " + element + " = " + JSON.stringify(ret.variables[element])))
            })
            // Constants caclulation.
            Object.keys(script.constants).forEach((key) => {
                cmdLines.push(String("var " + key + " = " + JSON.stringify(script.constants[key])))
            })
            cmdLines.push(cmd)
            var cmdCode = cmdLines.join(";\n")
            // console.log("\n[evalex begin]\n", cmdCode, "\n[evalex end]\n")

            // Hint: this eval will make variables change just in this scope, vars will not be changed.
            var evalRet = eval(cmdCode)
            console.log("[DEBUG] evalRet:\n",evalRet)

            // Save var changes to the var array.
            if (savechg) {
                variables.forEach(element => {
                    if (element != undefined && element != "") {
                        vars[element] = eval(element);
                    }
                })
            }
            return evalRet
        }
        // Execute the actions for the choice.
        // TODO: Standardize the code format.
        var execute = function (choice) {
            var varChanged = false
            // Actions and Parameters should match each other.
            console.log("\n\naction[deubg]::\n", choice)
            // Revised action yaml format, need to remove the if statement after all the scripts are updated.
            if (script.APcombined) {
                console.log("\n[INFO] APcombined Mode is on. \n")
                if (typeof choice.action[0] === "string") {
                    if (choice.action != "none") {
                        console.error("Unprocessed <string> action type")
                    }
                    else {
                        choice.action = []
                    }
                }
                if (choice.description != "") {
                    ret.output.content.push(choice.description)
                }
                // console.log("\n[debug] action :\n", choice.action)
                var actionArray = choice.action
                actionArray.forEach(element => {
                    var action = Object.keys(element)[0];
                    var param = Object.values(element)[0];
                    if (action == tpd.gotoAction) {
                        // Move forward to next chapter
                        ret.chapter = String(param)
                    } else if (action == tpd.gotoxAction) {
                        var chapterNext = evalEx(param)
                        ret.chapter = String(chapterNext)
                    } else if (action == tpd.noneAction) {
                        console.error(tpd.noneActionErr)
                    } else if (action == tpd.incrAction) {
                        // Increase the value of a variable only.
                        varChanged = true
                        vars[param] = vars[param] == undefined ? 1 : vars[param] + 1
                        ret.variables = vars
                    } else if (action == tpd.decrAction) {
                        // Decrease the value of the variable only.
                        varChanged = true
                        vars[param] = vars[param] == undefined ? 0 : vars[param] - 1
                        ret.variables = vars
                    } else if (action == tpd.calcAction) {
                        // Caculate the value of the variable only.
                        varChanged = true
                        // Try to find the param in the variables
                        var varName = ""
                        variables.forEach(element => {
                            if (param.indexOf(element) != -1) {
                                varName = element
                            }
                        })
                        if (varName != "") {
                            vars[varName] = evalEx(param)
                        }
                        ret.variables = vars
                    } else if (action == tpd.evalAction) {
                        // calculate the value of the variable and save the change.
                        varChanged = true
                        // save the change.
                        evalEx(param, true)
                        ret.variables = vars
                    } else if (action == tpd.resetAction) {
                        // Reset the value of the variable to default, jump to the first chapter.
                        ret.chapter = tpd.resetChapter
                        ret.variables = {}
                    } else {
                        // console.log("[Debug] choice action exception, action: ", action)
                        ret.output.error = tpd.gameTreeCrashErr
                    }

                });
                return varChanged
            }
            else {
                // TODO: To be remove after all the scripts are updated.
                var actionSet, paramSet
                if (typeof choice.action == "string") {
                    console.error(tpd.singleStringActionErr)
                } else if (typeof choice.action == "object" &&
                    choice.action instanceof Array == true) {
                    actionSet = choice.action
                    paramSet = choice.param
                } else {
                    console.log("choice action exception")
                    return varChanged
                }
                // Add output to the output list.
                if (choice.description != "") {
                    ret.output.push(choice.description)
                }
                // 执行
                actionSet.forEach((action, index) => {
                    if (action == "goto") {
                        // Move forward to next chapter
                        ret.chapter = String(paramSet[index])
                    } else if (action == "gotox") {
                        var chapterNext = evalEx(paramSet[index])
                        ret.chapter = String(chapterNext)
                    } else if (action == "none") {
                        // 章节不变
                    } else if (action == "incr") {
                        // 变量增加，章节不变
                        varChanged = true
                        vars[paramSet[index]] = vars[paramSet[index]] == undefined ? 1 : vars[paramSet[index]] + 1
                        ret.variables = vars
                    } else if (action == "decr") {
                        // 变量减少，章节不变
                        varChanged = true
                        vars[paramSet[index]] = vars[paramSet[index]] == undefined ? 0 : vars[paramSet[index]] - 1
                        ret.variables = vars
                    } else if (action == "calc") {
                        // 变量运算，章节不变
                        varChanged = true
                        // 要对哪个变量做运算
                        var varName = ""
                        variables.forEach(element => {
                            if (paramSet[index].indexOf(element) != -1) {
                                varName = element
                            }
                        })
                        if (varName != "") {
                            vars[varName] = evalEx(paramSet[index])
                        }
                        ret.variables = vars
                    } else if (action == "eval") {
                        // 变量运算，章节不变
                        varChanged = true
                        // 原地保存结果
                        evalEx(paramSet[index], true)
                        ret.variables = vars
                    } else if (action == "reset") {
                        // 重置章节到开头，清空变量环境
                        ret.chapter = "1.1"
                        ret.variables = {}
                    } else {
                        console.log("choice action exception")
                        ret.output.push(tpd.gameTreeCrashErr)
                    }
                })
                return varChanged
            }
        }
        // Execute choice
        execute(choice)
        // Match the dynamic variables
        // phase 0: check if the chapter matches
        var found = false
        if (dynamics != undefined) {
            dynamics.forEach((dynamic) => {
                if (chapterMatch(dynamic.conditions.chapter, ret.chapter)) {
                    found = true
                }
            })
        }
        else {
            console.warn(tpd.emptyDynamicsErr)
        }
        if (!found) {
            return ret
        }
        // phase 1: Check if fit the dynamic conditions
        var targetDynamic = -1
        dynamics.forEach((dynamic, i) => {
            var bool = evalEx(dynamic.conditions.expression)
            // Run the dynamic which matches the chapter first.
            if (bool && targetDynamic == -1) {
                targetDynamic = i
            }
        })
        if (targetDynamic == -1) {
            return ret
        }
        // Execute the dynamic
        // Warning: The dynamic could be re-run when incr,decr,calc is used, to make sure the result is correct,
        // but it could cause the infinite loop.
        // 注意: 执行 incr、decr、calc 这两种反过来又影响了变量的条件行为时，可以改写代码，来允许再次推导动态条件。但这可能引起死循环。
        execute(dynamics[targetDynamic])
        return ret
    }
    // Check choice key words to move forward.
    var target = -1
    loop1:
    for (var i = 0; stage != undefined && i < stage.choices.length; i++) {
        if (stage.choices[i].keywords.length == 0) {
            target = i
            break loop1
        }
        for (var j = 0; j < stage.choices[i].keywords.length; j++) {
            if (input.indexOf(stage.choices[i].keywords[j]) != -1) {
                target = i
                break loop1
            }
        }
    }
    // Check default Choices
    if (target == -1) {
        // Try to find default choice & reply
        loop2: for (var x = 0; x < defaults.length; x++) {
            if (chapterMatch(defaults[x].conditions.chapter, chapter)) {
                if (defaults[x].conditions.keywords.length == 0) {
                    target = x
                    break loop2
                }
                for (var y = 0; y < defaults[x].conditions.keywords.length; y++) {
                    if (input.indexOf(defaults[x].conditions.keywords[y]) != -1) {
                        target = x
                        break loop2
                    }
                }
            }
        }
        if (target == -1) {
            return {
                chapter: chapter,
                output: tpd.matchChapterErr,
                variables: vars
            }
        }
        return process(defaults[target])
    }
    // Process the choice
    else {
        // Execute the choice
        return process(stage.choices[target])
    }
}

// Main function.
export function play(input, profile, scriptObj) {
    // Initialize the game according to the script and profile.
    script = scriptObj
    // console.log("[DEBUG] Profile when loading:",profile)
    var chapter = profile.chapter
    var player = profile.player
    var vars = profile.variables
    APcombined = scriptObj.APcombined
    // console.log("Player:", player, "CurChapter:", chapter, "Input:", input)
    var chapterAfter = chapter
    // TODO, change to Json format output.
    var outputMap = new outputObj(tpd.emptyChapter,[],[],input)

    var stage = script.stages[chapter]
    var chapterStory = ""

    input = String(input).toLowerCase().trim()
    if (input == "") {
        // Show the Plot of Play
        chapterStory = (stage == undefined ? tpd.emptyStoryMsg : stage.story);
        outputMap = displayCustom(stage, chapterStory, player, vars, outputMap)
        // outputText.push(displayCustom(stage, chapterStory, player, vars))

    } else {
        // Process the input
        var result = proceed(stage, input, chapter, vars)
        // Handle the result
        chapterAfter = result.chapter
        vars = result.variables
        var stageToShow = result.chapter == chapter ? stage : script.stages[result.chapter]
        // Handle the output
        //! TDDO: Output should first include the desciption of the choice, then the story of the chapter.
        if (result.output.length > 0) {
            console.log("[IMPORTANT] Output: Using DisplayCustom 1")
            outputMap = displayCustom(stage, result.output.join('\n'), player, vars,outputMap);
        }
        if (result.output.length == 0 || result.chapter != chapter) {
            console.log("[IMPORTANT] Output: Using DisplayCustom 2")
            chapterStory = (stageToShow == undefined ? tpd.emptyStoryMsg : stageToShow.story);
            outputMap = displayCustom(stageToShow, chapterStory, player, vars, outputMap)
        }
    }
    outputMap.content.join('\n');
    return {
        chapter: chapterAfter,
        output: outputMap,
        variables: vars
    }
}

export default play 