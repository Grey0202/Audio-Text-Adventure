import * as tpd from "./templatePreDefines.js"

var script = undefined
var storyMode = false

function displayCustom(stage, unprocStory, player, vars) {

    // Debug
    // console.log("[DEBUG] story ::::: in displayCustom func")
    // console.log("stage\n", stage)
    // console.log("\n\n\ndefmsg\n", unprocStory)
    // console.log('\n\n\n\n\ndebug\n',stage,unprocStory)
    var output = tpd.outputTemplate

    if (stage!=undefined) {
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

        output = output.replace(tpd.emptyChapter, stage.chapter)
                        .replace(tpd.emptyStoryMsg, unprocStory)
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

// 根据输入推进剧情
function proceed(stage, input, chapter, vars) {
    var defaults = script.defaults
    var dynamics = script.dynamics
    var variables = script.variables
    input = String(input).toLowerCase()
    // 处理剧情选项/默认回复
    var process = function (choice) {
        var ret = {
            chapter: chapter,
            output: [],
            variables: vars
        }
        // Play Rounds: rounds
        var roundsVar = "rounds"
        if (variables.indexOf(roundsVar) != -1) {
            vars[roundsVar] = vars[roundsVar] == undefined ? 0 : vars[roundsVar] + 1
            ret.variables = vars
        }
        // 动态执行代码
        var evalEx = function (cmd, savechg = false) {
            var cmdLines = []
            // 因为需要初始化所有变量，所以要遍历整个变量声明列表
            variables.forEach(element => {
                cmdLines.push("var " + element + " = " + JSON.stringify(ret.variables[element]))
            })
            // 常量
            Object.keys(script.constants).forEach((key) => {
                cmdLines.push("var " + key + " = " + JSON.stringify(script.constants[key]))
            })
            cmdLines.push(cmd)
            var cmdCode = cmdLines.join(";\n")
            // console.log("\n[evalex begin]\n", cmdCode, "\n[evalex end]\n")
            var evalRet = eval(cmdCode)
            // 原地保存修改
            if (savechg) {
                variables.forEach(element => {
                    if (element != undefined && element != "") {
                        vars[element] = eval(element)
                    }
                })
            }
            return evalRet
        }
        // Execute the actions for the choice.
        var execute = function (choice) {
            var varChanged = false
            // action 可以是 list(一组动作)、string(单个动作)
            // param 的类型和长度要和 action 保持一致
            var actionSet, paramSet
            if (typeof choice.action == "string") {
                console.error("Unprocessed [string] action type")
            } else if (typeof choice.action == "object" &&
                choice.action instanceof Array == true) {
                actionSet = choice.action
                paramSet = choice.param
            } else {
                console.log("choice action exception")
                return varChanged
            }
            // 处理输出
            if (choice.description != "") {
                ret.output.push(choice.description)
            }
            // 执行
            actionSet.forEach((action, index) => {
                if (action == "goto") {
                    // 章节推进
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
                    ret.output.push("行为配置异常，游戏树崩塌")
                }
            })
            return varChanged
        }
        // 执行选项
        execute(choice)
        // 匹配动态条件
        // phase 0: 检查章节条件
        var found = false
        dynamics.forEach((dynamic) => {
            if (chapterMatch(dynamic.conditions.chapter, ret.chapter)) {
                found = true
            }
        })
        if (!found) {
            return ret
        }
        // phase 1: 检查动态条件
        var targetDynamic = -1
        dynamics.forEach((dynamic, i) => {
            var bool = evalEx(dynamic.conditions.expression)
            // 确保最后选中最先匹配到的条件
            if (bool && targetDynamic == -1) {
                targetDynamic = i
            }
        })
        if (targetDynamic == -1) {
            return ret
        }
        // 执行动态条件
        // 注意: 执行 incr、decr、calc 这两种反过来又影响了变量的条件行为时，可以改写代码，来允许再次推导动态条件。但这可能引起死循环。
        execute(dynamics[targetDynamic])
        return ret
    }
    // 查找剧情选项
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
    // 处理章节选项
    else {
        // 执行选择
        return process(stage.choices[target])
    }
}

// Main function.
function play(input, profile, scriptObj) {
    script = scriptObj
    var chapter = profile.chapter
    var player = profile.player
    var vars = profile.variables
    // console.log("玩家:", player, "当前章节:", chapter, "输入:", input)
    var chapterAfter = chapter
    var outputText = []
    var stage = script.stages[chapter]
    var chapterStory = ""
    if (String(input).trim() == "") {
        // Show the Plot of Play
        chapterStory = (stage == undefined ? tpd.emptyStoryMsg : stage.story);
        outputText.push(displayCustom(stage,chapterStory, player, vars))

    } else {
        // Process the input
        var result = proceed(stage, input, chapter, vars)
        // Handle the result
        chapterAfter = result.chapter
        vars = result.variables
        var stageToShow = result.chapter == chapter?stage:script.stages[result.chapter]
        // Handle the output
        if (result.output.length > 0) {
            outputText.push(displayCustom(stage, result.output.join('\n'), player, vars))
        } 
        if (result.output.length == 0 || result.chapter != chapter) {
            chapterStory = (stageToShow == undefined ? tpd.emptyStoryMsg : stageToShow.story);
            outputText.push(displayCustom(stageToShow,chapterStory, player, vars))
        }
    }

    return {
        chapter: chapterAfter,
        output: outputText.join('\n'),
        variables: vars
    }
}

export {play}