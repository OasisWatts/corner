import { lightGray, setStyle, slimThreshold, slimThresholdSize, slimThresholdExceptSize } from "front/@lib/style"
import Action from "front/reactCom"
import React from "react"
import { Image, Pressable, View } from "reactNative"
import { Tags } from "./tags"
import { CLIENT_SETTINGS, PROPS } from "front/@lib/util"
import { Page } from "../ssr"
import Search from "./search"

type State = {
      hoverWrite: boolean
}
type Props = {
      page: Page
}

export default class Header extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
            this.state = {
                  hoverWrite: false
            }
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
      private handlePressIcon = () => {
            Action.trigger("page", Page.boardList, () => {
                  if (PROPS.data.ext) {
                        console.log("boardlisttag url")
                        Action.trigger("boardListTag", PROPS.data.url, true)
                  } else Action.trigger("boardListTag", "전체")
                  Action.trigger("boardList")
            })
            Action.trigger("followListTag", null)
      }
      render(): React.ReactNode {
            const slim = window.innerWidth < slimThreshold
            return (
                  <View style={[headerSt, slim ? slimHeaderSt : null, fullSt]}>
                        <Pressable onPress={this.handlePressIcon} style={[iconSt, slim ? slimIconSt : null]} >
                              <Image style={[iconImgSt, slim ? imgSt : null]} source={{ uri: CLIENT_SETTINGS.host + (slim ? "/images/cornerIcon.png" : "/images/cornerIconLong.png") }} />
                        </Pressable>
                        <Search />
                  </View>
            )
      }
}

const headerSt = setStyle({
      position: "fixed",
      height: "50px",
      width: slimThresholdSize,
      top: "0",
      left: slimThresholdExceptSize,
      zIndex: "100",
      backgroundColor: "transparent"
})
const slimHeaderSt = setStyle({
      width: "100%",
      left: "0"
})
const fullSt = setStyle({
      backgroundColor: "white",
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      borderBottomColor: lightGray
})
const iconSt = setStyle({
      position: "absolute",
      top: "10px",
      left: "50px"
})
const slimIconSt = setStyle({
      left: "10px"
})
const iconImgSt = setStyle({
      width: "90px",
      height: "30px"
})
const imgSt = setStyle({
      height: "30px",
      width: "30px"
})