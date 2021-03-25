

export class Task{
    constructor(title,description,groupId,expireDate,author,type = "zadanie",mandatory = true)
    {
        this.id = `${Date.now()}t${Math.random().toString().slice(2)}r`
        this.title = title
        this.description = description
        this.groupId = groupId
        this.created = Date.now().valueOf()
        this.expire = expireDate || this.created + 604800000 // 1 tydzień
        this.type = type
        this.mandatory = mandatory
        this.author = author
        
        // this.platfromId = platformId
        // this.assigments = {} // {user.name/user.surname, fileId}
        // file extension
    }
}




/**
 * @typedef {object} Group
 * @property {string} name Name of goroup
 * @property {object} lecturer Head of group id
 * @property {string} created
 * @property {string[]} membersIds
 */
export class Group {
    constructor(name, lecturer,platformId) {
        this.id = `${Date.now()}t${Math.random().toString().slice(2)}r`
        this.lecturer = lecturer
        this.created = Date.now()
        this.name = name
        this.platformId = platformId
        this.membersIds = []
    }
}


/**
 * @typedef {Grade}
 * @property {string} userId
 * @property {number} date
 * @property {string} description
 * @property {nubmer} value
 * @property {string} lecturerId
 * @property {string} groupId
 *
 */
export class Grade {
    constructor( userId, lecturer, value,groupId, { date = null, description ='' })
    {
       // this.gradeId = gradeId
        this.userId = userId
        this.lecturer = lecturer
        this.date = date ??  Date.now()
        this.description = description ?? ``
        this.value = value
        this.groupId = groupId
        this.id = `${Date.now()}t${Math.random().toString().slice(2)}r`
    }
}