#!/usr/bin/env sh

echo "Installing npm-check-updates…"
npm -g i npm-check-updates

for dir in */ ; do
    cd "$dir"
    if [ -f package.json ] ; then
        echo "\n\n==========================="
        echo "== Updating dependencies of $dir"
        echo "==========================="
        ncu -u
        echo Running pnpm install
        pnpm install
    fi
    cd ..
done

echo "Done."
