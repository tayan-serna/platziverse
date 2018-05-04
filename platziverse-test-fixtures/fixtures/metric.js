'use strict'
const agentFixtures = require('./agent')

const metric = {
  id: 1,
  agentId: 1,
  type: 'type1',
  value: 'value1',
  createdAt: new Date(),
  updatedAt: new Date()
}

const metrics = [
  metric,
  extend(metric, { id: 2, agentId: 2, value: 'value2' }),
  extend(metric, { id: 3, type: 'type2', value: 'value3' }),
  extend(metric, { id: 4, agentId: 2, type: 'type2', value: 'value4' }),
  extend(metric, { id: 5, value: 'value5' }),
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  byAgentUuid: uuid => metrics
    .filter(metric => metric.agentId === agentFixtures.byUuid(uuid).id)
    .map(metric => metric.type)
    .filter((type, idx, arr) => arr.indexOf(type) === idx),
  byTypeAgentUuid: (type, uuid) => metrics
    .filter(metric => metric.agentId === agentFixtures.byUuid(uuid).id && metric.type === type)
    .map(({id, value, type, createdAt }) => ({ id, value, type, createdAt }))
    .sort((a,b) => new Date(b.date) - new Date(a.date))
}
