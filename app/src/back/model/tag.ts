import Board from "./board"
import Comment from "./comment"
import User from "./user"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, OneToMany, ManyToOne, JoinColumn, OneToOne } from "typeorm"
import UserTagCount from "./userTagCount"
import UrlTagCount from "./urlTagCount"

@Entity({ name: "tag", schema: "corner" })
export default class Tag {
      @PrimaryGeneratedColumn("increment")
      public id!: number

      @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
      public date!: number

      @Column({ type: "text" })
      public name!: string

      @Column({ type: "boolean" })
      public isUrl!: boolean

      @Column({ type: "int" })
      public count!: number

      /** 게시글과 관계 설정. */
      @ManyToMany(
            () => Board,
            (boards) => boards.tags,
      )
      public boards!: Board[]

      @ManyToOne(
            () => UserTagCount,
            (userCounts) => userCounts.tag
      )
      public userCounts!: UserTagCount

      @ManyToOne(
            () => UrlTagCount,
            (urlCounts) => urlCounts.tag,
      )
      public urlCounts!: UrlTagCount
}
