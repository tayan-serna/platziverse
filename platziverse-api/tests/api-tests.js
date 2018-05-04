'use strict'

const test = require('ava')
const request = require('supertest')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const { agent, metric} = require('platziverse-test-fixtures')

const uuid = 'yyy-yyy-yyy'
const typeNotFound = 'type3'
const type = 'type1'
const uuidNotFound = 'yyy-yyy-yyy-xxx'
const notFoundResponse = {
  error: "not found"
}
let sandbox = null
let server = null
let dbStub = null
let AgentStub = {}
let MetricStub = {}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  
  dbStub = sandbox.stub()
  dbStub.returns(Promise.resolve({
    Agent: AgentStub,
    Metric: MetricStub
  }))

  AgentStub.findConnected = sandbox.stub()
  AgentStub.findConnected.returns(Promise.resolve(agent.connected))
  
  AgentStub.findByUuid = sandbox.stub()
  AgentStub.findByUuid.withArgs(uuid).returns(Promise.resolve(agent.byUuid(uuid)))
  AgentStub.findByUuid.withArgs(uuidNotFound).returns(Promise.resolve(notFoundResponse))

  MetricStub.findByAgentUuid = sandbox.stub()
  MetricStub.findByAgentUuid.withArgs(uuid).returns(Promise.resolve(metric.byAgentUuid(uuid)))
  MetricStub.findByAgentUuid.withArgs(uuidNotFound).returns(Promise.resolve(notFoundResponse))

  MetricStub.findByTypeAgentUuid = sandbox.stub()
  MetricStub.findByTypeAgentUuid.withArgs(type, uuid).returns(Promise.resolve(metric.byTypeAgentUuid(type, uuid)))
  MetricStub.findByTypeAgentUuid.withArgs(type, uuidNotFound).returns(Promise.resolve(notFoundResponse))
  MetricStub.findByTypeAgentUuid.withArgs(typeNotFound, uuid).returns(Promise.resolve(notFoundResponse))

  const api = proxyquire('../api', {
    'platziverse-db': dbStub
  })

  server = proxyquire('../server', {
    './api': api
  })
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test.serial.cb('/api/agents', t => {
  request(server)
    .get('/api/agents')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(agent.connected)
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/agent/:uuid', t => {
  request(server)
    .get(`/api/agent/${uuid}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(agent.byUuid(uuid))
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/agent/:uuid - not found', t => {
  request(server)
    .get(`/api/agent/${uuidNotFound}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.truthy(err, 'should return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(notFoundResponse)
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid', t => {
  request(server)
    .get(`/api/metrics/${uuid}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(metric.byAgentUuid(uuid))
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/metrcis/:uuid - not found', t => {
  request(server)
    .get(`/api/metrics/${uuidNotFound}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.truthy(err, 'should return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(notFoundResponse)
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid/:type', t => {
  request(server)
    .get(`/api/metrics/${uuid}/${type}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(metric.byTypeAgentUuid(type, uuid))
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid/:type - not found', t => {
  request(server)
    .get(`/api/metrics/${uuidNotFound}/${type}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.truthy(err, 'should return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(notFoundResponse)
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })

  request(server)
    .get(`/api/metrics/${uuid}/${typeNotFound}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.truthy(err, 'should return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(notFoundResponse)
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})
