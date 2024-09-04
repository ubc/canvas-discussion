const path = require('path')
const { escapeComment, stripHTML, writeHeader, appendRow, postStatistics } = require('./util') // Adjust the path as necessary

const topicSummary = (topic) => {
  const posts = topic.replies.flat()
  const topicCreatedAt = new Date(topic.topicCreatedAt)

  const postSummary = postStatistics(posts, topicCreatedAt)

  return postSummary

}

// Function to write the summary to CSV
const writeSummaryToCSV = (courseId, data) => {

  console.log(`Writing summary of discussion data for course: ${courseId}`)
  const csvPath = path.join(__dirname, `output/${courseId}-discussion-summary.csv`)

  const headers = [
    'topic_id',
    'topic_title',
    //'topic_message',
    'topic_author_id',
    'topic_author_name',
    'topic_created_at', 
    'topic_posted_at',
    'number_of_posts',
    'median_posts_word_count',
    'average_time_to_post_hours',
    'first_reply_timestamp',
    'average_time_to_post_from_first_reply_hours',
    'average_posts_per_author'
  ]

  // Write the headers to the CSV file
  writeHeader(csvPath, Array.from(headers))

  data.forEach(discussion => {
    const summary = topicSummary(discussion)

    const topicDetails = {
      topic_id: discussion.topicId,
      topic_title: stripHTML(escapeComment(discussion.topicTitle)),
      //topic_message: stripHTML(escapeComment(discussion.topicMessage)),
      topic_author_id: discussion.topicAuthorId,
      topic_author_name: escapeComment(discussion.topicAuthorName),
      topic_created_at: discussion.topicCreatedAt,
      topic_posted_at: discussion.topicPostedAt,
      number_of_posts: summary.numberOfPosts,
      median_posts_word_count: summary.medianWordCount,
      average_time_to_post_hours: summary.averageTimeDiff,
      first_reply_timestamp: summary.firstReplyTimestamp,
      average_time_to_post_from_first_reply_hours: summary.averageTimeToPostFromFirst,
      average_posts_per_author: summary.averagePostsPerAuthor
    }
    appendRow(csvPath, Object.values(topicDetails))
  })
}

module.exports = writeSummaryToCSV
