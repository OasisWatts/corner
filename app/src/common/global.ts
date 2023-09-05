declare type Settings = {
      host: string
      "language-support": object
      board: {
            listLen: number
            contentsLen: number
            tagCnt: number
            tagLen: number
      }
      follow: {
            limit: number
            recommendLen: number
            followLen: number
      }
      block: {
            limit: number
      }
      session: {
            maxAge: number
      }
      cookie: {
            maxAge: number
            secret: string
      }
      database: {
            host: string,
            port: number,
            username: string,
            password: string,
            database: string
      }
      log: {
            interval: number
            directory: string
      }
}

declare type boardType = {
      id: number
      writer: string | undefined
      writerId: number | undefined
      writerImage: string | undefined
      writerFollowed: boolean
      contents: string
      date: string
      up: number
      numComment: number
      uped: boolean
      updated: boolean
      comments?: commentType[],
      tags?: string[]
}

declare type commentType = {
      id: number
      writer: string
      writerId: number | undefined
      writerImage: string
      writerFollowed: boolean
      contents: string
      date: string
      up: number
      uped: boolean
      updated: boolean
}

declare type UserType = {
      key: number
      name: string
      image: string
      tagCount?: number
      urlCount?: number
}

declare type TagType = {
      name: string
      isUrl: boolean
}
