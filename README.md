# Shibuya
[![Lint code](https://github.com/SkywardAI/shibuya/actions/workflows/lint.yml/badge.svg)](https://github.com/SkywardAI/shibuya/actions/workflows/lint.yml)  
A project built Electron + React.js, to dig out the potential of cross platform AI completion.

## Development Build
__This project is managed by [pnpm](https://www.npmjs.com/package/pnpm), but you can still use the package manager you want.__

Run following commands to develop this project
```shell
pnpm install
pnpm start dev
```
> **Note:** This will open both electron and Vite server in one terminal, it can cause problems like cannot stop Vite server.  
> A better development strategy is here:

Open 2 terminals, and run 
```sh
pnpm run start
```
And
```sh
pnpm run electron
```
One on each terminal, so they won't conflict with each other.
## References
* [Wllama](https://github.com/ngxson/wllama)
* [Voy](https://github.com/tantaraio/voy)
