const fs = require("fs")
const path = require("path")

const regexpPage = /^([A-Z]\w+?)+$/
const sassTable = {}
const roots = {
      front: path.resolve(__dirname, "../../src/front"),
}

exports.SETTINGS = {
      ...require("../../public/settings/settings.json"),
      // ...require("../../public/settings/settings.dev.json"),
}

exports.WP_ENTRIES = fs.readdirSync(path.resolve(__dirname, "../../src/front"))
      .filter((v) => regexpPage.test(v))
      .reduce((pv, v) => {
            pv[v] = path.resolve(__dirname, `../../src/front/${v}/index.tsx`)
            return pv
      }, {})

exports.SASS_IMPORTER = (url, prev, done) => {
      for (const k in roots) {
            const head = `${k}/`

            if (url.startsWith(head)) {
                  url = url.replace(head, roots[k] + path.sep)
                  break
            }
      }
      const file = path.resolve(prev, "..", url)
      if (sassTable.hasOwnProperty(file)) {
            sassTable[file].push(prev)
            done({ contents: "" })
      } else {
            sassTable[file] = [prev]
            done({ file })
      }
}
exports.getSASSTableEntries = () => (
      Object.entries(sassTable)
)
exports.flushImporterTable = () => {
      for (const k in sassTable) {
            delete sassTable[k]
      }
}
