
import { almostWhiteSt, contentFontSize, hoveredComment, mainButtonTextStyle, setStyle, tWhite, whiteSt } from "front/@lib/style"
import { CLIENT_SETTINGS } from "front/@lib/util"
import Action from "front/reactCom"
import { Page } from "front/ssr"
import React from "react"
import { Pressable, Text } from "reactNative"

const MAX_TAG_LEN_LIM = CLIENT_SETTINGS.board.tagLenLim
const HALF_MAX_TAG_LEN_LIM = Math.floor(MAX_TAG_LEN_LIM / 2)

type Props = {
      name: string
      isUrl: boolean
      isHere: boolean
      activatedDefault?: boolean
      total?: boolean
}
type State = {
      hoveredTag: boolean
      activated: boolean
}

export default class Tag extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
            const { activatedDefault } = this.props
            this.state = {
                  hoveredTag: false,
                  activated: activatedDefault || false
            }
      }

      protected ACTION_RECEIVER_TABLE: any = {
            boardListTag: (name_) => { // 선택된 태그 외, 다른 태그는 취소.
                  const { name } = this.props
                  if (name_ === name) this.setState({ activated: true })
                  else this.setState({ activated: false })
            }
      }

      private handlePress = () => {
            const { name, isUrl, total } = this.props
            this.setState({ activated: true }, () => {
                  Action.trigger("page", Page.boardList, () => {
                        Action.trigger("boardListTag", name, isUrl, total)
                        if (name === "전체") Action.trigger("followListTag", null)
                        else Action.trigger("followListTag", name)
                  })
            })
      }
      private handleHoverIn = () => {
            this.setState({ hoveredTag: true })
      }
      private handleHoverOut = () => {
            this.setState({ hoveredTag: false })
      }
      render(): React.ReactNode {
            const { name, isHere } = this.props
            const { hoveredTag, activated } = this.state
            let parsedName = name
            if (name.length > (MAX_TAG_LEN_LIM + 8)) parsedName = "..." + name.slice(8, 8 + HALF_MAX_TAG_LEN_LIM) + "..." + name.slice(name.length - HALF_MAX_TAG_LEN_LIM)

            return (
                  <Pressable style={tagSt} onPress={this.handlePress} onHoverIn={this.handleHoverIn} onHoverOut={this.handleHoverOut}>
                        <Text style={[mainButtonTextStyle, tagButtonTextSt, (hoveredTag || activated ? hoveredComment : almostWhiteSt)]} > {isHere ? "here" : parsedName}</Text>
                  </Pressable >
            )
      }
}
const tagSt = setStyle({
      display: "inline",
      marginRight: "10px",
      marginBottom: "5px"
})
const tagButtonTextSt = setStyle({
      backgroundColor: "white",
      borderRadius: "20px",
      paddingLeft: "10px",
      paddingRight: "10px",
      lineHeight: "20px",
      display: "inline-block",
      fontSize: contentFontSize,
      color: "black"
})