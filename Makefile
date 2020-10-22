release:
	git checkout develop
	git pull origin develop
	$(eval VERSION ?= $(shell npm version --no-git-tag-version prerelease))
	git checkout -b release/$(VERSION)
	git add .
	git commit -m "release: $(VERSION)"
	git push origin release/$(VERSION)
	gh pr create \
		--title "release: $(VERSION) to DEVELOP" \
		--body "" \
		--base develop \
		--head release/$(VERSION)
	gh pr create \
		--title "release: $(VERSION) to MASTER" \
		--body "" \
		--base master \
		--head release/$(VERSION)