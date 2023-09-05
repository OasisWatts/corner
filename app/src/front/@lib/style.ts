import { StyleSheet } from "reactNative"

export function composeStyle(a: Object, b: Object) {
      const styles = StyleSheet.compose(a, b)
      return styles
}
export function setStyle(obj: Object) {
      const styles = StyleSheet.create({ style: obj })
      return styles.style
}
export const mainColor = "black"
export const deepGray = "rgb(120,120,120)"
export const gray = "rgb(150,150,150)"
export const softGray = "rgb(180,180,180)"
export const lightGray = "rgb(220,220,220)"
export const almostWhite = "rgb(240, 240, 240)"
export const tWhite = "rgba(255,255,255,0.8)"
export const tLightGray = "rgba(220, 220, 220, 0.5)"
export const tDeepGray = "rgba(120,120,120,0.5)"
export const tWriteColor = "rgba(61,179,158,0.5)"
export const writeColor = "rgb(61,179,158)"
export const tUpColor = "rgba(228,98,98,0.5)"
export const upColor = "rgb(228,98,98)"
export const contentFontSize = "14px"
export const smallFontSize = "13px"
export const slimThreshold = 1500
export const contentFontSizeSt = setStyle({
      fontSize: contentFontSize
})
/** 기본 버튼. */
export const mainButtonStyle = setStyle({
      position: "absolute",
      borderRadius: "15px",
      top: "0",
      zIndex: "1",
      backgroundColor: "transparent"
})
/** 기본 버튼 안 텍스트. */
export const mainButtonTextStyle = setStyle({
      textAlign: "center",
      paddingTop: "1px",
      fontSize: smallFontSize,
      whiteSpace: "nowrap",
      color: deepGray
})
/** wrapper (게시글 목록, 게시글) */
export const pageSt = setStyle({
      position: "absolute",
      top: "50px",
      width: "calc(100% - 400px)",
      height: "calc(100vh - 50px)",
      borderTopLeftRadius: "20px",
      borderTopRightRadius: "20px"
})
export const slimPageSt = setStyle({
      left: "65px",
      width: "calc(100% - 130px)"
})
export const widePageSt = setStyle({
      left: "200px",
      width: "calc(100% - 400px)",
})

/** 목록 아이템 (게시글 리스트, 댓글 리스트) */
export const itemSt = setStyle({
      padding: "10px",
      position: "relative",
      display: "block",
      backgoundColor: tWhite,
      borderBottomColor: lightGray,
      borderBottomWidth: "1px",
      borderBottomStyle: "solid"
})
/** writer의 이미지 및 좋아요 등 wrapper */
export const profileSt = setStyle({
      width: "60px",
      display: "inline-block"
})
/** date, content, numComment 등 wrapper (게시글, 댓글) */
export const contentsSt = setStyle({
      width: "calc(100% - 65px)",
      display: "inline-block",
      marginLeft: "5px"
})
export const blockSt = setStyle({
      display: "block"
})
export const inlineBlockSt = setStyle({
      display: "inline-block"
})
export const whiteSt = setStyle({
      backgroundColor: "white"
})
export const almostWhiteSt = setStyle({
      backgroundColor: almostWhite
})
export const lightGraySt = setStyle({
      backgroundColor: lightGray
})
export const fontBlackSt = setStyle({
      color: "black"
})
/** writer text (게시글, 댓글) */
export const writerSt = setStyle({
      marginRight: "10px",
      fontWeight: "600",
      fontSize: contentFontSize
})
/** date text (게시글, 댓글) */
export const dateSt = setStyle({
      color: gray,
      fontSize: smallFontSize
})
export const updatedSt = setStyle({
      color: gray,
      fontSize: smallFontSize,
      marginLeft: "10px"
})
/** 입력란 (글쓰기, 게시글) */
export const inputSt = setStyle({
      position: "absolute",
      fontSize: contentFontSize,
      outlineStyle: "none",
      paddingLeft: "10px",
      paddingTop: "5px"
})
export const buttonSetSt = setStyle({
      display: "block",
      marginTop: "5px",
      marginRight: "15px",
      height: "20px",
      position: "relative"
})
/** 버튼 set에서 오른쪽 (삭제, 업데이트 등) */
export const rightButtonSetSt = setStyle({
      position: "absolute",
      right: "0",
      display: "block"
})
/** 오른쪽 버튼 */
export const rightButtonSt = setStyle({
      borderRadius: "15px",
      zIndex: "1",
      backgroundColor: "transparent",
      height: "20px",
      marginLeft: "10px",
      display: "inline"
})
/** 제출 버튼 */
export const submitButtonTextSt = setStyle({
      backgroundColor: tWriteColor,
      borderRadius: "20px",
      paddingLeft: "20px",
      paddingRight: "20px",
      paddingTop: "3px",
      paddingBottom: "3px",
      lineHeight: "20px",
      color: "black"
})
/** 태그 버튼 */
export const tagButtonTextSt = setStyle({
      backgroundColor: tWhite,
      borderRadius: "20px",
      paddingLeft: "10px",
      paddingRight: "10px",
      lineHeight: "30px",
      display: "inline-block",
      fontSize: contentFontSize,
      color: "black"
})
export const profileImgSt = setStyle({
      width: "40px",
      height: "40px",
      marginLeft: "10px"
})
/** 프로파일 이미지 버튼 */
export const followButtonSt = composeStyle(
      mainButtonStyle,
      {
            top: "45px",
            width: "26px",
            height: "26px",
            marginLeft: "17px",
            borderRadius: "13px"
      }
)
export const followImgSt = setStyle({
      width: "20px",
      height: "20px",
      borderRadius: "10px",
      marginLeft: "3px",
      marginTop: "4px"
})
/** 중요 왼쪽 버튼 */
export const upButtonSt = composeStyle(
      mainButtonStyle,
      {
            top: "-2.5px",
            left: "0",
            width: "25px",
            height: "25px",
            borderRadius: "12px"
      }
)
/** 중요 오른쪽 버튼 */
export const commentButtonSt = composeStyle(
      mainButtonStyle,
      {
            top: "-2.5px",
            left: "80px",
            width: "25px",
            height: "25px",
            borderRadius: "12px"
      }
)
export const hoveredComment = setStyle({
      backgroundColor: tWriteColor
})
export const hoveredUp = setStyle({
      backgroundColor: tUpColor
})
/** 중요 버튼 텍스트. */
export const importantButtonTextStyle = setStyle({
      fontSize: smallFontSize,
      position: "absolute"
})
/** 중요 왼쪽 버튼 텍스트 */
export const numSt = composeStyle(
      importantButtonTextStyle, {
      left: "35px"
})
/** 중요 오른쪽 버튼 텍스트 */
export const numSt1 = composeStyle(
      importantButtonTextStyle, {
      left: "115px"
})
export const importantImageSt = setStyle({
      width: "15px",
      height: "15px",
      top: "5px",
      left: "5px"
})