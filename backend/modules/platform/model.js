<<<<<<< HEAD
// lecturer or admin platformy.
=======
>>>>>>> origin/dev-backend-node

/**
 * @typedef {Object} platform
 * @property {string} name
 * @property {string} owner
 * @property {string} created
 * @property {string} administrator
<<<<<<< HEAD
 * @property {string} organisationName
 */

export default class Platform {
    constructor(name,ownerId,organisationName = '') {
        this.name = name
        this.owner = ownerId // TODO: type =  User.
        this.created = Date.now()
        this.administrator = ownerId // TODO: type =  User.
        this.organisationName = organisationName

=======
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
        this.assignedGroups = []
>>>>>>> origin/dev-backend-node
    }
}
