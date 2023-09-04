let corner_toggle = false // 아마 content.js에서 처리
const corner_button = document.createElement("button")
corner_button.id = "corner_button"
const corner_frame = document.createElement("iframe")
corner_frame.id = "corner_frame"
corner_frame.src = "http://localhost:4416?u"
corner_button.onclick = async () => {
      console.log("corner button onclicked")
      if (corner_toggle) {
            document.body.removeChild(corner_frame)
            corner_toggle = false
      } else {
            document.body.appendChild(corner_frame)
            corner_toggle = true
      }
}
document.body.appendChild(corner_button)
// }
//       fetch("http://localhost:4416", {
//             "mode": "cors"
//       }).then(async (res) => {
//             const data = await res.text()
//             console.log(data)
//             console.log("working")
//             ssr.innerHTML += data
//             document.body.appendChild(ssr)
//             document.body.appendChild(corner_button)
//       })
// }