import Comment from "./comment"
import Tag from "./tag"
import Url from "./url"
import User from "./user"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, OneToMany, JoinTable, JoinColumn, ManyToOne } from "typeorm"

@Entity({ name: "board", schema: "corner" })
export default class Board {
      @PrimaryGeneratedColumn("increment")
      public id!: number

      @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
      public date!: number

      @Column({ type: "int" })
      public writer!: number

      @Column({ type: "text" })
      public contents!: string

      @Column({ type: "boolean", default: false })
      public updated!: boolean

      /** 댓글과의 관계 설정. */
      @OneToMany(
            () => Comment,
            (comments) => comments.board,
            { nullable: true },
      ) //@JoinColumn()
      public comments!: Comment[]

      /** 좋아요한 유저와의 관계 설정. */
      @ManyToMany(
            () => User,
            (upedUsers) => upedUsers.upedBoards,
            { nullable: true },
      )
      public upedUsers!: User[]

      @Column({ type: "int", unsigned: true, default: 0 })
      public up!: number

      /** url과 관계 설정. */
      @ManyToOne(
            () => Url,
            (url) => url.boards,
            { nullable: true }
      )
      public url!: Url

      /** 해시태그와의 관계 설정. */
      @ManyToMany(
            () => Tag,
            (tags) => tags.boards,
            { nullable: true },
      ) @JoinTable()
      public tags!: Tag[]
}
