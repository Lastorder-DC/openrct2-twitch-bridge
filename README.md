# English README

Send OpenRCT2 server chat to twitch, or vice versa.

## 🚀 Installation
1. Download the latest version of the plugin from the [Releases page](https://github.com/Lastorder-DC/openrct2-twitch-bridge/releases).

2. To install it, extract downloaded zip file, and put `lib/twitch-bridge.js` file into your `/OpenRCT2/plugin` folder.

    * Easiest way to find the OpenRCT2-folder is by launching the OpenRCT2 game, click and hold on the red toolbox in the main menu, and select "Open custom content folder".
    * Otherwise this folder is commonly found in `C:\Users\<YOUR NAME>\Documents\OpenRCT2\plugin` on Windows.
    * If you already had this plugin installed before, you can safely overwrite the old file.

3. Once the file is there, it should connect to chat bridge server when OpenRCT2 Multiplayer server is opened.

## 🔨 Building
You can use `npx tsc` command to build js file for plugin. You can also make binary file from source with `pkg ./index.js` command.

## ⚖️ Licence
This plugin is licensed under the MIT licence.

# Korean README

오픈롤코 채팅을 트위치로, 트위치 채팅을 오픈롤코로 상호 전달해주는 플러그인입니다.

## 사용법
1. `lib` 폴더 안 `twitch-bridge.js` 파일을 오픈롤코 플러그인 폴더에 넣습니다.
1. 브릿지 서버 실행을 위해 현재 저장소를 클론 혹은 다운로드받습니다. nodejs 및 npm이 필요합니다.
1. 클론/다운로드후 압축해제한 폴더 위치에서 `npm install`을 실행해 필수 라이브러리를 다운로드받습니다.
1. `config` 폴더 안 `config.example.json5` 파일을 `config.json5`로 변경합니다. 파일 내용을 참고해 적절히 채웁니다.(채널명에 `#`은 붙이지 않습니다)
1. `node index.js` 명령으로 브릿지 서버를 시작합니다. 이후 오픈롤코 서버를 열면 채팅이 자동 연동됩니다.

## 주의사항
1. 서버에서만 동작합니다. 클라이언트에서 실행시 아무 역할을 하지 않습니다. 이는 의도된 것입니다.
1. 모든 채팅 메세지는 서버 명의로 출력됩니다. 서버 사용자 이름을 변경해서 다른 이름으로 출력되게 할 수 있습니다.
