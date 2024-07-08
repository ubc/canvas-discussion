const fs = require('fs')
const path = require('path')

const escapeComment = comment => comment ? '"' + comment.replace(/"/g, "'") + '"' : ''

const stripHTML = comment => comment ? comment.replace(/(<([^>]+)>)/gi, "").replace(/&nbsp;/g, " ") : ''

const writeHeader = (pathToFile, headers) => fs.writeFileSync(pathToFile, headers.join(',') + '\r\n')

const appendRow = (pathToFile, row) => fs.appendFileSync(pathToFile, row.join(',') + '\r\n')

// Function to calculate the topic summary
const topicSummary = (topic) => {
  const posts = topic.replies.flat()
  const topicPostedAt = new Date(topic.topicPostedAt)

  // Number of posts
  const numberOfPosts = posts.length

  if (numberOfPosts === 0) {
    return {
      numberOfPosts: 0,
      medianWordCount: 0,
      averageTimeDiff: 0,
      averagePostsPerAuthor: 0
    }
  }

  // Word count function
  const getWordCount = (str) => {
    const cleanStr = str.replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
    return cleanStr.trim().split(/\s+/).length
  }

  // Word counts
  const wordCounts = posts.map(post => getWordCount(post.postMessage))

  // Median word count
  const median = (arr) => {
    const sorted = arr.slice().sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  }
  const medianWordCount = Math.round(median(wordCounts) * 10) / 10

  // Average time in hours from topicCreatedAt to postTimestamp
  const timeDiffs = posts.map(post => {
    const postTimestamp = new Date(post.postTimestamp)
    return (postTimestamp - topicPostedAt) / (1000 * 60 * 60) // Convert from milliseconds to hours
  })
  const averageTimeDiff = Math.round((timeDiffs.reduce((acc, curr) => acc + curr, 0) / timeDiffs.length) * 10) / 10

  // Average number of posts per postAuthorId
  const postCountsByAuthor = posts.reduce((acc, post) => {
    acc[post.postAuthorId] = (acc[post.postAuthorId] || 0) + 1
    return acc
  }, {})
  const averagePostsPerAuthor = Math.round((Object.values(postCountsByAuthor).reduce((acc, curr) => acc + curr, 0) / Object.keys(postCountsByAuthor).length) * 10) / 10

  return {
    numberOfPosts,
    medianWordCount,
    averageTimeDiff,
    averagePostsPerAuthor
  }
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
      average_posts_per_author: summary.averagePostsPerAuthor
    }

    appendRow(csvPath, Object.values(topicDetails))
  })
}

module.exports = writeSummaryToCSV
