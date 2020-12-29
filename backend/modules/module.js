export default class Module {
  /**
   * @param {import('express').Express} app
   */
  configure(app) {
    throw new Error( `You have to override me!` )
  }
}