#!/usr/bin/env sh

# abort on errors
set -e

# build
cd docs
yarn install
yarn run build

# navigate into the build output directory
cd .vuepress/dist

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

git push -f git@github.com:alibaba/lightproxy.git master:gh-pages

cd -
