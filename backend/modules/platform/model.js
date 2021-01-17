
/**
 * @typedef {Object} platform
 * @property {string} name
 * @property {string} owner
 * @property {string} created
 * @property {string} administrator
 * @property {string} platformName
 */

export class Platform {
    constructor(owner,platformName) {
        this.id = `${Date.now()}t${Math.random().toString().slice(2)}r`
        this.owner = owner // TODO: type =  User.
        this.created = Date.now()
        this.administrator = owner // TODO: type =  User.
        this.name = platformName //
        this.membersIds = [owner.id]
    }
}
