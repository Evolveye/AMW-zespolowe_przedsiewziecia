/**
 * @typedef {Object} platform
 * @property {string} name
 * @property {string} owner
 * @property {string} created
 * @property {string} platformName
 */

export class Platform {
    constructor(ownerId,platformName) {
        this.id = `${Date.now()}t${Math.random().toString().slice(2)}r`
        this.ownerId = ownerId // TODO: type =  User.
        this.created = Date.now()
        this.name = platformName //
        this.membersIds = [ownerId]
        this.assignedGroups = []
    }
}
