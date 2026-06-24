#!/bin/bash
set -e

echo "=== Instalando dependências de sistema (Ubuntu/Debian) ==="
sudo apt-get update -qq
sudo apt-get install -y --no-install-recommends \
  git \
  curl \
  build-essential \
  libssl-dev \
  libreadline-dev \
  zlib1g-dev \
  libyaml-dev \
  libffi-dev \
  libgdbm-dev \
  libncurses5-dev \
  libpq-dev \
  postgresql-client \
  libvips \
  libjemalloc2

echo "=== Configurando rbenv e ruby-build ==="
if [ ! -d "$HOME/.rbenv" ]; then
  git clone https://github.com/rbenv/rbenv.git "$HOME/.rbenv"
  echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> "$HOME/.bashrc"
  echo 'eval "$(rbenv init -)"' >> "$HOME/.bashrc"
fi

export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"

if [ ! -d "$HOME/.rbenv/plugins/ruby-build" ]; then
  mkdir -p "$HOME/.rbenv/plugins"
  git clone https://github.com/rbenv/ruby-build.git "$HOME/.rbenv/plugins/ruby-build"
fi

# Detecta a versão do Ruby no arquivo .ruby-version ou usa a 3.4.7 por padrão
RUBY_VERSION="3.4.7"
if [ -f .ruby-version ]; then
  RUBY_VERSION=$(cat .ruby-version | tr -d '[:space:]')
fi

echo "=== Instalando o Ruby $RUBY_VERSION ==="
if ! rbenv versions | grep -q "$RUBY_VERSION"; then
  rbenv install "$RUBY_VERSION"
fi

rbenv global "$RUBY_VERSION"
rbenv shell "$RUBY_VERSION"

echo "=== Instalando Bundler e Gems do Projeto ==="
gem update --system --no-document
gem install bundler --no-document

if [ -f Gemfile ]; then
  bundle install
fi

echo "=== Setup finalizado com sucesso! ==="
echo "Por favor, rode 'source ~/.bashrc' ou reinicie sua sessão SSH para aplicar as alterações."
