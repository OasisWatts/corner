const fs = require("graceful-fs")
const path = require("path")

const productionMode = process.argv.includes("--prod")
const renderGap = 500
let timer

for (const v of fs.readdirSync("./public/lang")) {
      moveLang(v)
}
if (productionMode) {
      process.exit()
}
fs.watch("./public/lang", (e, file) => {
      console.info(`[LANG] Change ${file}`)

      if (timer) {
            clearTimeout(timer)
      }
      timer = setTimeout(moveLang, renderGap, file) // on tick
})
/** stringify and move lang files to build folder */
function moveLang(file) {
      const chunk = file.split(".")
      const locale = chunk[0]
      const data = JSON.parse(fs.readFileSync(path.resolve("./public/lang", file)).toString())

      switch (chunk[1]) {
            case "json": {
                  const files = fs.readdirSync("./build/strings")
                  let updated = 0

                  for (const k in data) {
                        if (k.startsWith("$") || k.startsWith("@")) {
                              continue
                        }
                        const target = `./build/strings/${locale}.${k}.js`
                        const baby = {

                              ...data.$global,
                              ...(data[k].$include || []).reduce(resolveDependency, {}),
                              ...data[k],
                        }
                        const index = files.indexOf(`${locale}.${k}.js`)

                        delete baby.$include
                        fs.writeFileSync(target, `window.__LANGUAGE=${JSON.stringify(baby)}`)
                        if (index !== -1) {
                              files.splice(index, 1)
                        }
                        updated++
                  }
                  for (const v of files) {
                        fs.unlinkSync(path.resolve("./www/build/strings", v))
                  }
                  console.info("[LANG] Application", `${updated} updated`, `${files.length} removed`)
            } break
      }

      function resolveDependency(pv, v) {
            const table = data[`@${v}`] || {}
            const include = table.$include || []

            return Object.assign(
                  pv,
                  include.reduce(resolveDependency, {}),
                  table,
            )
      }
}
