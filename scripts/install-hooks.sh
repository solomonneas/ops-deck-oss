#!/usr/bin/env bash
set -euo pipefail
#
# Wires .githooks/ into git config so pre-commit + commit-msg hooks run.
# Run once after cloning the repo:
#
#   bash scripts/install-hooks.sh
#
# The pre-commit hook depends on:
#   - jq
#   - grep with PCRE (-P) support (GNU grep or ugrep)
#   - python3
#   - a local checkout of content-guard. The default path is
#     $HOME/repos/content-guard/src; override with the CG_SRC env var if your
#     checkout lives elsewhere, e.g.
#       export CG_SRC=$HOME/code/content-guard/src
#
# The layer-2 project-specific blocklist lives in .githooks/project-blocks.txt.
# Edit that file to add or remove forbidden tokens (one PCRE alternative per
# line, blank/# lines ignored). No need to touch the hook scripts themselves.

cd "$(dirname "$0")/.."
git config core.hooksPath .githooks
echo "Hooks installed. Pre-commit and commit-msg now run Content Guard + project-specific rules."
echo "Hooks dir: $(git config core.hooksPath)"
