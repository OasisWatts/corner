
import Action from "front/reactCom"
import React from "react"
import { View } from "reactNative"
import { Page } from "."
import { Write } from "./write"
import { BoardList } from "./boardList"
import { Board } from "./board"
import Follows from "./followList"
import Navigator from "./navigator"
import { setStyle, slimThreshold, slimThresholdExceptSize, slimThresholdSize } from "front/@lib/style"
import Landing from "./landing"
import Setting from "./setting"

type Props = {
      page: Page
      boardId: number
}

export default class Wrapper extends Action<Props, State> {
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

      private renderPage = () => {
            const { page, boardId } = this.props
            switch (page) {
                  case Page.update:
                        return <Write update={true} boardId={boardId} />
                  case Page.boardList:
                        return <BoardList />
                  case Page.board:
                        return <Board boardId={boardId} />
                  case Page.setting:
                        return <Setting />
            }
      }
      render(): React.ReactNode {
            const slim = window.innerWidth < slimThreshold
            return (
                  <View style={slim ? slimWrapperSt : wideWrapperSt}>
                        {this.renderPage()}
                  </View>
            )
      }
}
const wideWrapperSt = setStyle({
      position: "relative",
      width: slimThresholdSize,
      left: slimThresholdExceptSize
})
const slimWrapperSt = setStyle({
      position: "relative",
      width: "100%"
})