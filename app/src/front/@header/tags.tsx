// import { setStyle } from "front/common/style"
import Action from "front/reactCom"
// import { PROPS } from "front/@lib/util"
import React, { createRef, useRef } from "react"
import { FlatList, Image, Pressable, ScrollView, Text, View } from "reactNative"
import Tag from "./tag"
import { CLIENT_SETTINGS, PROPS } from "front/@lib/util"
import { setStyle, slimThreshold, slimerThreshold, softGray } from "front/@lib/style"

type State = {
      tags: TagType[]
      leftEnd: boolean
      rightEnd: boolean
      offsetIndex: number
}
export class Tags extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
            console.log("tag state")
            this.state = {
                  tags: [],
                  leftEnd: true,
                  rightEnd: true,
                  offsetIndex: 0
            }
      }
      protected ACTION_RECEIVER_TABLE: any = {
            "tagReload": () => {
                  this.getTag()
            }
      }
      componentDidMount(): void {
            super.componentDidMount()
            window.addEventListener("resize", this.resize)
            this.getTag()
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
      private getTag = () => {
            console.log("getTag") // fetch /tag hot (props.ex 가 아니면 /// tag 만 출력해주면 됨 (+전체 태그))

            if (PROPS.data.ext) {
                  fetch("/tag?u=" + PROPS.data.url).then((r) => r.json()).then((tags) => {
                        console.log("tag url", tags)
                        // if (tags.length < 1 && PROPS.data.ext) Action.trigger("boardListTag", PROPS.data.hostname, false)
                        // else {
                        tags.forEach((t, idx) => {
                              if (t.isUrl == true) tags[idx].isHere = true
                        })
                        console.log("tags", tags)
                        this.setState({ tags })
                        // }
                  })
            } else {
                  fetch("/tag?h=true").then((r) => r.json()).then((tags) => {
                        console.log("tag hot", tags)
                        this.setState({ tags: [{ name: "전체", isUrl: false, activatedDefault: true, total: true }, ...tags] }) // no extension access -> /boards
                  })
            }
      }


      private renderItem = ({ item }) => <Tag name={item.name} isUrl={item.isUrl} isHere={item.isHere} activatedDefault={item.activatedDefault} total={item.total} />

      private flatListRef: React.RefObject<FlatList<TagType>> = createRef()

      private handleContentSizeChange = (width, height) => {
            const slim = window.innerWidth < slimThreshold
            const tagsWidth = slim ? window.innerWidth - slimPadding : window.innerWidth - widePadding
            console.log("whole wi", width, tagsWidth)
            if (width > tagsWidth) this.setState({ leftEnd: true, rightEnd: false })
            else this.setState({ leftEnd: true, rightEnd: true })
      }
      private handleScroll = (e) => {
            console.log("length", e)
            console.log("length", e.nativeEvent)
            const slim = window.innerWidth < slimThreshold
            const tagsWidth = slim ? window.innerWidth - slimPadding : window.innerWidth - widePadding
            console.log("end", (e.nativeEvent.contentOffset.x === 0), e.nativeEvent.contentOffset.x + tagsWidth, e.nativeEvent.contentSize.width)
            this.setState({ leftEnd: (e.nativeEvent.contentOffset.x === 0), rightEnd: (e.nativeEvent.contentOffset.x + tagsWidth >= e.nativeEvent.contentSize.width) })
      }
      private handleLeftButton = () => {
            const { offsetIndex } = this.state
            console.log("ref", this.flatListRef)
            console.log("curr ref", this.flatListRef.current)
            const slim = window.innerWidth < slimThreshold
            const tagsWidth = slim ? window.innerWidth - slimPadding - 30 : window.innerWidth - widePadding - 30 // 30은 어느정도 여유를 두고 스크롤 하기 위함.
            this.setState({ offsetIndex: offsetIndex - 1 }, () => this.flatListRef.current?.scrollToOffset({ animated: true, offset: tagsWidth * (offsetIndex - 1) }))
            // this.flatListRef.current?.scrollToOffset({ animated: true, offset: -100 })
      }
      private handleRightButton = () => {
            const { offsetIndex } = this.state
            console.log("ref", this.flatListRef)
            console.log("curr ref", this.flatListRef.current)
            const slim = window.innerWidth < slimThreshold
            const tagsWidth = slim ? window.innerWidth - slimPadding - 30 : window.innerWidth - widePadding - 30 // 30은 어느정도 여유를 두고 스크롤 하기 위함.
            this.setState({ offsetIndex: offsetIndex + 1 }, () => this.flatListRef.current?.scrollToOffset({ animated: true, offset: tagsWidth * (offsetIndex + 1) }))
      }
      render(): React.ReactNode {
            const { tags, leftEnd, rightEnd } = this.state
            console.log("state tags", tags)
            const renderOne = tags.length < 1 && PROPS.data.ext
            const slim = window.innerWidth < slimThreshold
            const slimer = window.innerWidth < slimerThreshold
            return (
                  <View style={[tagsWrapperSt, slimer ? slimerTagsWrapperSt : slim ? slimTagsWrapperSt : null]}>
                        {renderOne ? <Tag name={PROPS.data.url} isUrl={true} isHere={true} activatedDefault={true} /> :
                              null
                        }
                        {renderOne ? <Tag name={PROPS.data.hostname} isUrl={false} isHere={false} activatedDefault={true} /> :
                              <FlatList ref={this.flatListRef} horizontal={true} showsHorizontalScrollIndicator={false} onContentSizeChange={this.handleContentSizeChange} onScroll={this.handleScroll} data={tags} renderItem={this.renderItem} keyExtractor={(item) => item.name} />
                        }
                        {leftEnd ? null
                              : <Pressable style={leftButtonSt} onPress={this.handleLeftButton}>
                                    <Image style={leftButtonImgSt} source={{ uri: CLIENT_SETTINGS.host + "/images/rightArrow.svg" }} />
                              </Pressable>}
                        {rightEnd ? null
                              : <Pressable style={rightButtonSt} onPress={this.handleRightButton}>
                                    <Image style={rightButtonImgSt} source={{ uri: CLIENT_SETTINGS.host + "/images/rightArrow.svg" }} />
                              </Pressable>}
                  </View>
            )
      }
}
export const tagsWrapperSt = setStyle({
      display: "block",
      position: "absolute",
      top: "10px",
      left: "225px",
      width: "calc(100% - 450px)"
})
export const slimerTagsWrapperSt = setStyle({
      left: "90px",
      width: "calc(100% - 130px)"
})
export const slimTagsWrapperSt = setStyle({
      left: "100px",
      width: "calc(100% - 200px)"
})
const widePadding = 450
const slimPadding = 200
const leftButtonSt = setStyle({
      position: "absolute",
      left: "-20px",
      top: "5px"
})
const rightButtonSt = setStyle({
      position: "absolute",
      right: "-20px",
      top: "5px"
})
const leftButtonImgSt = setStyle({
      width: "20px",
      height: "20px",
      transform: "scaleX(-1)"
})
const rightButtonImgSt = setStyle({
      width: "20px",
      height: "20px"
})