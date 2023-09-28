import DB from "back/database/connection"
import Board from "back/model/board"
import Comment from "back/model/comment"
import User from "back/model/user"
import { SETTINGS } from "back/util/setting"
import { reduceToTable } from "back/util/utility"
import { Logger } from "back/util/logger"
import { ErrorCode, BOARD_CATEGORY } from "common/applicationCode"
import Tag from "back/model/tag"
import Url from "back/model/url"
import UrlTagCount from "back/model/urlTagCount"
import UserTagCount from "back/model/userTagCount"
import UserUrlCount from "back/model/userUrlCount"

const url = require("url")


const MAX_CONTENTS_LEN = 100 // SETTINGS.board.contentsLen
const MAX_LIST_LEN = SETTINGS.board.listLen
const TAG_DISPLAY_CNT = SETTINGS.board.tagDisplayCnt
const MAX_TAG_LEN = SETTINGS.board.tagLenLim
const MAX_TAG_CNT = SETTINGS.board.tagCountLim

/**
 * 커뮤니티 관련 트랜잭션 함수를 가진 클래스.
 */
export class StatementBoard {
      /** 차단한 상대가 쓴 것이 아닌 게시글 가져오기. */
      private static async getMyBoards(startId: number, userKey: number): Promise<any[]> {
            let whereQuery: string = `where writer = ${userKey} ${startId ? `and id < ${startId}` : ""}`
            let fromQuery: string = "from `board`"
            let orderQuery = `order by id desc limit ${MAX_LIST_LEN}`
            let selectAndQuery = ""

            const bList = await DB.Manager.query(
                  `select *, (select count(id) from \`comment\` where boardId = a.id) as comNum ${selectAndQuery}
                              from ( select id ${fromQuery} ${whereQuery} ${orderQuery}
                              ) b join \`board\` a on b.id = a.id;`
            ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("getMyBoards").put(err).out())
            return bList
      }
      /** 차단한 상대가 쓴 것이 아닌 게시글 가져오기. */
      private static async getMyUpBoards(startId: number, userKey: number): Promise<any[]> {
            let whereQuery: string = ""
            let fromQuery: string = `from (
                  select boardId from \`user_uped_boards_board\`
                  where userKey = ${userKey}${startId ? ` and boardId < ${startId}` : ""}
                  order by boardId desc limit ${MAX_LIST_LEN}) c join \`board\` d on d.id = c.boardId`
            let orderQuery = `order by id desc limit ${MAX_LIST_LEN}`
            let selectAndQuery = ""

            const bList = await DB.Manager.query(
                  `select *, (select count(id) from \`comment\` where boardId = a.id) as comNum ${selectAndQuery}
                              from ( select id ${fromQuery} ${whereQuery} ${orderQuery}
                              ) b join \`board\` a on b.id = a.id;`
            ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("getMyUpBoards").put(err).out())
            bList.forEach((b, idx) => { bList[idx].uped = 1 })
            return bList
      }
      /** 차단한 상대가 쓴 것이 아닌 게시글 가져오기. */
      private static async getUrlBoards(startId: number, userKey: number, blockeds: number[], url: string): Promise<any[]> {
            let selectAndQuery = `, (select count(*) from \`user_uped_boards_board\` where userKey = ${userKey} and boardId = a.id) as uped`
            let fromQuery: string = "from \`board\`"
            let orderQuery = `order by id desc limit ${MAX_LIST_LEN}`

            const urlObj = await DB.Manager.findOne(Url, { where: { name: url }, select: ["id"] }).catch((err) => Logger.errorApp(ErrorCode.url_find_failed).put("getUrlBoards").put(err).out())
            if (urlObj) {
                  let whereQuery = `where urlId = ${urlObj.id} ${startId ? ` and id < ${startId}` : ""}`
                  const bList = await DB.Manager.query(
                        `select *, (select count(id) from \`comment\` where boardId = a.id) as comNum ${selectAndQuery}
                                    from ( select id ${fromQuery} ${whereQuery} ${orderQuery}
                                    ) b join \`board\` a on b.id = a.id;`
                  ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("getUrlBoards").put(err).out())
                  let bListFiltered = bList.filter((b: any) => !blockeds.includes(b.writer))
                  return bListFiltered.sort((b1, b2) => b2.up - b1.up)
            } else return []
      }
      /** 차단한 상대가 쓴 것이 아닌 게시글 가져오기. */
      private static async getTagBoards(startId: number, userKey: number, blockeds: number[], tag: string): Promise<any[]> {
            const tagObj = await DB.Manager.findOne(Tag, { where: { name: tag }, select: ["id"] }).catch((err) => Logger.errorApp(ErrorCode.tag_find_failed).put("getTagBoards").put(err).out())
            if (tagObj) {
                  const tagId = tagObj.id
                  let selectAndQuery = `, (select count(*) from \`user_uped_boards_board\` where userKey = ${userKey} and boardId = a.id) as uped`
                  let joinQuery = `from (select boardId from \`board_tags_tag\` where tagId = ${tagId} ${startId ? ` and boardId < ${startId}` : ""} order by boardId desc limit ${MAX_LIST_LEN} ) b join corner.board a on b.boardId = a.id`

                  const bList = await DB.Manager.query(
                        `select *, (select count(id) from \`comment\` where boardId = a.id) as comNum ${selectAndQuery}
                              ${joinQuery};`
                  ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("getTagBoards").put(err).out())  // 차단 대상 제외.
                  let bListFiltered = bList.filter((b: any) => !blockeds.includes(b.writer))
                  return bListFiltered.sort((b1, b2) => b2.up - b1.up)
            } else return []
      }
      /** 전체 항목에서 보여줄 게시글 가져오기. (게시글을 넉넉히 뽑은뒤, up이 높은 것을 보여줌 - 모든 게시글을 다 보여줄 필요 없음 ) */
      private static async getBoards(startId: number, userKey: number, blockeds: number[]): Promise<any[]> {
            let whereQuery: string = startId ? `where id < ${startId}` : ""
            let fromQuery: string = "from \`board\`"
            let orderQuery = `order by id desc limit ${MAX_LIST_LEN}`
            let selectAndQuery = `, (select count(*) from \`user_uped_boards_board\` where userKey = ${userKey} and boardId = a.id) as uped`

            const bList = await DB.Manager.query(
                  `select *, (select count(id) from \`comment\` where boardId = a.id) as comNum ${selectAndQuery}
                              from ( select id ${fromQuery} ${whereQuery} ${orderQuery}
                              ) b join \`board\` a on b.id = a.id;`,
            ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("getBoards").put(err).out())  // 차단 대상 제외.
            let bListFiltered = bList.filter((b: any) => !blockeds.includes(b.writer))
            return bListFiltered.sort((b1, b2) => b2.up - b1.up)
      }
      private static async getSearchBoards(startId: number, userKey: number, blockeds: number[], search: string): Promise<any[]> {
            if (search[0] === "#") return this.getTagBoards(startId, userKey, blockeds, search)
            else {
                  let whereQuery: string = (startId ? `where id < ${startId} and ` : "where ") + `contents like \"%${search}%\"`
                  let fromQuery: string = "from \`board\`"
                  let orderQuery = `order by id desc limit ${MAX_LIST_LEN}`
                  let selectAndQuery = `, (select count(*) from \`user_uped_boards_board\` where userKey = ${userKey} and boardId = a.id) as uped`

                  const bList = await DB.Manager.query(
                        `select *, (select count(id) from \`comment\` where boardId = a.id) as comNum ${selectAndQuery}
                                    from ( select id ${fromQuery} ${whereQuery} ${orderQuery}
                                    ) b join \`board\` a on b.id = a.id;`,
                  ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("getSearchBoards").put(err).out())  // 차단 대상 제외.
                  let bListFiltered = bList.filter((b: any) => !blockeds.includes(b.writer))
                  return bListFiltered.sort((b1, b2) => b2.up - b1.up)
            }
      }
      private static async getUserBoards(startId: number, userKey: number, searchUser: number): Promise<any[]> {
            let whereQuery: string = (startId ? `where id < ${startId} and ` : "where ") + `writer = ${searchUser}`
            let fromQuery: string = "from \`board\`"
            let orderQuery = `order by id desc limit ${MAX_LIST_LEN}`
            let selectAndQuery = `, (select count(*) from \`user_uped_boards_board\` where userKey = ${userKey} and boardId = a.id) as uped`
            const bList = await DB.Manager.query(
                  `select *, (select count(id) from \`comment\` where boardId = a.id) as comNum ${selectAndQuery}
                                    from ( select id ${fromQuery} ${whereQuery} ${orderQuery}
                                    ) b join \`board\` a on b.id = a.id;`,
            ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("getUserBoards").put(err).out())  // 차단 대상 제외.
            console.log("bList", bList)
            return bList.sort((b1, b2) => b2.up - b1.up)
      }
      /** 차단한 상대가 쓴 것이 아닌 게시글 가져오기. */
      private static async getBoard(boardId: number, userKey: number): Promise<any> {
            let whereQuery: string = `where id = ${boardId}`
            let fromQuery: string = "from `board`"
            let selectAndQuery = `, (select count(*) from \`user_uped_boards_board\` where userKey = ${userKey} and boardId = ${boardId}) as uped`

            const boards = await DB.Manager.query(
                  `select *, (select count(id) from \`comment\` where boardId = ${boardId}) as comNum ${selectAndQuery}
                              ${fromQuery} ${whereQuery};`,
            ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("getBoard_0").put(err).out())  // 차단 대상 제외.
            const boardTags = await DB.Manager.findOne(Board, { select: ["tags"], relations: ["tags"], where: { id: boardId } })
                  .catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("getBoard_1").put(err).out())
            const board = boards[0]
            if (boardTags) {
                  const tags = boardTags.tags.filter((t) => !t.isUrl).map((t) => t.name)
                  const url = boardTags.tags.filter((t) => t.isUrl)
                  board.tags = tags
                  if (url.length) board.url = url[0].name
            } return board
      }
      public static async categorizedBoardList(startId: number, categ: number, userKey: number, url?: string, tag?: string, search?: string, searchUser?: number) {
            const user = await DB.Manager.findOne(User, { relations: ["blockeds"], where: { key: userKey } }).catch((err) => {
                  Logger.errorApp(ErrorCode.user_find_failed).put("categorizedBoardList_0").put(err).out()
            })
            if (user) {
                  switch (categ) {
                        case BOARD_CATEGORY.myBoards:
                              return await this.getMyBoards(startId, userKey)
                        case BOARD_CATEGORY.myUpBoards:
                              return await this.getMyUpBoards(startId, userKey)
                        case BOARD_CATEGORY.tagBoards:
                              if (tag) return await this.getTagBoards(startId, userKey, user.blockeds.map((b) => b.key), tag)
                              else return null
                        case BOARD_CATEGORY.urlBoards:
                              if (url) return await this.getUrlBoards(startId, userKey, user.blockeds.map((b) => b.key), url)
                              else return null
                        case BOARD_CATEGORY.boards:
                              return await this.getBoards(startId, userKey, user.blockeds.map((b) => b.key))
                        case BOARD_CATEGORY.searchBoards:
                              if (search) return await this.getSearchBoards(startId, userKey, user.blockeds.map((b) => b.key), search)
                              else return null
                        case BOARD_CATEGORY.userBoards:
                              if (searchUser) return await this.getUserBoards(startId, userKey, searchUser)
                              else return null
                        default: return null
                  }
            } else {
                  Logger.errorApp(ErrorCode.user_find_failed).put("categorizedBoardList_1").out()
                  return
            }
      }
      /**
      * 게시글 목록 조회.
      * @param startId 게시글 시작 식별자.
      * @param categ 게시글 ui 버튼 enum.
      * @param userKey 사용자 식별자.
      * @returns 조회한 게시글 목록, 끝 식별자 또는 오류 전송.
      */
      public static async boardList(startId: number, categ: number, userKey: number, url?: string, tag?: string, search?: string, searchUser?: number) {
            return new Promise(async (resolve, _) => {
                  const bList = await this.categorizedBoardList(startId, categ, userKey, url, tag, search, searchUser)
                  if (bList) {
                        const boardList: boardType[] = []
                        const where: { key: number }[] = []
                        let endOfList = false
                        if (bList.length === 0) {
                              resolve({ boardList: [], endId: startId, end: true })
                              return
                        } else if (bList.length < MAX_LIST_LEN) {
                              endOfList = true
                        }
                        let endId = startId
                        bList.forEach((b) => { if (endId < b.id) endId = b.id })
                        for (const item of bList) {
                              where.push({
                                    key: item.writer,
                              })
                        } // 게시물 글쓴이 정보 조회.
                        DB.Manager.find(User, {
                              where,
                              relations: ["followers"]
                        }).then((r) => {
                              const userTable = reduceToTable(r, (v) => v, (v) => v.key)
                              for (const item of bList) {
                                    const u: any = userTable[item.writer]
                                    boardList.push({
                                          id: item.id,
                                          writer: u.name,
                                          writerId: u.key,
                                          writerImage: u.image,
                                          writerFollowed: u.followers.some((f: User) => f.key === userKey),
                                          contents: item.contents.slice(0, MAX_CONTENTS_LEN),
                                          numComment: item.comNum,
                                          date: String(item.date),
                                          up: item.up,
                                          uped: item.uped,
                                          updated: item.updated
                                    })
                              }
                              Logger.passApp("boardList").put(BOARD_CATEGORY[categ]).out()
                              resolve({ boardList, endId, end: endOfList })
                        }).catch((err) => Logger.errorApp(ErrorCode.user_find_failed).put("boardList").put(err).out())
                  } else {
                        Logger.errorApp(ErrorCode.board_find_failed).put("boardList").out()
                  }
            })
      }

      /**
       * 게시글 조회.
       * @param boardId 게시글 식별자.
       * @param userKey 사용자 디비 식별자.
       * @returns 조회한 게시글 내용 및 댓글.
       */
      public static boardSelect(boardId: number, userKey: number): Promise<any> {
            return new Promise((resolve, _) => {
                  this.getBoard(boardId, userKey).then((board: any) => {
                        if (board) {
                              DB.Manager.findOne(User, {
                                    where: { key: board?.writer },
                                    relations: ["followers"]
                              }).then((user) => {
                                    DB.Manager.query(
                                          `select comment.id, comment.contents, comment.up, comment.writer, comment.date
                        , (select count(*) from \`user_uped_comments_comment\` where userKey = ${userKey} and commentId = comment.id) as uped
                              from (
                                    select id
                                    from \`board\`
                                    where board.id = ${boardId}
                              ) board left join \`comment\` comment on board.id = comment.boardId order by comment.id desc limit ${MAX_LIST_LEN};`
                                    ).then((cList) => {
                                          const where: { key: number }[] = []
                                          if (cList[0]?.id === null) {
                                                resolve({
                                                      id: boardId,
                                                      writer: user?.name,
                                                      writerId: user?.key,
                                                      writerImage: user?.image,
                                                      writerFollowed: user?.followers.some((f: User) => f.key === userKey) || false,
                                                      date: String(board?.date),
                                                      updated: board?.updated,
                                                      up: board?.up,
                                                      numComment: board?.comNum,
                                                      uped: board?.uped,
                                                      contents: board?.contents.slice(0, MAX_CONTENTS_LEN),
                                                      comments: [],
                                                      endId: 0, // comment 관련
                                                      end: true,
                                                      tags: board?.tags,
                                                      url: board?.url
                                                })
                                                return
                                          }
                                          let endOfList = false
                                          let endId = cList[cList.length - 1].id
                                          if (cList.length < MAX_LIST_LEN) {
                                                endOfList = true
                                          }
                                          for (const c of cList) {
                                                where.push({
                                                      key: c.writer,
                                                })
                                          }
                                          DB.Manager.find(User, {
                                                where,
                                                relations: ["followers"]
                                          }).then((r) => {
                                                const userTable = reduceToTable(r, (v) => v, (v) => v.key)
                                                const comments: commentType[] = []
                                                for (const c of cList) {
                                                      const u = userTable[c.writer]
                                                      comments.push({
                                                            id: c.id,
                                                            date: c.date,
                                                            contents: c.contents.slice(0, MAX_CONTENTS_LEN),
                                                            up: c.up,
                                                            uped: c.uped,
                                                            updated: c.updated,
                                                            writer: u.name,
                                                            writerId: u.key,
                                                            writerImage: u.image,
                                                            writerFollowed: u.followers.some((f: User) => f.key === userKey),
                                                      })
                                                }
                                                resolve({
                                                      id: boardId,
                                                      writer: user?.name,
                                                      writerId: user?.key,
                                                      writerImage: user?.image,
                                                      writerFollowed: user?.followers.some((f: User) => f.key === userKey) || false,
                                                      date: board.date,
                                                      updated: board.updated,
                                                      up: board.up,
                                                      numComment: board.comNum,
                                                      uped: board.uped,
                                                      contents: board.contents.slice(0, MAX_CONTENTS_LEN),
                                                      comments,
                                                      endId,
                                                      end: endOfList,
                                                      tags: board.tags,
                                                      url: board.url
                                                })
                                          }).catch((err) => Logger.errorApp(ErrorCode.user_find_failed).put("boardSelect_0").put(err).out())
                                    }).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("boardSelect_0").put(err).out())
                              }).catch((err) => Logger.errorApp(ErrorCode.user_find_failed).put("boardSelect_1").put(err).out())
                        } else Logger.errorApp(ErrorCode.board_find_failed).put("boardSelect_1").out()
                  }).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("boardSelect_2").put(err).out())
            })
      }
      /**
       * 댓글 조회.
       * @param boardId 게시글 식별자.
       * @param userKey 사용자 디비 식별자.
       * @returns 조회한 게시글 내용 및 댓글.
       */
      public static commentList(boardId: number, commentStartId: number, userKey: number) {
            return new Promise((resolve, _) => {
                  DB.Manager.query(
                        `select comment.id, comment.contents, comment.up, comment.writer
                              , (select count(*) from \`user_uped_comments_comment\` where userKey = ${userKey} and commentId = comment.id) as uped
                              from (
                                    select id
                                    from \`board\`
                                    where board.id = ${boardId}
                              ) board left join \`comment\` comment on board.id = comment.boardId where ${commentStartId ? `comment.id < ${commentStartId}` : ""} order by comment.id desc limit ${MAX_LIST_LEN};`,
                  ).then((cList) => {
                        const where: { key: number }[] = []
                        let endOfList = false
                        if (cList.length === 0) {
                              resolve({ comments: [], endId: commentStartId, end: true })
                              return
                        } else if (cList.length < MAX_LIST_LEN) {
                              endOfList = true
                        }
                        for (const c of cList) {
                              where.push({
                                    key: c.writer,
                              })
                        }
                        const endId = cList[cList.length - 1].id
                        DB.Manager.find(User, {
                              where,
                              relations: ["followers"]
                        }).then((r) => {
                              const userTable = reduceToTable(r, (v) => v, (v) => v.key)
                              const comments: commentType[] = []
                              for (const c of cList) {
                                    const u = userTable[c.writer]
                                    comments.push({
                                          id: c.id,
                                          date: c.date,
                                          contents: c.contents.slice(0, MAX_CONTENTS_LEN),
                                          up: c.up,
                                          uped: c.uped,
                                          updated: c.updated,
                                          writer: u.name,
                                          writerId: u.key,
                                          writerImage: u.image,
                                          writerFollowed: u.followers.some((f: User) => f.key === userKey)
                                    })
                              }
                              resolve({
                                    comments: (comments[0].id === null ? [] : comments),
                                    endId,
                                    end: endOfList
                              })
                        }).catch((err) => Logger.errorApp(ErrorCode.user_find_failed).put("commentList").put(err).out())
                  }).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("commentList").put(err).out())
            })
      }
      /**
       * 게시글 생성.
       * @param writerKey 글쓴이 디비 식별자.
       * @param contents 게시글 내용.
       */
      public static async boardInsert(writerKey: number, contents: string, hashTag: string, url_?: string, hostname_?: string) {
            const hashTags_ = hashTag.split("#").map((t) => ({ tag: t.replace(/\n|\s/g, ""), isUrl: false })).filter((t) => t.tag.length)
            const hashTags = Array.from(new Set(hashTags_))
            const hashTagEntities: Tag[] = []
            const promisesTags: Promise<any>[] = []
            const promisesFunc: Promise<any>[] = []
            if (hashTags.length > MAX_TAG_CNT) return
            if (hashTags.some((t) => t.tag.length > MAX_TAG_LEN)) return
            let urlO_: Url
            if (url_) hashTags.push({ tag: url_, isUrl: true })
            if (hostname_) hashTags.push({ tag: hostname_, isUrl: false })
            return new Promise(async (resolve, _) => {
                  if (url_) {
                        const urlO = await DB.Manager.findOne(Url, { where: { name: url_ } })
                        if (urlO) {
                              urlO_ = urlO
                              const p = new Promise((res, _) => DB.Manager.increment(Url, { name: url_ }, "count", 1).then(() => res(urlO)))
                              const p0 = new Promise((res, _) => DB.Manager.increment(UserUrlCount, { user: { key: writerKey }, url: urlO }, "count", 1).then(() => res(true)))
                              promisesFunc.push(p, p0)
                        } else {
                              const parsedUrl = url.parse(url_)
                              const urlO = await DB.Manager.save(Url, { name: url_, count: 1, isHost: parsedUrl.path === "" })
                              urlO_ = urlO
                              const p0 = new Promise((res, _) => DB.Manager.save(UserUrlCount, { user: { key: writerKey }, url: urlO, count: 1 }).then(() => res(urlO)))
                              promisesFunc.push(p0)
                        }
                        await Promise.all(promisesFunc)
                        for (const tagObj of hashTags) {
                              const pt = new Promise(async (res, _) => {
                                    const tagO = await DB.Manager.findOne(Tag, { where: { name: tagObj.tag } })
                                    if (tagO) {
                                          hashTagEntities.push(tagO)
                                          const promisesInside: Promise<any>[] = []
                                          const pi = new Promise((res, _) => DB.Manager.increment(Tag, { name: tagObj.tag }, "count", 1).then(() => res(true)))
                                          const pi0 = new Promise((res, _) => DB.Manager.increment(UrlTagCount, { url: { id: urlO_?.id }, tag: { id: tagO.id } }, "count", 1).then(() => res(true)).catch((err) => Logger.errorApp(ErrorCode.urltagcount_update_failed).put("boardInsert_0").put(err).out()))
                                          promisesInside.push(pi, pi0)
                                          await Promise.all(promisesInside)
                                          res(true)
                                    } else {
                                          const tagO_ = await DB.Manager.save(Tag, { name: tagObj.tag, isUrl: tagObj.isUrl, count: 1 })
                                          hashTagEntities.push(tagO_)
                                          DB.Manager.save(UrlTagCount, { url: { id: urlO_?.id }, tag: { id: tagO_.id }, count: 1 }).then(() => res(true)).catch((err) => Logger.errorApp(ErrorCode.urltagcount_save_failed).put("boardInsert_1").put(err).out())
                                    }
                              }).catch((err) => Logger.errorApp(ErrorCode.tag_find_failed).put("boardInsert").put(err).out())
                              promisesTags.push(pt)
                        }
                  } else {
                        for (const tagObj of hashTags) {
                              const pt = new Promise(async (res, _) => {
                                    const tagO = await DB.Manager.findOne(Tag, { where: { name: tagObj.tag } })
                                    if (tagO) {
                                          hashTagEntities.push(tagO)
                                          DB.Manager.increment(Tag, { name: tagObj.tag }, "count", 1).then(() => res(true))
                                                .catch((err) => Logger.errorApp(ErrorCode.tag_update_failed).put("boardInsert").put(err).out())
                                    } else {
                                          DB.Manager.save(Tag, { name: tagObj.tag, isUrl: tagObj.isUrl, count: 1 }).then((tagO) => {
                                                hashTagEntities.push(tagO)
                                                res(true)
                                          }).catch((err) => Logger.errorApp(ErrorCode.tag_save_failed).put("boardInsert").put(err).out())
                                    }
                              })
                              promisesTags.push(pt)
                        }
                  }
                  await Promise.all(promisesTags)
                  let promisesUserTag: Promise<any>[] = []
                  for (let hE of hashTagEntities) {
                        promisesUserTag.push(
                              new Promise(async (resolve, _) => {
                                    const userTagCountExist = await DB.Manager.findOne(UserTagCount, { where: { user: { key: writerKey }, tag: { id: hE.id } } })
                                    if (userTagCountExist) {
                                          await DB.Manager.increment(UserTagCount, { user: { key: writerKey }, tag: { id: hE.id } }, "count", 1)
                                    } else await DB.Manager.save(UserTagCount, { user: { key: writerKey }, tag: { id: hE.id }, count: 1 })
                                    resolve(true)
                              })
                        )
                  }
                  await Promise.all(promisesUserTag)
                  if (urlO_) await DB.Manager.save(Board, { contents: contents.slice(0, MAX_CONTENTS_LEN), writer: writerKey, tags: hashTagEntities, url: urlO_ })
                  else await DB.Manager.save(Board, { contents: contents.slice(0, MAX_CONTENTS_LEN), writer: writerKey, tags: hashTagEntities })
                  Logger.passApp("boardEnroll all").out()
                  resolve(true)
            })
      }

      /**
        * 게시글 업데이트.
        * @param boardId 게시글 식별자.
        * @param updaterKey 업데이트하려는 사용자 식별자.
        * @param contents 게시글 내용.
        */
      public static boardUpdate(boardId: number, updaterKey: number, contents: string, hashTag: string) {
            const hashTags_ = hashTag.split("#").map((t) => ({ tag: t.replace(/\n|\s/g, ""), isUrl: false })).filter((t) => t.tag.length)
            const hashTags = Array.from(new Set(hashTags_))
            const hashTagEntities: Tag[] = []
            const promisesTags: Promise<any>[] = []
            if (hashTags.length > MAX_TAG_CNT) return
            if (hashTags.some((t) => t.tag.length > MAX_TAG_LEN)) return
            return new Promise(async (resolve, _) => {
                  DB.Manager.findOne(Board, { where: { id: boardId, writer: updaterKey }, relations: ["url", "tags"] }).then(async (board) => {
                        if (board) {
                              if (board.url) {
                                    for (const tagObj of hashTags) {
                                          const pt = new Promise(async (res, _) => {
                                                const tagO = await DB.Manager.findOne(Tag, { where: { name: tagObj.tag } })
                                                const promisesInside: Promise<any>[] = []
                                                if (tagO) {
                                                      hashTagEntities.push(tagO)
                                                      if (!board.tags.some((t) => t.name === tagO.name)) {  // 태그 추가 (증가)
                                                            const pi = new Promise((res, _) => DB.Manager.increment(Tag, { name: tagObj.tag }, "count", 1).then(() => res(true))).catch((err) => Logger.errorApp(ErrorCode.tag_update_failed).put("boardInsert").put(err).out())
                                                            const pi0 = new Promise((res, _) => DB.Manager.increment(UrlTagCount, { url: { id: board.url?.id }, tag: { id: tagO.id } }, "count", 1).then(() => res(true)).catch((err) => Logger.errorApp(ErrorCode.urltagcount_update_failed).put("boardInsert_0").put(err).out()))
                                                            promisesInside.push(pi, pi0)
                                                      }
                                                      await Promise.all(promisesInside)
                                                      res(true)
                                                } else { // 태그 추가 (생성)
                                                      const tagO_ = await DB.Manager.save(Tag, { name: tagObj.tag, isUrl: tagObj.isUrl, count: 1 })
                                                      hashTagEntities.push(tagO_)
                                                      DB.Manager.save(UrlTagCount, { url: { id: board.url?.id }, tag: { id: tagO_.id }, count: 1 }).then(() => { res(true) }).catch((err) => Logger.errorApp(ErrorCode.urltagcount_save_failed).put("boardInsert_1").put(err).out())
                                                }
                                          }).catch((err) => Logger.errorApp(ErrorCode.tag_find_failed).put("boardInsert").put(err).out())
                                          promisesTags.push(pt)
                                    }
                                    for (const tagObj of board.tags) {
                                          const pt = new Promise(async (res, _) => {
                                                const tagO = await DB.Manager.findOne(Tag, { where: { name: tagObj.name } })
                                                const promisesInside: Promise<any>[] = []
                                                if (tagO && !hashTags.some(({ tag, isUrl }) => (tag === tagO.name))) {
                                                      if (tagO.count > 1) { // 태그 제거 (감소)
                                                            const pi = new Promise((res, _) => DB.Manager.decrement(Tag, { name: tagObj.name }, "count", 1).then(() => res(true)))
                                                            const pi0 = new Promise((res, _) => DB.Manager.decrement(UrlTagCount, { url: { id: board.url?.id }, tag: { id: tagO.id } }, "count", 1).then(() => res(true)).catch((err) => Logger.errorApp(ErrorCode.urltagcount_update_failed).put("boardInsert_0").put(err).out()))
                                                            promisesInside.push(pi, pi0)
                                                            await Promise.all(promisesInside)
                                                            res(true)
                                                      } else { // 태그 제거 (삭제 , many to many 라 tag는 delete 불가)
                                                            const pi = new Promise((res, _) => DB.Manager.decrement(Tag, { name: tagObj.name }, "count", 1).then(() => res(true)))
                                                            const pi0 = new Promise((res, _) => DB.Manager.delete(UrlTagCount, { url: { id: board.url?.id }, tag: { id: tagO.id } }).then(() => res(true)).catch((err) => Logger.errorApp(ErrorCode.urltagcount_update_failed).put("boardInsert_0").put(err).out()))
                                                            promisesInside.push(pi, pi0)
                                                            await Promise.all(promisesInside)
                                                            res(true)
                                                      }
                                                } else res(true)
                                          })
                                          promisesTags.push(pt)
                                    }
                              } else {
                                    for (const tagObj of hashTags) {
                                          const pt = new Promise(async (res, _) => {
                                                const tagO = await DB.Manager.findOne(Tag, { where: { name: tagObj.tag } })
                                                if (tagO) {
                                                      hashTagEntities.push(tagO)
                                                      if (!board.tags.includes(tagO)) {  // 태그 추가 (증가)
                                                            DB.Manager.increment(Tag, { name: tagObj.tag }, "count", 1).then(() => res(true))
                                                                  .catch((err) => Logger.errorApp(ErrorCode.tag_update_failed).put("boardInsert").put(err).out())
                                                      }
                                                } else { // 태그 추가 (생성)
                                                      DB.Manager.save(Tag, { name: tagObj.tag, isUrl: tagObj.isUrl, count: 1 }).then((tagO) => {
                                                            hashTagEntities.push(tagO)
                                                            res(true)
                                                      }).catch((err) => Logger.errorApp(ErrorCode.tag_save_failed).put("boardInsert").put(err).out())
                                                }
                                          })
                                          promisesTags.push(pt)
                                    }
                                    for (const tagObj of board.tags) {
                                          const pt = new Promise(async (res, _) => {
                                                DB.Manager.findOne(Tag, { where: { id: tagObj.id } }).then((tagO) => {
                                                      if (tagO && !hashTags.some(({ tag, isUrl }) => (tag === tagO.name))) {
                                                            DB.Manager.decrement(Tag, { id: tagObj.id }, "count", 1).then(() => res(true))
                                                                  .catch((err) => Logger.errorApp(ErrorCode.tag_update_failed).put("boardInsert").put(err).out())
                                                      } else res(true)
                                                }).catch((err) => Logger.errorApp(ErrorCode.tag_find_failed).put("boardInsert").put(err).out())
                                          })
                                          promisesTags.push(pt)
                                    }
                              }
                              await Promise.all(promisesTags)
                              const promisesUserTag: Promise<any>[] = []
                              for (const hE of hashTagEntities) {
                                    promisesUserTag.push(
                                          new Promise(async (resolve, _) => {
                                                const userTagCountExist = await DB.Manager.findOne(UserTagCount, { where: { user: { key: board.writer }, tag: { id: hE.id } } })
                                                if (userTagCountExist) { // 태그 추가 (증가)
                                                      if (!board.tags.some((t) => t.name === hE.name)) await DB.Manager.increment(UserTagCount, { user: { key: board.writer }, tag: { id: hE.id } }, "count", 1)
                                                } else await DB.Manager.save(UserTagCount, { user: { key: board.writer }, tag: { id: hE.id }, count: 1 }) // 태그 추가 (생성)
                                                resolve(true)
                                          })
                                    )
                              }
                              for (const tagObj of board.tags) {
                                    promisesUserTag.push(
                                          new Promise(async (resolve, _) => {
                                                const userTagCountExist = await DB.Manager.findOne(UserTagCount, { where: { user: { key: board.writer }, tag: { id: tagObj.id } } })
                                                if (userTagCountExist && !hashTagEntities.some((tagEn) => tagEn.id === tagObj.id)) {
                                                      if (userTagCountExist.count > 1) { // 태그 제거 (감소)
                                                            await DB.Manager.decrement(UserTagCount, { user: { key: board.writer }, tag: { id: userTagCountExist.id } }, "count", 1)
                                                      } else { // 태그 제거 (삭제)
                                                            await DB.Manager.delete(UserTagCount, { user: { key: board.writer }, tag: { id: userTagCountExist.id } })
                                                      }
                                                }
                                                resolve(true)
                                          })
                                    )
                              }
                              await Promise.all(promisesUserTag)
                              DB.Manager.save(Board, {
                                    id: boardId, writer: updaterKey,
                                    contents: contents.slice(0, MAX_CONTENTS_LEN),
                                    updated: true,
                                    tags: hashTagEntities
                              }).then((r) => {
                                    Logger.passApp("boardUpdate").out()
                                    resolve(true)
                              }).catch((err) => Logger.errorApp(ErrorCode.board_update_failed).put("boardUpdate_1").put(err).out())
                        } else Logger.errorApp(ErrorCode.board_find_failed).put("boardUpdate_0").out()
                  }).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("boardUpdate_1").put(err).out())
            })
      }

      /**
      * 게시글 삭제.
      * @param boardId 게시글 식별자.
      */
      public static boardDelete(boardId: number, userKey: number) {
            return new Promise((resolve, _) => {
                  DB.Manager.findOne(Board, { where: { id: boardId, writer: userKey }, relations: ["tags", "url"] }).then((board) => {
                        if (board) {
                              const promisesTag: Promise<any>[] = []
                              board.tags.forEach((tag) => {
                                    const p = new Promise((res) => DB.Manager.decrement(Tag, { name: tag.name }, "count", 1).then(() => res(true)).catch((err) => Logger.errorApp(ErrorCode.tag_update_failed).put("boardDelete").put(err).out()))
                                    promisesTag.push(p)
                                    if (board.url) {
                                          const pi0 = new Promise((res, _) => DB.Manager.decrement(UrlTagCount, { url: { id: board.url?.id }, tag: { id: tag.id } }, "count", 1).then(() => res(true)).catch((err) => Logger.errorApp(ErrorCode.urltagcount_update_failed).put("boardDelete").put(err).out()))
                                          promisesTag.push(pi0)
                                    }
                              })
                              DB.Manager.remove(Board, board).then(async () => { // cascade deleting tags
                                    await Promise.all(promisesTag)
                                    Logger.passApp("boardDelete").out()
                                    resolve(true)
                              }).catch((err) => Logger.errorApp(ErrorCode.block_delete_failed).put("boardDelete").put(err).out())
                        } else Logger.errorApp(ErrorCode.board_find_failed).put("boardDelete_0").out()
                  }).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("boardDelete_1").put(err).out())
            })
      }

      /**
      * 게시글 좋아요.
      * @param boardId 게시글 식별자.
      * @param userKey 사용자 디비 식별자.
      */
      public static async boardUp(boardId: number, userKey: number) {
            const board = await DB.Manager.findOne(Board, { where: { id: boardId }, select: ["writer"] })
            if (board?.writer === userKey) return
            const uped = await DB.Manager.query(`select * from \`user_uped_boards_board\` where userKey=${userKey} and boardId=${boardId}`)
            if (uped.length) {
                  await DB.Manager.query(`delete from \`user_uped_boards_board\` where userKey=${userKey} and boardId=${boardId}`)
                  await DB.Manager.decrement(Board, { id: boardId }, "up", 1)
                  return ({ uped: false })
            } else {
                  await DB.Manager.query(`insert into \`user_uped_boards_board\` (userKey, boardId) values (${userKey}, ${boardId})`)
                  await DB.Manager.increment(Board, { id: boardId }, "up", 1)
                  return ({ uped: true })
            }
            // return new Promise((resolve, _) => {
            //       DB.Manager.query(`select * from \`user_uped_boards_board\` where userKey=${userKey} and boardId=${boardId}`).then(async (uped) => {
            //             if (uped.length) {
            //                   DB.Manager.query(`delete from \`user_uped_boards_board\` where userKey=${userKey} and boardId=${boardId}`).then(() => {
            //                         DB.Manager.decrement(Board, { id: boardId }, "up", 1).then(() => {
            //                               Logger.passApp("boardUp").out()
            //                               resolve({ uped: false })
            //                               return
            //                         }).catch((err) => Logger.errorApp(ErrorCode.comment_like_decrement).put(err).out())
            //                   }).catch((err) => Logger.errorApp(ErrorCode.comment_like_delete_failed).put(err).out())
            //             } else {
            //                   DB.Manager.query(`insert into \`user_uped_boards_board\` (userKey, boardId) values (${userKey}, ${boardId})`).then(() => {
            //                         DB.Manager.increment(Board, { id: boardId }, "up", 1).then(() => {
            //                               Logger.passApp("boardUp").out()
            //                               resolve({ uped: true })
            //                               return
            //                         }).catch((err) => Logger.errorApp(ErrorCode.comment_like_increment).put(err).out())
            //                   }).catch((err) => Logger.errorApp(ErrorCode.comment_like_insert_failed).put(err).out())
            //             }
            //       }).catch((err) => Logger.errorApp(ErrorCode.comment_unfound).put(err).out())
            // })
      }

      /**
      * 댓글 생성.
      * @param boardId 게시글 식별자.
      * @param contents 내용물.
      * @param writerKey 글쓴이 식별자.
      */
      public static commentInsert(boardId: number, writerKey: number, contents: string) {
            return new Promise((resolve, _) => {
                  DB.Manager.insert(Comment, {
                        writer: writerKey,
                        contents,
                        board: {
                              id: boardId,
                        },
                  }).then(() => {
                        Logger.passApp("commentInsert").out()
                        resolve(true)
                  }).catch((err) => Logger.errorApp(ErrorCode.comment_insert_failed).put("commentInsert").put(err).out())
            })
      }

      /**
      * 댓글 업데이트.
      * @param boardId 댓글 식별자.
      * @param updaterKey 업데이트하려는 사용자 식별자.
      * @param contents 내용물.
      */
      public static commentUpdate(boardId: number, updaterKey: number, contents: string) {
            return new Promise((resolve, _) => {
                  DB.Manager.update(Comment, { id: boardId, writer: updaterKey }, {
                        contents,
                        updated: true
                  }).then((r) => {
                        if (!r.affected) {
                              Logger.errorApp(ErrorCode.comment_update_bad_request).put("commentUpdate_0").out()
                        } else {
                              Logger.passApp("commentUpdate").out()
                              resolve(true)
                        }
                  }).catch((err) => Logger.errorApp(ErrorCode.comment_update_failed).put("commentUpdate_1").put(err).out())
            })
      }

      /**
       * 댓글 삭제.
       * @param commentId 댓글 식별자.
       */
      public static commentDelete(commentId: number, userKey: number) {
            return new Promise((resolve, _) => {
                  DB.Manager.findOne(User, { where: { key: userKey } }).then((user) => {
                        if (user) {
                              DB.Manager.delete(Comment, commentId).then(() => {
                                    Logger.passApp("commentDelete").out()
                                    resolve(true)
                              }).catch((err) => Logger.errorApp(ErrorCode.comment_delete_failed).put("commentDelete").put(err).out())
                        } else Logger.errorApp(ErrorCode.user_find_failed).put("commentDelete_0").out()
                  }).catch((err) => Logger.errorApp(ErrorCode.user_find_failed).put("commentDelete_1").put(err).out())
            })
      }

      /**
       * 댓글 좋아요.
       * @param commentId 댓글 식별자.
       * @param userKey 사용자 식별자.
       */
      public static async commentUp(commentId: number, userKey: number) {
            const board = await DB.Manager.findOne(Comment, { where: { id: commentId }, select: ["writer"] })
            if (board?.writer === userKey) return
            const uped = await DB.Manager.query(`select * from \`user_uped_comments_comment\` where userKey=${userKey} and commentId=${commentId}`)
            if (uped.length) {
                  await DB.Manager.query(`delete from \`user_uped_comments_comment\` where userKey=${userKey} and commentId=${commentId}`)
                  await DB.Manager.decrement(Comment, { id: commentId }, "up", 1)
                  return ({ uped: false })
            } else {
                  await DB.Manager.query(`insert into \`user_uped_comments_comment\` (userKey, commentId) values (${userKey}, ${commentId})`)
                  await DB.Manager.increment(Comment, { id: commentId }, "up", 1)
                  return ({ uped: false })
            }
            // return new Promise((resolve, _) => {
            //       DB.Manager.query(`select * from \`user_uped_comments_comment\` where userKey=${userKey} and commentId=${commentId}`).then(async (uped) => {
            //             if (uped.length) {
            //                   DB.Manager.query(`delete from \`user_uped_comments_comment\` where userKey=${userKey} and commentId=${commentId}`).then(() => {
            //                         DB.Manager.decrement(Comment, { id: commentId }, "up", 1).then(() => {
            //                               Logger.passApp("commentUp").out()
            //                               resolve({ uped: false })
            //                               return
            //                         }).catch((err) => Logger.errorApp(ErrorCode.comment_like_decrement).put(err).out())
            //                   }).catch((err) => Logger.errorApp(ErrorCode.comment_like_delete_failed).put(err).out())
            //             } else {
            //                   DB.Manager.query(`insert into \`user_uped_comments_comment\` (userKey, commentId) values (${userKey}, ${commentId})`).then(() => {
            //                         DB.Manager.increment(Comment, { id: commentId }, "up", 1).then(() => {
            //                               Logger.passApp("commentUp").out()
            //                               resolve({ uped: true })
            //                               return
            //                         }).catch((err) => Logger.errorApp(ErrorCode.comment_like_increment).put(err).out())
            //                   }).catch((err) => Logger.errorApp(ErrorCode.comment_like_insert_failed).put(err).out())
            //             }
            //       }).catch((err) => Logger.errorApp(ErrorCode.comment_unfound).put(err).out())
            // })
      }

      /** url에 사용된 태그 가져오기. */
      public static async getUrlTag(url: string) {
            console.log("get url tag")
            return new Promise((resolve, _) => {
                  DB.Manager.findOne(Url, { select: ["id"], where: { name: url } }).then((url_) => {
                        if (url_) {
                              const urlId = url_.id
                              DB.Manager.query(`select name, isUrl from (select tagId from \`urltagcount\` where urlId = ${urlId} and count > 0 order by count desc limit ${TAG_DISPLAY_CNT}) b join corner.tag a on a.id = b.tagid;`)
                                    .then((r) => {
                                          Logger.passApp("get tag").put(r.map((i) => i.name)).out()
                                          if (r) {
                                                resolve(r)
                                                return
                                          } else {
                                                Logger.errorApp(ErrorCode.tag_find_failed).put("getUrlTag_0").out()
                                          }
                                    }).catch((err) => Logger.errorApp(ErrorCode.tag_find_failed).put("getUrlTag_1").put(err).out())
                        } else {
                              resolve([])
                        }
                  }).catch((err) => Logger.errorApp(ErrorCode.url_find_failed).put("getUrlTag").put(err).out())
            })
      }

      /** 핫한 태그 가져오기. (유저가 작성한 태그 절반, 전체에서 가장 많이 쓴 태그 절반) */
      public static async getHotTag(userKey: number) {
            const hotKeyLen = Math.ceil(TAG_DISPLAY_CNT / 2)
            const userHotKeyLen = TAG_DISPLAY_CNT - hotKeyLen - 1
            return new Promise((resolve, _) => {
                  DB.Manager.query(`select name, isUrl from (select tagId from \`usertagcount\` where userKey = ${userKey} and count > 0 order by count desc limit ${userHotKeyLen}) b join \`tag\` a on a.id = b.tagId;`)
                        .then((r) => {
                              const left_tag_cnt = hotKeyLen - (userHotKeyLen - r.length)
                              const exclude_tag = r.map((t) => "\"" + t.name + "\"").join(" ,")
                              DB.Manager.query(`select name, isUrl from \`tag\` ${r.length ? `where count > 0 and name not in (${exclude_tag})` : "where count > 0"} order by count desc limit ${left_tag_cnt}`)
                                    .then((r2) => {
                                          r.push(...r2)
                                          Logger.passApp("get tag").out()
                                          resolve(r)
                                          return
                                    }).catch((err) => Logger.errorApp(ErrorCode.tag_find_failed).put("getHotTag_0").put(err).out())
                        }).catch((err) => Logger.errorApp(ErrorCode.tag_find_failed).put("getHotTag_1").put(err).out())
            })
      }
      /** url, hostname에 게시글 있는지 확인. */
      public static async checkBoard(url: string, hostname: string) {
            return new Promise<any>(async (resolve) => {
                  let urlBoardNum = 0
                  let tagBoardNum = 0
                  const urlObj = await DB.Manager.findOne(Url, { where: { name: url }, select: ["id"] }).catch((err) => Logger.errorApp(ErrorCode.url_find_failed).put("checkBoard").put(err).out())
                  if (urlObj) {
                        const boardNum = await DB.Manager.query(`select count(id) as cnt from \`board\` where urlId = ${urlObj.id} limit 99;`)
                        urlBoardNum = boardNum[0].cnt
                  }
                  const tagObj = await DB.Manager.findOne(Tag, { where: { name: hostname } }).catch((err) => Logger.errorApp(ErrorCode.tag_find_failed).put("checkBoard").put(err).out())
                  if (tagObj) {
                        const boardNum = await DB.Manager.query(`select count(boardId) as cnt from \`board_tags_tag\` where tagId = ${tagObj.id} limit 99;`)
                        tagBoardNum = boardNum[0].cnt
                  }
                  if (urlBoardNum > 99) urlBoardNum = 100
                  if (tagBoardNum > 99) tagBoardNum = 100
                  resolve({ u: urlBoardNum, h: tagBoardNum })
            })
      }
      /** url, hostname에 게시글 있는지 확인. */
      public static async checkUrlBoardExist(url: string) {
            return new Promise<any>(async (resolve) => {
                  let urlBoardExist = false
                  const urlObj = await DB.Manager.findOne(Url, { where: { name: url }, select: ["id"] }).catch((err) => Logger.errorApp(ErrorCode.url_find_failed).put("checkBoard").put(err).out())
                  if (urlObj) {
                        const boardExist = await DB.Manager.query(`select id from \`board\` where urlId = ${urlObj.id} limit 1;`)
                        if (boardExist) urlBoardExist = true
                  }
                  resolve(urlBoardExist)
            })
      }
}