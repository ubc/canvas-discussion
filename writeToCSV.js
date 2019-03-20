const fs = require('fs')
const path = require('path')
const fswrite = fs.writeFileSync
const fsappend = fs.appendFileSync

const writeHeader = (pathToFile, header) => fswrite(pathToFile, header + '\r\n')
const append = (pathToFile, row) => fsappend(pathToFile, row + '\r\n')

const escapeComment = comment => comment ? '"' + comment.replace(/"/g, "'") + '"' : ''

const writeToCSV = data => {
  const csv = path.join(__dirname, 'output.csv')

  const header = [
    'author_id',
    'discussion_topic_title',
    'discussion_topic_message',
    'reply',
    'count_of_likes',
    'timestamp'
  ]

  writeHeader(csv, header)

  data.forEach(discussion => {
    if (discussion.hasOwnProperty('replies')) {
      discussion.replies.forEach(reply => reply.forEach(response => {
        append(csv, [
          response.author,
          escapeComment(discussion.topicTitle),
          escapeComment(discussion.topicMessage),
          escapeComment(response.message),
          response.likes,
          response.timestamp
        ]
        )
      }))
    } else {
      append(csv, [
        discussion.author,
        escapeComment(discussion.topicTitle),
        escapeComment(discussion.topicMessage),
        '',
        '',
        discussion.timestamp
      ])
    }
  })
}

module.exports = writeToCSV
