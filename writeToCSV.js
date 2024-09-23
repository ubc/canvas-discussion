const path = require('path')

const { escapeComment, stripHTML, writeHeader, appendRow, convertToPacificTime, toDateTime } = require('./util') // Adjust the path as necessary

const writeToCSV = (courseId, data) => {
  console.log(`Writing discussion data for course: ${courseId}`)

  const csvPath = path.join(__dirname, `output/${courseId}-discussion.csv`)

  const headers = [
    'topic_id',
    'topic_title',
    'topic_message',
    'topic_author_id',
    'topic_author_name',
    'topic_created_at',
    'topic_posted_at',
    'response_author_id',
    'response_author_name',
    'response_id',
    'response_parent_id',
    'response_message',
    'response_likes',
    'response_timestamp'
  ]

  // Write the headers to the CSV file
  writeHeader(csvPath, headers)

  data.forEach(discussion => {
    const topicDetails = {
      topic_id: discussion.topicId,
      topic_title: stripHTML(escapeComment(discussion.topicTitle)),
      topic_message: stripHTML(escapeComment(discussion.topicMessage)),
      topic_author_id: discussion.topicAuthorId,
      topic_author_name: escapeComment(discussion.topicAuthorName),
      topic_created_at: convertToPacificTime(toDateTime(discussion.topicCreatedAt)),
      topic_posted_at: convertToPacificTime(toDateTime(discussion.topicPostedAt))
    }

    if (Array.isArray(discussion.replies) && discussion.replies.length > 0) {
      discussion.replies.flat().forEach(post => {
        const postDetails = {
          ...topicDetails,
          response_author_id: post.postAuthorId,
          response_author_name: escapeComment(post.postAuthorName),
          response_id: post.postId,
          response_parent_id: post.postParentId,
          response_message: stripHTML(escapeComment(post.postMessage)),
          response_likes: post.postLikes,
          response_timestamp: convertToPacificTime(toDateTime(post.postTimestamp))
        }
        appendRow(csvPath, Object.values(postDetails))
      })
    } else {
      appendRow(csvPath, Object.values(topicDetails))
    }
  })
}

module.exports = writeToCSV
