// import { setStyle } from "front/common/style"
import Action from "front/reactCom"
import React from "react"
import { View, Text, Image, Pressable } from "reactNative"
import { blockSt, buttonSetSt, contentsSt, dateSt, followButtonSt, followImgSt, hoveredUp, upButtonSt, commentButtonSt, importantImageSt, inlineBlockSt, mainButtonTextStyle, numSt, numSt1, profileImgSt, profileSt, setStyle, updatedSt, writerSt, whiteSt, contentFontSizeSt, lightGray } from "front/@lib/style"
import { upColorSt } from "./board"
import { getHumanNumber, getHumanTimeDistance } from "front/@lib/Language"
import { CLIENT_SETTINGS, PROPS } from "front/@lib/util"

type State = {
      contents: string
      comments: commentType[]
      boardUpdateToggle: boolean
      text: string
      up: number
      uped: boolean
      writerFollowed: boolean
      hoverUp: boolean
      hoverItem: boolean
      hoverFollow: boolean
}
type Props = {
      item: boardType
}
export class BoardItem extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
            const { item } = this.props
            this.state = {
                  contents: "",
                  comments: [],
                  boardUpdateToggle: false,
                  text: "",
                  up: item.up,
                  uped: item.uped,
                  writerFollowed: item.writerFollowed,
                  hoverUp: false,
                  hoverItem: false,
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

      private handlePressDelete = () => {
            const { item } = this.props
            fetch("/boardDelete?id=" + item.id).then(() => {
                  Action.trigger("deleteBoardItem", item.id)
            })
      }
      private handlePressEdit = () => {
            const { item } = this.props
            Action.trigger("pageBoardUpdate", item.id)
      }
      private handlePressUp = () => {
            const { up } = this.state
            const { item } = this.props
            if (item.writer !== PROPS.data.name) fetch("/boardUp?id=" + item.id).then((r) => r.json()).then((o) => {
                  this.setState({ up: o.uped ? up + 1 : up - 1, uped: o.uped })
            })
      }
      private handlePressFollow = () => {
            const { item } = this.props
            if (item.writer !== PROPS.data.name) fetch("/follow?id=" + item.writerId).then((r) => r.json()).then((o) => {
                  this.setState({ writerFollowed: o.followed }, () => Action.trigger("followReload", item.writerId, o.followed))
            })
      }
      private loadBoard = (boardId: number) => {
            Action.trigger("pageBoard", boardId)
      }
      private handlePressBoard = () => {
            const { item } = this.props
            this.loadBoard(item.id)
      }
      private handleHoverInUp = () => {
            const { item } = this.props
            if (item.writer !== PROPS.data.name) this.setState({ hoverUp: true })
      }
      private handleHoverOutUp = () => {
            this.setState({ hoverUp: false })
      }
      private handleHoverInContent = () => {
            this.setState({ hoverItem: true })
      }
      private handleHoverOutContent = () => {
            this.setState({ hoverItem: false })
      }
      private handleHoverInFollow = () => {
            const { item } = this.props
            if (item.writer !== PROPS.data.name) this.setState({ hoverFollow: true })
      }
      private handleHoverOutFollow = () => {
            this.setState({ hoverFollow: false })
      }

      render(): React.ReactNode {
            const { up, uped, hoverUp, hoverItem, hoverFollow, writerFollowed } = this.state
            const { item } = this.props
            return (
                  <Pressable style={[boardItemSt, hoverItem ? whiteSt : null]} onPress={this.handlePressBoard} onHoverIn={this.handleHoverInContent} onHoverOut={this.handleHoverOutContent}>
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
                                    {item.updated ? <Text style={updatedSt}>updated</Text> : null}
                                    {item.writer === PROPS.data.name ?
                                          <Pressable style={[updatedSt, inlineBlockSt]} onPress={this.handlePressDelete} >
                                                <Text style={mainButtonTextStyle}> delete</Text>
                                          </Pressable> : null}
                                    {item.writer === PROPS.data.name ?
                                          <Pressable style={[updatedSt, inlineBlockSt]} onPress={this.handlePressEdit} >
                                                <Text style={mainButtonTextStyle}> edit</Text>
                                          </Pressable> : null}
                              </View>
                              <Text style={[contentFontSizeSt, contentSize]} numberOfLines={3}>{item.contents}</Text>
                              <View style={buttonSetSt}>
                                    <Pressable style={[upButtonSt, hoverUp ? hoveredUp : null]} onPress={this.handlePressUp} onHoverIn={this.handleHoverInUp} onHoverOut={this.handleHoverOutUp} >
                                          <Image style={importantImageSt} source={{ uri: CLIENT_SETTINGS.host + "/images/" + (hoverUp || uped ? "upPink.svg" : "upGray.svg") }} />
                                    </Pressable>
                                    <Text style={[numSt, hoverUp ? upColorSt : null]}>{getHumanNumber(up)}</Text>
                                    <View style={commentButtonSt}  >
                                          <Image style={importantImageSt} source={{ uri: CLIENT_SETTINGS.host + "/images/commentGray.svg" }} />
                                    </View>
                                    <Text style={numSt1}>{getHumanNumber(item.numComment)}</Text>
                              </View>
                        </View>
                  </Pressable>
            )
      }
}
const boardItemSt = setStyle({
      display: "block",
      paddingTop: "10px",
      paddingBottom: "10px",
      borderBottomColor: lightGray,
      borderBottomWidth: "1px",
      borderBottomStyle: "solid"
})
const contentSize = setStyle({
      minHeight: "18px"
})