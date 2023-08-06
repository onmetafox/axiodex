class TtlCache {
  constructor(ttl = 60, maxKeys) {
    this._cache = {}
    this._ttl = ttl
    this._maxKeys = maxKeys
  }

  get(key) {
    return this._cache[key]
  }

  set(key, value) {
    this._cache[key] = value

    const keys = Object.keys(this._cache)
    if (this._maxKeys && keys.length >= this._maxKeys) {
      for (let i = 0; i <= keys.length - this._maxKeys; i++) {
        delete this._cache[keys[i]]
      }
    }

    setTimeout(() => {
      delete this._cache[key]
    }, this._ttl * 1000)
  }
}

module.exports = TtlCache