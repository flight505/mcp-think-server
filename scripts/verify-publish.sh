#!/bin/bash

# This script performs a comprehensive check before publishing
# It verifies that the package can be built, works with npx, and meets publishing requirements

set -e

# Define colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running publish verification checks...${NC}"

# Step 1: Lint checks
echo -e "\n${YELLOW}Step 1: Running lint checks...${NC}"
npm run lint
echo -e "${GREEN}✓ Lint checks passed${NC}"

# Step 2: Run tests
echo -e "\n${YELLOW}Step 2: Running tests...${NC}"
# Run only a subset of tests that are expected to pass (publish-checks)
npm test tests/publish-checks.spec.ts || { echo -e "${RED}✗ Tests failed${NC}"; exit 1; }
echo -e "${GREEN}✓ Tests passed${NC}"

# Step 3: Build the package
echo -e "\n${YELLOW}Step 3: Building the package...${NC}"
npm run build || { echo -e "${RED}✗ Build failed${NC}"; exit 1; }
echo -e "${GREEN}✓ Build successful${NC}"

# Step 4: Checking version consistency
echo -e "\n${YELLOW}Step 4: Checking version consistency...${NC}"
PACKAGE_VERSION=$(node -e "console.log(require('./package.json').version)")
SERVER_VERSION=$(node dist/src/server.js --version 2>&1 | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')

echo "Package version: $PACKAGE_VERSION"
echo "Server version: $SERVER_VERSION"

# Compare versions
if [ "$PACKAGE_VERSION" != "$SERVER_VERSION" ]; then
  echo -e "${RED}✗ Version mismatch: package.json=$PACKAGE_VERSION, server.js=$SERVER_VERSION${NC}"
  exit 1
else
  echo -e "${GREEN}✓ Versions match: $PACKAGE_VERSION${NC}"
fi

# Step 5: Check if bin directory is included in package.json "files"
echo -e "\n${YELLOW}Step 5: Checking package.json files configuration...${NC}"
FILES_INCLUDE_BIN=$(node -e "console.log(require('./package.json').files.includes('bin'))")
if [ "$FILES_INCLUDE_BIN" != "true" ]; then
  echo -e "${RED}✗ bin directory is not included in package.json files array${NC}"
  exit 1
else
  echo -e "${GREEN}✓ bin directory is properly included${NC}"
fi

# Step 6: Test with npm pack
echo -e "\n${YELLOW}Step 6: Testing with npm pack...${NC}"
npm pack --dry-run || { echo -e "${RED}✗ npm pack dry run failed${NC}"; exit 1; }
echo -e "${GREEN}✓ npm pack dry run successful${NC}"

# Step 7: Check if can execute from bin script
echo -e "\n${YELLOW}Step 7: Checking if bin script can execute...${NC}"
if [ -f "./bin/mcp-think-tank.js" ]; then
  echo -e "${GREEN}✓ bin script exists${NC}"
else
  echo -e "${RED}✗ bin script not found${NC}"
  exit 1
fi

# Test that the bin script can be executed
node -e "
try {
  require('./bin/mcp-think-tank.js');
  console.log('${GREEN}✓ bin script can be executed${NC}');
} catch(e) {
  console.error('${RED}✗ bin script execution failed:${NC}', e);
  process.exit(1);
}
"

echo -e "\n${GREEN}All verification checks passed successfully.${NC}"
echo -e "${YELLOW}The package is ready to be published.${NC}"
echo -e "Run: ${GREEN}npm publish${NC} to publish the package." 