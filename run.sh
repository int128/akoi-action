#!/bin/bash
set -o pipefail
set -eux

test "$AKOI_VERSION"
platform="$(uname -s | tr '[:upper:]' '[:lower:]')"
bin_dir="$(mktemp -d)"

cp -v "$AKOI_CONFIG" "$bin_dir/.akoi.yml"
cd "$bin_dir"
curl -fL -o akoi "https://github.com/suzuki-shunsuke/akoi/releases/download/${AKOI_VERSION}/akoi_${AKOI_VERSION#v}_${platform}_amd64"
chmod +x akoi
./akoi install

echo "$bin_dir" >> "$GITHUB_PATH"
echo "::set-output name=directory::$bin_dir"
