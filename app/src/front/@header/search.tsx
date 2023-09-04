
import { almostWhiteSt, contentFontSize, lightGray, lightGraySt, setStyle, slimThreshold, tWhite } from "front/@lib/style"
import { CLIENT_SETTINGS, fullStyle } from "front/@lib/util"
import Action from "front/reactCom"
import React from "react"
import { Image, Pressable, TextInput, View } from "reactNative"
import { slimTagsWrapperSt, tagsWrapperSt } from "./tags"

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
            if (text.length > 0) Action.trigger("boardListSearch", text)
      }
      private handlePressCancel = () => {
            this.setState({ text: "" }, () => {
                  Action.trigger("searchShow", false)
            })
      }
      render(): React.ReactNode {
            const { text } = this.state
            const slim = window.innerWidth < slimThreshold
            return (
                  <View style={[tagsWrapperSt, slim ? slimTagsWrapperSt : null]}>
                        <Image style={searchImageSt} source={{ uri: CLIENT_SETTINGS.host + "/images/search.svg" }} />
                        <TextInput style={[searchInputSt, fullStyle ? almostWhiteSt : null]} onChangeText={this.handleChangeText} value={text} onKeyPress={this.handleKeyPress} />
                        <Pressable onPress={this.handlePressCancel} style={cancelButtonSt} >
                              <Image style={imgSt} source={{ uri: CLIENT_SETTINGS.host + "/images/off.svg" }} />
                        </Pressable>
                  </View>
            )
      }
}
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
      borderColor: lightGray,
      borderRadius: "15px",
      paddingLeft: "10px",
      fontSize: contentFontSize,
      backgroundColor: tWhite,
      outlineStyle: "none"
})
const cancelButtonSt = setStyle({
      position: "absolute",
      right: "-30px",
      top: "5px"
})
const imgSt = setStyle({
      height: "20px",
      width: "20px"
})