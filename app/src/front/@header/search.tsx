
import { almostWhiteSt, contentFontSize, lightGray, lightGraySt, setStyle, slimThreshold, slimerThreshold, softGray, tWhite } from "front/@lib/style"
import { CLIENT_SETTINGS } from "front/@lib/util"
import Action from "front/reactCom"
import React from "react"
import { Image, Pressable, TextInput, View } from "reactNative"
import { tagsWrapperSt } from "./tags"
import { Page } from "front/ssr"

type State = {
      text: string
}

export default class Search extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
            this.state = {
                  text: ""
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
      private handleChangeText = (text) => {
            this.setState({ text })
      }
      private handleKeyPress = (e) => {
            if (e.nativeEvent.key == "Enter") this.search()
      }
      private search = () => {
            const { text } = this.state
            if (text.length > 0) {
                  Action.trigger("page", Page.boardList, () => Action.trigger("boardListSearch", text))
            }
      }
      render(): React.ReactNode {
            const { text } = this.state
            const slim = window.innerWidth < slimThreshold
            const slimer = window.innerWidth < slimerThreshold
            return (
                  <View style={[searchWrapSt, slimer ? slimerSearchWrapSt : slim ? slimSearchWrapSt : null]}>
                        <Image style={searchImageSt} source={{ uri: CLIENT_SETTINGS.host + "/images/search.svg" }} />
                        <TextInput style={[searchInputSt, almostWhiteSt]} onChangeText={this.handleChangeText} value={text} onKeyPress={this.handleKeyPress} />
                  </View>
            )
      }
}
const searchWrapSt = setStyle({
      display: "block",
      position: "absolute",
      top: "10px",
      left: "225px",
      width: "calc(100% - 225px)"
})
const slimerSearchWrapSt = setStyle({
      left: "90px",
      height: "30px",
      width: "calc(100% - 100px)"
})
const slimSearchWrapSt = setStyle({
      left: "100px",
      width: "calc(100% - 110px)"
})
const searchImageSt = setStyle({
      position: "absolute",
      left: "-30px",
      top: "5px",
      width: "20px",
      height: "20px"
})
const searchInputSt = setStyle({
      width: "100%",
      height: "30px",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: softGray,
      borderRadius: "15px",
      paddingLeft: "10px",
      fontSize: contentFontSize,
      backgroundColor: tWhite,
      outlineStyle: "none"
})