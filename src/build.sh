#!/bin/bash

# Check if an argument was passed
if [ -z "$1" ]; then
  echo "Please provide an argument: 'chrome' or 'firefox'"
  exit 1
fi

# Assign the target directory and built directory based on the argument
if [ "$1" == "chrome" ]; then
  TARGET_DIR="chrome"
  BUILT_DIR="built-chrome"
elif [ "$1" == "firefox" ]; then
  TARGET_DIR="mozilla"
  BUILT_DIR="built-firefox"
else
  echo "Invalid argument. Use 'chrome' or 'firefox'."
  exit 1
fi

# Create the built directory if it does not exist
if [ ! -d "$BUILT_DIR" ]; then
  mkdir "$BUILT_DIR"
  chmod 777 "$BUILT_DIR"
fi

# Copy the directories
cp -r "$TARGET_DIR"/* "$BUILT_DIR"/
cp -r scripts "$BUILT_DIR"/
cp -r styles "$BUILT_DIR"/
cp -r icons "$BUILT_DIR"/

echo "Copied extension artifacts to '$BUILT_DIR'."