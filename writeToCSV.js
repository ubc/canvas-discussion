const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const fswrite = promisify(fs.writeFile)
const fsappend = promisify(fs.appendFile)

const writeHeader = (pathToFile, header) => fswrite(pathToFile, header + '\r\n')
const append = (pathToFile, row) => fsappend(pathToFile, row + '\r\n')

const escapeComment = comment => '"' + comment.replace(/"/g, "'") + '"'

const writeToCSV = data => {
  const csv = path.join(__dirname, 'output.csv')

  const header = [
    'author_id',
    'discussion_topic_title',
    'discussion_topic_message',
    'reply'
  ]

  writeHeader(csv, header)

  data.forEach(discussion => {
    if (discussion.hasOwnProperty('replies')) {
      discussion.replies.forEach(reply => reply.forEach(response => {
        console.log(response)
        append(csv, [
          response.author,
          escapeComment(discussion.topicTitle),
          escapeComment(discussion.topicMessage),
          escapeComment(response.message)
        ]
        )
      }))
    } else {
      append(csv, [
        discussion.author,
        escapeComment(discussion.topicTitle),
        escapeComment(discussion.topicMessage)
      ])
    }
  })
}

module.exports = writeToCSV
