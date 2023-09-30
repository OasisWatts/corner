import Action from "front/reactCom"
import React from "react"
import { View } from "reactNative"
import { PROPS } from "front/@lib/util"
import Bind from "front/reactRoot"
import Header from "../@header/header"
import Follows from "./followList"
import Wrapper from "./wrapper"
import Landing from "./landing"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import Navigator from "./navigator"

window.onpopstate = (ev: any) => { // 브라우저 뒤로가기, 앞으로가기 반영
      let id = Page.boardList
      let urlPage: string = "home"
      if (ev.state.page_id != null) {
            urlPage = ev.state.page_id
      }
      const arr = urlPage.split("/")
      if (arr.length > 1 && arr[0] === "board") Action.trigger("pageBoard", Number(arr[1]))
      else {
            switch (urlPage) {
                  case "update":
                        id = Page.update
                        break
                  case "home":
                        id = Page.boardList
                        break
                  case "board":
                        id = Page.board
                        break
            }
            Action.trigger("page", id)
      }
}

const firebaseConfig = {
      apiKey: "AIzaSyAL6T0maW_okdIm1M4oWtdiO-uequejhTc",
      authDomain: "corner-b22ac.firebaseapp.com",
      projectId: "corner-b22ac",
      storageBucket: "corner-b22ac.appspot.com",
      messagingSenderId: "919517213292",
      appId: "1:919517213292:web:bf7907cbfae98839c21e49",
      measurementId: "G-68V1EBWLNG"
}
const firebaseapp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseapp)

type State = {
      page: Page,
      boardId: number
      landing: boolean
}

export enum Page {
      update,
      boardList,
      board,
      setting
}

const windowHistory = {}
windowHistory[Page.update] = "update"
windowHistory[Page.boardList] = "home"
windowHistory[Page.board] = "board"
windowHistory[Page.setting] = "setting"


export default class Index extends Action<Props, State> {
      constructor(props: Page.Props<"ssr">) {
            super(props)
            this.state = {
                  page: PROPS.data.boardAccess ? Page.board : Page.boardList,
                  boardId: -1,
                  landing: false
            }
      }

      protected ACTION_RECEIVER_TABLE: any = {
            "page": (page: Page, callback?) => {
                  this.pushHistory(page)
                  this.setState({ page }, () => {
                        if (callback) callback()
                  })
            },
            "pageBoardUpdate": (boardId) => {
                  this.pushHistory(Page.update)
                  this.setState({ page: Page.update, boardId })
            },
            "pageBoard": (boardId) => {
                  this.pushHistory(Page.board, boardId)
                  this.setState({ page: Page.board, boardId })
            },
            "pageReload": () => {
                  this.forceUpdate()
            },
            landingOff: () => {
                  this.setState({ landing: false }, () => {
                        if (!PROPS.data.boardAccess) {
                              Action.trigger("boardListReload")
                        }
                  })
            },
            landingOn: () => {
                  this.setState({ landing: true })
            }
      }
      componentDidMount() {
            super.componentDidMount()
            const urlPage = location.href.split("/")[3] // localhost url 기준
            if (PROPS.data.boardAccess) {
                  const boardUrl = "/board/" + String(PROPS.data.board.id)
                  window.history.pushState({ page_id: boardUrl }, "", boardUrl)
                  PROPS.data.boardAccess = false // board로 바로 redering 용 (한 번 보여줬으면, 해당 board가 아닌 다른 반응을 해야하므로, false로 돌림, component did mount 마지막 호출이라 여기서 처리)
            } else window.history.pushState({ page_id: urlPage }, "", `/${urlPage}`)

            if (PROPS.data.ss) this.setState({ landing: false })
            else this.setState({ landing: true })
            // const auth_ = getAuth()
            // auth_.onAuthStateChanged((user) => { // react root으로 옮겨서 로그인 정보 알아, landing 여부를 알아내기 전까지 랜더링되지 않게 할까
            //       console.log("sc", user)
            //       if (user) {
            //             fetch("/signIn", {
            //                   method: "POST",
            //                   headers: {
            //                         "Content-Type": "application/json"
            //                   },
            //                   body: JSON.stringify({ i: user.uid, n: user.displayName?.replace(/\n|\s/g, ""), e: user.email })
            //             }).then((r) => r.json()).then((o) => {
            //                   console.log("signIn", o)
            //                   if (o.signed) {
            //                         this.setState({ landing: false })
            //                   } else this.setState({ landing: true })
            //             })
            //       } else this.setState({ landing: true })
            // })
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
            const { page, boardId, landing } = this.state
            return (
                  <View>
                        <Header page={page} />
                        <Wrapper page={page} boardId={boardId} />
                        {landing ? <Landing /> : null}
                        <Navigator />
                        <Follows />
                  </View>
            )
      }
}
Bind(Index)