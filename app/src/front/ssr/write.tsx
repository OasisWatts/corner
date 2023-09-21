// import { setStyle } from "front/common/style"
// import { CLIENT_SETTINGS } from "front/@lib/util"
import { composeStyle, inputSt, mainButtonTextStyle, pageSt, rightButtonSt, setStyle, slimPageSt, slimThreshold, widePageSt, contentFontSize, writeColor, whiteSt, submitButtonTextSt, fontBlackSt, slimerPageSt, slimerThreshold, tWriteColor } from "front/@lib/style"
import Action from "front/reactCom"
import React from "react"
import { View, TextInput, Pressable, Text } from "reactNative"
import { Page } from "."
import { CLIENT_SETTINGS, PROPS } from "front/@lib/util"

const MAX_CONTENTS_LEN = CLIENT_SETTINGS.board.contentsLen
const MAX_TAG_LEN = CLIENT_SETTINGS.board.tagLenLim
const MAX_TAG_CNT = CLIENT_SETTINGS.board.tagCountLim

type Props = {
      update: boolean,
      boardId: number | null
}
type State = {
      contentText: string
      hashTag: string
}
export class Write extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
            this.state = {
                  contentText: "",
                  hashTag: "#"
            }
      }

      protected ACTION_RECEIVER_TABLE: any = {
            writeReload: () => {
                  this.setState({ contentText: "", hashTag: "#" })
            }
      }

      componentDidMount(): void {
            const { update } = this.props
            super.componentDidMount()
            window.addEventListener("resize", this.resize)
            if (update) this.getBoard()
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
      private getBoard = () => {
            const { boardId } = this.props
            fetch("/boardload?id=" + String(boardId)).then((r) => r.json()).then((res) => {
                  this.setState({
                        contentText: res.contents,
                        hashTag: "#" + res.tags.join(" #")
                  })
            })
      }
      private onChangeContentText = (contentText) => {
            this.setState({ contentText })
      }
      private onChangeHashTagText = (hashTag) => {
            const { hashTag: prevTag } = this.state
            const last = hashTag[hashTag.length - 1]
            const prevLast = prevTag[prevTag.length - 1]
            const tmpTags = hashTag.split("#")
            if (tmpTags.length > MAX_TAG_CNT) return
            if (last === " " && prevLast !== "#") hashTag += "#"
            else if (tmpTags[tmpTags.length - 1].length > MAX_TAG_LEN) return
            if (hashTag.length === 0) hashTag = "#"
            this.setState({ hashTag })
      }
      private handlePressWrite = () => {
            const { contentText, hashTag } = this.state
            fetch("/boardInsert", {
                  method: "POST",
                  headers: {
                        "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ c: contentText, t: hashTag, u: (PROPS.data.ext ? PROPS.data.url : "") || "", h: (PROPS.data.ext ? PROPS.data.hostname : "") || "" })
            }).then(() => {
                  Action.trigger("page", Page.boardList)
                  Action.trigger("tagReload")
            })
      }
      private handlePressBoardUpdate = () => {
            const { boardId } = this.props
            const { contentText, hashTag } = this.state
            if (boardId) {
                  fetch("/boardUpdate?id=" + boardId, {
                        method: "POST",
                        headers: {
                              "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ c: contentText, t: hashTag })
                  }).then(() => {
                        Action.trigger("page", Page.boardList)
                        Action.trigger("tagReload")
                  })
            }
      }
      private handlePressCancel = () => {
            Action.trigger("page", Page.boardList)
      }

      render(): React.ReactNode {
            const { contentText, hashTag } = this.state
            const { update } = this.props
            const slim = window.innerWidth < slimThreshold
            const slimer = window.innerWidth < slimerThreshold

            return (
                  <View style={[pageSt, whiteSt, slimer ? slimerPageSt : slim ? slimPageSt : widePageSt]}>
                        <TextInput style={[inputForWritePageSt, focusedSt]} multiline numberOfLines={3} maxLength={MAX_CONTENTS_LEN} onChangeText={this.onChangeContentText} value={contentText} />
                        <Pressable style={[hashTagSt, focusedSt]}>
                              <Text style={hashTagTextSt}> hash tag </Text>
                              <TextInput style={inputHashTagSt} onChangeText={this.onChangeHashTagText} value={hashTag} maxLength={MAX_TAG_LEN * MAX_TAG_CNT} />
                        </Pressable>
                        <View style={[buttonsForWritePageSt, fullStyleButtonsForWritePageSt]}>
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
            width: "calc(100% - 10px)",
            left: "5px",
            top: "5px",
            borderRadius: "20px",
            paddingLeft: "20px",
            paddingRight: "20px",
            paddingTop: "20px",
            paddingBottom: "20px",
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
      width: "calc(100% - 10px)",
      left: "5px",
      borderRadius: "20px"
})
const focusedSt = setStyle({
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: tWriteColor,
      backgroundColor: "white"
})
const fullStyleHashTagSt = setStyle({
      width: "calc(100% - 40px)",
      top: "285px",
      left: "20px"
})
const hashTagTextSt = setStyle({
      position: "absolute",
      left: "15px",
      width: "80px",
      height: "40px",
      lineHeight: "40px",
      fontSize: contentFontSize,
      color: writeColor,
      pointer: "default"
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
      top: "350px",
      right: "20px"
})
const biggerFontSt = setStyle({
      fontSize: contentFontSize
})