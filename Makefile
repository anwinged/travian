all: format build

restart-server:
	docker-compose restart

build:
	tools/npm run-script build:dev

build-min:
	tools/npm run-script build

format:
	tools/npm run-script format

test:
	tools/npm run test

coverage:
	tools/npm run coverage

publish:
	tools/npm publish --access public