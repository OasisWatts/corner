
import { composeStyle, contentFontSize, setStyle, slimThreshold, tUpColor, tWriteColor } from "front/@lib/style"
import { CLIENT_SETTINGS } from "front/@lib/util"
import Action from "front/reactCom"
import React from "react"
import { Image, Pressable, Text, View } from "reactNative"
import { boardPage } from "."

type State = {
      hoverItem: boolean
      activated: boolean
}
type Props = {
      name: string
      image: string
      userKey: number
}
export default class FollowItem extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
            this.state = {
                  hoverItem: false,
                  activated: false
            }
      }
      protected ACTION_RECEIVER_TABLE: any = {
            followUserList: (key_) => { // 선택된 태그 외, 다른 태그는 취소.
                  const { userKey } = this.props
                  if (key_ !== userKey) this.setState({ activated: false })
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

      private handlePressFollowItem = () => {
            const { userKey } = this.props
            console.log("press follwitem", userKey)
            Action.trigger("page", boardPage.boardList, () => {
                  Action.trigger("boardListUser", userKey)
                  Action.trigger("followUserList", userKey)
            })
      }
      private handleHoverIn = () => {
            this.setState({ hoverItem: true })
      }
      private handleHoverOut = () => {
            this.setState({ hoverItem: false })
      }

      render(): React.ReactNode {
            const { hoverItem, activated } = this.state
            const { name, image } = this.props
            const slim = window.innerWidth < slimThreshold
            return (
                  <View style={[followSt, slim ? null : wideFollowSt]}>
                        <Pressable style={iconWrapSt} onPress={this.handlePressFollowItem} onHoverIn={this.handleHoverIn} onHoverOut={this.handleHoverOut} >
                              <Image style={[iconSt, hoverItem || activated ? iconBorderSt : null]} source={{ uri: CLIENT_SETTINGS.host + "/profiles/" + image }} />
                              <Text style={[textSt, slim ? null : wideTextSt]}>{name}</Text>
                        </Pressable>
                  </View>
            )
      }
}
const followSt = setStyle({
      height: "50px",
      width: "100%",
      marginTop: "5px"
})
const wideFollowSt = setStyle({
      height: "35px"
})
const iconWrapSt = setStyle({
      height: "30px",
      width: "30px",
      borderRadius: "20px",
      position: "relative",
      marginLeft: "10px"
})
const iconBorderSt = setStyle({
      borderWidth: "5px",
      borderStyle: "solid",
      borderColor: tWriteColor
})
const iconSt = setStyle({
      height: "30px",
      width: "30px",
      borderRadius: "20px"
})
const textSt = setStyle({
      fontSize: contentFontSize,
      overflowX: "clip",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      width: "30px"
})
const wideTextSt = setStyle({
      position: "absolute",
      left: "45px",
      lineHeight: "30px",
      width: "120px"
})