// import { setStyle } from "front/common/style"
// import { CLIENT_SETTINGS } from "front/@lib/util"
import { buttonsForWriteBoxSt, buttonSetSt, composeStyle, inputForWriteBoxSt, inputSt, mainButtonStyle, mainButtonTextStyle, pageSt, rightButtonSt, pressableSt1, setStyle, slimPageSt, slimThreshold, tLightGray, tWhite, widePageSt, contentFontSize, almostWhite, tWriteColor, writeColor, whiteSt, almostWhiteSt, submitButtonTextSt, fontBlackSt } from "front/@lib/style"
import Action from "front/reactCom"
import React from "react"
import { View, TextInput, Pressable, Text } from "reactNative"
import { boardPage } from "."
import { wrapForWriteBoxSt } from "./board"
import { PROPS, extension, fullStyle } from "front/@lib/util"

const MAX_CONTENTS_LEN = 100// CLIENT_SETTINGS.board.contentsLen

type Props = {
      update: boolean,
      boardId: number | null
}
type State = {
      contentText: string
      focusedContentArea: boolean
      focusedTagArea: boolean
      hashTag: string
}
export class Write extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
            this.state = {
                  contentText: "",
                  focusedContentArea: false,
                  focusedTagArea: false,
                  hashTag: "#"
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
      private onChangeContentText = (contentText) => {
            this.setState({ contentText })
      }
      private onChangeHashTagText = (hashTag) => {
            const { hashTag: prevTag } = this.state
            const last = hashTag[hashTag.length - 1]
            const prevLast = prevTag[prevTag.length - 1]
            if (last === " " && prevLast !== "#") hashTag += "#"
            if (hashTag.length === 0) hashTag = "#"
            console.log("hashtag", hashTag, "pr", prevTag)
            this.setState({ hashTag })
      }
      private handlePressWrite = () => {
            const { contentText, hashTag } = this.state
            console.log("wr", JSON.stringify({ c: contentText }))
            fetch("/boardInsert", {
                  method: "POST",
                  headers: {
                        "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ c: contentText, t: hashTag, u: (PROPS.data.ext ? PROPS.data.url : "") || "", h: (PROPS.data.ext ? PROPS.data.hostname : "") || "" })
            }).then(() => Action.trigger("page", boardPage.boardList))
      }
      private handlePressBoardUpdate = () => {
            const { boardId } = this.props
            const { contentText } = this.state
            if (boardId) {
                  fetch("/boardUpdate?id=" + boardId, {
                        method: "POST",
                        headers: {
                              "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ c: contentText })
                  }).then(() => Action.trigger("page", boardPage.boardList))
            }
      }
      private handlePressCancel = () => {
            console.log("cancel")
            Action.trigger("page", boardPage.boardList)
      }
      private handleFocusContent = () => {
            this.setState({ focusedContentArea: true })
      }
      private handleBlurContent = () => {
            this.setState({ focusedContentArea: false })
      }
      private handleFocusTag = () => {
            this.setState({ focusedTagArea: true })
      }
      private handleBlurTag = () => {
            this.setState({ focusedTagArea: false })
      }

      render(): React.ReactNode {
            const { contentText, hashTag, focusedContentArea, focusedTagArea } = this.state
            const { update } = this.props
            const slim = window.innerWidth < slimThreshold
            return (
                  <View style={[pageSt, fullStyle ? whiteSt : null, slim ? slimPageSt : widePageSt]}>
                        <TextInput style={[inputForWritePageSt, fullStyle ? fullStyleInputForWritePageSt : null, fullStyle ? almostWhiteSt : (focusedContentArea ? whiteSt : null)]} multiline numberOfLines={3} maxLength={MAX_CONTENTS_LEN} onChangeText={this.onChangeContentText} value={contentText} onFocus={this.handleFocusContent} onBlur={this.handleBlurContent} />
                        <Pressable style={[hashTagSt, fullStyle ? fullStyleHashTagSt : null, fullStyle ? almostWhiteSt : (focusedTagArea ? whiteSt : null)]} onHoverIn={this.handleFocusTag} onHoverOut={this.handleBlurTag}>
                              <Text style={hashTagTextSt}> hash tag </Text>
                              <TextInput style={inputHashTagSt} onChangeText={this.onChangeHashTagText} value={hashTag} />
                        </Pressable>
                        <View style={[buttonsForWritePageSt, fullStyle ? fullStyleButtonsForWritePageSt : null]}>
                              <Pressable style={rightButtonSt} onPress={this.handlePressCancel} >
                                    <Text style={[mainButtonTextStyle, biggerFontSt, fontBlackSt]}> cancel</Text>
                              </Pressable>
                              <Pressable style={rightButtonSt} onPress={update ? this.handlePressBoardUpdate : this.handlePressWrite} >
                                    <Text style={[mainButtonTextStyle, biggerFontSt, submitButtonTextSt]}> {update ? "update" : "write"}</Text>
                              </Pressable>
                        </View>
                  </View>
            )
      }
}
const inputForWritePageSt = composeStyle(
      inputSt,
      {
            height: "250px",
            width: "100%",
            backgroundColor: tWhite,
            left: "0",
            borderRadius: "20px",
            paddingLeft: "20px",
            paddingRight: "20px",
            paddingTop: "20px",
            paddingBottom: "20px"
      }
)
const fullStyleInputForWritePageSt = setStyle({
      width: "calc(100% - 40px)",
      left: "20px",
      top: "20px"
})
const hashTagSt = setStyle({
      position: "absolute",
      top: "260px",
      height: "40px",
      width: "100%",
      backgroundColor: tWhite,
      borderRadius: "20px",
})
const fullStyleHashTagSt = setStyle({
      width: "calc(100% - 40px)",
      top: "300px",
      left: "20px"
})
const hashTagTextSt = setStyle({
      position: "absolute",
      left: "15px",
      width: "80px",
      height: "40px",
      lineHeight: "40px",
      fontSize: contentFontSize
})
const inputHashTagSt = setStyle({
      position: "absolute",
      fontSize: contentFontSize,
      outlineStyle: "none",
      height: "40px",
      lineHeight: "40px",
      width: "calc(100% - 150px)",
      left: "115px"
})
const buttonsForWritePageSt = setStyle({
      position: "absolute",
      top: "310px",
      right: "0",
      display: "block"
})
const fullStyleButtonsForWritePageSt = setStyle({
      top: "360px",
      right: "20px"
})
const biggerFontSt = setStyle({
      fontSize: contentFontSize
})