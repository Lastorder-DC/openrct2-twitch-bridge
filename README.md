## openrct2-twitch-bridge

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


## English howto
1. Download latest zip file from release
1. copy `twitch-bridge.js` to OpenRCT's plugin folder
1. rename `config.example.json5` to`config.json5` and edit empty vars(see comments for detail)
1. execute bridge executable
1. execute OpenRCT2 and open server(or use headless mode)
