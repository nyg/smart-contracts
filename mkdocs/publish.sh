#!/usr/bin/env sh

set -eu

echo_section() {
    command echo "\n"$(tput bold)$@$(tput sgr0)
}

echo_section Building website…
rm -r site
mkdocs build

echo_section Creating archive…
( cd site && tar -cz * > ../site.tar.gz )
ls -lh site.tar.gz

source .sshenv
echo "\n"Removing existing site files on host…
ssh $SSH_USER@$SSH_HOST "find $SSH_DIR ! -name .well-known ! -name .htaccess -mindepth 1 -maxdepth 1 -exec rm -r {} +"

echo_section Copying archive to host…
scp site.tar.gz $SSH_USER@$SSH_HOST:$SSH_DIR

echo "\n"Extracting archive to site folder…
ssh $SSH_USER@$SSH_HOST "cd $SSH_DIR && tar -xf site.tar.gz && rm site.tar.gz"

echo Setting executable permission for CGI script…
ssh $SSH_USER@$SSH_HOST "chmod +x $SSH_DIR/assets/count.py"

echo Removing archive…
rm site.tar.gz
