/** 클라이언트 설정 객체. */
export const CLIENT_SETTINGS: Settings = "FRONT" in Object && eval("window['__CLIENT_SETTINGS']") // template html에서 CLIENT_SETTINGS 가져옴
/** 프론트엔드 여부. */
export const FRONT: boolean = Boolean(CLIENT_SETTINGS)
/** 현재 페이지 최상위 컴포넌트의 속성 객체. */
export const PROPS: Page.Props<any> = FRONT && eval("window['__PROPS']")// window['__PROPS'] (data/index.html 안)를 가져옴
/** extension 여부. */
export const extension: boolean = FRONT && PROPS.data.ext
/** userKey */
export const userKey: number = FRONT && PROPS.data.userKey
/** full 화면 여부. (extension이 아니거나, extension일 때 full로 화면을 킨 경우.) [미완]*/
export const fullStyle: boolean = FRONT && (!PROPS.data.ext)