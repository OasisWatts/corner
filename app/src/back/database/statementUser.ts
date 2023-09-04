import DB from "back/database/connection"
import { ErrorCode } from "common/applicationCode"
import User from "back/model/user"
import { Logger } from "back/util/logger"
import { SETTINGS } from "back/util/setting"

const MAX_FRIENDS = SETTINGS.follow.limit
const MAX_BLOCKS = SETTINGS.block.limit
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