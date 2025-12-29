#!/bin/sh
set -eux

script_dir=$(cd "$(dirname "$0")" && pwd)
chmod +x "$script_dir"/_*.manifest.sh
sudo "$script_dir/_install.manifest.sh"
"$script_dir/_login.manifest.sh"
CI_PROJECT_URL="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}"
CI_JOB_ID="${GITHUB_RUN_ID}"
CI_JOB_URL="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"
SHORT_SHA="$(printf '%s' "$GITHUB_SHA" | cut -c1-7)"


# ---------- 2. Build the manifests with Yarn workspaces -----------------------

corepack enable
yarn set version stable
yarn install
export IMAGE_SUFFIX="$SHORT_SHA"
yarn run manifest

echo "Manifest written to .k8ts"

# ---------- 3. Compute image‑naming & tagging rules ---------------------------

REGISTRY="ghcr.io"
IMAGE_OWNER=$(printf '%s' "$GITHUB_REPOSITORY_OWNER" | tr '[:upper:]' '[:lower:]')

IMAGE_NAME="$REGISTRY/$IMAGE_OWNER/apps"

# Push two tags: the git short‑sha and "latest"
IMAGE_TAGS="$SHORT_SHA,latest"

MANIFEST_PATH=".k8ts"

IMAGE_TITLE="laniakea/apps Manifests"

# ---------- 4. Push the manifest list with ORAS ------------------------------

oras push \
    --artifact-type application/vnd.oci.image.manifest.v1+json \
    --annotation "org.opencontainers.image.url=$CI_PROJECT_URL" \
    --annotation "org.opencontainers.image.title=$IMAGE_TITLE" \
    --annotation "com.github.actions.run.id=$CI_JOB_ID" \
    --annotation "com.github.actions.run.url=$CI_JOB_URL" \
    "$IMAGE_NAME:$IMAGE_TAGS" \
    "$MANIFEST_PATH"
