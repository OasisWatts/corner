import { composeStyle, mainButtonStyle, mainButtonTextStyle, mainColor, setStyle, tLightGray, whiteSt } from "front/@lib/style"
import Action from "front/reactCom"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "reactNative"
import { BoardList } from "./boardList"
import { Tags } from "../@header/tags"
import { Write } from "./write"
import { FRONT, PROPS, fullStyle } from "front/@lib/util"
import Bind from "front/reactRoot"
import Header from "../@header/header"
import { Board } from "./board"


export default class Background extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
      }

      render(): React.ReactNode {
            return (
                  <View style={[backgroundSt, fullStyle ? whiteSt : null]} />
            )
      }
}

const backgroundSt = setStyle({
      backdropFilter: "blur(30px)",
      backgroundColor: tLightGray,
      width: "100%",
      height: "100vh",
      zIndex: "-1",
      position: "fixed"
})