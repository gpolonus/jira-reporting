
const axios = require('axios')
const env = require('./env')

const boardUrl = '/rest/agile/latest/board'
const filterUrl = '/rest/api/latest/filter'
const issueUrl = '/rest/api/latest/issue'
const changelogQueryParam = 'expand=changelog'
const queries = [
  'ONE_ISSUE',
  'ONE_BOARD',
  'ISSUES_ON_BOARD',
  'ONE_FILTER',
  'ALL_FILTERS'
  // ,'ISSUES_IN_FILTER'
].reduce((ac, queryName, i) => ({...ac, [queryName]: i}),{})
const queryMap = Object.entries({
  ONE_ISSUE: [],
  ONE_BOARD: [queries.ISSUES_ON_BOARD],
  ISSUES_ON_BOARD: [],
  ALL_FILTERS: [],
  ONE_FILTER: [queries.ISSUES_IN_FILTER],
  ISSUES_IN_FILTER: []
}).reduce((ac, [key, mapping]) => ({...ac, [queries[key]]: mapping}), {})
const canChangelog = Object.entries({
  ONE_ISSUE: true,
  ONE_BOARD: false,
  ISSUES_ON_BOARD: true,
  ONE_FILTER: false,
  ALL_FILTERS: false,
  ISSUES_IN_FILTER: true
}).reduce((ac, [key, mapping]) => ({...ac, [queries[key]]: mapping}), {})


class JiraRequest {

  constructor() {
    this.url = null
    this.boardId = -1
    this.issueId = null
    this.filterId = -1
    this.changelogRequest = false
    this.queryType = null
    this.username = env.JIRA_USERNAME
    this.password = env.JIRA_API_KEY
    this.startAt = -1
    this.maxResults = -1
  }

  setQueryType(next) {
    if(this.queryType) {
      if(queryMap[this.queryType].includes(next)) {
        this.queryType = next
      } else {
        throw new Error(`Cannot build a query like that.`)
      }
    } else {
      this.queryType = next
    }
  }

  changelog(cl) {
    if(canChangelog[this.queryType]) {
      this.changelogRequest = !!cl
      return this
    } else {
      throw new Error('Cannot view changelog of issues on this query')
    }
  }

  board(id) {
    if(!isNumber(id)) {
      throw new Error('Board ID must be supplied and a number')
    } else {
      this.setQueryType(queries.ONE_BOARD)
      this.boardId = id
      return this
    }
  }

  issues() {
    if(this.queryType === queries.ONE_BOARD) {
      this.setQueryType(queries.ISSUES_ON_BOARD)
    } else if(this.queryType === queries.ONE_FILTER) {
      this.setQueryType(queries.ISSUES_IN_FILTER)
    }
    return this
  }

  issue(id) {
    if(!id) {
      throw new Error('Issue ID must be supplied and be a string')
    } else {
      this.setQueryType(queries.ONE_ISSUE)
      this.issueId = id
      return this
    }
  }

  filter(id) {
    if(!isNumber(id)) {
      throw new Error('Filter ID must be supplied and be a number')
    } else {
      this.setQueryType(queries.ONE_FILTER)
      this.filterId = id
      return this
    }
  }

  filters() {
    this.setQueryType(queries.ALL_FILTERS)
    return this
  }

  constructUrl() {
    if(this.url) {
      return this
    }

    this.url = env.JIRA_URL
    switch(this.queryType) {
      case queries.ONE_ISSUE:
        this.url += issueUrl + this.issueId
        break

      case queries.ONE_BOARD:
        this.url += boardUrl + '/' + this.boardId
        break

      case queries.ISSUES_ON_BOARD:
        this.url += boardUrl + '/' + this.boardId
        this.url += '/issue'
        break

      case queries.ALL_FILTERS:
        this.url += filterUrl
        break

      case queries.ONE_FILTER:
        this.url += filterUrl
        this.url += '/' + this.filterId
        break

      case queries.ISSUES_IN_FILTER:
        this.url += filterUrl
        this.url += '/' + this.filterId
        this.url += '/issue'
        break

      default:
    }

    const queryStrings = []

    if(this.changelogRequest) {
      queryStrings.push(changelogQueryParam)
    }

    if(this.startAt > 0) {
      queryStrings.push('startAt=' + this.startAt)
    }

    if(this.maxResults > 0) {
      queryStrings.push('maxResults=' + this.maxResults)
    }

    if(queryStrings.length > 0) {
      this.url += '?' + queryStrings.join('&')
    }
  }

  execute() {
    this.constructUrl()
    return axios({
      url: this.url,
      method: 'get',
      auth: {
        username: this.username,
        password: this.password
      },
      headers: {"Access-Control-Allow-Origin": "localhost:3000"}
    })
  }

}

module.exports = function jiraQuery() {
  return new JiraRequest()
}

function isNumber(num) {
  return num >= 0 && num !== null
}