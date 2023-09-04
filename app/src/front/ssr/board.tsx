// import { setStyle } from "front/common/style"
import Action from "front/reactCom"
import React from "react"
import { View, Text, Image, Pressable, FlatList, TextInput } from "reactNative"
import { CommentItem } from "./commentItem"
import { blockSt, composeStyle, contentsSt, upButtonSt, mainButtonTextStyle, rightButtonSt, profileSt, setStyle, pageSt, buttonSetSt, tWhite, tDeepGray, importantButtonTextStyle, slimPageSt, widePageSt, slimThreshold, dateSt, writerSt, numSt, numSt1, commentButtonSt, hoveredUp, hoveredComment, importantImageSt, profileImgSt, followImgSt, followButtonSt, tWriteColor, tUpColor, tLightGray, lightGray, writeColor, upColor, updatedSt, rightButtonSetSt, inputSt, whiteSt, almostWhiteSt, submitButtonTextSt, mainFontSizeSt, contentFontSize, contentFontSizeSt } from "front/@lib/style"
import { BoardItem } from "./boardItem"
import { boardPage } from "."
import { CLIENT_SETTINGS, PROPS, extension, fullStyle, userKey } from "front/@lib/util"
import Bind from "front/reactRoot"
import { getHumanNumber, getHumanTimeDistance } from "front/@lib/Language"
import { } from "./write"
// import { CLIENT_SETTINGS } from "front/@lib/util"

const MAX_CONTENTS_LEN = 100// CLIENT_SETTINGS.board.contentsLen
const HOST = ""// CLIENT_SETTINGS.host

type State = {
      commentStartId: number
      comments: commentType[]
      commentText: string
      focusedArea: boolean
      endOfList: boolean
      id: number
      writer: string
      writerId: number
      writerImage: string
      writerFollowed: boolean
      date: string
      updated: boolean
      up: number
      numComment: number
      uped: boolean
      contents: string
      tags: string[]
      hoverUp: boolean
      hoverComment: boolean
      hoverFollow: boolean
}
type Props = {
      boardId: number
}
export class Board extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
            this.state = {
                  commentStartId: 0,
                  comments: [],
                  commentText: "",
                  focusedArea: false,
                  endOfList: false,
                  id: -1,
                  writer: "",
                  writerId: -1,
                  writerImage: "",
                  writerFollowed: false,
                  date: "",
                  updated: false,
                  up: 0,
                  numComment: 0,
                  uped: false,
                  contents: "",
                  tags: [],
                  hoverUp: false,
                  hoverComment: false,
                  hoverFollow: false
            }
      }

      protected ACTION_RECEIVER_TABLE: any = {
            deleteCommentItem: (commentId: number) => {
                  const { comments, numComment } = this.state
                  const newComments = comments.filter((c) => c.id !== commentId)
                  this.setState({ comments: newComments, numComment: numComment - 1 })
            },
            boardReload: () => {
                  this.getBoard()
            },
            followReload: (followedId, followed) => {
                  const { writerId } = this.state
                  if (followedId === writerId) {
                        if (followed) this.setState({ writerFollowed: true })
                        else this.setState({ writerFollowed: false })
                  }
            }
      }
      componentDidMount(): void {
            super.componentDidMount()
            this.getBoard()
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
      private onChangeComment = (text) => {
            this.setState({ commentText: text })
      }
      private handlePressCommentWrite = () => {
            const { commentText, id } = this.state
            fetch("/commentInsert?bid=" + id, {
                  method: "POST",
                  headers: {
                        "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ c: commentText })
            }).then(() => {
                  this.getBoard()
            })
      }
      private handlePressDelete = () => {
            const { id } = this.state
            fetch("/boardDelete?id=" + id).then(() => {
                  Action.trigger("page", boardPage.boardList)
            })
      }
      private handlePressUpdate = () => {
            const { id } = this.state
            Action.trigger("pageBoardUpdate", id)
      }
      private handlePressUp = () => {
            const { id, up } = this.state
            fetch("/boardUp?id=" + id).then((r) => r.json()).then((o) => {
                  this.setState({ up: o.uped ? up + 1 : up - 1, uped: o.uped })
            })
      }
      private getComments = () => {
            const { commentStartId, comments, endOfList, id } = this.state
            if (endOfList) return
            fetch("/comments?id=" + id + "&startId=" + commentStartId)
                  .then(r => r.json())
                  .then((o) => {
                        if (o.end) this.setState({ endOfList: true })
                        else this.setState({
                              comments: comments.concat(o.comments),
                              commentStartId: o.endId
                        })
                  })
      }
      private handleLoadMore = () => {
            this.getComments()
      }
      private renderItem = ({ item }) => {
            const { id } = this.state
            return <CommentItem item={item} boardId={id} />
      }
      private getBoard = () => {
            const { boardId } = this.props
            fetch("/board/" + String(boardId)).then((r) => r.json()).then((res) => {
                  console.log("res board", res)
                  this.setState({
                        id: res.id,
                        writer: res.writer,
                        writerId: res.writerId,
                        writerImage: res.writerImage,
                        date: res.date,
                        updated: res.updated,
                        up: res.up,
                        numComment: res.numCom,
                        uped: res.uped,
                        contents: res.contents,
                        comments: res.comments,
                        tags: res.tags
                  })
            })
      }
      private handlePressFollow = () => {
            const { writerId } = this.state
            fetch("/follow?id=" + writerId).then((r) => r.json()).then((o) => {
                  this.setState({ writerFollowed: o.followed }, () => Action.trigger("followReload", writerId, o.followed))
            })
      }
      private handleHoverInUp = () => {
            this.setState({ hoverUp: true })
      }
      private handleHoverOutUp = () => {
            this.setState({ hoverUp: false })
      }
      private handlePressCommentCancel = () => {
            this.setState({ commentText: "" })
      }
      private handleHoverInFollow = () => {
            this.setState({ hoverFollow: true })
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
            const { commentText, focusedArea, writerImage, up, uped, updated, writer, writerId, writerFollowed, date, numComment, contents, comments, tags, hoverUp, hoverComment, hoverFollow } = this.state
            const slim = window.innerWidth < slimThreshold
            return (
                  <View style={[pageSt, slim ? slimPageSt : widePageSt]}>
                        <View style={[boardWrapSt, whiteSt]}>
                              <View style={profileSt}>
                                    <Image style={profileImgSt} source={{ uri: CLIENT_SETTINGS.host + "/profiles/" + writerImage }} />
                                    {writerId === userKey ? null : <Pressable style={[followButtonSt, hoverFollow ? hoveredUp : null]} onPress={this.handlePressFollow} onHoverIn={this.handleHoverInFollow} onHoverOut={this.handleHoverOutFollow} >
                                          <Image style={followImgSt} source={{ uri: CLIENT_SETTINGS.host + "/images/" + (hoverFollow || writerFollowed ? "heartPink.svg" : "heartGray.svg") }} />
                                    </Pressable>}
                              </View>
                              <View style={contentsSt}>
                                    <View style={blockSt}>
                                          <Text style={writerSt}>{writer}</Text>
                                          <Text style={dateSt}>{getHumanTimeDistance(Date.parse(date), Date.now())}</Text>
                                          {updated ? <Text style={updatedSt}>updated</Text> : null}
                                    </View>
                                    <Text style={contentFontSizeSt}>{contents}</Text>
                                    <Text style={[tagSt, contentFontSizeSt]}>{"#" + tags.join(" #")}</Text>
                                    <View style={[buttonSetSt, boardButtonSetSt]}>
                                          <Pressable style={[upButtonSt, hoverUp ? hoveredUp : null]} onPress={this.handlePressUp} onHoverIn={this.handleHoverInUp} onHoverOut={this.handleHoverOutUp}>
                                                <Image style={importantImageSt} source={{ uri: CLIENT_SETTINGS.host + "/images/" + (hoverUp || uped ? "upPink.svg" : "upGray.svg") }} />
                                          </Pressable>
                                          <Text style={[numSt, hoverUp ? upColorSt : null]}>{getHumanNumber(up)}</Text>
                                          <View style={commentButtonSt} >
                                                <Image style={importantImageSt} source={{ uri: CLIENT_SETTINGS.host + "/images/commentGray.svg" }} />
                                          </View>
                                          <Text style={numSt1}>{getHumanNumber(numComment)}</Text>
                                          {writerId === userKey ? <View style={rightButtonSetSt}>
                                                <Pressable style={rightButtonSt} onPress={this.handlePressDelete} >
                                                      <Text style={mainButtonTextStyle}>delete</Text>
                                                </Pressable>
                                                <Pressable style={rightButtonSt} onPress={this.handlePressUpdate}  >
                                                      <Text style={mainButtonTextStyle}>update</Text>
                                                </Pressable>
                                          </View>
                                                : null}
                                    </View>
                              </View>
                        </View>
                        <Pressable style={[wrapForWriteBoxSt, fullStyle ? almostWhiteSt : null, (focusedArea && !fullStyle) ? whiteSt : null]} onHoverIn={this.handleFocusTextArea} onHoverOut={this.handleBlurTextArea} >
                              <TextInput style={inputForWriteBoxSt} multiline numberOfLines={3} maxLength={MAX_CONTENTS_LEN} onChangeText={this.onChangeComment} value={commentText} />
                              <View style={buttonsForWriteBoxSt}>
                                    <Pressable style={rightButtonSt} onPress={this.handlePressCommentCancel} >
                                          <Text style={mainButtonTextStyle}> clear</Text>
                                    </Pressable>
                                    <Pressable style={rightButtonSt} onPress={this.handlePressCommentWrite} >
                                          <Text style={[mainButtonTextStyle, submitButtonTextSt, marginRightButtonSt]}>comment</Text>
                                    </Pressable>
                              </View>
                        </Pressable>
                        <FlatList
                              data={comments}
                              renderItem={this.renderItem}
                              keyExtractor={(item: any) => item.id}
                              onEndReached={this.handleLoadMore}
                              onEndReachedThreshold={1} />
                  </View >
            )
      }
}
export const upColorSt = setStyle({
      color: upColor
})
const boardButtonSetSt = setStyle({
      marginTop: "20px"
})
export const wrapForWriteBoxSt = setStyle({
      width: "100%",
      position: "relative",
      height: "110px",
      borderBottomColor: lightGray,
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      backgroundColor: tWhite
})
export const inputForWriteBoxSt = composeStyle(
      inputSt,
      {
            height: "calc(100% - 35px)",
            width: "100%",
      }
)
export const buttonsForWriteBoxSt = setStyle({
      position: "absolute",
      top: "80px",
      right: "0",
      display: "block"
})
const boardWrapSt = setStyle({
      background: tWhite,
      display: "block",
      paddingTop: "10px",
      paddingBottom: "10px",
      borderBottomColor: lightGray,
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      borderTopLeftRadius: "20px",
      borderTopRightRadius: "20px"
})
const tagSt = setStyle({
      display: "block",
      marginTop: "10px"
})
export const marginRightButtonSt = setStyle({
      marginRight: "10px"
})