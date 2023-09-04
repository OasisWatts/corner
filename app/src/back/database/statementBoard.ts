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
const MAX_TAG_CNT = SETTINGS.board.tagCnt
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
            ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put(err).out())
            console.log("bLisF", bList)
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
            ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put(err).out())
            console.log("bLisF", bList)
            bList.forEach((b, idx) => { bList[idx].uped = 1 })
            return bList
      }
      /** 차단한 상대가 쓴 것이 아닌 게시글 가져오기. */
      private static async getUrlBoards(startId: number, userKey: number, blockeds: number[], url: string): Promise<any[]> {
            let selectAndQuery = `, (select count(*) from \`user_uped_boards_board\` where userKey = ${userKey} and boardId = a.id) as uped`
            let fromQuery: string = "from \`board\`"
            let orderQuery = `order by id desc limit ${MAX_LIST_LEN}`

            const urlObj = await DB.Manager.findOne(Url, { where: { name: url }, select: ["id"] }).catch((err) => Logger.errorApp(ErrorCode.url_find_failed).put(err).out())
            if (urlObj) {
                  console.log("urlobj", urlObj)
                  let whereQuery = `where urlId = ${urlObj.id} ${startId ? ` and id < ${startId}` : ""}`
                  const bList = await DB.Manager.query(
                        `select *, (select count(id) from \`comment\` where boardId = a.id) as comNum ${selectAndQuery}
                                    from ( select id ${fromQuery} ${whereQuery} ${orderQuery}
                                    ) b join \`board\` a on b.id = a.id;`
                  ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put(err).out())
                  let bListFiltered = bList.filter((b: any) => !blockeds.includes(b.writer))
                  console.log("bLisF", bListFiltered)
                  return bListFiltered.sort((b1, b2) => b2.up - b1.up)
            } else return []
      }
      /** 차단한 상대가 쓴 것이 아닌 게시글 가져오기. */
      private static async getTagBoards(startId: number, userKey: number, blockeds: number[], tag: string): Promise<any[]> {
            const tagObj = await DB.Manager.findOne(Tag, { where: { name: tag }, select: ["id"] }).catch((err) => Logger.errorApp(ErrorCode.tag_find_failed).put(err).out())
            if (tagObj) {
                  const tagId = tagObj.id
                  let selectAndQuery = `, (select count(*) from \`user_uped_boards_board\` where userKey = ${userKey} and boardId = a.id) as uped`
                  let joinQuery = `from (select boardId from \`board_tags_tag\` where tagId = ${tagId} ${startId ? ` and boardId < ${startId}` : ""} order by boardId desc limit ${MAX_LIST_LEN} ) b join corner.board a on b.boardId = a.id`

                  const bList = await DB.Manager.query(
                        `select *, (select count(id) from \`comment\` where boardId = a.id) as comNum ${selectAndQuery}
                              ${joinQuery};`
                  ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put(err).out())  // 차단 대상 제외.
                  let bListFiltered = bList.filter((b: any) => !blockeds.includes(b.writer))
                  console.log("bLisF", bListFiltered)
                  return bListFiltered.sort((b1, b2) => b2.up - b1.up)
            } else return []
      }
      /** 차단한 상대가 쓴 것이 아닌 게시글 가져오기. */
      private static async getBoards(startId: number, userKey: number, blockeds: number[]): Promise<any[]> {
            let whereQuery: string = startId ? `where id < ${startId}` : ""
            let fromQuery: string = "from \`board\`"
            let orderQuery = `order by id desc limit ${MAX_LIST_LEN}`
            let selectAndQuery = `, (select count(*) from \`user_uped_boards_board\` where userKey = ${userKey} and boardId = a.id) as uped`

            const bList = await DB.Manager.query(
                  `select *, (select count(id) from \`comment\` where boardId = a.id) as comNum ${selectAndQuery}
                              from ( select id ${fromQuery} ${whereQuery} ${orderQuery}
                              ) b join \`board\` a on b.id = a.id;`,
            ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put(err).out())  // 차단 대상 제외.
            let bListFiltered = bList.filter((b: any) => !blockeds.includes(b.writer))
            console.log("bLisF", bListFiltered, bList)
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
                  ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put(err).out())  // 차단 대상 제외.
                  let bListFiltered = bList.filter((b: any) => !blockeds.includes(b.writer))
                  console.log("bLisF", bListFiltered, bList)
                  return bListFiltered.sort((b1, b2) => b2.up - b1.up)
            }
      }
      /** 차단한 상대가 쓴 것이 아닌 게시글 가져오기. */
      private static async getBoard(boardId: number, userKey: number): Promise<any> {
            let whereQuery: string = `where id = ${boardId}`
            let fromQuery: string = "from `board`"
            let selectAndQuery = `, (select count(*) from \`user_uped_boards_board\` where userKey = ${userKey} and boardId = ${boardId}) as uped`

            const boards = await DB.Manager.query(
                  `select *, (select count(id) from \`comment\` where boardId = ${boardId}) as comNum ${selectAndQuery}
                              ${fromQuery} ${whereQuery};`,
            ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put(err).out())  // 차단 대상 제외.
            const boardTags = await DB.Manager.findOne(Board, { select: ["tags"], relations: ["tags"], where: { id: boardId } })
                  .catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put(err).out())
            const board = boards[0]
            if (boardTags) {
                  const tags = boardTags.tags.map((t) => t.name)
                  console.log("tags", tags)
                  board.tags = tags
            } return board
      }
      public static async categorizedBoardList(startId: number, categ: number, userKey: number, url?: string, tag?: string, search?: string) {
            const user = await DB.Manager.findOne(User, { relations: ["blockeds"], where: { key: userKey } }).catch((err) => {
                  Logger.errorApp(ErrorCode.user_find_failed).put(err).out()
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
                        default: return null
                  }
            } else return null
      }
      /**
      * 게시글 목록 조회.
      * @param startId 게시글 시작 식별자.
      * @param categ 게시글 ui 버튼 enum.
      * @param userKey 사용자 식별자.
      * @returns 조회한 게시글 목록, 끝 식별자 또는 오류 전송.
      */
      public static async boardList(startId: number, categ: number, userKey: number, url?: string, tag?: string, search?: string) {
            return new Promise(async (resolve, _) => {
                  const bList = await this.categorizedBoardList(startId, categ, userKey, url, tag, search)
                  if (bList) {
                        console.log("3")
                        const boardList: boardType[] = []
                        const where: { key: number }[] = []
                        if (bList.length < 1) {
                              resolve({ end: true })
                              return
                        }
                        const endId = bList[bList.length - 1].id
                        for (const item of bList) {
                              where.push({
                                    key: item.writer,
                              })
                        } // 게시물 글쓴이 정보 조회.
                        console.log("4")
                        DB.Manager.find(User, {
                              where,
                              relations: ["followers"]
                        }).then((r) => {
                              console.log("r", r)
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
                              console.log("boardList", boardList, "endId", endId)
                              Logger.passApp("boardList").out()
                              resolve({ boardList, endId })
                        }).catch((err) => Logger.errorApp(ErrorCode.user_find_failed).put(err).out())
                  } else {
                        Logger.errorApp(ErrorCode.board_find_failed).out()
                  }
            })
      }

      /**
       * 게시글 조회.
       * @param boardId 게시글 식별자.
       * @param userKey 사용자 디비 식별자.
       * @returns 조회한 게시글 내용 및 댓글.
       */
      public static boardSelect(boardId: number, userKey: number): Promise<boardType> {
            return new Promise((resolve, _) => {
                  this.getBoard(boardId, userKey).then((board: any) => {
                        if (board) {
                              console.log("board", board)
                              DB.Manager.findOne(User, {
                                    where: { key: board?.writer },
                                    relations: ["followers"]
                              }).then((user) => {
                                    console.log("usr", user)
                                    console.log("f", user?.followers)
                                    DB.Manager.query(
                                          `select comment.id, comment.contents, comment.up, comment.writer, comment.date
                        , (select count(*) from \`user_uped_comments_comment\` where userKey = ${userKey} and commentId = comment.id) as uped
                              from (
                                    select id
                                    from \`board\`
                                    where id = ${boardId}
                              ) board left join \`comment\` comment on board.id = comment.boardId order by id desc limit ${MAX_LIST_LEN};`
                                    ).then((result) => {
                                          console.log("result", result)
                                          const where: { key: number }[] = []
                                          if (result[0]?.id === null) {
                                                console.log("no comment", board, board?.contents)
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
                                                      tags: board?.tags
                                                })
                                                return
                                          } console.log("1")
                                          for (const c of result) {
                                                where.push({
                                                      key: c.writer,
                                                })
                                          }
                                          DB.Manager.find(User, {
                                                where,
                                                relations: ["followers"]
                                          }).then((r) => {
                                                console.log("user", r)
                                                const userTable = reduceToTable(r, (v) => v, (v) => v.key)
                                                console.log("usert", userTable)
                                                const comments: commentType[] = []
                                                for (const c of result) {
                                                      console.log("c", c)
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
                                                      tags: board.tags
                                                })
                                          }).catch((err) => Logger.errorApp(ErrorCode.user_find_failed).put(err).out())
                                    }).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put(err).out())
                              }).catch((err) => Logger.errorApp(ErrorCode.user_find_failed).put(err).out())
                        } else Logger.errorApp(ErrorCode.board_find_failed).out()
                  }).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put(err).out())
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
                                    where id = ${boardId}
                              ) board left join \`comment\` comment on board.id = comment.boardId where ${commentStartId ? `id < ${commentStartId}` : ""} order by id desc limit ${MAX_LIST_LEN};`,
                  ).then((cList) => {
                        const where: { key: number }[] = []
                        if (cList.length < 1) resolve({ end: true })
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
                                    endId
                              })
                        }).catch((err) => Logger.errorApp(ErrorCode.user_find_failed).put(err).out())
                  }).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put(err).out())
            })
      }
      /**
       * 게시글 생성.
       * @param writerKey 글쓴이 디비 식별자.
       * @param contents 게시글 내용.
       */
      public static async boardInsert(writerKey: number, contents: string, hashTag: string, url_?: string, hostname_?: string) {
            let urlEntity: Url | null = null
            const hashTags = hashTag.split("#").map((t) => ({ tag: t.replace(/\n|\s/g, ""), isUrl: false })).filter((t) => t.tag.length)
            console.log("uh", url_, hostname_)
            if (url_) {
                  const urlExist = await DB.Manager.findOne(Url, { where: { name: url_ } })
                  if (urlExist) {
                        urlEntity = urlExist
                        await DB.Manager.increment(Url, { name: url_ }, "count", 1)
                  } else {
                        const parsedUrl = url.parse(url_)
                        if (parsedUrl.path === "") {
                              urlEntity = await DB.Manager.save(Url, { name: url_, count: 1, isHost: true })
                        } else {
                              urlEntity = await DB.Manager.save(Url, { name: url_, count: 1 })
                        }
                  }
                  if (urlEntity) {
                        const userUrlCount = await DB.Manager.findOne(UserUrlCount, { where: { user: { key: writerKey }, url: urlEntity } })
                        if (userUrlCount) {
                              await DB.Manager.increment(UserUrlCount, { user: { key: writerKey }, url: urlEntity }, "count", 1)
                        } else await DB.Manager.save(UserUrlCount, { user: { key: writerKey }, url: urlEntity, count: 1 })
                  }
                  hashTags.push({ tag: url_, isUrl: true })
            }
            if (hostname_) hashTags.push({ tag: hostname_, isUrl: false })
            const hashTagEntities: Tag[] = []
            console.log("hashtags", hashTags)
            for (const tagObj of hashTags) {
                  const tagExist = await DB.Manager.findOne(Tag, { where: { name: tagObj.tag } })
                  let tagEntity: Tag
                  console.log("tagExist", tagExist)
                  if (tagExist) {
                        tagEntity = tagExist
                        await DB.Manager.increment(Tag, { name: tagObj.tag }, "count", 1)
                        if (urlEntity) await DB.Manager.increment(UrlTagCount, { url: urlEntity, tag: tagExist }, "count", 1)
                  } else {
                        tagEntity = await DB.Manager.save(Tag, { name: tagObj.tag, isUrl: tagObj.isUrl, count: 1 })
                        if (urlEntity && tagEntity) {
                              await DB.Manager.save(UrlTagCount, { url: urlEntity, tag: tagEntity, count: 1 })
                        }
                  }
                  if (tagEntity) {
                        hashTagEntities.push(tagEntity)
                        const userTagCountExist = await DB.Manager.findOne(UserTagCount, { where: { user: { key: writerKey }, tag: tagEntity } })
                        console.log("userTagCount", userTagCountExist)
                        if (userTagCountExist) {
                              await DB.Manager.increment(UserTagCount, { user: { key: writerKey }, tag: tagEntity }, "count", 1)
                        } else await DB.Manager.save(UserTagCount, { user: { key: writerKey }, tag: tagEntity, count: 1 })
                  }
            }

            if (urlEntity) await DB.Manager.save(Board, { contents: contents.slice(0, MAX_CONTENTS_LEN), writer: writerKey, tags: hashTagEntities, url: urlEntity })
            else await DB.Manager.save(Board, { contents: contents.slice(0, MAX_CONTENTS_LEN), writer: writerKey, tags: hashTagEntities })
            return true
      }

      /**
        * 게시글 업데이트.
        * @param boardId 게시글 식별자.
        * @param updaterKey 업데이트하려는 사용자 식별자.
        * @param contents 게시글 내용.
        */
      public static boardUpdate(boardId: number, updaterKey: number, contents: string) {
            return new Promise((resolve, _) => {
                  DB.Manager.update(Board, { id: boardId, writer: updaterKey }, {
                        contents: contents.slice(0, MAX_CONTENTS_LEN),
                        updated: true
                  }).then((r) => {
                        if (!r.affected) {
                              Logger.errorApp(ErrorCode.board_update_failed).out()
                        } else {
                              Logger.passApp("boardUpdate").out()
                              resolve(true)
                        }
                  }).catch((err) => Logger.errorApp(ErrorCode.board_update_failed).put(err).out())
            })
      }

      /**
      * 게시글 삭제.
      * @param boardId 게시글 식별자.
      */
      public static boardDelete(boardId: number) {
            return new Promise((resolve, _) => {
                  DB.Manager.delete(Board, boardId).then(() => {
                        Logger.passApp("boardDelete").out()
                        resolve(true)
                  }).catch((err) => Logger.errorApp(ErrorCode.block_delete_failed).put(err).out())
            })
      }

      /**
      * 게시글 좋아요.
      * @param boardId 게시글 식별자.
      * @param userKey 사용자 디비 식별자.
      */
      public static async boardUp(boardId: number, userKey: number) {
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
                  }).catch((err) => Logger.errorApp(ErrorCode.comment_insert_failed).put(err).out())
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
                              Logger.errorApp(ErrorCode.comment_update_bad_request).out()
                        } else {
                              Logger.passApp("commentUpdate").out()
                              resolve(true)
                        }
                  }).catch((err) => Logger.errorApp(ErrorCode.comment_update_failed).put(err).out())
            })
      }

      /**
       * 댓글 삭제.
       * @param commentId 댓글 식별자.
       */
      public static commentDelete(commentId: number) {
            return new Promise((resolve, _) => {
                  DB.Manager.delete(Comment, commentId).then(() => {
                        Logger.passApp("commentDelete").out()
                        resolve(true)
                  }).catch((err) => Logger.errorApp(ErrorCode.comment_delete_failed).put(err).out())
            })
      }

      /**
       * 댓글 좋아요.
       * @param commentId 댓글 식별자.
       * @param userKey 사용자 식별자.
       */
      public static async commentUp(commentId: number, userKey: number) {
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
            return new Promise((resolve, _) => {
                  DB.Manager.findOne(Url, { select: ["id"], where: { name: url } }).then((url_) => {
                        if (url_) {
                              const urlId = url_.id
                              DB.Manager.query(`select name, isUrl from (select tagId from \`urltagcount\` where urlId = ${urlId}  order by count desc limit ${MAX_TAG_CNT}) b join corner.tag a on a.id = b.tagid;`)
                                    .then((r) => {
                                          console.log("tag", r)
                                          Logger.passApp("get tag").out()
                                          if (r) {
                                                resolve(r)
                                                return
                                          } else {
                                                Logger.errorApp(ErrorCode.tag_find_failed).out()
                                          }
                                    }).catch((err) => Logger.errorApp(ErrorCode.tag_find_failed).put(err).out())
                        } else Logger.errorApp(ErrorCode.url_find_failed).out()
                  }).catch((err) => Logger.errorApp(ErrorCode.url_find_failed).put(err).out())
            })
      }

      /** 핫한 태그 가져오기. */
      public static async getHotTag() {
            return new Promise((resolve, _) => {
                  DB.Manager.query(`select name, isUrl from (select tagId from \`urltagcount\` order by count desc limit ${MAX_TAG_CNT}) b join corner.tag a on a.id = b.tagid;`)
                        .then((r) => {
                              console.log("tag", r)
                              Logger.passApp("get tag").out()
                              if (r) {
                                    resolve(r)
                                    return
                              } else {
                                    Logger.errorApp(ErrorCode.tag_find_failed).out()
                              }
                        }).catch((err) => Logger.errorApp(ErrorCode.tag_find_failed).put(err).out())
            })
      }
}