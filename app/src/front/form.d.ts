/** Window 타입 추가. */
interface Window {
      __CLIENT_SETTINGS: any
      __PROPS: any
}
/**`RECEIVER`에서 정의하는 핸들러 함수의 자료형.*/
declare type Behavior<T extends any[] = []> = (...args: T) => boolean | void;// T가 없으면 []로 초기화
/** 주어진 함수의 매개 변수의 자료형.*/
declare type ArgumentsOf<T> = T extends (...args: infer Arguments) => any ? Arguments : never;
/**
 * 딕셔너리의 자료형.
 *
 * 식별자의 자료형은 문자열로 취급한다.
 */
declare type Table<V> = {
      [key: string]: V,
      [key: number]: V,
}
declare namespace Page {
      type Key = keyof Page.DataTable
      type DataTable = {
            ssr: {
                  url: string | null
                  hostname: string | null
                  ext: boolean
                  userKey: number
                  boardAccess?: boolean
                  board?: BoardType
            }
      }
      interface Props<T extends Page.Key> {
            locale: string
            page: T
            path: string
            title: string
            data: Page.DataTable[T] // data/lang/
      }
}
declare type ActionReceiverTable = Partial<{
      "page": Action<[page, () => {}?]>,
      "pageBoardUpdate": Action<[number]>,
      "pageBoard": Action<[number]>,
      "pageFollowBoardList": Action<[number]>,
      "deleteBoardItem": Action<[number]>,
      "deleteCommentItem": Action<[number]>,
      "boardReload": Action<>,
      "followReload": Action<[number, boolean]>,
      "boardListTag": Action<[string, boolean?, boolean?]>,
      "boardListSearch": Action<string>,
      "searchShow": Action<[boolean]>,
      "boardListMyBoard": Action,
      "boardListMyUp": Action,
      "boardListUser": Action<[number]>,
      "setting": Action,
      "tagReload": Action,
      "followListUser": Action<[string]>
}>

declare type Props = {}
declare type State = {}