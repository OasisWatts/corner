async function getTab() {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
      return tab
}
async function create(url, hostname) {
      console.log("create", url, hostname)
      const iconBlueImg = chrome.runtime.getURL("img/corner-icon-url.png")
      const iconYellowImg = chrome.runtime.getURL("img/corner-icon-hostname.png")
      const corner_img = document.createElement("img")
      const board_num = document.createElement("div")
      corner_img.id = "corner_img"
      board_num.id = "board_num"
      const corner_icon = document.createElement("button")
      corner_icon.id = "corner_icon"
      corner_icon.appendChild(corner_img)
      corner_icon.appendChild(board_num)
      console.log("before check fetch")
      fetch("https://corner.dance/check?u=" + url.replaceAll("&", "!oa@sis$").replaceAll("#", "!cor@ner$") + "&h=" + hostname).then((r) => r.json()).then((r) => {
            if (r.u) {
                  corner_img.src = iconBlueImg
                  if (r.u > 99) board_num.innerText = "99+"
                  else board_num.innerText = r.u
                  document.body.appendChild(corner_icon)
            } else if (r.h) {
                  corner_img.src = iconYellowImg
                  if (r.h > 99) board_num.innerText = "99+"
                  else board_num.innerText = r.h
                  document.body.appendChild(corner_icon)
            }
      })
}
chrome.runtime.onMessage.addListener(async function (msg, sender, sendResponse) {
      if (msg === "connect") {
            const { id, url } = await getTab()
            const parsedUrl = new URL(url)
            console.log("connected getUrl", url)
            chrome.scripting.executeScript({
                  target: { tabId: id },
                  func: create,
                  args: [url, parsedUrl.hostname]
            }).catch((err) => console.log(err))
            chrome.contextMenus.create({
                  id: 'corner',
                  title: 'comment on Corner',
                  contexts: ['all']
            });
            // chrome.sidePanel.setOptions({ enabled: true, path: "sidepanel.html" })
      } else if (msg === "panelOpened") { // side panel이 열린 것을 확인하면, side panel을 원하는대로 업데이트
            chrome.runtime.sendMessage("panelUpdate")
      } else console.log("undefined msg", msg)
})
// toolbar icon 클릭 시 sidepanel 열림
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error(error))
// tab 변경 시, 알림
// chrome.tabs.onActivated.addListener(() => {
//       console.log("tab changed")
//       console.log(chrome)
//       chrome.runtime.sendMessage("tabChanged")
// })
let prevUrl
const urlChangeExceptions = [
      /https:\/\/.*\.firebaseapp\.com\/__\/auth\/handler\?apiKey=.*/,
      /https:\/\/accounts\.google\.com\/o\/oauth2\/auth.*/
]
// url 변경 시, 알림
chrome.tabs.onUpdated.addListener(async () => {
      const { url } = await getTab()
      if (prevUrl != url && !urlChangeExceptions.some((mt) => url.match(mt) || (prevUrl && prevUrl.match(mt)))) {
            console.log("url changed", prevUrl, url)
            chrome.runtime.sendMessage("urlChanged")
            prevUrl = url
      }
})
// context menu 를 눌러 side panel을 킴
chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'corner') {
            chrome.sidePanel.setOptions({ enabled: true, path: "sidepanel.html", tabId: tab.id })
            chrome.sidePanel.open({ tabId: tab.id });
      }
})