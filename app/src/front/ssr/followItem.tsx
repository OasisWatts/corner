
import { composeStyle, contentFontSize, setStyle, tUpColor } from "front/@lib/style"
import { CLIENT_SETTINGS } from "front/@lib/util"
import Action from "front/reactCom"
import React from "react"
import { Image, Pressable, Text, View } from "reactNative"

type State = {
      hoverItem: boolean
}
type Props = {
      item: UserType
}
export default class FollowItem extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
            this.state = {
                  hoverItem: false
            }
      }

      private handlePressFollowItem = () => {
            const { item } = this.props
            Action.trigger("pageFollowBoardList", item.key)
      }
      private handleHoverIn = () => {
            this.setState({ hoverItem: true })
      }
      private handleHoverOut = () => {
            this.setState({ hoverItem: false })
      }

      render(): React.ReactNode {
            const { hoverItem } = this.state
            const { item } = this.props
            return (
                  <Pressable onPress={this.handlePressFollowItem} style={followSt} onHoverIn={this.handleHoverIn} onHoverOut={this.handleHoverOut} >
                        <Pressable style={[iconWrapSt, hoverItem ? iconBorderSt : null]}>
                              <Image style={iconSt} source={{ uri: CLIENT_SETTINGS.host + "/users/" + item.image }} />
                              <View style={iconCoverSt} />
                        </Pressable>
                        <Text style={textSt}>{item.name}</Text>
                  </Pressable>
            )
      }
}
const followSt = setStyle({
      height: "40px",
      width: "100%",
      paddingTop: "5px"
})
const iconWrapSt = setStyle({
      height: "30px",
      width: "30px",
      borderRadius: "20px",
      position: "relative",
      marginLeft: "10px"
})
const iconBorderSt = setStyle({
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: tUpColor
})
const iconSt = setStyle({
      height: "30px",
      width: "30px",
      position: "absolute",
      top: "0",
      left: "0"
})
const iconCoverSt = composeStyle(
      iconSt,
      {
            borderRadius: "20px",
            backdropFilter: "grayscale(1)",
            zIndex: "1"
      })
const textSt = setStyle({
      fontSize: contentFontSize,
      marginLeft: "10px"
})