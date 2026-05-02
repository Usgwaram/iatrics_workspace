#!/bin/bash

echo "🚀 Running Iatrics API Tests..."

# Wait for backend
sleep 3

# Run Postman collection
newman run collections/iatrics.postman_collection.json \
  -e env/dev.postman_environment.json \
  --delay-request 200 \
  --timeout-request 5000

echo "✅ Tests completed"