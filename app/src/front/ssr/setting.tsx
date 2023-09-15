
import { getAuth, signOut } from "firebase/auth"
import Action from "front/reactCom"
import React from "react"
import { Pressable, Text, View } from "reactNative"
import { Page } from "."
import { pageSt, setStyle, slimPageSt, slimThreshold, whiteSt, widePageSt } from "front/@lib/style"
import { fullStyle } from "front/@lib/util"


export default class Setting extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
      }
      componentDidMount(): void {
            super.componentDidMount()
            window.addEventListener("resize", this.resize)
      }
      componentWillUnmount() {
            super.componentWillUnmount()
            window.removeEventListener("resize", this.resize)
      }
      private previousWidth: number = window.innerWidth
      private resize = () => {
            if ((this.previousWidth > slimThreshold && window.innerWidth <= slimThreshold) || (this.previousWidth < slimThreshold && window.innerWidth >= slimThreshold)) {
                  this.forceUpdate()
            } this.previousWidth = window.innerWidth
      }

      private signOut = () => {
            const auth = getAuth()
            signOut(auth).then(() => fetch("/signout").then((r) => r.json()).then((o) => {
                  console.log("s o a", o)
                  if (o.signedOut) Action.trigger("page", Page.boardList)
            })).catch((err) => console.log("sign out error", err))
      }

      render(): React.ReactNode {
            const slim = window.innerWidth < slimThreshold
            return (
                  <View style={[pageSt, fullStyle ? whiteSt : null, slim ? slimPageSt : widePageSt]}>
                        <Pressable style={buttonSt} onPress={this.signOut}>
                              <Text>Sign out</Text>
                        </Pressable>
                  </View>
            )
      }
}
const buttonSt = setStyle({
      width: "350px",
      height: "60px",
      backgroundColor: "white",
      display: "inline-block",
      borderRadius: "35px",
      marginBottom: "10px",
      marginTop: "500px"
})