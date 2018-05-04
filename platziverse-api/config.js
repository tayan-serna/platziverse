'use strict'

const debug = require('debug')('platziverse:api:db')
const dbConfig = require('platziverse-db-setup')({ setup: false, logging: s => debug(s) })

module.exports = {
  db: dbConfig
}
