import express from "express"
// import React from "react"
// import ReactDOMServer from "react-dom/server"

// import { Root } from "front/reactRoot"
import { fileInBuild } from "./util/setting"
import { setTable } from "front/@lib/Language"
import { getLanguageTable } from "./util/language"

const htmlTemplete = fileInBuild("index.html").toString()

// const ssrRegExp = createReader("SSR")
const nestRegExp = /("?)\/\*\{(.+?)\}\*\/\1/g

function createReader(key: string): RegExp {
      return new RegExp(`("?)/\\* %%${key}%% \\*/\\1`, "g")
}

/**
 * 주어진 페이지를 렌더하는 Express 끝점 클로저를 반환한다.
 *
 * @param page 페이지.
 * @param data 추가 정보.
 */
export function pageBuilder<T extends Page.Key>(
      page: T,
      data?: Page.DataTable[T],
): express.RequestHandler {
      return async (req: any, res) => {
            res.render(page, {
                  locale: req.locale,
                  page,
                  path: req.originalUrl,
                  title: "corner",
                  data
            })
      }
}
/**
 * 주어진 파일에서 정의된 컴포넌트를 최상위 컴포넌트로 삼도록 한 HTML을 전달한다.
 *
 * HTML 내(JavaScript 포함)에서 `／*{...}*／` 구문은 이 함수 스코프 안에서 `eval(...)` 함수의 결과로 대체된다.
 *
 * @param path 뷰(React) 파일 경로.
 * @param $ Express 관련 추가 정보.
 * @param callback 콜백 함수.
 */
export function engine(
      path: string,
      $: any,
      callback: (err: any, content?: string) => void,
): void {
      // const REACT_SUFFIX = CLOTHES.development
      //       ? "development"
      //       : "production.min"

      // const KEY = `${$.locale}/${$.page}`
      // const SSR = $.ssr

      // $.title = L(`${KEY}#title`, ...($.metadata.titleArgs || []))
      // $.version = PACKAGE.version
      // // NOTE Express 내부적으로 정의한 정보가 외부에 노출되지 않도록 삭제
      // delete ($ as any).settings
      // delete ($ as any).cache
      // delete ($ as any)._locals


      setTable(getLanguageTable($.locale, $.page))
      const CLIENT_SETTINGS: any = {}
      const html = htmlTemplete
            // .replace(ssrRegExp,
            //       ReactDOMServer.renderToString(
            //             React.createElement(
            //                   Root,
            //                   $,
            //                   React.createElement(require(`front/${$.page}/index.tsx`).default, $),
            //             )))
            .replace(nestRegExp, (v, p1, p2) => String(eval(p2)))
      // NOTE never used 오류 회피
      void CLIENT_SETTINGS

      callback(null, html)
}
