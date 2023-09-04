
import { deepGray, fontBlackSt, gray, lightGray, setStyle, slimThreshold, smallFontSize } from "front/@lib/style"
import { CLIENT_SETTINGS, extension, fullStyle } from "front/@lib/util"
import Action from "front/reactCom"
import React from "react"
import { FlatList, Image, Pressable, Text, View } from "reactNative"
import FollowItem from "./followItem"

type State = {
      key: string,
      startId: number,
      follows: UserType[],
      endOfList: boolean
      followsOnly: boolean
}
export default class Follows extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
            this.state = {
                  key: "",
                  startId: 0,
                  follows: [],
                  endOfList: false,
                  followsOnly: false
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
      private getFollows = () => {
            const { startId, follows, endOfList } = this.state
            if (endOfList) return
            console.log("getFollows")
            fetch("/follows?sid=" + startId)
                  .then((r) => r.json())
                  .then((o) => {
                        if (o.end) this.setState({ endOfList: true })
                        else {
                              this.setState({
                                    follows: follows.concat(o.followList),
                                    startId: o.endId
                              })
                        }
                  })
      }
      private handleLoadMore = () => {
            this.getFollows()
      }
      private renderItem = ({ item }) => <FollowItem item={item} />
      private handleFindMore = () => {
            this.setState({ followsOnly: true })
      }

      render(): React.ReactNode {
            const { follows, followsOnly } = this.state
            const slim = window.innerWidth < slimThreshold
            if (followsOnly) {
                  return (
                        <View style={[sideBarSt, fullStyle ? fullSt : null, slim ? slimSideBarSt : wideSideBarSt]}>
                              <Pressable onPress={this.handleFindMore}>
                                    <Text style={textButtonSt}>닫기</Text>
                              </Pressable>
                              <Image style={iconSt} source={{ uri: CLIENT_SETTINGS.host + "/images/heart.svg" }} />
                              <FlatList
                                    style={listSt}
                                    data={follows}
                                    renderItem={this.renderItem}
                                    keyExtractor={(item: any) => item.id} />
                        </View>
                  )
            } else {
                  return (
                        <View style={[sideBarSt, fullStyle ? fullSt : null, slim ? slimSideBarSt : wideSideBarSt]}>
                              <Image style={[iconSt, slim ? slimSideBarIconSt : wideSideBarIconSt]} source={{ uri: CLIENT_SETTINGS.host + "/images/heartBlack.svg" }} />
                              <FlatList
                                    style={listSt}
                                    data={follows}
                                    renderItem={this.renderItem}
                                    keyExtractor={(item: any) => item.id} />
                              <Pressable onPress={this.handleFindMore}>
                                    <Text style={textButtonSt}>더보기</Text>
                              </Pressable>
                              <Image style={[iconSt, slim ? slimSideBarIconSt : wideSideBarIconSt]} source={{ uri: CLIENT_SETTINGS.host + "/images/hot.svg" }} />
                              <FlatList
                                    style={listSt}
                                    data={follows}
                                    renderItem={this.renderItem}
                                    keyExtractor={(item: any) => item.id} />
                        </View>
                  )
            }
      }
}
export const sideBarSt = setStyle({
      position: "fixed",
      height: "100%",
      top: "53px"
})
const fullSt = setStyle({
      borderRightWidth: "1px",
      borderRightStyle: "solid",
      borderRightColor: lightGray
})
export const slimSideBarSt = setStyle({
      width: "50px"
})
export const wideSideBarSt = setStyle({
      width: "190px"
})
const slimSideBarIconSt = setStyle({
      left: "12px"
})
const wideSideBarIconSt = setStyle({
      left: "88px"
})
const listSt = setStyle({
      height: "250px"
})
const iconSt = setStyle({
      height: "25px",
      width: "25px",
      marginTop: "7px"
})
const textButtonSt = setStyle({
      textAlign: "center",
      marginTop: "5px",
      marginBottom: "5px",
      fontSize: smallFontSize,
      color: "black"
})