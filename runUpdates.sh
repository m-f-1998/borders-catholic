#!/bin/bash

echo "🔄 Updating client packages..."
cd client
npm update --save
if [ -n "$(npm outdated)" ]; then
  echo "Some packages have major updates and need to be checked manually."
  npm outdated
fi

echo ""
echo "🔄 Updating server packages..."
cd ../server
npm update --save
if [ -n "$(npm outdated)" ]; then
  echo "Some packages have major updates and need to be checked manually."
  npm outdated
fi

echo ""
read -p "Press any key to exit..." -n1 -s