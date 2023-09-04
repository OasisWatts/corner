import Board from "./board"
import Comment from "./comment"
import Tag from "./tag"
import User from "./user"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, OneToMany, ManyToOne, JoinColumn, OneToOne } from "typeorm"

@Entity({ name: "userTagCount", schema: "corner" })
export default class UserTagCount {
      @PrimaryGeneratedColumn("increment")
      public id!: number

      /** 유저와 관계 설정. */
      @ManyToOne(
            () => User,
            (user) => user.tagCounts,
      )
      public user!: User

      /** 태그과 관계 설정. */
      @ManyToOne(
            () => Tag,
            (tag) => tag.userCounts,
      )
      public tag!: Tag

      @Column({ type: "int", default: 0 })
      public count!: number
}
