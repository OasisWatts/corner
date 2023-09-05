import { contentFontSize, contentFontSizeSt, pageSt, setStyle, slimPageSt, slimThreshold, tLightGray, tWhite, widePageSt } from "front/@lib/style"
import Action from "front/reactCom"
import React from "react"
import { FlatList, Text, View } from "reactNative"
import { BoardItem } from "./boardItem"
import { PROPS, extension } from "front/@lib/util"
import { BOARD_CATEGORY } from "common/applicationCode"
// import { CLIENT_SETTINGS } from "front/@lib/util"

const HOST = ""// CLIENT_SETTINGS.host

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
                  console.log("deleteboarditem", boardId)
                  const { boards } = this.state
                  const newBoards = [...boards.filter((board) => { console.log("boardid", board.id); return (board.id !== boardId) })]
                  this.setState({ boards: newBoards })
                  this.forceUpdate()
            },
            "boardListTag": (tag, isUrl, total) => {
                  console.log("blt", tag, isUrl, total)
                  if (total) this.setState({ startId: 0, boards: [], endOfList: false, categ: BOARD_CATEGORY.boards }, () => this.getBoards())
                  else if (isUrl) this.setState({ startId: 0, boards: [], endOfList: false, categ: BOARD_CATEGORY.urlBoards, url: tag }, () => this.getBoards())
                  else this.setState({ startId: 0, boards: [], endOfList: false, categ: BOARD_CATEGORY.tagBoards, tag }, () => this.getBoards())
            },
            "boardListSearch": (search) => {
                  console.log("bls", search)
                  this.setState({ startId: 0, boards: [], endOfList: false, categ: BOARD_CATEGORY.searchBoards, search }, () => this.getBoards())
            },
            "boardListMyBoard": () => {
                  this.setState({ startId: 0, boards: [], endOfList: false, categ: BOARD_CATEGORY.myBoards }, () => this.getBoards())
            },
            "boardListMyUp": () => {
                  this.setState({ startId: 0, boards: [], endOfList: false, categ: BOARD_CATEGORY.myUpBoards }, () => this.getBoards())
            },
            "boardListUser": (searchUser) => {
                  console.log("blu")
                  this.setState({ startId: 0, boards: [], endOfList: false, categ: BOARD_CATEGORY.userBoards, searchUser }, () => this.getBoards())
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
            console.log("getBoards", startId, boards, endOfList, categ, url, tag, search, searchUser)
            let req
            switch (categ) {
                  case BOARD_CATEGORY.tagBoards:
                        req = "/tagboards?sid=" + startId + "&t=" + tag
                        break
                  case BOARD_CATEGORY.urlBoards:
                        req = "/urlboards?sid=" + startId + "&u=" + url
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
                  case BOARD_CATEGORY.userBoards:
                        req = "/userboards?sid=" + startId + "&u=" + searchUser
                  default:
            }
            if (req) {
                  fetch(req).then((r) => r.json()).then((o) => {
                        console.log("boards o", o)
                        this.setState({
                              boards: boards.concat(o.boardList),
                              startId: o.endId,
                              endOfList: o.end ? true : false
                        })
                  })
            }
      }
      private handleLoadMore = () => {
            console.log("loadmore")
            this.getBoards()
      }
      private renderItem = ({ item }) => <BoardItem item={item} />

      render(): React.ReactNode {
            const { boards, categ } = this.state
            const slim = window.innerWidth < slimThreshold
            if (boards.length > 0) {
                  return (
                        <View style={[pageSt, transparentWhiteSt, slim ? slimPageSt : widePageSt]}>
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
                        <View style={[pageSt, transparentWhiteSt, slim ? slimPageSt : widePageSt]}>
                              <Text style={vacancyTextSt}>{categ === BOARD_CATEGORY.userBoards ? "게시글이 없습니다." : "첫번째 게시글의 주인이 되어보세요."}</Text>
                        </View>
                  )
            }
      }
}
const flatListSt = setStyle({
      borderTopLeftRadius: "20px",
      borderTopRightRadius: "20px"
})
export const transparentWhiteSt = setStyle({
      backgroundColor: tWhite
})
const vacancyTextSt = setStyle({
      position: "absolute",
      top: "calc(50% - 10px)",
      fontSize: contentFontSize,
      width: "100%",
      textAlign: "center"
})