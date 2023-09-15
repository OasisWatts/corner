
import { almostWhiteSt, composeStyle, lightGraySt, mainButtonTextStyle, setStyle, tagButtonTextSt, whiteSt } from "front/@lib/style"
import { fullStyle } from "front/@lib/util"
import Action from "front/reactCom"
import { Page } from "front/ssr"
import React from "react"
import { Pressable, Text, View } from "reactNative"

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
                  if (name_ !== name) this.setState({ activated: false })
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
            console.log("name", name, this.props.isUrl)
            return (
                  <Pressable style={tagSt} onPress={this.handlePress} onHoverIn={this.handleHoverIn} onHoverOut={this.handleHoverOut}>
                        <Text style={[mainButtonTextStyle, tagButtonTextSt, fullStyle ? (hoveredTag || activated ? lightGraySt : almostWhiteSt) : (hoveredTag || activated ? whiteSt : null)]} > {isHere ? "here" : name}</Text>
                  </Pressable>
            )
      }
}
const tagSt = setStyle({
      display: "inline",
      marginRight: "10px"
})