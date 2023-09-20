async function getTab() {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
      return tab
}
chrome.runtime.sendMessage("panelOpened")
chrome.runtime.onMessage.addListener(async function (msg, sender, sendResponse) {
      if (msg === "panelUpdate" || msg === "tabChanged") {
            console.log("get in sidepanel")
            const { id, url } = await getTab()
            const parsedUrl = new URL(url)
            prevUrl = url
            document.body.querySelector("#corner_frame").src = "http://localhost:4416?ext=1&u=" + url.replaceAll("&", "!oa@sis$").replaceAll("#", "!cor@ner$") + "&h=" + parsedUrl.hostname
      } else if (msg === "urlChanged") {
            const url_change_alert = document.createElement("div")
            url_change_alert.id = "url_change_alert"
            url_change_alert.innerText = "url is changed. click this to refresh corner"
            url_change_alert.onclick = async () => {
                  const { id, url } = await getTab()
                  const parsedUrl = new URL(url)
                  prevUrl = url
                  const corner_frame = document.body.querySelector("#corner_frame")
                  corner_frame.src = "http://localhost:4416?ext=1&u=" + url.replaceAll("&", "!oa@sis$").replaceAll("#", "!cor@ner$") + "&h=" + parsedUrl.hostname
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
      } else console.log("undefined msg")
})