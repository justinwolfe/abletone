#!/bin/bash

while true; do
  # Start the backend and frontend
  npm run dev --prefix backend &
  BACKEND_PID=$!
  npm run dev --prefix frontend &
  FRONTEND_PID=$!

  # Wait for the backend process to exit
  wait $BACKEND_PID

  # If backend process exits, kill the frontend process
  kill $FRONTEND_PID

  # Delay before restart (optional)
  echo "Restarting both backend and frontend..."
  sleep 2
done
