# Shibuya
[![Lint code](https://github.com/SkywardAI/shibuya/actions/workflows/lint.yml/badge.svg)](https://github.com/SkywardAI/shibuya/actions/workflows/lint.yml) [![Release Distribution](https://github.com/SkywardAI/shibuya/actions/workflows/distribution.yml/badge.svg)](https://github.com/SkywardAI/shibuya/actions/workflows/distribution.yml)  
A project built Electron + React.js, to dig out the potential of cross platform AI completion.

https://github.com/user-attachments/assets/4cd16c88-25b6-4027-a5f4-5d67ef6458ef

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

## Distributions
There are some distribution files in releast page. Please download and run `SkywardaiChat-vX.Y.Z.(AppImage|dmg|-mac.zip|exe)` according to your platform.  
Currently there's no `Code Signing` in our distributions, so your defender might block you from using the application. Please allow install to use the distributions.  
#### Mac
Extract from dmg might say they are broked, it's because it's been blocked by the Gatekeeper. You can download the `-mac.zip` file and extract `.app` from it, and run the `.app` file directly to give you chance bypassing the Gatekeeper.
#### Windows
To install the application, Windows Defender SmartScreen might block you, please select **More info** and choose **Run anyway**.
#### Linux
You can run the `.AppImage` file directly, but you might want to give it execute permissions and disable sanbox to run it normally.
```sh
# Assume we have the application <application-name>.AppImage
chmod +x <application-name>.AppImage
<application-name>.AppImage --no-sandbox
```

> Sensitive informations are stored only at your own machine. No one can see them.

## References
* [Wllama](https://github.com/ngxson/wllama)
* [node-llama-cpp](https://github.com/withcatai/node-llama-cpp)
