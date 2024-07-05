#!/bin/bash
until npm run dev --prefix ./backend; do
  echo "Backend crashed with exit code $?.  Restarting..." >&2
  sleep 1
done