BUN := $(or $(shell which bun 2>/dev/null),$(HOME)/.bun/bin/bun)

.DEFAULT_GOAL := help

## help: show this help
.PHONY: help
help:
	@sed -n 's/^## //p' $(MAKEFILE_LIST) | column -t -s ':' | sed -e 's/^/ /'

## install: install dependencies
.PHONY: install
install:
	$(BUN) install

## dev: start development server
.PHONY: dev
dev:
	$(BUN) run dev

## build: fetch data and build for production
.PHONY: build
build:
	$(BUN) run build

## preview: preview production build locally
.PHONY: preview
preview:
	$(BUN) run preview

## fetch-data: fetch glossary data from remote
.PHONY: fetch-data
fetch-data:
	$(BUN) scripts/fetch-glossary.js

## check: run svelte-check and type checking
.PHONY: check
check:
	$(BUN) run check

## sync: sync SvelteKit generated files
.PHONY: sync
sync:
	$(BUN) x svelte-kit sync
