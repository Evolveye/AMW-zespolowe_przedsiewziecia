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
    constructor(lecturer, description, platformId, membersIds, externalUrl, { meetingUrl, groupId, dateStart, dateEnd, historyId }) {

        this.id = `${Date.now()}t${Math.random().toString().slice(2)}r`
        this.created = Date.now()


        this.dateStart = dateStart
        this.dateEnd = dateEnd


        this.lecturer = lecturer
        this.description = description
        this.platformId = platformId
        this.externalUrl = externalUrl ?? ""


        if (!Array.isArray(membersIds))
            this.membersIds = [membersIds]
        else
            this.membersIds = membersIds


        this.groupId = groupId ?? ""
        this.url = meetingUrl ?? ""
        this.historyId = historyId ?? ""
        this.public = false
    }

    validate() {
        if (!validateDate(this.dateStart, MEETING_DATE_MAX_YEARS_AHEAD))
            return false

        if (!validateDate(this.dateEnd, MEETING_DATE_MAX_YEARS_AHEAD))
            return false

        if (this.dateStart > this.dateEnd)
            return false

        return true
    }
}