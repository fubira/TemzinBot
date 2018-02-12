TemzinBot
=========

mineflayerを利用した適当bot


## Features

  - I'M BOT!
  - commandline interface

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

## License

[MIT](https://github.com/fubira/TemzinBot/blob/master/LICENSE,md)

## Author

[fubira](https://github.com/fubira)
