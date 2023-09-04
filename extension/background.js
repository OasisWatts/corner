async function getTab() {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
      return tab
}
async function create(url, hostname) {
      const iconImg = chrome.runtime.getURL("img/corner-icon.svg")
      const enlargeImg = chrome.runtime.getURL("img/enlarge.svg")
      const reduceImg = chrome.runtime.getURL("img/reduce.svg")
      const offImg = chrome.runtime.getURL("img/off.svg")
      const corner_img = document.createElement("img")
      const enlarge_img = document.createElement("img")
      const reduce_img = document.createElement("img")
      const off_img = document.createElement("img")
      corner_img.src = iconImg
      enlarge_img.src = enlargeImg
      reduce_img.src = reduceImg
      off_img.src = offImg
      corner_img.id = "corner_img"
      enlarge_img.id = "enlarge_img"
      reduce_img.id = "reduce_img"
      off_img.id = "off_img"
      const on_button = document.createElement("button")
      const off_button = document.createElement("button")
      const enlarge_button = document.createElement("button")
      const reduce_button = document.createElement("button")
      on_button.id = "on_button"
      off_button.id = "off_button"
      enlarge_button.id = "enlarge_button"
      reduce_button.id = "reduce_button"
      on_button.appendChild(corner_img)
      off_button.appendChild(off_img)
      enlarge_button.appendChild(enlarge_img)
      reduce_button.appendChild(reduce_img)
      const corner_frame = document.createElement("iframe")
      corner_frame.id = "corner_frame"
      corner_frame.src = "http://localhost:4416?ext=1&u=" + url + "&h=" + hostname
      on_button.onclick = async () => {
            console.log("corner button onclicked")
            corner_frame.id = "corner_frame"
            off_button.id = "off_button"
            document.body.appendChild(corner_frame)
            document.body.appendChild(off_button)
            document.body.appendChild(enlarge_button)
            document.body.removeChild(on_button)
      }
      off_button.onclick = async () => {
            console.log("corner button onclicked")
            document.body.removeChild(corner_frame)
            document.body.appendChild(on_button)
            document.body.removeChild(off_button)
            document.body.removeChild(enlarge_button)
            document.body.removeChild(reduce_button)
      }
      enlarge_button.onclick = async () => {
            console.log("corner enlarge conlicked")
            corner_frame.id = "corner_frame_enlarged"
            off_button.id = "off_button_enlarged"
            document.body.removeChild(enlarge_button)
            document.body.appendChild(reduce_button)
      }
      reduce_button.onclick = async () => {
            console.log("corner reduce conlicked")
            corner_frame.id = "corner_frame"
            off_button.id = "off_button"
            document.body.appendChild(enlarge_button)
            document.body.removeChild(reduce_button)
      }
      document.body.appendChild(on_button)
}
chrome.runtime.onMessage.addListener(async function (msg, sender, sendResponse) {
      if (msg === "connect") {
            const { id, url } = await getTab()
            const parsedUrl = new URL(url)
            console.log(chrome)
            chrome.scripting.executeScript({
                  target: { tabId: id },
                  func: create,
                  args: [url, parsedUrl.hostname]

            }).catch((err) => console.log(err))
      } else console.log("undefined msg")
})