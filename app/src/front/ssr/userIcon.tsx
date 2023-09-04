
import { setStyle } from "front/@lib/style"
import { CLIENT_SETTINGS } from "front/@lib/util"
import Action from "front/reactCom"
import React from "react"
import { Image, Pressable, View } from "reactNative"


export default class UserIcon extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
      }

      private handlePressIcon = () => {

      }

      render(): React.ReactNode {
            return (
                  <Pressable onPress={this.handlePressIcon} style={iconSt} >
                        <Image style={iconSt} source={{ uri: CLIENT_SETTINGS.host + "/images/cornerIconTransparent.svg" }} />
                  </Pressable>
            )
      }
}
const iconSt = setStyle({
      height: "50px",
      width: "50px"
})