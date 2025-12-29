#!/bin/sh
set -eux
printf '%s' "$GITHUB_TOKEN" |
    oras login ghcr.io \
        --username "$GITHUB_ACTOR" \
        --password-stdin
