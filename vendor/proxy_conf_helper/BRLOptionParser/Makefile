COCOAPODS = Pods Podfile.lock

default: test

install: $(COCOAPODS)

test: install
	@xcodebuild \
		-workspace BRLOptionParser.xcworkspace \
		-scheme BRLOptionParser \
		-sdk macosx \
		-configuration Release \
		build test

$(COCOAPODS):
	@pod install

.PHONY: test

