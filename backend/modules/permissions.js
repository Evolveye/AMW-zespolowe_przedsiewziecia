export default class Permission {
  // master => pełnia praw


  constructor(referenceId, name, perms) {
    if (!referenceId || !name) throw new Error(`Name and  are required`)

    this.id = `${Date.now()}t${Math.random().toString().slice(2)}r`
    this.referenceId = referenceId
    this.name = name.toLowerCase()

    this.isMaster = perms.isMaster ?? false
  }

  getProxy() {
    return new Proxy(this, {
      get(perm, key) {
        if (key === `target`) return perm
        if (!(key in perm)) return null
        if (perm.isMaster) return true

        return perm[key] || false
      }
    })
  }
}