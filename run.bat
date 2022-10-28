@echo off
deno cache --reload https://raw.githubusercontent.com/ChapterIV/verify-code/master/verify.js
deno run --allow-read https://raw.githubusercontent.com/ChapterIV/verify-code/master/verify.js