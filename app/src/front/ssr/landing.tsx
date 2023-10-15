
import { setStyle, slimThreshold, softGray, lightWriteColor, upColor, whiteSt, writeColor } from "front/@lib/style"
import { CLIENT_SETTINGS, PROPS } from "front/@lib/util"
import Action from "front/reactCom"
import React from "react"
import { Image, Linking, Pressable, Text, TextInput, View } from "reactNative"
import { signInWithPopup, GoogleAuthProvider, AuthErrorCodes, getAuth } from "firebase/auth"
import { initializeApp } from "firebase/app"
import { Page, auth } from "."

/** 랜딩 페이지이자 로그인 페이지 (extension에서는 로그인 알림으로 쓰임) */
export default class Landing extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
      }
      private installCorner = () => {
            window.open(CLIENT_SETTINGS.extension)
      }
      private googleLogin = () => {
            this.socialLogin(new GoogleAuthProvider(), ["openid", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]).then((result) => {
                  const user = result.user
                  fetch("/signIn", {
                        method: "POST",
                        headers: {
                              "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ i: user.uid, n: user.displayName?.replace(/\n|\s/g, ""), e: user.email })
                  }).then((r) => r.json()).then((o) => {
                        if (o.signed) {
                              PROPS.data.name = o.name
                              PROPS.data.image = o.image
                              Action.trigger("tagReload")
                              Action.trigger("followListTag", null)
                              Action.trigger("page", Page.boardList, () => Action.trigger("landingOff"))
                        }
                  })
            })
            // .catch(() => {
            //       JJorm.trigger("error", ApplicationCode.LOGIN_FAILED)
            // });
      }
      private socialLogin = (provider: any, scopes?: Array<string>) => {
            if (scopes) {
                  scopes.forEach(scope => {
                        provider.addScope(scope);
                  });
            }
            return signInWithPopup(auth, provider)
      }

      render(): React.ReactNode {
            const slim = window.innerWidth < slimThreshold
            if (PROPS.data.ext) {
                  // if (slim) {
                  return (<View style={[landingSt, landingExtSt]}>
                        <Pressable style={[buttonSt, buttonExSt, slim ? slimButtonSt : null]} onPress={this.googleLogin}>
                              <Image style={[googleImageSt, slim ? slimGoogleImageSt : null]} source={{ uri: CLIENT_SETTINGS.host + "/images/google.svg" }} />
                              <Text style={[textSt, buttonTextSt, slim ? slimButtonTextSt : null]}>Sign In with Google</Text>
                        </Pressable>
                  </View>)
            } else return (
                  <View style={landingSt}>
                        <View style={[sideSt, leftSideSt, slim ? slimLeftSideSt : null]}>
                              <Image style={imageSt} source={{ uri: CLIENT_SETTINGS.host + "/images/cornerIconLongBlack.png" }} />
                              <Text style={[textSt, mainTextSt, slim ? slimMainTextSt : null]}>Leave Comments Everywhere</Text>
                              <Text style={[textSt, subTextSt, slim ? slimSubTextSt : null]}>Express your opinions on websites, even it doen't have a comment feature</Text>
                              <Text style={[textSt, subTextSt, slim ? slimSubTextSt : null]}>Connect with people who share your interest in the same website</Text>
                        </View>
                        <View style={[sideSt, rightSideSt, slim ? slimRightSideSt : null]}>
                              <Text style={[textSt, rightMainTextSt, slim ? slimRightMainTextSt : null, whiteFontSt]}> Be the first user of the prototype version </Text>
                              <Text style={[textSt, guideTextSt, slim ? slimGuideTextSt : null, whiteFontSt]}> You have to install a chrome extension (Please click 'Install Corner')</Text>
                              <View style={[buttonSetSt, slim ? slimButtonSetSt : null]}>
                                    <Pressable style={[buttonSt, slim ? slimButtonSt : null]} onPress={this.installCorner}>
                                          <Text style={[textSt, buttonTextSt, slim ? slimButtonTextSt : null]}>Install Corner</Text>
                                    </Pressable>
                                    <Pressable style={[buttonSt, slim ? slimButtonSt : null]} onPress={this.googleLogin}>
                                          <Image style={[googleImageSt, slim ? slimGoogleImageSt : null]} source={{ uri: CLIENT_SETTINGS.host + "/images/google.svg" }} />
                                          <Text style={[textSt, buttonTextSt, slim ? slimButtonTextSt : null]}>Sign In with Google</Text>
                                    </Pressable>
                              </View>
                              <Text style={[textSt, guideTextSt, slim ? slimGuideTextSt : null, whiteFontSt]}> To visit corner as a website, sign in with google</Text>
                              <Text style={[textSt, rightMainTextSt, slim ? slimRightMainTextSt : null, slim ? slimBigGuideTextSt : bigGuideTextSt, whiteFontSt]}>Corner Extension Guide</Text>
                              <Text style={[textSt, guideTextSt, slim ? slimGuideTextSt : null, whiteFontSt]}> Right click anywhere on a website and select 'comment on corner' from the context menu to activate the side panel</Text>
                              <Text style={[textSt, guideTextSt, slim ? slimGuideTextSt : null, whiteFontSt]}> Icon on the corner displays the number of comments if any comment exists on the page</Text>
                              <View style={[featureWrapSt, slim ? slimFeatureWrapSt : null]}>
                                    <Image style={[slim ? slimFeatureImgSt : featureImgSt]} source={{ uri: CLIENT_SETTINGS.host + "/images/featureContextmenu.svg" }} />
                                    <Image style={[slim ? slimFeatureImgSt : featureImgSt]} source={{ uri: CLIENT_SETTINGS.host + "/images/featureSidepanel.svg" }} />
                                    <Image style={[slim ? slimFeatureImgSt : featureImgSt]} source={{ uri: CLIENT_SETTINGS.host + "/images/featureBoardnum.svg" }} />
                              </View>
                              <Text style={[textSt, guideTextSt, slim ? slimGuideTextSt : null, whiteFontSt]}> Try using it on a OTT service like Netflix and Disney+, or an brand online store like Nike and Samsung</Text>
                        </View>
                  </View >
            )
      }
}
const landingExtSt = setStyle({
      height: "100vh",
      textAlign: "center"
})
const landingSt = setStyle({
      width: "100vw",
      zIndex: "200",
      display: "inline-block",
      backgroundColor: "white",
      minHeight: "100vh"
})
const sideSt = setStyle({
      width: "100%",
      display: "inline-block",
      padding: "100px"
})
const leftSideSt = setStyle({
      backgroundColor: "white"
})
const rightSideSt = setStyle({
      backgroundColor: writeColor
})
const slimLeftSideSt = setStyle({
      padding: "15px",
      paddingBottom: "30px"
})
const slimRightSideSt = setStyle({
      padding: "15px",
      paddingTop: "30px",
      paddingBottom: "30px"
})
const imageSt = setStyle({
      left: "calc(50% - 150px)",
      width: "300px",
      height: "100px"
})
const googleImageSt = setStyle({
      width: "30px",
      height: "30px",
      display: "inline-block",
      top: "7px",
      marginRight: "10px"
})
const slimGoogleImageSt = setStyle({
      width: "20px",
      height: "20px",
      top: "5px"
})
const mainTextSt = setStyle({
      fontSize: "60px",
      display: "block",
      fontWeight: "800",
      marginBottom: "50px",
      marginTop: "50px"
})
const slimMainTextSt = setStyle({
      fontSize: "35px",
      marginBottom: "20px",
      marginTop: "30px"
})
export const textSt = setStyle({
      display: "block",
      fontWeight: "300",
      textAlign: "center"
})
const subTextSt = setStyle({
      fontSize: "30px",
      marginBottom: "10px"
})
const slimSubTextSt = setStyle({
      fontSize: "20px"
})
const rightMainTextSt = setStyle({
      fontSize: "40px",
      marginBottom: "30px",
      fontWeight: "600",
})
const slimRightMainTextSt = setStyle({
      fontSize: "35px",
      marginBottom: "20px"
})
const bigGuideTextSt = setStyle({
      marginTop: "100px"
})
const slimBigGuideTextSt = setStyle({
      marginTop: "50px"
})
const guideTextSt = setStyle({
      display: "block",
      fontSize: "25px",
      marginTop: "10px"
})
const slimGuideTextSt = setStyle({
      fontSize: "20px"
})
const buttonSetSt = setStyle({
      display: "block",
      marginTop: "50px",
      marginBottom: "30px",
      position: "relative",
      textAlign: "center"
})
const slimButtonSetSt = setStyle({
      marginTop: "20px",
      marginBottom: "10px"
})
export const buttonSt = setStyle({
      width: "350px",
      height: "60px",
      backgroundColor: "white",
      display: "inline-block",
      borderRadius: "35px",
      marginBottom: "10px",
      marginLeft: "20px",
      marginRight: "20px"
})
export const slimButtonSt = setStyle({
      width: "200px",
      height: "40px"
})
export const buttonTextSt = setStyle({
      fontSize: "23px",
      textAlign: "center",
      lineHeight: "60px",
      display: "inline-block",
      fontWeight: "400",
      color: "black"
})
export const slimButtonTextSt = setStyle({
      fontSize: "15px",
      lineHeight: "40px"
})
export const buttonExSt = setStyle({
      marginTop: "150px",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: softGray
})
const featureWrapSt = setStyle({
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      marginTop: "50px",
      marginBottom: "50px",
      width: "100%",
      flexWrap: "wrap"
})
const slimFeatureWrapSt = setStyle({
      marginTop: "20px",
      marginBottom: "20px"
})
const featureImgSt = setStyle({
      width: "260px",
      height: "160px",
      marginRight: "50px"
})
const slimFeatureImgSt = setStyle({
      width: "195px",
      height: "120px",
      marginRight: "15px",
      marginTop: "15px"
})
const whiteFontSt = setStyle({
      color: "white"
})