TemzinBot
=========

mineflayerを利用した適当bot


## Features

  - I'M BOT!
  - Modulized functions
  - Commandline chat interface
  - OpenAI (gpt-3.5) support
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

TemzinBotはOpenAIによるAIチャットBot機能をもちます。
以下の環境変数によりOpenAIに関する情報を設定してください。
設定したキーワードが先頭にある質問文に対して、Botが回答するようになります。

```
OPENAI_ASK_KEYWORD="ai"
OPENAI_API_KEY="<Your OpenAI API Key>"
OPENAI_SYSTEM_ROLE_CONTENT="あなたはtemzinという名前のアシスタントAIです。"
OPENAI_USER_ROLE_CONTENT_PREFIX=""
OPENAI_USER_ROLE_CONTENT_POSTFIX="100～200文字程度にまとめて回答してください。 "
```

上記の設定の場合、`ai 自己紹介して` と問いかけることでAIが自己紹介をします。

## License

[MIT](https://github.com/fubira/TemzinBot/blob/master/LICENSE,md)

## Author

[fubira](https://github.com/fubira)
