
import { deepGray, fontBlackSt, gray, lightGray, setStyle, slimThreshold, smallFontSize } from "front/@lib/style"
import { CLIENT_SETTINGS, PROPS, extension, fullStyle } from "front/@lib/util"
import Action from "front/reactCom"
import React from "react"
import { FlatList, Image, Pressable, Text, View } from "reactNative"
import FollowItem from "./followItem"

type State = {
      tag: string,
      startId: number,
      recommends: UserType[]
      follows: UserType[],
      endOfList: boolean
      zero: boolean
}
export default class Follows extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
            this.state = {
                  tag: PROPS.data.ext ? PROPS.data.url : null,
                  startId: 0,
                  recommends: [],
                  follows: [],
                  endOfList: false,
                  zero: false
            }
      }
      protected ACTION_RECEIVER_TABLE: any = {
            followListTag: (tag) => {
                  this.setState({ tag, recommends: [], startId: 0, follows: [], endOfList: false }, () => this.getFollows(true))
            }
      }
      componentDidMount(): void {
            super.componentDidMount()
            this.getFollows(true)
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
      private getFollows = (hot?: boolean) => {
            const { tag, startId, follows, endOfList, zero } = this.state
            if (endOfList) return
            console.log("getFollows", tag, startId, follows, hot)
            if (hot) {
                  console.log("fe", "/getfollow?h=1" + (tag ? ("&t=" + tag) : ""))
                  fetch("/getfollow?h=1" + (tag ? ("&t=" + tag) : "")).then((r) => r.json()).then((o) => {
                        console.log("hotFollowO", o)
                        this.setState({
                              recommends: o.recomm,
                              follows: o.follow.users,
                              startId: o.follow.endId,
                              endOfList: o.follow.end ? true : false,
                              zero: o.follow.zero
                        })
                  })
            } else {
                  fetch("/getfollow?sid=" + startId + (tag ? ("&t=" + tag) : "") + (zero ? "&z=1" : "")).then((r) => r.json()).then((o) => {
                        console.log("followO", o)
                        this.setState({
                              follows: follows.concat(o.follow.users),
                              startId: o.follow.endId,
                              endOfList: o.follow.end,
                              zero: o.follow.zero
                        })
                  })
            }
      }
      private handleLoadMore = () => {
            this.getFollows()
      }
      private renderItem = ({ item }) => <FollowItem userKey={item.key} name={item.name} image={item.image} />

      render(): React.ReactNode {
            const { recommends, follows } = this.state
            const slim = window.innerWidth < slimThreshold
            return (
                  <View style={[sideBarSt, fullStyle ? fullSt : null, slim ? slimSideBarSt : wideSideBarSt]}>
                        {recommends.length ? <Image style={[iconSt, slim ? slimSideBarIconSt : wideSideBarIconSt]} source={{ uri: CLIENT_SETTINGS.host + "/images/hot.svg" }} /> : null}
                        <View>
                              <FlatList
                                    data={recommends}
                                    renderItem={this.renderItem}
                                    keyExtractor={(item: any) => item.key} />
                        </View>
                        {follows.length ? <Image style={[iconSt, slim ? slimSideBarIconSt : wideSideBarIconSt]} source={{ uri: CLIENT_SETTINGS.host + "/images/heartBlack.svg" }} /> : null}
                        <FlatList
                              data={follows}
                              renderItem={this.renderItem}
                              keyExtractor={(item: any) => item.key}
                              onEndReached={this.handleLoadMore}
                              onEndReachedThreshold={0.5}
                        />
                  </View>
            )
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
      width: "65px"
})
export const wideSideBarSt = setStyle({
      width: "190px"
})
const slimSideBarIconSt = setStyle({
      left: "14px"
})
const wideSideBarIconSt = setStyle({
      left: "88px"
})
const iconSt = setStyle({
      height: "20px",
      width: "20px",
      marginTop: "10px",
      marginBottom: "5px"
})