#!/bin/bash

# Exit on any error
set -e

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Preparing to publish MCP Think Tank...${NC}"

# Read current version from package.json
VERSION=$(node -e "console.log(require('./package.json').version)")
echo -e "${GREEN}Current version is ${VERSION}${NC}"

# Run verify-publish script to ensure everything is ready
echo -e "${YELLOW}Running verification checks...${NC}"
npm run verify-publish

# Ask for confirmation
echo -e "${YELLOW}Are you sure you want to publish version ${VERSION}? (y/n)${NC}"
read -r answer
if [[ "$answer" != "y" ]]; then
  echo -e "${RED}Publish canceled.${NC}"
  exit 0
fi

# Publish to npm
echo -e "${YELLOW}Publishing to npm...${NC}"
npm publish

echo -e "${GREEN}Successfully published version ${VERSION}!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update the version in Smithery.yaml if needed"
echo "2. Tag this release: git tag v${VERSION}"
echo "3. Push the tag: git push origin v${VERSION}"
echo "4. Create a release on GitHub"

exit 0 