
import { setStyle, slimThreshold, upColor, whiteSt, writeColor } from "front/@lib/style"
import { CLIENT_SETTINGS, PROPS } from "front/@lib/util"
import Action from "front/reactCom"
import React from "react"
import { Image, Pressable, Text, TextInput, View } from "reactNative"
import { signInWithPopup, GoogleAuthProvider, AuthErrorCodes, getAuth } from "firebase/auth"
import { initializeApp } from "firebase/app"
import { Page, auth } from "."

/** 랜딩 페이지이자 로그인 페이지 (extension에서는 로그인 알림으로 쓰임) */
export default class Landing extends Action<Props, State> {
      constructor(props: Props) {
            super(props)
      }
      private googleLogin = () => {
            console.log("google login")
            this.socialLogin(new GoogleAuthProvider(), ["openid", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]).then((result) => {
                  const user = result.user
                  fetch("/signIn", {
                        method: "POST",
                        headers: {
                              "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ i: user.uid, n: user.displayName?.replace(/\n|\s/g, ""), e: user.email })
                  }).then((r) => r.json()).then((o) => {
                        console.log("o", o)
                        if (o.signed) {
                              PROPS.data.name = o.name
                              PROPS.data.image = o.image
                              Action.trigger("landingOff")
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
                  return (<View style={[landingSt, landingExtSt]}>
                        <Pressable style={[buttonSt, buttonExSt]} onPress={this.googleLogin}>
                              <Text style={[textSt, buttonTextSt]}>Sign In with Google</Text>
                        </Pressable>
                  </View>)
            } else return (
                  <View style={landingSt}>
                        <View style={[sideSt, leftSideSt, slim ? slimSideSt : null]}>
                              <Image style={imageSt} source={{ uri: CLIENT_SETTINGS.host + "/images/cornerIconLongWhite.png" }} />
                              <Text style={[textSt, mainTextSt]}>Leave Comments Everywhere</Text>
                              <Text style={[textSt, subTextSt]}>Express your opinions on websites, even it doen't have a comment feature</Text>
                              <Text style={[textSt, subTextSt]}>Connect with people who share your interest in the same website</Text>
                        </View>
                        <View style={[sideSt, rightSideSt, slim ? slimSideSt : null]}>
                              <Text style={[textSt, rightMainTextSt]}> Be the first user of the prototype version </Text>
                              <Text style={[textSt, guide0TextSt]}> You have to download chrome extension (Please install by clicking 'get corner')</Text>
                              <View style={buttonSetSt}>
                                    <Pressable style={[buttonSt]}>
                                          <Text style={[textSt, buttonTextSt]}>Get Corner</Text>
                                    </Pressable>
                                    <Pressable style={[buttonSt]} onPress={this.googleLogin}>
                                          <Text style={[textSt, buttonTextSt]}>Sign In with Google</Text>
                                    </Pressable>
                              </View>
                              <Text style={[textSt, guide1TextSt]}> You can use corner by clicking the button  located in the bottom right corner after download</Text>
                        </View>
                  </View>
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
      backgroundColor: "white"
})
const sideSt = setStyle({
      width: "100%",
      display: "inline-block",
      padding: "100px"
})
const leftSideSt = setStyle({
      backgroundColor: "black"
})
const rightSideSt = setStyle({
      backgroundColor: "rgb(8 148 123)"
})
const slimSideSt = setStyle({
      padding: "20px"
})
const imageSt = setStyle({
      left: "calc(50% - 150px)",
      width: "300px",
      height: "100px"
})
const mainTextSt = setStyle({
      fontSize: "60px",
      display: "block",
      fontWeight: "800",
      marginBottom: "100px",
      marginTop: "100px",
      color: "white"
})
const textSt = setStyle({
      display: "block",
      fontWeight: "300",
      color: "white",
      textAlign: "center"
})
const subTextSt = setStyle({
      fontSize: "30px",
      marginBottom: "10px"
})
const rightMainTextSt = setStyle({
      fontSize: "40px",
      marginBottom: "70px",
      fontWeight: "600",
      marginTop: "100px"
})
const guide0TextSt = setStyle({
      display: "block",
      fontSize: "25px"
})
const guide1TextSt = setStyle({
      fontSize: "20px",
      marginTop: "20px"
})
const buttonSetSt = setStyle({
      display: "block",
      marginTop: "100px",
      position: "relative",
      textAlign: "center"
})
const buttonSt = setStyle({
      width: "350px",
      height: "60px",
      backgroundColor: "white",
      display: "inline-block",
      borderRadius: "35px",
      marginBottom: "10px",
      marginLeft: "20px",
      marginRight: "20px"
})
const buttonTextSt = setStyle({
      fontSize: "23px",
      textAlign: "center",
      lineHeight: "60px",
      width: "100%",
      display: "inline-block",
      fontWeight: "400",
      color: "black"
})
const buttonExSt = setStyle({
      marginTop: "150px",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "black"
})