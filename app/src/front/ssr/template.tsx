
import Action from "front/reactCom"
import React from "react"
import { View } from "reactNative"


export default class Template extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
      }

      render(): React.ReactNode {
            return (
                  <View>
                  </View>
            )
      }
}