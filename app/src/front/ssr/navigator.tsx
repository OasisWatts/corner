
import { tWriteColor, composeStyle, contentFontSize, setStyle, slimThreshold, lightGray, almostWhite, slimThresholdExceptSize, slimerThreshold, tUpColor } from "front/@lib/style"
import Action from "front/reactCom"
import React from "react"
import { Image, Linking, Pressable, Text, View } from "reactNative"
import { sideBarSt, wideSideBarSt } from "./followList"
import { CLIENT_SETTINGS, PROPS } from "front/@lib/util"
import { Page } from "."


export default class Navigator extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
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
      private handleWrite = () => {
            Action.trigger("page", Page.write, () => Action.trigger("writeReload"))
      }
      private handlePressMyBoard = () => {
            Action.trigger("page", Page.boardList, () => Action.trigger("boardListMyBoard"))
      }
      private handlePressMyUp = () => {
            Action.trigger("page", Page.boardList, () => Action.trigger("boardListMyUp"))
      }
      private handlePressSetting = () => {
            Action.trigger("page", Page.setting)
      }
      private handlePressInstall = () => {
            window.open(CLIENT_SETTINGS.extension)
      }

      render(): React.ReactNode {
            const slim = window.innerWidth < slimThreshold
            const slimer = window.innerWidth < slimerThreshold
            return (
                  <View style={[rightSideBar, slim ? slimFullSt : fullSt, slim ? null : wideSideBarSt, slimer ? slimerRightSideBarSt : slim ? slimRightSideBar : wideRightSideBar]}>
                        <Pressable style={[slim ? slimWriteSt : wideButtonSt, slimer ? slimerWriteSt : writeSt]} onPress={this.handleWrite}>
                              <Image style={[imgSt, slim ? slimWriteImgSt : null]} source={{ uri: CLIENT_SETTINGS.host + "/images/write.svg" }} />
                              {slim ? null : <Text style={textSt}>write</Text>}
                        </Pressable>
                        <Pressable style={[slim ? slimButtonSt : wideButtonSt]} onPress={this.handlePressMyBoard} >
                              <Image style={[imgSt, slimer ? slimerImgSt : slim ? slimImgSt : null]} source={{ uri: CLIENT_SETTINGS.host + "/images/myWrite.svg" }} />
                              {slim ? null : <Text style={textSt}>my write</Text>}
                        </Pressable>
                        <Pressable style={[slim ? slimButtonSt : wideButtonSt]} onPress={this.handlePressMyUp} >
                              <Image style={[imgSt, slimer ? slimerImgSt : slim ? slimImgSt : null]} source={{ uri: CLIENT_SETTINGS.host + "/images/myUp.svg" }} />
                              {slim ? null : <Text style={textSt}>my up</Text>}
                        </Pressable>
                        <Pressable style={[slim ? slimButtonSt : wideButtonSt]} onPress={this.handlePressSetting} >
                              <Image style={[imgSt, slimer ? slimerImgSt : slim ? slimImgSt : null]} source={{ uri: CLIENT_SETTINGS.host + "/images/setting.svg" }} />
                              {slim ? null : <Text style={textSt}>sign out</Text>}
                        </Pressable>
                        {PROPS.data.ext ? null : <Pressable style={[slim ? slimWriteSt : wideButtonSt, slimer ? slimerInstallSt : installSt]} onPress={this.handlePressInstall} >
                              <Image style={[imgSt, slim ? slimWriteImgSt : null]} source={{ uri: CLIENT_SETTINGS.host + "/images/cornerIcon.png" }} />
                              {slim ? null : <Text style={textSt}>install extension</Text>}
                        </Pressable>}
                  </View>
            )
      }
}

const rightSideBar = composeStyle(
      sideBarSt,
      {
            height: "auto"
      }
)
const fullSt = setStyle({
      borderRadius: "15px",
      paddingBottom: "10px",
      backgroundColor: almostWhite,
      marginTop: "30px"
})
const slimFullSt = setStyle({
      paddingBottom: "10px",
      backgroundColor: almostWhite
})
const wideRightSideBar = setStyle({
      right: slimThresholdExceptSize
})
const slimRightSideBar = setStyle({
      width: "50px",
      right: "0"
})
const slimerRightSideBarSt = setStyle({
      bottom: "0",
      height: "55px",
      top: "auto",
      left: "0",
      width: "100%",
      paddingTop: "10px",
      justifyContent: "space-around",
      flexDirection: "row",
})
const wideButtonSt = setStyle({
      position: "relative",
      marginLeft: "10px",
      width: "170px",
      height: "40px"
})
const slimButtonSt = setStyle({
      position: "relative",
      width: "50px",
      height: "50px"
})
const writeSt = setStyle({
      marginTop: "15px",
      marginBottom: "5px",
      borderRadius: "20px",
      backgroundColor: tWriteColor
})
const slimerWriteSt = setStyle({
      borderRadius: "20px",
      backgroundColor: tWriteColor
})
const slimWriteSt = setStyle({
      position: "relative",
      width: "40px",
      height: "40px",
      marginLeft: "5px",
      borderRadius: "20px"
})
const installSt = setStyle({
      marginTop: "5px",
      marginBottom: "5px",
      borderRadius: "20px",
      backgroundColor: tUpColor
})
const slimerInstallSt = setStyle({
      borderRadius: "20px",
      backgroundColor: tUpColor
})
const imgSt = setStyle({
      height: "30px",
      width: "30px",
      position: "absolute",
      left: "10px",
      top: "5px"
})
const slimerImgSt = setStyle({
      left: "10px",
      top: "5px"
})
const slimImgSt = setStyle({
      left: "10px",
      top: "10px"
})
const slimWriteImgSt = setStyle({
      left: "5px",
      top: "5px"
})
const textSt = setStyle({
      height: "40px",
      lineHeight: "40px",
      fontSize: contentFontSize,
      fontWeight: "600",
      width: "115px",
      right: "0",
      position: "absolute"
})