// import { setStyle } from "front/common/style"
import Action from "front/reactCom"
// import { PROPS } from "front/@lib/util"
import React, { createRef } from "react"
import { FlatList, Image, Pressable, View } from "reactNative"
import Tag from "./tag"
import { CLIENT_SETTINGS, PROPS } from "front/@lib/util"
import { setStyle, slimThreshold, slimerThreshold, softGray, tWriteColor } from "front/@lib/style"

type State = {
      tags: TagType[]
      leftEnd: boolean
      rightEnd: boolean
      offsetIndex: number
}
export class Tags extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
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
      private getTag = () => { // fetch /tag hot (props.ex 가 아니면 /// tag 만 출력해주면 됨 (+전체 태그))
            if (PROPS.data.ext) {
                  fetch("/tag?u=" + PROPS.data.url).then((r) => typeof r === "object" ? r.json() : null).then((tags) => {
                        tags.forEach((t, idx) => {
                              if (t.isUrl == true) tags[idx].isHere = true
                        })
                        this.setState({ tags })
                        Action.trigger("boardListTag", PROPS.data.hostname)
                  })
            } else {
                  fetch("/tag?h=true").then((r) => typeof r === "object" ? r.json() : null).then((tags) => {
                        this.setState({ tags: [{ name: "전체", isUrl: false, activatedDefault: true, total: true }, ...tags] }) // no extension access -> /boards
                  })
            }
      }


      private renderItem = (item) => <Tag name={item.name} isUrl={item.isUrl} isHere={item.isHere} activatedDefault={item.activatedDefault} total={item.total} />

      render(): React.ReactNode {
            const { tags, leftEnd, rightEnd } = this.state
            const renderOne = tags.length < 1 && PROPS.data.ext
            let renderOneTags: any[] = []
            if (renderOne) renderOneTags = [{ name: PROPS.data.url, isUrl: true, isHere: true, activatedDefault: true }, { name: PROPS.data.hostname, isUrl: false, isHere: false, activatedDefault: false }]
            console.log(renderOne ? renderOneTags : tags)
            const slim = window.innerWidth < slimThreshold
            return (
                  <View style={[tagsWrapperSt, slim ? slimTagsWrapperSt : null]}>
                        {(renderOne ? renderOneTags : tags).map((t) => t && this.renderItem(t))}
                  </View>
            )
      }
}
const tagsWrapperSt = setStyle({
      display: "flex",
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      paddingLeft: "5px",
      paddingTop: "5px",
})
const slimTagsWrapperSt = setStyle({
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      borderBottomColor: softGray
})