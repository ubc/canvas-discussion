const fs = require('fs');
const path = require('path');

const escapeComment = comment => comment ? '"' + comment.replace(/"/g, "'") + '"' : ''

const stripHTML = comment => comment ? comment.replace(/(<([^>]+)>)/gi, "").replace(/&nbsp;/g, " ") : ''

const writeHeader = (pathToFile, headers) => fs.writeFileSync(pathToFile, headers.join(',') + '\r\n')

const appendRow = (pathToFile, row) => fs.appendFileSync(pathToFile, row.join(',') + '\r\n')

const writeToCSV = (courseId, data) => {
  const csvPath = path.join(__dirname, `output/${courseId}-discussion.csv`)

  const headers =[
    'topic_id', 
    'topic_title', 
    'topic_message', 
    'topic_author_id',
    'topic_author_name', 
    'topic_timestamp', 
    'post_author_id',
    'post_author_name', 
    'post_id', 
    'post_parent_id', 
    'post_message',
    'post_likes', 
    'post_timestamp'
  ]

  // Write the headers to the CSV file
  writeHeader(csvPath, Array.from(headers))

  data.forEach(discussion => {
    const topicDetails = {
      topic_id: discussion.topicId,
      topic_title: stripHTML(escapeComment(discussion.topicTitle)),
      topic_message: stripHTML(escapeComment(discussion.topicMessage)),
      topic_author_id: discussion.topicAuthorId,
      topic_author_name: escapeComment(discussion.topicAuthorName),
      topic_timestamp: discussion.topicCreatedAt
    };

    if (Array.isArray(discussion.replies) && discussion.replies.length > 0) {
      discussion.replies.flat().forEach(post => {
        const postDetails = {
          ...topicDetails,
          post_author_id: post.postAuthorId,
          post_author_name: escapeComment(post.postAuthorName),
          post_id: post.postId,
          post_parent_id: post.postParentId,
          post_message: stripHTML(escapeComment(post.postMessage)),
          post_likes: post.postLikes,
          post_timestamp: post.postTimestamp
        };
        appendRow(csvPath, Object.values(postDetails));
      })
    } else {
      appendRow(csvPath, Object.values(topicDetails));
    }
  })
}

module.exports = writeToCSV;
