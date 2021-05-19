import { validateDate } from "../../src/utils.js"
import { MEETING_DATE_MAX_YEARS_AHEAD } from "./consts.js"


/**
 * @typedef {object} Meet
 * @property {object} lecturer Head of group id
 * @property {string} description Name of goroup
 * @property {string} platformId Head of group i
 * @property {string} groupId
 * @property {string[]} membersIds
 * @property {object}  param0
 * @property {param0.meetingUrl} meetingUrl
 * @property {param0.dateStart} membersIds
 * @property {param0.dateEnd} membersIds

 */
export default class Meet {
    constructor(lecturer, description, membersIds, platformId, externalUrl, { meetingUrl, groupId, dateStart, dateEnd, historyId }) {

        this.id = `${Date.now()}t${Math.random().toString().slice(2)}r`
        this.created = Date.now()


        this.dateStart = dateStart
        this.dateEnd = dateEnd


        this.lecturer = lecturer
        this.description = description
        this.externalUrl = externalUrl ?? ""


        if (!Array.isArray(membersIds))
            this.membersIds = [membersIds]
        else
            this.membersIds = membersIds

        this.platformId = platformId ?? ""
        this.groupId = groupId ?? ""
        this.url = meetingUrl ?? ""
        this.historyId = historyId ?? ""
        this.public = false
    }

    validate() {
        if (!validateDate(this.dateStart, MEETING_DATE_MAX_YEARS_AHEAD))
            return false

        // if (!validateDate(this.dateEnd, MEETING_DATE_MAX_YEARS_AHEAD))
        //     return false

        // if (this.dateStart > this.dateEnd)
        //     return false

        // console.log("date OK")
        return true
    }
}

/**
 * @typedef {object} BoardImgs
 * @property {string} meetId Head of group id
 * @property {string[]} filesName Name of goroup
 * @property {string[]} filesPath
 */
export class BoardImgs{
    constructor(
        meetId,
        filesName,
        filesPath,
    ){
        this.id = `${Date.now()}t${Math.random().toString().slice(2)}r`
        this.meetId = meetId
        this.filesName = filesName
        this.filesPath = filesPath
    }

    validate() {
        const imgFileExtensions = [`.jpg`,`.jpeg`,`.bmp`,`.png`,`.gif`,`.tif`,`.tiff`]

        if(!this.filesName.every(
            name => imgFileExtensions.some( ext => name.endsWith(ext) )
            ))
            return false

        return true
    }
}

export class ChatMessage {
    constructor(userObj,meetId,message) // time
    {
        this.id = `${Date.now()}t${Math.random().toString().slice(2)}r`
        this.author = userObj
        this.meetId = meetId
        this.message = message
        this.date = Date.now().valueOf()
    }
}