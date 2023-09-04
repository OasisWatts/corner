const childProcess = require("child_process")
const fs = require("fs")
const readLine = require("readline")
const path = require("path")
const stdio = readLine.createInterface(process.stdin, process.stdout)

const page = process.argv[2]
const productionMode = process.argv.includes("--prod")
const mobileMode = process.argv.includes("--mob")

console.log("mode:", productionMode ? "production" : "development")
console.log("page:", page ? page : "all")

function buildFront(page) {
      let $js = buildJS(page)
      let $lang = buildLang()
      stdio.on("line", (line) => {
            switch (line) {
                  case "":
                  case "kill":
                        $js.kill()
                        $lang.kill()
                        process.exit()
                  case "js":
                        $js.kill()
                        $js = buildJS(page)
                        break
                  case "lang":
                        $lang.kill()
                        $lang = buildLang()
                        break
                  default:
                        help()
            }
      })
}
for (const v of fs.readdirSync(path.resolve(__dirname, "../build/pages"))) {
      fs.unlinkSync(path.resolve(__dirname, "../build/pages", v))
}
if (productionMode) {
      const children = [
            buildLang(),
      ]
      for (const pg of fs.readdirSync(path.resolve(__dirname, "../src/front"))) {
            if (pg.startsWith("@")) {
                  continue
            }
            if (!fs.statSync(path.resolve(__dirname, "../src/front", pg)).isDirectory()) {
                  continue
            }
            console.log("packing:", pg)
            children.push(buildJS(pg))
            children.push(buildCss(pg))
      }
      for (const v of children) {
            v.on("exit", (code) => {
                  if (code) {
                        process.exit(code)
                  }
                  if (++count === children.length) {
                        process.exit()
                  }
            })
      }
} else if (!page) {
      help()
      for (const pg of fs.readdirSync(path.resolve(__dirname, "../src/front"))) {
            if (pg.startsWith("@")) {
                  continue
            }
            if (!fs.statSync(path.resolve(__dirname, "../src/front", pg)).isDirectory()) {
                  continue
            }
            console.log("building", pg)
            console.log("")
            buildFront(pg)
      }
} else {
      help()
      buildFront()
}
function help() {
      console.log("")
      console.log("command")
      console.log("kill: terminate all")
      console.log("js: restart JS")
      console.log("css: restart CSS")
      console.log("lang: restart LANG")
      console.log("")
}
function run(name, command, ...args) {
      const $baby = childProcess.spawn(command, ...args, {
            cwd: path.resolve(__dirname, ".."),
            shell: true,
      })
      $baby.stdout.on("data", (chunk) => {
            for (const line of String(chunk).split("\n")) {
                  console.log(`|${name.padEnd(5)}|`, line)
            }
      })
      $baby.stderr.on("data", (chunk) => {
            for (const line of String(chunk).split("\n")) {
                  console.error(`|${name.padEnd(5)}|`, line)
            }
      })
      $baby.on("exit", (code) => {
            console.log(`[${name}] exited with the code:`, code)
      })
      return $baby
}
function buildJS(pg) {
      return run("JS", "webpack", [
            "--entry", `./src/front/${pg}/index.tsx`,
            "--output-path", `./build/pages`,
            "--output-filename", `${pg}.js`,
            ...(productionMode ? [
                  "--mode", "production",
                  "--env", "production=y"] : [
                  "--mode", "development",
                  "--env", "production=n"]),
            ...(mobileMode ?
                  ["--env", "mobile=y"] : []),
      ])
}
function buildLang() {
      return productionMode
            ? run("LANG", "node", [
                  "./tools/lib/front-lang-loader.js",
                  "--prod",
            ])
            : run("LANG", "node", [
                  "./tools/lib/front-lang-loader.js",
            ])
}