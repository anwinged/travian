all: test format build

setup:
	tools/npm install

write-version:
	@echo $(shell date +'%Y%m%d-%H.%M.%S') > ./src/version.txt

build: write-version
	tools/npm run-script build:dev

build-min: write-version
	tools/npm run-script build

format:
	tools/npm run-script format
	tools/npm run-script format-vue

test:
	tools/npm run test

coverage:
	tools/npm run coverage

restart-server:
	docker-compose restart

publish:
	tools/npm publish --access public