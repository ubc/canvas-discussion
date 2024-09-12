const path = require('path')

const { escapeComment, stripHTML, writeHeader, appendRow } = require('./util') // Adjust the path as necessary

const writeToCSV = (courseId, data) => {

  console.log(`Writing discussion data for course: ${courseId}`);

  const csvPath = path.join(__dirname, `output/${courseId}-discussion.csv`)

  const headers =[
    'topic_id',
    'topic_title',
    'topic_message',
    'topic_author_id',
    'topic_author_name',
    'topic_created_at',
    'topic_posted_at',
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
      topic_created_at: discussion.topicCreatedAt,
      topic_posted_at: discussion.topicPostedAt
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
        appendRow(csvPath, Object.values(postDetails))
      })
    } else {
      appendRow(csvPath, Object.values(topicDetails))
    }
  })
}

module.exports = writeToCSV;
