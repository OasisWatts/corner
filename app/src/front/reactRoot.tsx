// import L from "./@global/Language"
import { AppRegistry, View } from "reactNative"
import { FRONT, PROPS } from "./@lib/util"
import Action from "./reactCom"
import React from "react"
import ReactDOM from "react-dom"
// import { AppRegistry } from "reactNative"
// import { View } from "react-native"
// import { setStyle } from "./@lib/style"
// import window from 'global'

type State = {}
type Props = Page.Props<any> & Readonly<{
      children?: React.ReactNode;
}>

export default function Bind(targetClass: any, bonusClass?: any): void {
      // if (typeof window !== "undefined") {
      if (FRONT) {
            // AppRegistry.registerComponent("app", () => targetClass)
            // AppRegistry.runApplication("App", {
            //       rootTag: document.getElementById("stage")
            // })
            renderReactDom(targetClass, bonusClass)
      }
      // if (typeof window !== "undefined") {
      //       console.log("w undefined")
      //       if (window.__PROPS.data?.mb) {
      //             document.addEventListener('deviceready', () => {
      //                   renderReactDom(targetClass, bonusClass)
      //             }, false)
      //       } else {
      //             renderReactDom(targetClass, bonusClass)
      //       }
      //       window.onload = () => {
      //             // 로딩 화면 삭제.
      //             // window loading이 안 되었을 경우 element를 못찾음 
      //             const loadingScreen = document.getElementById("loading")
      //             if (loadingScreen) document.body.removeChild(loadingScreen)
      //             // 네트워크 오류.
      //             // window.addEventListener("offline", () => {
      //             //       Action.trigger("modal-on", "network")
      //             // })
      //       }
      // }
}
function renderReactDom(targetClass: any, bonusClass?: any) {
      const $root = document.createElement("main")
      ReactDOM.render(<Root {...PROPS}>
            {React.createElement(targetClass, PROPS)}
            {(bonusClass) && React.createElement(bonusClass, PROPS)}
            {/* template html에서 가져온 PROPS */}
      </Root>, $root)
      document.body.appendChild($root)
      // const App = React.createElement(Root, PROPS, React.createElement(targetClass, PROPS))
      // AppRegistry.registerComponent("App", () => targetClass)
      // AppRegistry.runApplication("App", {
      //       initialProps: PROPS,
      //       rootTag: document.body
      // })
      // console.log("window", window)

      // const $root = document.createElement("main")
      // ReactDOM.render(, $root)
      // document.body.appendChild($root)
}
export class Root extends Action<Props, State> {
      static getDerivedStateFromError(error: Error): Partial<State> {
            return { error }
      }
      componentDidMount(): void {
            super.componentDidMount()
            Action.flush()
      }

      render(): React.ReactNode {
            return (
                  <View>
                        {this.props.children}
                  </View>
            )
      }
}

// const style = setStyle({
//       backgroundColor: "white"
// })