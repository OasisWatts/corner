import Action from "front/reactCom"
import React from "react"
import { View, Text, Pressable, TextInput, Image } from "reactNative"
import { blockSt, buttonSetSt, composeStyle, contentsSt, itemSt, mainButtonTextStyle, rightButtonSt, profileSt, numSt, upButtonSt, dateSt, writerSt, hoveredUp, importantImageSt, followImgSt, followButtonSt, profileImgSt, whiteSt, almostWhiteSt, submitButtonTextSt, contentFontSizeSt, fontBlackSt, inlineBlockSt, updatedSt } from "front/@lib/style"
import { buttonsForWriteBoxSt, inputForWriteBoxSt, marginRightButtonSt, upColorSt, wrapForWriteBoxSt } from "./board"
import { getHumanNumber, getHumanTimeDistance } from "front/@lib/Language"
import { CLIENT_SETTINGS, PROPS } from "front/@lib/util"
import { } from "./write"

const MAX_CONTENTS_LEN = CLIENT_SETTINGS.board.contentsLen

type State = {
      updateToggle: boolean
      text: string
      focusedArea: boolean
      up: number
      uped: boolean
      writerFollowed: boolean
      hoverUp: boolean
      hoverFollow: boolean
}
type Props = {
      item: commentType
      boardId: number
}
export class CommentItem extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
            const { item } = this.props
            this.state = {
                  updateToggle: false,
                  text: "",
                  focusedArea: false,
                  up: item.up,
                  uped: item.uped,
                  writerFollowed: item.writerFollowed,
                  hoverUp: false,
                  hoverFollow: false
            }
      }

      protected ACTION_RECEIVER_TABLE: any = {
            followReload: (followedId, followed) => {
                  const { item } = this.props
                  if (followedId === item.writerId) {
                        if (followed) this.setState({ writerFollowed: true })
                        else this.setState({ writerFollowed: false })
                  }
            }
      }

      private onChangeComment = (text) => {
            this.setState({ text })
      }
      private handlePressCommentUpdate = () => {
            const { item, boardId } = this.props
            const { text } = this.state
            fetch("/commentUpdate?cid=" + item.id + "&bid=" + boardId, {
                  method: "POST",
                  headers: {
                        "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ c: text })
            }).then(() => {
                  Action.trigger("boardReload")
                  this.setState({ updateToggle: false })
            })
      }
      private handlePressDelete = () => {
            const { item, boardId } = this.props
            fetch("/commentDelete?cid=" + item.id + "&bid=" + boardId).then((res) => {
                  Action.trigger("deleteCommentItem", item.id)
            })
      }
      private handlePressEdit = () => {
            const { item } = this.props
            this.setState({ updateToggle: true, text: item.contents })
      }
      private handlePressCancel = () => {
            this.setState({ updateToggle: false })
      }
      private handlePressUp = () => {
            const { item } = this.props
            const { up } = this.state
            if (item.writer !== PROPS.data.name) fetch("/commentUp?id=" + item.id).then((r) => r.json()).then((o) => {
                  this.setState({ up: o.uped ? up + 1 : up - 1, uped: o.uped })
            })
      }
      private handlePressFollow = () => {
            const { item } = this.props
            if (item.writer !== PROPS.data.name) fetch("/follow?id=" + item.writerId).then((r) => r.json()).then((o) => {
                  this.setState({ writerFollowed: o.followed }, () => Action.trigger("followReload", item.writerId, o.followed))
            })
      }
      private handleHoverInUp = () => {
            const { item } = this.props
            if (item.writer !== PROPS.data.name) this.setState({ hoverUp: true })
      }
      private handleHoverOutUp = () => {
            this.setState({ hoverUp: false })
      }
      private handleHoverInFollow = () => {
            const { item } = this.props
            if (item.writer !== PROPS.data.name) this.setState({ hoverFollow: true })
      }
      private handleHoverOutFollow = () => {
            this.setState({ hoverFollow: false })
      }
      private handleFocusTextArea = () => {
            this.setState({ focusedArea: true })
      }
      private handleBlurTextArea = () => {
            this.setState({ focusedArea: false })
      }

      render(): React.ReactNode {
            const { item } = this.props
            const { updateToggle, text, focusedArea, hoverUp, hoverFollow, writerFollowed, up, uped } = this.state
            if (updateToggle) {
                  return (
                        <Pressable style={[wrapForWriteBoxSt, almostWhiteSt, focusedArea ? whiteSt : null]} onFocus={this.handleFocusTextArea} onBlur={this.handleBlurTextArea} >
                              <TextInput style={inputForWriteBoxSt} multiline numberOfLines={3} maxLength={MAX_CONTENTS_LEN} onChangeText={this.onChangeComment} value={text} />
                              <View style={buttonsForWriteBoxSt}>
                                    <Pressable style={rightButtonSt} onPress={this.handlePressCancel} >
                                          <Text style={[mainButtonTextStyle, fontBlackSt]}>cancel</Text>
                                    </Pressable>
                                    <Pressable style={rightButtonSt} onPress={this.handlePressCommentUpdate} >
                                          <Text style={[mainButtonTextStyle, submitButtonTextSt]}>update</Text>
                                    </Pressable>
                              </View>
                        </Pressable>
                  )
            } else {
                  return (
                        <View style={[commentItemSt, whiteSt]}>
                              <View style={profileSt}>
                                    <Image style={profileImgSt} source={{ uri: CLIENT_SETTINGS.host + "/profiles/" + item.writerImage }} />
                                    {item.writer === PROPS.data.name ? null : <Pressable style={[followButtonSt, hoverFollow ? hoveredUp : null]} onPress={this.handlePressFollow} onHoverIn={this.handleHoverInFollow} onHoverOut={this.handleHoverOutFollow} >
                                          <Image style={followImgSt} source={{ uri: CLIENT_SETTINGS.host + "/images/" + (hoverFollow || writerFollowed ? "heartPink.svg" : "heartGray.svg") }} />
                                    </Pressable>}
                              </View>
                              <View style={contentsSt}>
                                    <View style={blockSt}>
                                          <Text style={writerSt}>{item.writer}</Text>
                                          <Text style={dateSt}>{getHumanTimeDistance(Date.parse(item.date), Date.now())}</Text>
                                          {item.writer === PROPS.data.name ?
                                                <Pressable style={[updatedSt, inlineBlockSt]} onPress={this.handlePressDelete} >
                                                      <Text style={mainButtonTextStyle}>delete</Text>
                                                </Pressable>
                                                : null}
                                          {item.writer === PROPS.data.name ?
                                                <Pressable style={[updatedSt, inlineBlockSt]} onPress={this.handlePressEdit}  >
                                                      <Text style={[mainButtonTextStyle, marginRightButtonSt]}>edit</Text>
                                                </Pressable>
                                                : null}
                                    </View>
                                    <Text style={contentFontSizeSt}>{item.contents}</Text>
                                    <View style={buttonSetSt}>
                                          <Pressable style={[upButtonSt, hoverUp ? hoveredUp : null]} onPress={this.handlePressUp} onHoverIn={this.handleHoverInUp} onHoverOut={this.handleHoverOutUp} >
                                                <Image style={importantImageSt} source={{ uri: CLIENT_SETTINGS.host + "/images/" + (hoverUp || uped ? "upPink.svg" : "upGray.svg") }} />
                                          </Pressable>
                                          <Text style={[numSt, hoverUp ? upColorSt : null]}>{getHumanNumber(up)}</Text>
                                    </View>
                              </View>
                        </View >
                  )
            }
      }
}
const commentItemSt = composeStyle(
      itemSt,
      {
            marginLeft: "40px"
      }
)