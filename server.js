// server.js

// call the packages we need
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const jiraQuery = require('./JiraRequest')
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())


if(process.argv[2] === 'dev') {
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
  })
} else {
  app.use('/jirareports', express.static('build'))
}


const port = process.env.PORT || 8080        // set our port


const getIssuesOnBoardData = async (boardId) => {
  return await jiraQuery()
    .board(boardId)
    .issues()
    .changelog(true)
    .execute()
}

// ROUTES FOR OUR API
// =============================================================================
const router = express.Router()

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' })
})

router.get('/board/:boardId', async function(req, res) {
  const { data } = await getIssuesOnBoardData(req.params.boardId)
  const updates = data.issues.map(
    ({key, changelog: { histories }, fields: { customfield_10021: points }}) =>
      histories.map(({ created, items }) =>
        items.reduce((ac, {field, fromString: from, toString: to}) =>
          ([ ...ac,
            ...(field === 'status' || field === 'Story Points' ? [{
              key,
              created,
              type: field,
              to,
              from,
              points,
            }] : [])
          ]), [])))

  res.json(updates)
})

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/jirareports/api', router)

// START THE SERVER
// =============================================================================
app.listen(port)
console.log('Running on port ' + port)
