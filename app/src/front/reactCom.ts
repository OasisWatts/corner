import React from "react"

type ActionReceiverPolytable = {
      [key in keyof ActionReceiverTable]: Array<ActionReceiverTable[key]>
};
export default abstract class Action<P = {}, S = {}> extends React.PureComponent<P, S> {
      private static RECEIVER: ActionReceiverPolytable = {};

      private static flushed = false;

      private static triggers: Function[] = [];

      public static flush(): void { // componentdidmount 하기 전에 쌓여있는 trigger을 모두 호출. flushed = 1
            Action.flushed = true
            for (const v of Action.triggers) {
                  v()
            }
      }

      public static trigger<
            T extends keyof ActionReceiverTable,
            A extends ArgumentsOf<ActionReceiverTable[T]>,
      >(
            type: T,
            ...args: A
      ): void {
            if (!Action.flushed) { // flushed가 false(초기값)면 triggers에 모든 trigger 저장.
                  return void Action.triggers.push(() => Action.trigger(type, ...args))
            }
            const list: Behavior<any[]>[] = Action.RECEIVER[type] || []

            for (let i = list.length - 1; i >= 0; i--) {
                  if (list[i](...args) === false) break
            }
            // 디버그용 로그 출력. 디버그 시, 사용.
            // if (!type.includes("timer")) console.log("Action trigger: ", type, JSON.stringify(args))
      }

      protected readonly ACTION_RECEIVER_TABLE: any = {}; // 트리거 작동집

      componentDidMount(): void { // POLYTABLE에 TABLE 등록
            let k

            for (k in this.ACTION_RECEIVER_TABLE) {
                  if (Action.RECEIVER.hasOwnProperty(k)) {
                        (Action.RECEIVER[k] as any).push(this.ACTION_RECEIVER_TABLE[k])
                  } else {
                        (Action.RECEIVER[k] as any) = [this.ACTION_RECEIVER_TABLE[k]]
                  }
            }
      }

      componentWillUnmount(): void { // POLYTABLE에서 TABLE 마지막 요소만 남김
            let k

            for (k in this.ACTION_RECEIVER_TABLE) {
                  const list: any = Action.RECEIVER[k]

                  list.splice(list.lastIndexOf(this.ACTION_RECEIVER_TABLE[k]), 1)
            }
      }
}
