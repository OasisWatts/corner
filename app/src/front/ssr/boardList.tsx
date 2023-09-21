import { contentFontSize, pageSt, setStyle, slimPageSt, slimThreshold, slimerPageSt, slimerThreshold, widePageSt } from "front/@lib/style"
import Action from "front/reactCom"
import React from "react"
import { FlatList, Text, View } from "reactNative"
import { BoardItem } from "./boardItem"
import { PROPS } from "front/@lib/util"
import { BOARD_CATEGORY } from "common/applicationCode"

type State = {
      startId: number,
      boards: boardType[],
      endOfList: boolean
      categ: BOARD_CATEGORY
      url: string | null
      tag: string | null
      search: string | null
      searchUser: string | null
}
export class BoardList extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
            this.state = {
                  startId: 0,
                  boards: [],
                  categ: PROPS.data.ext ? BOARD_CATEGORY.urlBoards : BOARD_CATEGORY.boards,
                  url: PROPS.data.ext ? PROPS.data.url : null,
                  tag: null,
                  search: "",
                  searchUser: "",
                  endOfList: false
            }
      }
      protected ACTION_RECEIVER_TABLE: any = {
            "deleteBoardItem": (boardId) => {
                  const { boards } = this.state
                  const newBoards = [...boards.filter((board) => { return (board.id !== boardId) })]
                  this.setState({ boards: newBoards })
                  this.forceUpdate()
            },
            "boardListTag": (tag, isUrl, total) => {
                  if (total) this.setState({ startId: 0, boards: [], endOfList: false, categ: BOARD_CATEGORY.boards }, () => this.getBoards())
                  else if (isUrl) this.setState({ startId: 0, boards: [], endOfList: false, categ: BOARD_CATEGORY.urlBoards, url: tag }, () => this.getBoards())
                  else this.setState({ startId: 0, boards: [], endOfList: false, categ: BOARD_CATEGORY.tagBoards, tag }, () => this.getBoards())
            },
            "boardListSearch": (search) => {
                  this.setState({ startId: 0, boards: [], endOfList: false, categ: BOARD_CATEGORY.searchBoards, search }, () => this.getBoards())
            },
            "boardListMyBoard": () => {
                  this.setState({ startId: 0, boards: [], endOfList: false, categ: BOARD_CATEGORY.myBoards }, () => this.getBoards())
            },
            "boardListMyUp": () => {
                  this.setState({ startId: 0, boards: [], endOfList: false, categ: BOARD_CATEGORY.myUpBoards }, () => this.getBoards())
            },
            "boardListUser": (searchUser) => {
                  this.setState({ startId: 0, boards: [], endOfList: false, categ: BOARD_CATEGORY.userBoards, searchUser }, () => this.getBoards())
            },
            "boardList": () => {
                  this.getBoards()
            }
      }
      componentDidMount(): void {
            super.componentDidMount()
            this.getBoards()
            window.addEventListener("resize", this.resize)
      }
      componentWillUnmount() {
            super.componentWillUnmount()
            window.removeEventListener("resize", this.resize)
      }
      private previousWidth: number = window.innerWidth
      private resize = () => {
            if ((this.previousWidth > slimThreshold && window.innerWidth <= slimThreshold) || (this.previousWidth < slimThreshold && window.innerWidth >= slimThreshold)) {
                  this.setState({ boards: [], endOfList: false, startId: 0 }, () => this.getBoards()) //this.forceUpdate()
            } this.previousWidth = window.innerWidth
      }
      private getBoards = () => {
            const { startId, boards, endOfList, categ, url, tag, search, searchUser } = this.state
            if (endOfList) return
            let req
            switch (categ) {
                  case BOARD_CATEGORY.tagBoards:
                        req = "/tagboards?sid=" + startId + "&t=" + tag
                        break
                  case BOARD_CATEGORY.urlBoards:
                        req = "/urlboards?sid=" + startId + "&u=" + url.replaceAll("&", "!oa@sis$").replaceAll("#", "!cor@ner$")
                        break
                  case BOARD_CATEGORY.myBoards:
                        req = "/myboards?sid=" + startId
                        break
                  case BOARD_CATEGORY.myUpBoards:
                        req = "/myupboards?sid=" + startId
                        break
                  case BOARD_CATEGORY.boards:
                        req = "/boards?sid=" + startId
                        break
                  case BOARD_CATEGORY.searchBoards:
                        req = "/searchboards?sid=" + startId + "&s=" + search
                        break
                  case BOARD_CATEGORY.userBoards:
                        req = "/userboards?sid=" + startId + "&u=" + searchUser
                  default:
            }
            if (req) {
                  fetch(req).then((r) => r.json()).then((o) => {
                        this.setState({
                              boards: boards.concat(o.boardList),
                              startId: o.endId,
                              endOfList: o.end ? true : false
                        })
                  })
            }
      }
      private handleLoadMore = () => {
            this.getBoards()
      }
      private renderItem = ({ item }) => <BoardItem item={item} />

      render(): React.ReactNode {
            const { boards, categ } = this.state
            const slim = window.innerWidth < slimThreshold
            const slimer = window.innerWidth < slimerThreshold

            if (boards.length > 0) {
                  return (
                        <View style={[pageSt, slimer ? slimerPageSt : slim ? slimPageSt : widePageSt]}>
                              <FlatList
                                    style={flatListSt}
                                    data={boards}
                                    renderItem={this.renderItem}
                                    keyExtractor={(item: any) => item.id}
                                    onEndReached={this.handleLoadMore}
                                    onEndReachedThreshold={0.5}
                              />
                        </ View>
                  )
            } else {
                  return (
                        <View style={[pageSt, slimer ? slimerPageSt : slim ? slimPageSt : widePageSt]}>
                              <Text style={vacancyTextSt}>{categ === BOARD_CATEGORY.userBoards ? "no board." : "Be the first writer of this place"}</Text>
                        </View>
                  )
            }
      }
}
const flatListSt = setStyle({
      borderTopLeftRadius: "20px",
      borderTopRightRadius: "20px"
})
const vacancyTextSt = setStyle({
      position: "absolute",
      top: "calc(50% - 10px)",
      fontSize: contentFontSize,
      width: "100%",
      textAlign: "center"
})