import { composeStyle, mainButtonStyle, mainButtonTextStyle, mainColor, setStyle, tLightGray } from "front/@lib/style"
import Action from "front/reactCom"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "reactNative"
import { BoardList } from "./boardList"
import { Tags } from "../@header/tags"
import { Write } from "./write"
import { FRONT, PROPS } from "front/@lib/util"
import Bind from "front/reactRoot"
import Header from "../@header/header"
import { Board } from "./board"
import Background from "./background"
import Follows from "./followList"
import Wrapper from "./wrapper"

window.onpopstate = (ev: any) => { // 브라우저 뒤로가기, 앞으로가기 반영
      let id = boardPage.boardList
      let urlPage: string = "home"
      if (ev.state.page_id != null) {
            urlPage = ev.state.page_id
      } console.log("urlPage", urlPage)
      const arr = urlPage.split("/")
      if (arr.length > 1 && arr[0] === "board") Action.trigger("pageBoard", Number(arr[1]))
      else {
            switch (urlPage) {
                  case "write":
                        id = boardPage.write
                        break
                  case "update":
                        id = boardPage.update
                        break
                  case "home":
                        id = boardPage.boardList
                        break
                  case "board":
                        id = boardPage.board
                        break
            }
            console.log("id", id)
            Action.trigger("page", id)
      }
}

type State = {
      page: boardPage,
      boardId: number
}

export enum boardPage {
      write,
      update,
      boardList,
      board
}

const windowHistory = {}
windowHistory[boardPage.write] = "write"
windowHistory[boardPage.update] = "update"
windowHistory[boardPage.boardList] = "home"
windowHistory[boardPage.board] = "board"

export default class Index extends Action<Props, State> {
      constructor(props: Page.Props<"ssr">) {
            super(props)
            this.state = {
                  page: PROPS.data.boardAccess ? boardPage.board : boardPage.boardList,
                  boardId: -1,
            }
            console.log("front", FRONT)
            console.log("props", PROPS)
      }

      protected ACTION_RECEIVER_TABLE: any = {
            "page": (page: boardPage, callback?) => {
                  console.log("page", boardPage[page])
                  this.pushHistory(page)
                  this.setState({ page }, () => {
                        if (callback) callback()
                  })
            },
            "pageBoardUpdate": (boardId) => {
                  this.pushHistory(boardPage.update)
                  this.setState({ page: boardPage.update, boardId })
            },
            "pageBoard": (boardId) => {
                  console.log("pb", boardId)
                  this.pushHistory(boardPage.board, boardId)
                  this.setState({ page: boardPage.board, boardId })
            }
      }
      componentDidMount() {
            super.componentDidMount()
            const urlPage = location.href.split("/")[3] // localhost url 기준
            if (PROPS.data.boardAccess) {
                  console.log("index cm")
                  const boardUrl = "/board/" + String(PROPS.data.board.id)
                  window.history.pushState({ page_id: boardUrl }, "", boardUrl)
                  PROPS.data.boardAccess = false // board로 바로 redering 용 (한 번 보여줬으면, 해당 board가 아닌 다른 반응을 해야하므로, false로 돌림, component did mount 마지막 호출이라 여기서 처리)
            } else window.history.pushState({ page_id: urlPage }, "", `/${urlPage}`); console.log("index cm1")
      }
      private pushHistory = (page, boardId?: number) => {
            let url_ = windowHistory[page]
            if (boardId) {
                  url_ += ("/" + String(boardId))
            }
            const state = { page_id: url_ }
            const title = ""
            const url = "/" + url_
            window.history.pushState(state, title, url)
      }
      render(): React.ReactNode {
            const { page, boardId } = this.state
            return (
                  <View>
                        <Background />
                        <Header page={page} />
                        <Wrapper page={page} boardId={boardId} />
                  </View>
            )
      }
}
Bind(Index)