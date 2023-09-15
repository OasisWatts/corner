
import { tWriteColor, composeStyle, mainButtonStyle, contentFontSize, setStyle, slimThreshold, tWhite, lightGray, almostWhite } from "front/@lib/style"
import Action from "front/reactCom"
import React from "react"
import { Image, Pressable, Text, View } from "reactNative"
import { sideBarSt, slimSideBarSt, wideSideBarSt } from "./followList"
import { CLIENT_SETTINGS, fullStyle } from "front/@lib/util"
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
            Action.trigger("page", Page.write)
      }
      private handlePressSearch = () => {
            Action.trigger("searchShow", true)
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

      render(): React.ReactNode {
            const slim = window.innerWidth < slimThreshold
            return (
                  <View style={[rightSideBar, fullStyle ? (slim ? slimFullSt : fullSt) : null, slim ? slimSideBarSt : wideSideBarSt, slim ? slimRightSideBar : wideRightSideBar]}>
                        <Pressable style={[slim ? slimWriteSt : wideButtonSt, writeSt]} onPress={this.handleWrite}>
                              <Image style={[imgSt, slim ? slimWriteImgSt : null]} source={{ uri: CLIENT_SETTINGS.host + "/images/write.svg" }} />
                              {slim ? null : <Text style={textSt}>write</Text>}
                        </Pressable>
                        <Pressable style={[slim ? slimButtonSt : wideButtonSt]} onPress={this.handlePressSearch} >
                              <Image style={[imgSt, slim ? slimImgSt : null]} source={{ uri: CLIENT_SETTINGS.host + "/images/searchBold.svg" }} />
                              {slim ? null : <Text style={textSt}>search</Text>}
                        </Pressable>
                        <Pressable style={[slim ? slimButtonSt : wideButtonSt]} onPress={this.handlePressMyBoard} >
                              <Image style={[imgSt, slim ? slimImgSt : null]} source={{ uri: CLIENT_SETTINGS.host + "/images/myWrite.svg" }} />
                              {slim ? null : <Text style={textSt}>my write</Text>}
                        </Pressable>
                        <Pressable style={[slim ? slimButtonSt : wideButtonSt]} onPress={this.handlePressMyUp} >
                              <Image style={[imgSt, slim ? slimImgSt : null]} source={{ uri: CLIENT_SETTINGS.host + "/images/myUp.svg" }} />
                              {slim ? null : <Text style={textSt}>my up</Text>}
                        </Pressable>
                        <Pressable style={[slim ? slimButtonSt : wideButtonSt]} onPress={this.handlePressSetting} >
                              <Image style={[imgSt, slim ? slimImgSt : null]} source={{ uri: CLIENT_SETTINGS.host + "/images/setting.svg" }} />
                              {slim ? null : <Text style={textSt}>setting</Text>}
                        </Pressable>
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
      borderTopLeftRadius: "15px",
      borderBottomLeftRadius: "15px",
      paddingBottom: "10px",
      backgroundColor: almostWhite,
      marginTop: "30px"
})
const wideRightSideBar = setStyle({
      right: "calc(50% - 750px)"
})
const slimRightSideBar = setStyle({
      right: "0"
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
const slimWriteSt = setStyle({
      position: "relative",
      width: "40px",
      height: "40px",
      marginLeft: "5px",
      borderRadius: "20px"
})
const imgSt = setStyle({
      height: "30px",
      width: "30px",
      position: "absolute",
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
      width: "100px",
      right: "0",
      position: "absolute"
})