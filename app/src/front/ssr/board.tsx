import Action from "front/reactCom"
import React from "react"
import { View, Text, Image, Pressable, FlatList, TextInput, Linking } from "reactNative"
import { CommentItem } from "./commentItem"
import { blockSt, composeStyle, contentsSt, upButtonSt, mainButtonTextStyle, rightButtonSt, profileSt, setStyle, pageSt, buttonSetSt, slimPageSt, widePageSt, slimThreshold, dateSt, writerSt, numSt, numSt1, commentButtonSt, hoveredUp, importantImageSt, profileImgSt, followImgSt, followButtonSt, lightGray, upColor, updatedSt, inputSt, whiteSt, almostWhiteSt, submitButtonTextSt, contentFontSizeSt, fontBlackSt, inlineBlockSt, slimerThreshold, slimerPageSt, mainButtonStyle } from "front/@lib/style"
import { Page } from "."
import { CLIENT_SETTINGS, PROPS } from "front/@lib/util"
import { getHumanNumber, getHumanTimeDistance } from "front/@lib/Language"
import { } from "./write"
import { BOARD_CATEGORY } from "common/applicationCode"

const MAX_CONTENTS_LEN = CLIENT_SETTINGS.board.contentsLen

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
      url: string | null
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
            if (PROPS.data.boardAccess) {
                  const { id, writer, writerId, writerImage, writerFollowed, contents, date, up, numComment, uped, updated, comments, tags, url } = PROPS.data.board
                  this.state = {
                        commentStartId: comments.length ? comments[comments.length - 1]?.id : -1,
                        comments,
                        commentText: "",
                        focusedArea: false,
                        endOfList: false,
                        id,
                        writer,
                        writerId,
                        writerImage,
                        writerFollowed,
                        date,
                        updated,
                        up,
                        numComment,
                        uped,
                        contents,
                        tags,
                        url,
                        hoverUp: false,
                        hoverComment: false,
                        hoverFollow: false
                  }
                  // PROPS.data.boardAccess = false
            } else {
                  this.state = {
                        commentStartId: 0,
                        comments: [],
                        commentText: "",
                        focusedArea: false,
                        endOfList: false,
                        id: this.props.boardId,
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
                        url: null,
                        hoverUp: false,
                        hoverComment: false,
                        hoverFollow: false
                  }
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
            if (!PROPS.data.boardAccess) {
                  this.getBoard()
            }
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
                  Action.trigger("page", Page.boardList)
            })
      }
      private handlePressUpdate = () => {
            const { id } = this.state
            Action.trigger("pageBoardUpdate", id)
      }
      private handlePressUp = () => {
            const { id, up, writer } = this.state
            if (writer !== PROPS.data.writer) fetch("/boardUp?id=" + id).then((r) => r.json()).then((o) => {
                  this.setState({ up: o.uped ? up + 1 : up - 1, uped: o.uped })
            })
      }
      private handlePressBackButton = () => {
            Action.trigger("page", Page.boardList)
      }
      private getComments = () => {
            const { commentStartId, comments, endOfList, id } = this.state
            if (endOfList) return
            fetch("/comments?id=" + id + "&startId=" + commentStartId)
                  .then(r => r.json())
                  .then((o) => {
                        this.setState({
                              comments: comments.concat(o.comments),
                              commentStartId: o.endId,
                              endOfList: o.end ? true : false
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
            const { id } = this.state
            fetch("/boardload?id=" + String(id)).then((r) => r.json()).then((res) => {
                  this.setState({
                        id: res.id,
                        writer: res.writer,
                        writerId: res.writerId,
                        writerImage: res.writerImage,
                        writerFollowed: res.writerFollowed,
                        date: res.date,
                        updated: res.updated,
                        up: res.up,
                        numComment: res.numComment,
                        uped: res.uped,
                        contents: res.contents,
                        comments: res.comments,
                        commentStartId: res.endId,
                        endOfList: res.end ? true : false,
                        tags: res.tags,
                        url: res.url,
                        commentText: ""
                  })
            })
      }
      private handlePressFollow = () => {
            const { writerId, writer } = this.state
            if (writer !== PROPS.data.name) fetch("/follow?id=" + writerId).then((r) => r.json()).then((o) => {
                  gtag_report_conversion() // google ads 추적 함수 // index.html 참고
                  this.setState({ writerFollowed: o.followed }, () => Action.trigger("followReload", writerId, o.followed))
            })
      }
      private handleHoverInUp = () => {
            const { writer } = this.state
            if (writer !== PROPS.data.name) this.setState({ hoverUp: true })
      }
      private handleHoverOutUp = () => {
            this.setState({ hoverUp: false })
      }
      private handlePressCommentCancel = () => {
            this.setState({ commentText: "" })
      }
      private handleHoverInFollow = () => {
            const { writer } = this.state
            if (writer !== PROPS.data.name) this.setState({ hoverFollow: true })
      }
      private handleHoverOutFollow = () => {
            this.setState({ hoverFollow: false })
      }
      private pressURL = () => {
            const { url } = this.state
            if (url) Linking.openURL(url)
      }
      private renderHeader = () => {
            const { commentText, writerImage, up, uped, updated, writer, writerFollowed, date, numComment, contents, tags, hoverUp, hoverFollow, url } = this.state

            return (
                  <View>
                        <View style={[boardWrapSt, whiteSt]}>
                              <View style={profileSt}>
                                    <Image style={profileImgSt} source={{ uri: CLIENT_SETTINGS.host + "/profiles/" + writerImage }} />
                                    {writer === PROPS.data.name ? null : <Pressable style={[followButtonSt, hoverFollow ? hoveredUp : null]} onPress={this.handlePressFollow} onHoverIn={this.handleHoverInFollow} onHoverOut={this.handleHoverOutFollow} >
                                          <Image style={followImgSt} source={{ uri: CLIENT_SETTINGS.host + "/images/" + (hoverFollow || writerFollowed ? "heartPink.svg" : "heartGray.svg") }} />
                                    </Pressable>}
                              </View>
                              <View style={contentsSt}>
                                    <View style={blockSt}>
                                          <Text style={writerSt}>{writer}</Text>
                                          <Text style={dateSt}>{getHumanTimeDistance(Date.parse(date), Date.now())}</Text>
                                          {updated ? <Text style={updatedSt}>updated</Text> : null}
                                          {writer === PROPS.data.name ?
                                                <Pressable style={[updatedSt, inlineBlockSt]} onPress={this.handlePressDelete} >
                                                      <Text style={mainButtonTextStyle}>delete</Text>
                                                </Pressable>
                                                : null}
                                          {writer === PROPS.data.name ?
                                                <Pressable style={[updatedSt, inlineBlockSt]} onPress={this.handlePressUpdate}  >
                                                      <Text style={mainButtonTextStyle}>edit</Text>
                                                </Pressable>
                                                : null}
                                    </View>
                                    <Text style={contentFontSizeSt}>{contents}</Text>
                                    <Text style={[tagSt, contentFontSizeSt]}>{"#" + tags.join(" #")}</Text>
                                    {url ? <Text style={[tagSt, contentFontSizeSt, urlSt]} onPress={this.pressURL}>written place</Text> : null}
                                    <View style={[buttonSetSt, boardButtonSetSt]}>
                                          <Pressable style={[upButtonSt, hoverUp ? hoveredUp : null]} onPress={this.handlePressUp} onHoverIn={this.handleHoverInUp} onHoverOut={this.handleHoverOutUp}>
                                                <Image style={importantImageSt} source={{ uri: CLIENT_SETTINGS.host + "/images/" + (hoverUp || uped ? "upPink.svg" : "upGray.svg") }} />
                                          </Pressable>
                                          <Text style={[numSt, hoverUp ? upColorSt : null]}>{getHumanNumber(up)}</Text>
                                          <View style={commentButtonSt} >
                                                <Image style={importantImageSt} source={{ uri: CLIENT_SETTINGS.host + "/images/commentGray.svg" }} />
                                          </View>
                                          <Text style={numSt1}>{getHumanNumber(numComment)}</Text>
                                          <Pressable style={backButtonSt} onPress={this.handlePressBackButton}>
                                                <Text> go back </Text>
                                          </Pressable>
                                    </View>
                              </View>
                        </View>
                        <Pressable style={[wrapForWriteBoxSt, almostWhiteSt]}  >
                              <TextInput style={inputForWriteBoxSt} multiline numberOfLines={3} maxLength={MAX_CONTENTS_LEN} onChangeText={this.onChangeComment} value={commentText} />
                              <View style={buttonsForWriteBoxSt}>
                                    <Pressable style={rightButtonSt} onPress={this.handlePressCommentCancel} >
                                          <Text style={[mainButtonTextStyle, fontBlackSt]}> clear</Text>
                                    </Pressable>
                                    <Pressable style={rightButtonSt} onPress={this.handlePressCommentWrite} >
                                          <Text style={[mainButtonTextStyle, submitButtonTextSt, marginRightButtonSt]}>comment</Text>
                                    </Pressable>
                              </View>
                        </Pressable>
                  </View>
            )
      }
      render(): React.ReactNode {
            const slim = window.innerWidth < slimThreshold
            const slimer = window.innerWidth < slimerThreshold
            const { comments } = this.state
            return (
                  <View style={[pageSt, slimer ? slimerPageSt : slim ? slimPageSt : widePageSt]}>
                        <FlatList
                              ListHeaderComponent={this.renderHeader}
                              data={comments}
                              renderItem={this.renderItem}
                              keyExtractor={(item: any) => item.id}
                              onEndReached={this.handleLoadMore}
                              onEndReachedThreshold={0.5} />
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
      borderBottomStyle: "solid"
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
const urlSt = setStyle({
      textDecorationLine: "underline"
})
const backButtonSt = composeStyle(
      mainButtonStyle,
      {
            top: "-2.5px",
            left: "150px"
      }
)