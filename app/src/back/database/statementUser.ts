import DB from "back/database/connection"
import { ErrorCode } from "common/applicationCode"
import User from "back/model/user"
import { Logger } from "back/util/logger"
import { SETTINGS } from "back/util/setting"
import Tag from "back/model/tag"

const MAX_FRIENDS = SETTINGS.follow.limit
const MAX_BLOCKS = SETTINGS.block.limit
const MAX_FOLLOW_RECOMM = SETTINGS.follow.recommendLen
const MAX_FOLLOW_LEN = SETTINGS.follow.followLen
/**
 * 친구 관련 트랜잭션 함수를 가진 클래스.
 */
export class StatementUser {
      /**
       * 팔로우 또는 언팔로우.
       * @param targetKey 대상 사용자 식별자.
       * @param userKey 친구를 추가하려는 사용자 식별자.
       */
      public static follow(targetKey: number, userKey: number) {
            return new Promise((resolve, reject) => {
                  DB.Manager.findOne(User, {
                        where: { key: userKey },
                        select: ["key"],
                        relations: ["followings"],
                  }).then((user) => {
                        if (user) {
                              const userKey = user.key
                              const numFriends = user.followings.length
                              if (targetKey === userKey) {
                                    Logger.errorApp(ErrorCode.follow_self).out()
                                    return
                              }
                              if (numFriends > MAX_FRIENDS) {
                                    Logger.errorApp(ErrorCode.max_friends).out()
                                    return
                              }
                              if (user.followings.some((f) => f.key === targetKey)) {
                                    DB.Manager.query(`delete from \`user_followings_user\` where followerKey = ${userKey} and followedKey = ${targetKey}`).then(() => {
                                          Logger.passApp().out()
                                          resolve({ followed: false })
                                    }).catch((err) => { Logger.errorApp(ErrorCode.unfollow_failed).put(err).out() })
                              } else {
                                    DB.Manager.query(`insert into \`user_followings_user\`(followerKey, followedKey) value(${userKey}, ${targetKey})`).then(() => {
                                          Logger.passApp().out()
                                          resolve({ followed: true })
                                    }).catch((err) => { Logger.errorApp(ErrorCode.follow_failed).put(err).out() })
                              }
                        } else Logger.errorApp(ErrorCode.user_unfound).out()
                  }).catch((err) => { Logger.errorApp(ErrorCode.user_unfound).put(err).out() })
            })
      }

      /**
       * follow 찾기 (태그 사용 순으로 배열)
       * @param userKey 
       * @param tag 
       * @param startId 
       * @returns 
       */
      public static getFollow(userKey: number, tag: string | null, startId: number, zeroTagUse: boolean) {
            return new Promise((resolve, reject) => {
                  if (zeroTagUse) {
                        DB.Manager.query(`select followedKey, (select name from corner.user where user.key = followedKey) name, (select image from corner.user where user.key = followedKey) image from corner.user_followings_user where followerKey = ${userKey} and followedKey > ${startId} and followedKey not in (select usertagcount.userKey from corner.usertagcount where usertagcount.userKey = followedKey) order by followedKey desc limit ${MAX_FOLLOW_LEN};
                                    `).then((usersO) => {
                              const users = usersO.map((us) => ({ key: us.userKey, name: us.name, image: us.image }))
                              if (users.length === 0) {
                                    resolve({ users, end: true, endId: 0, zero: true })
                              } else {
                                    const endId = users[users.length - 1].key
                                    if (users.length < MAX_FOLLOW_LEN) {
                                          resolve({ users, end: true, endId: 0, zero: true })
                                    } else resolve({ users, end: false, endId, zero: true })
                              }
                              Logger.passApp("getFollow")
                              return
                        }).catch((err) => Logger.errorApp(ErrorCode.follow_find_failed).put(err).out())
                  } else if (tag) {
                        DB.Manager.findOne(Tag, { where: { name: tag }, select: ["id"] }).then((tagO) => {
                              if (tagO) {
                                    const tagId = tagO.id
                                    DB.Manager.query(`select userKey, (select name from corner.user where user.key = userKey) name, (select image from corner.user where user.key = userKey) image from (select followedKey from corner.user_followings_user where followerKey = ${userKey}) followed left join corner.usertagcount usertagcount on usertagcount.userKey = followed.followedKey where tagId = ${tagId} and userKey > ${startId} order by count desc limit ${MAX_FOLLOW_LEN};
                              `).then((usersO) => {
                                          const users = usersO.map((us) => ({ key: us.userKey, name: us.name, image: us.image }))
                                          if (users.length === 0) {
                                                resolve({ users, end: true, endId: startId, zero: true })
                                          } else {
                                                const endId = users[users.length - 1].key
                                                if (users.length < MAX_FOLLOW_LEN) {
                                                      resolve({ users, end: false, endId, zero: true })
                                                } else resolve({ users, end: false, endId })
                                          }
                                          Logger.passApp("getFollow").out()
                                          return
                                    }).catch((err) => Logger.errorApp(ErrorCode.follow_find_failed).put(err).out())
                              } else Logger.errorApp(ErrorCode.tag_find_failed).out()
                        }).catch((err) => Logger.errorApp(ErrorCode.tag_find_failed).put(err).out())
                  } else {
                        DB.Manager.query(`select userKey, (select name from corner.user where user.key = userKey) name, (select image from corner.user where user.key = userKey) image, count(*) as cnt from (select followedKey from corner.user_followings_user where followerKey = ${userKey}) followed left join corner.usertagcount usertagcount on usertagcount.userKey = followed.followedKey where userKey > 0 group by userKey order by cnt desc limit ${MAX_FOLLOW_LEN};
                        `).then((usersO) => {
                              console.log("usersO", usersO)
                              const users = usersO.map((us) => ({ key: us.userKey, name: us.name, image: us.image }))
                              if (users.length === 0) {
                                    resolve({ users, end: true, endId: 0, zero: true })
                              } else {
                                    const endId = users[users.length - 1].key
                                    if (users.length < MAX_FOLLOW_LEN) {
                                          DB.Manager.query(`select followedKey, (select name from corner.user where user.key = followedKey) name, (select image from corner.user where user.key = followedKey) image from corner.user_followings_user where followerKey = ${userKey} and followedKey > ${startId} and followedKey not in (select usertagcount.userKey from corner.usertagcount where usertagcount.userKey = followedKey) order by followedKey desc limit ${MAX_FOLLOW_LEN};
                                                      `).then((usersO_) => {
                                                console.log("usersO", usersO_)
                                                const users_ = usersO_.map((us) => ({ key: us.userKey, name: us.name, image: us.image }))
                                                if (users_.length === 0) {
                                                      resolve({ users: [...users, ...users_], end: true, endId: 0, zero: true })
                                                } else {
                                                      const endId = users_[users_.length - 1].key
                                                      if (users_.length < MAX_FOLLOW_LEN) {
                                                            resolve({ users: [...users, ...users_], end: true, endId: 0, zero: true })
                                                      } else resolve({ users: [...users, ...users_], end: false, endId, zero: true })
                                                }
                                                Logger.passApp("getFollow")
                                                return
                                          }).catch((err) => Logger.errorApp(ErrorCode.follow_find_failed).put(err).out())
                                    } else resolve({ users, end: false, endId })
                              }
                        }).catch((err) => Logger.errorApp(ErrorCode.follow_find_failed).put(err).out())
                  }
            })
      }

      /**
       * follow 추천 (태그(url, hostname 포함)에 가장 많이 사용한 유저)
       * @param userKey 
       * @param tag 
       * @returns 
       */
      public static getFollowRecommend(userKey: number, tag: string | null) {
            console.log("gfr", userKey, tag)
            return new Promise((resolve, reject) => {
                  if (tag) {
                        DB.Manager.findOne(Tag, { where: { name: tag }, select: ["id"] }).then((tagO) => {
                              if (tagO) {
                                    console.log("tagO", tagO)
                                    const tagId = tagO.id
                                    DB.Manager.query(`select userKey, (select name from corner.user where user.key = userKey) name, (select image from corner.user where user.key = userKey) image from corner.usertagcount where tagId = ${tagId} order by count desc limit ${MAX_FOLLOW_RECOMM};`).then((usersO) => {
                                          const users = usersO.map((us) => ({ key: us.userKey, name: us.name, image: us.image }))
                                          console.log("usrs", usersO, users)
                                          Logger.passApp("getFollowRecommend")
                                          resolve(users)
                                          return
                                    }).catch((err) => Logger.errorApp(ErrorCode.follow_recommend_find_failed).put(err).out())
                              } else Logger.errorApp(ErrorCode.tag_find_failed).out()
                        }).catch((err) => Logger.errorApp(ErrorCode.tag_find_failed).put(err).out())
                  } else {
                        console.log("notag")
                        DB.Manager.query(`select userKey, (select name from corner.user where user.key = userKey) name, (select image from corner.user where user.key = userKey) image, count(*) as cnt from corner.usertagcount group by userKey order by cnt desc;`).then((usersO) => {
                              const users = usersO.map((us) => ({ key: us.userKey, name: us.name, image: us.image }))
                              console.log("usrs", usersO, users)
                              Logger.passApp("getFollowRecommend")
                              resolve(users)
                              return
                        }).catch((err) => Logger.errorApp(ErrorCode.follow_recommend_find_failed).put(err).out())
                  }
            })
      }

      /**
       * 밴 추가.
       * @param targetName 대상 사용자 식별자.
       * @param userName 친구를 추가하려는 사용자 식별자.
       */
      public static blockAdd(targetName: string, userName: string) {
            return new Promise((resolve, reject) => {
                  const target = DB.Manager.findOne(User, {
                        where: { name: targetName },
                        select: ["key"]
                  })
                  const user = DB.Manager.findOne(User, {
                        where: { name: userName },
                        select: ["key"],
                        relations: ["blockeds"],
                  })
                  Promise.all([target, user]).then(([target, user]) => {
                        if (target && user) {
                              const targetKey = target.key
                              const userKey = user.key
                              const numBlocks = user.blockeds.length
                              if (user.blockeds.some((u) => u.key === targetKey)) Logger.errorApp(ErrorCode.block_already).out()
                              if (targetKey === userKey) Logger.errorApp(ErrorCode.block_self).out()
                              if (numBlocks > MAX_BLOCKS) Logger.errorApp(ErrorCode.max_blocks).out()
                              else DB.Manager.query(`insert into \`user_blockeds_user\`(blockersKey, blockedsKey) value(${userKey}, ${targetKey})`)
                                    .then(() => {
                                          Logger.passApp().out()
                                          resolve(true)
                                    }).catch((err) => {
                                          Logger.errorApp(ErrorCode.block_add_failed).put(err).out()
                                    })
                        }
                  }).catch((err) => {
                        Logger.errorApp(ErrorCode.block_add_failed).put(err).out()
                  })
                  reject()
            })
      }

      /**
       * 밴 제거.
       * @param targetName 대상 사용자 식별자.
       * @param userName 친구를 삭제하려는 사용자 식별자.
       */
      public static blockDelete(targetName: string, userName: string) {
            return new Promise((resolve, reject) => {
                  /** 대상 사용자 키. */
                  const targetKey = new Promise((res, _) => {
                        DB.Manager.findOne(User, {
                              where: { name: targetName },
                              select: ["key"],
                        }).then((u) => {
                              if (u) res(u.key)
                              else Logger.errorApp(ErrorCode.user_unfound).out()
                        })
                  })
                  /** 친구를 삭제하려는 사용자 키 */
                  const userKey = new Promise((res, _) => {
                        DB.Manager.findOne(User, {
                              where: { name: userName },
                              select: ["key"],
                        }).then((u) => {
                              if (u) res(u.key)
                              else Logger.errorApp(ErrorCode.user_unfound).out()
                        })
                  })
                  Promise.all([targetKey, userKey]).then((v) => {
                        DB.Manager.query(`delete from \`user_blockeds_user\` where blockersKey = ${v[1]} and blockedsKey = ${v[0]}`)
                              .then((res) => {
                                    Logger.passApp().out()
                                    resolve(true)
                              }).catch((err) => {
                                    Logger.errorApp(ErrorCode.block_delete_failed).put(err).out()
                              })
                  }).catch((err) => {
                        Logger.errorApp(ErrorCode.block_delete_failed).put(err).out()
                  })
                  reject()
            })
      }
}