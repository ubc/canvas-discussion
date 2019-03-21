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
    'author_name',
    'post_id',
    'parent_id',
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
          response.authorId,
          response.authorName,
          response.id,
          response.parentId,
          escapeComment(discussion.topicTitle),
          escapeComment(discussion.topicMessage),
          escapeComment(response.message),
          response.likes,
          response.timestamp
        ])
      }))
    } else {
      append(csv, [
        discussion.authorId,
        discussion.authorName,
        discussion.id,
        '', // discussion topics cannot have a parent ID
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
