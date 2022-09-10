# Audio&Text-Adventure v0.5.0

## <font color=red size=5>ALERT: The update for this project is suspended and will resume update after the dissertation is submitted.</font>

## <font color=red size=5>ALERT: This is a work in progress! Not all features are implemented yet. Could contain serious bugs.</font>

## Description

To be finished...

## Features

### UpdatePlan (TODO List)

- [ ] Add music generate AI funciton. - Might be High priority.
- [ ] Add a script editor - Low Priority
- [ ] Revise script parse logic to allow more flexible script writing (use two differnet variables to caculate the result of a expression) - Low Priority
- [ ] Revise Load & Save game - Middle Priority
- [ ] Code clean up - Middle Priority
- [ ] Change to typescript project - Low Priority
- [ ] Chinese/English version - Low Priority
- [ ] Script selector - Middle Priority

### Current Features

- [x] Voice input
- [x] Using json return respones
- [x] Revise response and output stream, change to json type
- [x] Revise action-parameter map in yaml
- [x] Change yamljs to js-yaml
- [x] Add front-end page
<!-- - [ ]  -->

## How to play

This branch contains 2 different parts, which run in fact not individually.

### Setup

Download node.js LTS [here](https://nodejs.org/) and install it.

#### Backend Setup

In the backend, you can use the following commands to setup the project.

``` bash
npm install
node server.js
```

#### Frontend Setup

In A-T-GaMe folder, run `npm install` and `npm start` to start the frontend.

``` bash
npm install
npm start
```



## Special thanks

Thanks to @Chen-ttt for providing JavaScript support.

Thanks to @withSoundi for providing front-end design support.

Thanks to @YicongCao. This ATA project is inspired by [A markdown Game](https://github.com/YicongCao/MarkdownGame) and the game engine/script is based on his brilliant idea.
