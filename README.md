TemzinBot
=========

mineflayerを利用した適当bot


## Features

  - I'M BOT!
  - Modulized functions
    - move to the designated position
    - follow player
    - greeting responce
    - 3sec countdown
    - data recorder
  - Commandline interface
  - Dockerize support

## Installation

    $ git clone https://github.com/fubira/TemzinBot
    $ cd TemzinBot
    $ npm install

## Environment

.env.sample をコピーして .env を作成し、環境に合わせて内容を書き換えてください。

```
MC_HOST="localhost"
MC_PORT="25565"
MC_USERNAME="user@foo.bar"
MC_PASSWORD="password"
```

## Usage

    $ npm start


## Dockerize

### Build docker image

```bash
docker build -t <yourname>/temzinbot .
```

### Run docker container

```bash
docker run -d -it \
  -e MC_HOST=localhost \
  -e MC_PORT=25565 \
  -e MC_USERNAME=username \
  -e MC_PASSWORD=password \
  --name temzinbot \
  <yourname>/temzinbot
```

### Open-AI Chat Bot

OpenAI API Keyを指定することで、BOTによるAIチャットを実行できます。
"AI [質問文]" と話しかけると、BOTが質問文に対する回答を発言します。

環境変数 OPENAI_API_KEY にAPI Keyの値を設定し、
temzinbot/modules/module-chat-openaiを有効にしてBOTを起動してください。

## License

[MIT](https://github.com/fubira/TemzinBot/blob/master/LICENSE,md)

## Author

[fubira](https://github.com/fubira)
