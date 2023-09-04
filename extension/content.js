chrome.runtime.sendMessage(
      "connect", (res) => {
            if (res) {
                  console.log("done")
            }
      }
)