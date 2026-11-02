#!/usr/bin/env sh
# Download the BinaryCIF files that Module B loads from this repo (roadmap task 1.3).
# Run from the repo root: sh tools/fetch-structures.sh
# The site falls back to the RCSB ModelServer when a file is missing.
set -e
mkdir -p data/structures
for id in 5xtd 4ug0; do
  curl -fL --retry 3 "https://models.rcsb.org/v1/${id}/full?encoding=bcif" -o "data/structures/${id}.bcif"
  echo "${id}.bcif $(wc -c < "data/structures/${id}.bcif") bytes"
done
