import Board from "./board"
import Comment from "./comment"
import Tag from "./tag"
import Url from "./url"
import User from "./user"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, OneToMany, ManyToOne, JoinColumn, OneToOne } from "typeorm"

@Entity({ name: "urltagcount", schema: "corner" })
export default class UrlTagCount {
      @PrimaryGeneratedColumn("increment")
      public id!: number

      /** 태그와 관계 설정. */
      @ManyToOne(
            () => Url,
            (url) => url.tagCounts,
      )
      public url!: Url

      /** url과 관계 설정. */
      @ManyToOne(
            () => Tag,
            (tag) => tag.urlCounts,
      )
      public tag!: Tag

      @Column({ type: "int", default: 0 })
      public count!: number
}
