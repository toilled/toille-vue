build:
	dart compile js -O2 -o web/main.dart.js web/main.dart

serve:
	python3 -m http.server 3000 --directory web
