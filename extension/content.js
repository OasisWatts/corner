chrome.runtime.sendMessage(
      { type: "connected" }, (res) => {
            if (res) {
                  console.log("done")
            }
      }
)