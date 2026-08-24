/* app-info-parser non include tipi TypeScript */
declare module 'app-info-parser' {
  class ApkParser {
    constructor(file: File | Blob | string)
    parse(): Promise<Record<string, unknown>>
  }
  export default ApkParser
}
