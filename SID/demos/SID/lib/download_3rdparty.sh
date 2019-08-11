#!/usr/bin/env bash

set -e

rm -r 3rdparty/
mkdir 3rdparty

cd 3rdparty/
touch index.html

############## base ##############
mkdir base
cd base
touch index.html

wget https://code.jquery.com/jquery-3.2.1.js -O jquery.js
wget https://code.jquery.com/jquery-3.2.1.min.js -O jquery.min.js

wget https://raw.githubusercontent.com/component/emitter/master/index.js -O emitter.js

cat jquery.js emitter.js > ../base.js
cat jquery.min.js emitter.js > ../base.min.js

cd ..

############## babylon ##############
mkdir babylon
cd babylon
touch index.html

wget http://cdn.babylonjs.com/babylon.max.js
wget http://cdn.babylonjs.com/babylon.js

# babylon gui (replaces canvas2d)
wget http://cdn.babylonjs.com/gui/babylon.gui.js
wget http://cdn.babylonjs.com/gui/babylon.gui.min.js

cat babylon.max.js babylon.gui.js > ../babylon.js
cat babylon.js babylon.gui.min.js > ../babylon.min.js

cd ..

############## babylon-extra ##############

mkdir babylon-extra
cd babylon-extra
touch index.html

# physics engine (cannon.js)
wget https://github.com/BabylonJS/Babylon.js/raw/master/dist/cannon.js

wget https://preview.babylonjs.com/oimo.js

cd ..

############## ui ##############

mkdir ui
cd ui
touch index.html

BSVERSION=3.3.7
wget https://github.com/twbs/bootstrap/releases/download/v${BSVERSION}/bootstrap-${BSVERSION}-dist.zip
unzip bootstrap-${BSVERSION}-dist.zip
mv bootstrap-${BSVERSION}-dist bootstrap
rm bootstrap-${BSVERSION}-dist.zip

wget https://raw.githubusercontent.com/joewalnes/smoothie/master/smoothie.js

wget https://raw.githubusercontent.com/seiyria/bootstrap-slider/master/dist/bootstrap-slider.min.js
wget https://raw.githubusercontent.com/seiyria/bootstrap-slider/master/dist/bootstrap-slider.js
wget https://raw.githubusercontent.com/seiyria/bootstrap-slider/master/dist/css/bootstrap-slider.css
wget https://raw.githubusercontent.com/seiyria/bootstrap-slider/master/dist/css/bootstrap-slider.min.css

wget https://gitcdn.github.io/bootstrap-toggle/2.2.2/css/bootstrap-toggle.min.css
wget https://gitcdn.github.io/bootstrap-toggle/2.2.2/js/bootstrap-toggle.min.js
wget https://gitcdn.github.io/bootstrap-toggle/2.2.2/js/bootstrap-toggle.js

cat bootstrap-slider.js smoothie.js bootstrap/js/bootstrap.js bootstrap-toggle.js > ../ui.js
cat bootstrap-slider.min.js smoothie.js bootstrap/js/bootstrap.min.js bootstrap-toggle.min.js > ../ui.min.js

## css files
# remove comments from css files and fix location of font files
sed 's/\/\*.*\*\///g; s/\.\.\/fonts\//ui\/bootstrap\/fonts\//g' bootstrap/css/bootstrap.css bootstrap-slider.css bootstrap-toggle.min.css > ../ui.css

cd ..

############## ui-extra ##############

mkdir ui-extra
cd ui-extra
touch index.html

wget https://cdn.jsdelivr.net/npm/chart.js@2.8.0 -O Chart.min.js

cd ..

############## MathJax ##############

# https://ro-che.info/articles/2017-04-02-deploying-mathjax, adjusted to CommonHTML
wget https://github.com/mathjax/MathJax/archive/2.7.2.zip
unzip 2.7.2.zip
rm 2.7.2.zip
mv MathJax-2.7.2 MathJax
cd MathJax
touch index.html

rm -rf docs test unpacked .gitignore README-branch.txt README.md bower.json \
  CONTRIBUTING.md LICENSE package.json composer.json .npmignore .travis.yml \
  config/ localization/ \
  extensions/MathML extensions/asciimath2jax.js extensions/jsMath2jax.js \
  extensions/mml2jax.js extensions/a11y/
find fonts/HTML-CSS/ -mindepth 1 -maxdepth 1 ! -name TeX -exec rm -rf {} \+
find fonts -mindepth 3 -maxdepth 3 ! -name woff -exec rm -rf {} +
find jax/input/ -mindepth 1 -maxdepth 1 ! -name TeX -exec rm -rf {} \+
find jax/output/ -mindepth 1 -maxdepth 1 ! -name CommonHTML -exec rm -rf {} \+
find jax/output/CommonHTML/fonts -mindepth 1 -maxdepth 1 ! -name TeX -exec rm -rf {} \+
cd ..

