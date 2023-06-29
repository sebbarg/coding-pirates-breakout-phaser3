# Coding Pirates Breakout example

Phaser3 port of [Phaser2 Breakout tutorial](https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_breakout_game_Phaser)

- [Typescript](https://www.typescriptlang.org/)
- [Phaser3](https://phaser.io/)

## Requirements

- node.js (https://nodejs.org)
- optionally yarn (`npm install -g yarn`)

## Available Commands

| Command        | Description                                              |
| -------------- | -------------------------------------------------------- |
| `yarn install` | Install project dependencies                             |
| `yarn dev`     | Builds project and open web server, watching for changes |
| `yarn build`   | Builds code bundle with production settings              |
| `yarn serve`   | Run a web server to serve built code bundle              |

## Development

After cloning the repo, run `yarn install` from your project directory. Then, you can start the local development
server by running `yarn dev` and navigate to http://localhost:3000.

## Production

After running `yarn build`, the files you need for production will be on the `dist` folder. To test code on your `dist` folder, run `yarn serve` and navigate to http://localhost:5000
