// import { setStyle } from "front/common/style"
// import { CLIENT_SETTINGS } from "front/@lib/util"
import { composeStyle, inputSt, mainButtonTextStyle, pageSt, rightButtonSt, setStyle, slimPageSt, slimThreshold, widePageSt, contentFontSize, writeColor, whiteSt, submitButtonTextSt, fontBlackSt, slimerPageSt, slimerThreshold, lightWriteColor, lightGray } from "front/@lib/style"
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
            if ((this.previousWidth > slimThreshold && window.innerWidth <= slimThreshold) || (this.previousWidth < slimThreshold && window.innerWidth >= slimThreshold)
                  || (this.previousWidth > slimerThreshold && window.innerWidth <= slimerThreshold) || (this.previousWidth < slimerThreshold && window.innerWidth >= slimerThreshold)) {
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
                  if (PROPS.data.ext) gtag_report_conversion() // google ads 추적 함수 // index.html 참고
                  this.setState({ contentText: "", hashTag: "#" }, () => {
                        Action.trigger("page", Page.boardList)
                        Action.trigger("tagReload")
                        Action.trigger("boardListReload")
                  })
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
                  <View style={[update ? updateWrapperSt : writeWrapperSt, whiteSt, update ? (slimer ? slimerPageSt : slim ? slimPageSt : widePageSt) : null]}>
                        <TextInput style={[updateInputSt, update ? null : writeInputSt, focusedSt]} autoFocus multiline numberOfLines={3} maxLength={MAX_CONTENTS_LEN} onChangeText={this.onChangeContentText} value={contentText} />
                        <Pressable style={[hashTagSt, focusedSt]}>
                              <Text style={hashTagTextSt}> hash tag </Text>
                              <TextInput style={inputHashTagSt} onChangeText={this.onChangeHashTagText} value={hashTag} maxLength={MAX_TAG_LEN * MAX_TAG_CNT} />
                        </Pressable>
                        <View style={[buttonsForWritePageSt]}>
                              {update ? <Pressable style={rightButtonSt} onPress={this.handlePressCancel} >
                                    <Text style={[mainButtonTextStyle, biggerFontSt, fontBlackSt]}> cancel</Text>
                              </Pressable> : null}
                              <Pressable style={[rightButtonSt, update ? null : writeWriteButtonSt]} onPress={update ? this.handlePressBoardUpdate : this.handlePressWrite} >
                                    <Text style={[mainButtonTextStyle, biggerFontSt, submitButtonTextSt]}> {update ? "update" : "write"}</Text>
                              </Pressable>
                        </View>
                  </View>
            )
      }
}
const writeWriteButtonSt = setStyle({
      marginLeft: "0"
})
const updateWrapperSt = composeStyle(
      pageSt,
      {
            padding: "5px",
      }
)
const writeWrapperSt = setStyle({
      padding: "5px",
      width: "100%",
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      borderBottomColor: lightGray
})
const updateInputSt = setStyle({
      fontSize: contentFontSize,
      outlineStyle: "none",
      height: "250px",
      borderRadius: "10px",
      padding: "15px"
})
const writeInputSt = setStyle({
      height: "80px"
})
const hashTagSt = setStyle({
      height: "40px",
      borderRadius: "10px",
      marginTop: "5px"
})
const focusedSt = setStyle({
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: lightWriteColor,
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
      marginTop: "5px",
      display: "block"
})
const biggerFontSt = setStyle({
      fontSize: contentFontSize
})