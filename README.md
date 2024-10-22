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
There are some distribution files in releast page. Please download and run `Shibuya-vX.Y.Z.(AppImage|zip|exe)` according to your platform.  
Currently there's no `Code Signing` in our distributions, so your defender might block you from using the application. Please allow install to use the distributions.  
  
_**Sensitive informations are stored only at your own machine. No one can see them.**_
  
#### MacOS X (.zip)
Extract from dmg might say they are broked, it's because it's been blocked by the Gatekeeper. You can download the `.zip` file and extract `.app` from it, and run the `.app` file directly to give you chance bypassing the Gatekeeper.
#### Windows (.exe)
To install the application, Windows Defender SmartScreen might block you, please select **More info** and choose **Run anyway**.
#### Linux (.AppImage)
You can download and run the `.AppImage` file directly by double-clicking the binary on a linux desktop destribution.  
If you couldn't run it by double-click it, open a terminal and run following command to give it execute permission:  
```sh
chmod +x <application-name>.AppImage
```
If you want to continue run the app using terminal after applied execute permission, run following command:
```sh
/path/to/<application-name>.AppImage --no-sandbox
```
> Note: Remove the `--no-sandbox` flag might cause problem at startup, as chromium might not allow this to happen.
> 
## References
* [Wllama](https://github.com/ngxson/wllama)
* [node-llama-cpp](https://github.com/withcatai/node-llama-cpp)
