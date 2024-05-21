const fs = require('fs')
const path = require('path')
const fswrite = fs.writeFileSync
const fsappend = fs.appendFileSync

const writeHeader = (pathToFile, header) => fswrite(pathToFile, header + '\r\n')
const append = (pathToFile, row) => fsappend(pathToFile, row + '\r\n')

const escapeComment = comment => comment ? '"' + comment.replace(/"/g, "'") + '"' : ''

const stripHTML = comment => comment ? comment.replace(/(<([^>]+)>)/gi, "").replaceAll('&nbsp;', " ") : ''

const writeToCSV = (courseId, data) => {
  const csv = path.join(__dirname, `output/${courseId}-discussion.csv`)

  const header = [
    'topic_id',
    'topic_title',
    'topic_message',
    'topic_author_id',
    'topic_author_name',
    'topic_timestamp'
  ]

  writeHeader(csv, header)

  data.forEach(discussion => {
    append(csv, [                                 // write discussion to CSV
      discussion.topicId,
      stripHTML(escapeComment(discussion.topicTitle)),
      stripHTML(escapeComment(discussion.topicMessage)),
      discussion.topicAuthorId,
      escapeComment(discussion.topicAuthorName),
      discussion.topicCreatedAt,
    ])

    discussion.replies.forEach(reply =>
      reply.forEach(response => {
        append(csv, [                              // write replies to CSV
          response.authorId,
          escapeComment(response.authorName),
          response.id,
          response.parentId,
          stripHTML(escapeComment(discussion.topicTitle)),
          stripHTML(escapeComment(discussion.topicMessage)),
          stripHTML(escapeComment(response.message)),
          response.likes,
          response.timestamp
        ])
      })
    )
  })
}

module.exports = writeToCSV
