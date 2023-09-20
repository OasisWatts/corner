import express from "express"
import cors from "cors"
import path from "path"
import session from "express-session"
import { engine, pageBuilder } from "./reactNest"
import DB from "./database/connection"
import { StatementBoard } from "./database/StatementBoard"
import { SETTINGS, writeClientConstants } from "./util/setting"
import { BOARD_CATEGORY } from "common/applicationCode"
import { getLocale, loadLanguages } from "./util/language"
import CookieParser from "cookie-parser"
import { StatementUser } from "./database/statementUser"

const app = express()
const MAX_CONTENTS_LEN = SETTINGS.board.contentsLen

declare module 'express-session' {
      interface SessionData {
            userKey: number | null
            isLogined: boolean
      }
}

function parseUrl(url) {
      return url.replaceAll("!oa@sis$", "&").replaceAll("!cor@ner$", "#")
}
export const send404 = (req, res) => {
      res.sendStatus(404)
}
DB.initialize().then(() => {
      writeClientConstants()
      loadLanguages()
      app.engine("js", engine)
      app.set("views", path.resolve(__dirname, "./pages"))
      app.set("view engine", "js")
      app.use(cors())
      app.use(express.urlencoded({ extended: true }))
      app.use(express.text())
      app.use(express.json())
      app.use(CookieParser(SETTINGS.cookie.secret))
      app.use((req, res, next) => {
            req.locale = getLocale(req)
            next(null)
      })
      app.use(session({
            secret: "corner",
            resave: false,
            saveUninitialized: true,
            cookie: {
                  httpOnly: false, // cannot be true because the session needs to be used in ws
                  maxAge: SETTINGS.session.maxAge
            },
      }))
      app.use("/profiles", express.static(path.resolve(__dirname, "./profiles"), { maxAge: SETTINGS.cookie.maxAge }), send404)
      app.use("/images", express.static(path.resolve(__dirname, "./images"), { maxAge: SETTINGS.cookie.maxAge }), send404)
      app.use("/pages", express.static(path.resolve(__dirname, "./pages"), { maxAge: SETTINGS.cookie.maxAge }), send404)
      app.use("/strings", express.static(path.resolve(__dirname, "./strings"), { maxAge: SETTINGS.cookie.maxAge }), send404)
      app.use("/constants.js", (req, res) => res.sendFile(path.resolve(__dirname, "./constants.js")))
      app.use("/board/constants.js", (req, res) => res.sendFile(path.resolve(__dirname, "./constants.js")))
      app.use("/favicon.ico", express.static(path.resolve(__dirname, "./images/favicon.ico"), { maxAge: SETTINGS.cookie.maxAge }), send404)
      app.get("/admin/load-languages", (req, res) => loadLanguages())
      // 전체 게시글 목록 조회.
      app.get("/boards", async (req, res, next) => {
            const startId = Number(req.query.sid)
            const userKey = req.session.userKey
            console.log("boards", userKey, req.session.isLogined)
            if (!req.session.isLogined || !userKey) res.redirect("/") // redirection함..
            else {
                  const result = await StatementBoard.boardList(startId, BOARD_CATEGORY.boards, userKey)
                  console.log("result", JSON.stringify(result))
                  res.send(JSON.stringify(result))
            }
      }) // 본인이 작성한 게시글 목록 조회.
      app.get("/myboards", async (req, res, next) => {
            const startId = Number(req.query.sid)
            const userKey = req.session.userKey
            if (!req.session.isLogined || !userKey) res.redirect("/")
            else {
                  const result = await StatementBoard.boardList(startId, BOARD_CATEGORY.myBoards, userKey)
                  console.log("result", JSON.stringify(result))
                  res.send(JSON.stringify(result))
            }
      }) // 본인이 up한 게시글 목록 조회.
      app.get("/myupboards", async (req, res, next) => {
            const startId = Number(req.query.sid)
            const userKey = req.session.userKey
            if (!req.session.isLogined || !userKey) res.redirect("/")
            else {
                  const result = await StatementBoard.boardList(startId, BOARD_CATEGORY.myUpBoards, userKey)
                  console.log("result", JSON.stringify(result))
                  res.send(JSON.stringify(result))
            }
      }) // 같은 태그의 게시글 목록 조회.
      app.get("/tagboards", async (req, res, next) => {
            const startId = Number(req.query.sid)
            const tag = String(req.query.t)
            const userKey = req.session.userKey
            if (!req.session.isLogined || !userKey) res.redirect("/")
            else {
                  const result = await StatementBoard.boardList(startId, BOARD_CATEGORY.tagBoards, userKey, undefined, tag)
                  console.log("result", JSON.stringify(result))
                  res.send(JSON.stringify(result))
            }
      }) // 같은 url의 게시글 목록 조회.
      app.get("/urlboards", async (req, res, next) => {
            const startId = Number(req.query.sid)
            const url = parseUrl(String(req.query.u))
            const userKey = req.session.userKey
            if (!req.session.isLogined || !userKey) res.redirect("/")
            else {
                  const result = await StatementBoard.boardList(startId, BOARD_CATEGORY.urlBoards, userKey, url)
                  console.log("result", JSON.stringify(result))
                  res.send(JSON.stringify(result))
            }
      }) // 검색어의 게시글 목록 조회.
      app.get("/searchboards", async (req, res, next) => {
            const startId = Number(req.query.sid)
            const search = String(req.query.s)
            console.log("sb", startId, search)
            const userKey = req.session.userKey
            if (!req.session.isLogined || !userKey) res.redirect("/")
            else {
                  const result = await StatementBoard.boardList(startId, BOARD_CATEGORY.searchBoards, userKey, undefined, undefined, search)
                  console.log("result", JSON.stringify(result))
                  res.send(JSON.stringify(result))
            }
      })
      // 유저의 게시글 목록 조회.
      app.get("/userboards", async (req, res, next) => {
            const startId = Number(req.query.sid)
            const searchUser = Number(req.query.u)
            console.log("ub", startId, searchUser)
            const userKey = req.session.userKey
            if (!req.session.isLogined || !userKey) res.redirect("/")
            else {
                  const result = await StatementBoard.boardList(startId, BOARD_CATEGORY.userBoards, userKey, undefined, undefined, undefined, searchUser)
                  res.send(JSON.stringify(result))
            }
      })
      // 댓글 조회.
      app.get("/comments", async (req, res) => {
            const boardId = Number(req.query.id)
            const startId = Number(req.query.startId)
            const userKey = req.session.userKey
            if (!req.session.isLogined || !userKey) res.redirect("/")
            else {
                  const result = await StatementBoard.commentList(boardId, startId, userKey)
                  res.send(JSON.stringify(result))
            }
      })
      // 게시글 등록.
      app.post("/boardInsert", async (req, res) => {
            const userKey = req.session.userKey
            console.log("body", req.body)
            const contents = req.body.c
            const hashTag = req.body.t
            let url = parseUrl(req.body.u)
            let hostname = req.body.h
            if (contents.length > MAX_CONTENTS_LEN) return
            if (url === "") url = null
            if (hostname === "" || url === hostname) hostname = null
            console.log("u", url, hostname)
            if (!req.session.isLogined || !userKey) res.redirect("/")
            else {
                  console.log("0")
                  const result = await DB.Manager.transaction(() => StatementBoard.boardInsert(userKey, contents, hashTag, url, hostname))
                  if (result) res.send(true)
            }
      })
      // 게시글 수정.
      app.post("/boardUpdate", async (req, res) => {
            const boardId = Number(req.query.id)
            const userKey = req.session.userKey
            const contents = req.body.c
            const hashTag = req.body.t
            if (contents.length > MAX_CONTENTS_LEN) return
            if (!req.session.isLogined || !userKey) res.redirect("/")
            else {
                  const result = await StatementBoard.boardUpdate(boardId, userKey, contents, hashTag)
                  if (result) res.send(true)
            }
      })
      // 게시글 삭제.
      app.get("/boardDelete", async (req, res) => {
            const boardId = Number(req.query.id)
            const userKey = req.session.userKey
            if (userKey) {
                  const result = await StatementBoard.boardDelete(boardId, userKey)
                  if (result) res.send(true)
            }
      })
      // 댓글 등록.
      app.post("/commentInsert", async (req, res) => {
            const boardId = Number(req.query.bid)
            const userKey = req.session.userKey
            const contents = req.body.c
            if (!req.session.isLogined || !userKey) res.redirect("/")
            else {
                  const result = await StatementBoard.commentInsert(boardId, userKey, contents)
                  if (result) res.send(true)
            }
      })
      // 댓글 수정.
      app.post("/commentUpdate", async (req, res) => {
            const commentId = Number(req.query.cid)
            const userKey = req.session.userKey
            const contents = req.body.c
            if (!req.session.isLogined || !userKey) res.redirect("/")
            else {
                  const result = await StatementBoard.commentUpdate(commentId, userKey, contents)
                  if (result) res.send(true)
            }
      })
      // 댓글 삭제.
      app.get("/commentDelete", async (req, res) => {
            const commentId = Number(req.query.cid)
            const userKey = req.session.userKey
            if (userKey) {
                  const result = await StatementBoard.commentDelete(commentId, userKey)
                  if (result) res.send(true)
            }
      })
      // 게시글 좋아요.
      app.get("/boardUp", async (req, res) => {
            const boardId = Number(req.query.id)
            const userKey = req.session.userKey
            if (!req.session.isLogined || !userKey) res.redirect("/")
            else {
                  const result = await DB.Manager.transaction(() => StatementBoard.boardUp(boardId, userKey))
                  res.send(JSON.stringify(result))
            }
      })
      // 댓글 좋아요.
      app.get("/commentUp", async (req, res) => {
            const commentId = Number(req.query.id)
            const userKey = req.session.userKey
            if (!req.session.isLogined || !userKey) res.redirect("/")
            else {
                  const result = await DB.Manager.transaction(() => StatementBoard.commentUp(commentId, userKey))
                  res.send(JSON.stringify(result))
            }
      })
      // 팔로우.
      app.get("/follow", async (req, res, next) => {
            const followId = Number(req.query.id)
            const userKey = req.session.userKey
            if (!req.session.isLogined || !userKey) res.redirect("/")
            else {
                  const result = await StatementUser.follow(followId, userKey)
                  res.send(JSON.stringify(result))
            }
      })
      // url 최빈 태그 조회.
      app.get("/tag", async (req, res, next) => {
            const url = parseUrl(String(req.query.u))
            const hot = Boolean(req.query.h)
            const userKey = req.session.userKey
            console.log("tag", url, hot)
            if (!req.session.isLogined || !userKey) res.redirect("/")
            else {
                  if (hot) {
                        const result = await StatementBoard.getHotTag(userKey)
                        res.send(JSON.stringify(result))
                  } else if (url) {
                        const tags = await StatementBoard.getUrlTag(url)
                        res.send(JSON.stringify({ tags }))
                  }
            }
      })
      app.get("/getfollow", async (req, res, next) => {
            const hot = Boolean(req.query.h)
            const tag = req.query.t ? String(req.query.t) : null
            const startId = Number(req.query.sid)
            const zero = Boolean(req.query.z)
            console.log("getfollow", hot, tag, startId, zero)
            const userKey = req.session.userKey
            if (!req.session.isLogined || !userKey) res.redirect("/")
            else {
                  if (hot) {
                        const result_recommend = await StatementUser.getFollowRecommend(userKey, tag)
                        const result_follow = await StatementUser.getFollow(userKey, tag, 0, zero)
                        const result = { recomm: result_recommend, follow: result_follow }
                        res.send(JSON.stringify(result))
                  } else {
                        const result_follow = await StatementUser.getFollow(userKey, tag, startId, zero)
                        const result = { recomm: null, follow: result_follow }
                        res.send(JSON.stringify(result))
                  }
            }
      })
      // 로그인 또는 계정 생성 (구글 소셜)
      app.post("/signIn", async (req, res, next) => { // get 으로 하지말기
            const id = String(req.body.i)
            const name = String(req.body.n)
            const email = String(req.body.e)
            console.log("s0")
            if (!req.session.isLogined || !req.session.userKey) {
                  try {
                        console.log("s1")
                        const result: any = await StatementUser.signIn(id, name, email)
                        console.log("s2")
                        req.session.userKey = result.userKey
                        req.session.isLogined = true
                        res.send(JSON.stringify({ signed: true, name: result.name, image: result.image }))
                  } catch { res.send(JSON.stringify({ signed: false })) }
            } else res.send(JSON.stringify({ signed: true }))
      })
      // 로그아웃
      app.get("/signout", async (req, res, next) => {
            if (req.session.isLogined) req.session.isLogined = false
            if (req.session.userKey) req.session.userKey = null
            res.send(JSON.stringify({ signedOut: true }))
      })
      // 게시글 조회.(랜더링된 화면에서)
      app.get("/boardload", async (req, res, next) => {
            console.log('req', req)
            const boardId = Number(req.query.id)
            const userKey = req.session.userKey
            if (!req.session.isLogined || !userKey) res.redirect("/")
            else {
                  const board = await StatementBoard.boardSelect(boardId, userKey)
                  res.send(JSON.stringify(board))
            }
      })
      // 게시글 조회. (새로 랜더링. (유저가 url로 바로 게시글 페이지로 접근할 수 있게 하기 위함) 이렇게 접근하는 경우는, 웹에서 접근할 때이므로, url과 hostname이 null)
      app.get("/board/:id", async (req, res, next) => {
            console.log('req', req)
            const boardId = Number(req.params.id)
            const userKey = req.session.userKey
            res.set("Access-Control-Allow-Origin", "*")
            if (!req.session.isLogined || !userKey) {
                  pageBuilder("ssr", { url: null, hostname: null, ext: false, ss: false })(req, res, next)
            } else {
                  const board = await StatementBoard.boardSelect(boardId, userKey)
                  const user = await StatementUser.getUser(userKey)
                  pageBuilder("ssr", { url: null, hostname: null, ext: false, ss: true, boardAccess: true, board, name: user.name, image: user.image })(req, res, next)
            }
      })
      // board가 존재하는지 확인.
      app.get("/check", async (req, res, next) => {
            console.log("check")
            const url = parseUrl(String(req.query.u))
            const hostname = String(req.query.h)
            const result = await StatementBoard.checkBoard(url, hostname)
            if (result) res.send(result)
      })
      app.get("/*", async (req, res, next) => {
            const { u, h } = req.query
            let url: string | null = null
            let hostname: string | null = null
            if (u) url = parseUrl(String(u))
            if (h) hostname = String(h)
            const extension: boolean = Boolean(req.query.ext)
            console.log("url", url)
            res.set("Access-Control-Allow-Origin", "*")
            req.session.isLogined = true // 개발 시 로그인 매번 할 필요 없게
            req.session.userKey = 5 // 개발 시 로그인 매번 할 필요 없게
            console.log("il", req.session.isLogined, req.session.userKey)
            if (!req.session.isLogined || !req.session.userKey) {
                  pageBuilder("ssr", { url, hostname, ext: extension, ss: false })(req, res, next)
            } else {
                  const user = await StatementUser.getUser(req.session.userKey)
                  pageBuilder("ssr", { url, hostname, ext: extension, ss: true, name: user.name, image: user.image })(req, res, next)
            }
      })
      app.listen(4416)
})