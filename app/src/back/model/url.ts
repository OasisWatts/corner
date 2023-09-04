import Board from "./board"
import Comment from "./comment"
import User from "./user"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, OneToMany, ManyToOne, JoinColumn, OneToOne } from "typeorm"
import UserUrlCount from "./userUrlCount"
import UrlTagCount from "./urlTagCount"

@Entity({ name: "url", schema: "corner" })
export default class Url {
      @PrimaryGeneratedColumn("increment")
      public id!: number

      @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
      public date!: number

      @Column({ type: "text" })
      public name!: string

      @Column({ type: "int" })
      public count!: number

      @Column({ type: "boolean", default: false })
      public isHostname!: boolean

      /** 게시글과 관계 설정. */
      @OneToMany(
            () => Board,
            (boards) => boards.tags,
            { nullable: true }
      )
      public boards!: Board[]

      @ManyToMany(
            () => User,
            (bannedUsers) => bannedUsers.bannedURLs
      )
      public bannedUsers!: User[]

      @ManyToOne(
            () => UserUrlCount,
            (userCounts) => userCounts.url
      )
      public userCounts!: UserUrlCount[]

      @ManyToOne(
            () => UrlTagCount,
            (tagCounts) => tagCounts.url,
      )
      public tagCounts!: UrlTagCount[]
}
