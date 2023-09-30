const host = "https://corner.dance"
// const host = "http://localhost:4416"
async function getTab() {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
      return tab
}
chrome.runtime.sendMessage({ type: "panelOpened" })
chrome.runtime.onMessage.addListener(async function (msg, sender, sendResponse) {
      if (msg.type === "panelUpdate") {
            const url = msg.url
            const parsedUrl = new URL(url)
            document.body.querySelector("#corner_frame").src = host + "?ext=1&u=" + url.replaceAll("&", "!oa@sis$").replaceAll("#", "!cor@ner$") + "&h=" + parsedUrl.hostname
      } else if (msg.type === "windowChanged") {
            while (document.body.querySelector("#url_change_alert")) {
                  const url_change_alert = document.body.querySelector("#url_change_alert")
                  url_change_alert.remove()
            }
            const corner_frame = document.body.querySelector("#corner_frame")
            corner_frame.className = ""
            const url = msg.url
            const parsedUrl = new URL(url)
            corner_frame.src = host + "?ext=1&u=" + url.replaceAll("&", "!oa@sis$").replaceAll("#", "!cor@ner$") + "&h=" + parsedUrl.hostname
      } else if (msg.type === "urlChanged") {
            const url = msg.url
            const url_change_alert = document.createElement("div")
            url_change_alert.id = "url_change_alert"
            url_change_alert.innerText = "url is changed. click this to refresh corner"
            url_change_alert.onclick = async () => {
                  const parsedUrl = new URL(url)
                  const corner_frame = document.body.querySelector("#corner_frame")
                  corner_frame.src = host + "?ext=1&u=" + url.replaceAll("&", "!oa@sis$").replaceAll("#", "!cor@ner$") + "&h=" + parsedUrl.hostname
                  corner_frame.className = ""
                  while (document.body.querySelector("#url_change_alert")) {
                        const url_change_alert = document.body.querySelector("#url_change_alert")
                        url_change_alert.remove()
                  }
            }
            const corner_frame = document.body.querySelector("#corner_frame")
            corner_frame.className = "alerted_corner_frame"
            // corner_frame.insertBefore(url_change_alert)
            if (!document.body.querySelector("#url_change_alert")) document.body.append(url_change_alert)
      } else if (msg.type === "unAlertedTab") {
            while (document.body.querySelector("#url_change_alert")) {
                  const url_change_alert = document.body.querySelector("#url_change_alert")
                  url_change_alert.remove()
            }
            corner_frame.className = ""
      }
})