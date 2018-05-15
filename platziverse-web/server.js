'use strict'

const debug = require('debug')('platziverse:web')
const http = require('http')
const path = require('path')
const express = require('express')
const sockectio = require('socket.io')
const chalk = require('chalk')
const PlatziverseAgent = require('platziverse-agent')

const { pipe } = require('platziverse-utils')

const port = process.env.PORT || 8080
const app = express()
const server = http.createServer(app)
const io = sockectio(server)
const agent = new PlatziverseAgent()

app.use(express.static(path.join(__dirname, 'public')))

// Socket.io / Websockets
io.on('connect', socket => {
  debug(`Connected ${socket.id}`)

  pipe(agent, socket)
})

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(port, () => {
  console.log(`${chalk.green('[platziverse:web]')} server listening on port ${port}`)
  agent.connect()
})
