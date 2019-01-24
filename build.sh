#!/bin/bash

# Test if closure compiler available
if [ ! -f ~/.closure-compiler/closure-compiler-v20190106.jar ]; then
    # File not found

    # Ensure the ~/.closure-compiler directory exists
    mkdir -p ~/.closure-compiler

    # Move into that director
    pushd ~/.closure-compiler

    # Download pre-built binary
    wget https://dl.google.com/closure-compiler/compiler-20190106.zip

    # Extract just the compiler .jar file
    unzip -p compiler-20190106.zip closure-compiler-v20190106.jar > closure-compiler-v20190106.jar

    # Delete the .zip file
    rm compiler-20190106.zip

    # Move back to the project directory
    popd
fi

# Compile and minify
java -jar ~/.closure-compiler/closure-compiler-v20190106.jar \
    --language_in ECMASCRIPT6_TYPED \
    --compilation_level ADVANCED_OPTIMIZATIONS \
    --strict_mode_input \
    --dependency_mode LOOSE \
    --warning_level VERBOSE \
    --summary_detail_level=3 \
    --externs src/externs.js \
    --js src/constants.js \
    --js src/rect.js \
    --js src/input.js \
    --js src/keyboard.js \
    --js src/mouse.js \
    --js src/maps.js \
    --js src/path.js \
    --js src/glutils.js \
    --js src/tilemap.js \
    --js src/fov.js \
    --js src/sprites.js \
    --js src/dialog.js \
    --js src/quests.js \
    --js src/game.js \
    --js_output_file dist/stacio.min.js
