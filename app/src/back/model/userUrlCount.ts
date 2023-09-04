import Board from "./board"
import Comment from "./comment"
import Url from "./url"
import User from "./user"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, OneToMany, ManyToOne, JoinColumn, OneToOne } from "typeorm"

@Entity({ name: "userUrlCount", schema: "corner" })
export default class UserUrlCount {
      @PrimaryGeneratedColumn("increment")
      public id!: number

      /** 유저와 관계 설정. */
      @ManyToOne(
            () => User,
            (user) => user.tagCounts,
      )
      public user!: User

      /** url과 관계 설정. */
      @ManyToOne(
            () => Url,
            (url) => url.userCounts,
      )
      public url!: Url

      @Column({ type: "int", default: 0 })
      public count!: number
}
