
/**
 * @typedef {object} Group
 * @property {string} name Name of goroup
 * @property {object} lecturer Head of group id
 * @property {string} created
 * @property {string[]} membersIds
 */
export default class Group {
    constructor(name, lecturer,platformId) {
        this.id = `${Date.now()}t${Math.random().toString().slice(2)}r`
        this.lecturer = lecturer
        this.created = Date.now()
        this.name = name
        this.platformId = platformId
        this.membersIds = []
    }
}