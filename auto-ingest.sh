#!/bin/bash
# Auto-update intel every 10 minutes
# Run with: ./auto-ingest.sh

cd /home/vibecode/workspace

while true; do
  echo "$(date): Running intel ingestion..."
  node ingest-intel-local.js
  echo "$(date): Sleeping for 10 minutes..."
  sleep 600
done
