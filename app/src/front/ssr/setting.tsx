
import { getAuth, signOut } from "firebase/auth"
import Action from "front/reactCom"
import React from "react"
import { Pressable, Text, View } from "reactNative"
import { pageSt, setStyle, slimPageSt, slimThreshold, slimerPageSt, slimerThreshold, whiteSt, widePageSt } from "front/@lib/style"
import { buttonExSt, buttonSt, buttonTextSt, slimButtonSt, slimButtonTextSt, textSt } from "./landing"
import { Page } from "."


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
            if ((this.previousWidth > slimThreshold && window.innerWidth <= slimThreshold) || (this.previousWidth < slimThreshold && window.innerWidth >= slimThreshold)
                  || (this.previousWidth > slimerThreshold && window.innerWidth <= slimerThreshold) || (this.previousWidth < slimerThreshold && window.innerWidth >= slimerThreshold)) {
                  this.forceUpdate()
            } this.previousWidth = window.innerWidth
      }

      private signOut = () => {
            const auth = getAuth()
            signOut(auth).then(() => fetch("/signout").then((r) => r.json()).then((o) => {
                  if (o.signedOut) {
                        Action.trigger("landingOn")
                  }
            })).catch((err) => console.log("sign out error", err))
      }

      render(): React.ReactNode {
            const slim = window.innerWidth < slimThreshold
            const slimer = window.innerWidth < slimerThreshold
            return (
                  <View style={[pageSt, whiteSt, slimer ? slimerPageSt : slim ? slimPageSt : widePageSt, sidePanelSt]}>
                        <Text style={[textSt, topSt, buttonTextSt, slim ? slimButtonTextSt : null]}>Any feedback or request is welcome (businessoasis322@gmail.com)</Text>
                        <Pressable style={[buttonSt, topButtonSt, buttonExSt, slim ? slimButtonSt : null]} onPress={this.signOut}>
                              <Text style={[textSt, buttonTextSt, slim ? slimButtonTextSt : null]}>Sign Out</Text>
                        </Pressable>
                  </View>
            )
      }
}
const topSt = setStyle({
      marginTop: "100px"
})
const topButtonSt = setStyle({
      marginTop: "30px"
})
const sidePanelSt = setStyle({
      textAlign: "center",
      display: "inline-block"
})