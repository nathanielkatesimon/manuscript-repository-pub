## Setup Ubuntu
```bash
sudo apt update
sudo apt upgrade
```

## Install Node
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
nvm install --lts
```

## Install Ruby
```bash
sudo apt install build-essential autoconf libssl-dev libyaml-dev zlib1g-dev libffi-dev libgmp-dev rustc
sudo apt install postgresql libpq-dev
sudo add-apt-repository -y ppa:jdxcode/mise
sudo apt update -y
sudo apt install -y mise
mise use -g ruby@3.4.8
```


## Run backend
```bash
cd backend
bundle install
rails db:create
rails db:migrate
rails s -p 5000
```

## Run frontend
```bash
cd frontend
npm install
npm run dev
```
