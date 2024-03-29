const host = "https://corner.dance"
// const host = "http://localhost:4416"
async function getTab() {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
      return tab
}
async function create(url, hostname) {
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
      fetch(host + "/check?u=" + url.replaceAll("&", "!oa@sis$").replaceAll("#", "!cor@ner$") + "&h=" + hostname).then((r) => r.json()).then((r) => {
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
      if (msg.type === "connected") {
            const { id, url } = await getTab()
            const parsedUrl = new URL(url)
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
      } else if (msg.type === "panelOpened") { // side panel이 열린 것을 확인하면, side panel을 원하는대로 업데이트
            const { id, url } = await getTab()
            chrome.runtime.sendMessage({ type: "panelUpdate", url })
      }
})
// toolbar icon 클릭 시 sidepanel 열림
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error(error))
// tab 변경 시, frame updated
chrome.tabs.onActivated.addListener(async () => {
      const { url, windowId } = await getTab()
      const currWIndowId = TabCurrWindowId[id]
      if (currWIndowId === windowId) {
            chrome.runtime.sendMessage({ type: "windowChanged", url })
      }
})
const urlChangeExceptions = [
      /https:\/\/.*\.firebaseapp\.com\/__\/auth\/handler.*/,
      /https:\/\/accounts\.google\.com\/o\/oauth2\/auth.*/,
      /chrome:\/\/newtab\/.*/
]
const TabPreviousUrls = {}
const TabCurrWindowId = {}
// url 변경 시, alert
chrome.tabs.onUpdated.addListener(async () => {
      const { id, url, windowId } = await getTab()
      const previousUrl = TabPreviousUrls[id]
      const currWIndowId = TabCurrWindowId[id]
      if (currWIndowId === windowId && previousUrl != url && !urlChangeExceptions.some((mt) => url.match(mt) || (previousUrl && previousUrl.match(mt)))) {
            chrome.runtime.sendMessage({ type: "urlChanged", url })
            TabPreviousUrls[id] = url
      }
})
let previousWindowId
// context menu 를 눌러 side panel을 킴
chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'corner') {
            for (tabId in TabCurrWindowId) {
                  console.log("tabId", tabId)
                  chrome.sidePanel.setOptions({ enabled: false, path: "sidepanel.html", tabId: Number(tabId) })
            }
            chrome.sidePanel.setOptions({ enabled: true, path: "sidepanel.html", tabId: tab.id })
            chrome.sidePanel.open({ tabId: tab.id })
            TabCurrWindowId[tab.id] = tab.windowId
      }
})