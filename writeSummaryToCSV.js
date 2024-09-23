const path = require('path')
const { escapeComment, stripHTML, writeHeader, appendRow, postStatistics, toDateTime, convertToPacificTime, formatNumberOutput  } = require('./util') // Adjust the path as necessary

const topicSummary = (topic) => {
  const posts = topic.replies.flat()
  const topicPostedAt = toDateTime(topic.topic_posted_at)

  const postSummary = postStatistics(posts, topicPostedAt)

  return postSummary
}

// Function to write the summary to CSV
const writeSummaryToCSV = (courseId, data) => {
  console.log(`Writing summary of discussion data for course: ${courseId}`)
  const csvPath = path.join(__dirname, `output/${courseId}-discussion-summary.csv`)

  const headers = [
    'topic_id',
    'topic_title',
    'topic_author_id',
    'topic_author_name',
    'topic_posted_at',
    'number_of_posts',
    'average_posts_per_author',
    'median_posts_word_count',
    'average_days_to_post_from_posted_at',
    'first_reply_timestamp',
    'average_days_to_post_from_first_response'
  ]

  // Write the headers to the CSV file
  writeHeader(csvPath, Array.from(headers))

  data.forEach(discussion => {
    const summary = topicSummary(discussion)

    const topicDetails = {
      topic_id: discussion.topicId,
      topic_title: stripHTML(escapeComment(discussion.topicTitle)),
      topic_author_id: discussion.topicAuthorId,
      topic_author_name: escapeComment(discussion.topicAuthorName),
      topic_posted_at: convertToPacificTime(toDateTime(discussion.topicPostedAt)),
      number_of_posts: formatNumberOutput(summary.numberOfPosts),
      average_posts_per_author: formatNumberOutput(summary.averagePostsPerAuthor),
      median_word_count: formatNumberOutput(summary.medianWordCount),
      average_time_to_post_from_reference_days: formatNumberOutput(summary.averageTimeDiffFromReference),
      first_reply_timestamp: convertToPacificTime(summary.firstReplyTimestamp),
      average_time_to_post_from_first_days: formatNumberOutput(summary.averageTimeDiffFromFirst)

    }
    appendRow(csvPath, Object.values(topicDetails))
  })
}

module.exports = writeSummaryToCSV
