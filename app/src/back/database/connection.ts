// AUTO DB-IMPORT
import { Logger } from "back/util/logger"
import { SETTINGS } from "back/util/setting"
import { RedisClientType } from "redis"
import { DataSource, EntityManager } from "typeorm";


// import redis from "redis"
import User from "back/model/user"
import Board from "back/model/board";
import Comment from "back/model/comment";
import UserTagCount from "back/model/userTagCount";
import Tag from "back/model/tag";
import UserUrlCount from "back/model/userUrlCount";
import UrlTagCount from "back/model/urlTagCount";
import Url from "back/model/url";

export default class DB {
      public static connection: DataSource

      public static redisClient: RedisClientType

      public static get Manager(): EntityManager {
            return DB.connection.manager
      }

      public static async initialize(): Promise<void> {
            const entities: Function[] = [
                  User,
                  Board,
                  Comment,
                  Tag,
                  Url,
                  UserTagCount,
                  UserUrlCount,
                  UrlTagCount
            ]

            DB.connection = new DataSource({
                  type: "mysql",
                  supportBigNumbers: true,
                  bigNumberStrings: false,
                  ...SETTINGS.database,
                  synchronize: true, // synchronize: true여야 수정 entity가 반영
                  logging: ["query"],
                  entities,
                  cache: true,
                  // ssl: SSL_OPTIONS,
            })
            await DB.connection.initialize()
            Logger.passSignificant("DB").put(SETTINGS.database.host).out()

            // redis 초기화.
            // DB.redisClient = redis.createClient()
            // DB.redisClient.on("connect", () => {
            //       Logger.passSignificant("Redis").out()
            // })
            // DB.redisClient.on("error", (err) => {
            //       Logger.errorSignificant("Redis").put(err).out()
            // })
      }
}