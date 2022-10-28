// get local path

const path = Deno.cwd();
console.log(`start to verify path [${path}]`)
let filePath = ''
let lineNo = 0
let count = 0

function contains(line, content) {
    return line.indexOf(content) > -1;
}

function isMatch(reg, line) {
    return reg.test(line)
}
function error(line, error) {
    count++
    var p = filePath.indexOf('src')
    var fPath = p > -1 ? filePath.substring(p) : filePath

    console.log('')
    console.log(`${count}:${fPath}:${lineNo}`)
    console.log(`[${error}] ${line.trim()}`);
}
// 直接错误
function fixError(line) {
    if (contains(line, "import { Box } from '@mui/system';")) {
        error(line, 'import Box from material!')
    }
}
// 注释分析
function verifyNote(line) {
    if (isMatch(/^[ ]*\/\/.*/, line)) {
        if (isMatch(/[.{},=]/), line) {
            error(line, 'comment')
        }
    }
}
// 调试信息
function verifyDebugInfo(line) {
    if (contains(line, 'console.log')) {
        error(line, 'log')
    }
    if (contains(line, "{' '}")) {
        error(line, 'space')
    }
}
// 事件读取
function verifyEvent(line) {
    if (isMatch(/on[A-Z][a-zA-Z]+={[a-zA-Z]+}/, line)) {
        if (!isMatch(/on[A-Z][a-zA-Z]+={on[A-Z][a-zA-Z]+Handler}/, line)) {
            error(line, 'event spelling error')
        }
    }
}
// 列举所有大写开头的变量
function verifyConstUppercaseStart(line) {
    // const 前有空格表示在渲染函数内部的变量
    if (isMatch(/^[\s]+const [A-Z]/, line)) {
        error(line, 'const with uppercase start')
    }
    // 列举所有开头大写的变量
    else if (isMatch(/const [A-Z][a-zA-Z]+ = {/, line)) {
        error(line, 'const with uppercase start')
    }
}
// 类型检查
function verifyType(line) {
    if (isMatch(/^type/, line) || isMatch(/^export type/, line)) {
        if (!isMatch(/type [A-Z]/, line)) {
            error(line, 'type name uppercase first letter')
        }
    }
}
// 类名检查
function verifyClassName(line) {
    var ms = /'& \..+': {/.exec(line)
    if (!ms) return
    ms.forEach(m => {
        if (!contains(m, 'Mui') && !contains(m, 'IconWithTooltip') && !contains(m, '.ListBox')) {
            if (isMatch(/\.[A-Z]/, line)) {
                error(line, 'class name lowercase first letter')
            }
            if (contains(m, '-')) {
                error(line, "class name don't contains [-]")
            }
        }
    });
}
// 主验证模块
async function verify(path) {
    // 读取文件内容
    const content = await Deno.readTextFile(path)
    const lines = content.split('\n')
    lines.forEach(line => {
        lineNo++;
        // 直接错误
        fixError(line)
        // 注释分析
        verifyNote(line)
        // 调试信息
        verifyDebugInfo(line)
        // 事件读取
        verifyEvent(line)
        // 列举所有大写开头的变量
        verifyConstUppercaseStart(line)
        // 类型检查
        verifyType(line)
        // 类名检查
        verifyClassName(line)
    });
}

async function walk(path) {
    for await (const file of Deno.readDir(path)) {
        // 初始化行号
        lineNo = 0
        // 当前路径
        filePath = `${path}/${file.name}`
        if (file.isFile) {
            await verify(filePath)
        } else {
            await walk(filePath)
        }
    }
}
await walk(path)

console.log(`verify completed`)
console.log('terminal will closed in 10 minutes')

setTimeout(() => {

}, 1000 * 60 * 10);