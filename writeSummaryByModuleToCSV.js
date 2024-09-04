
const path = require('path')
const { escapeComment, stripHTML, writeHeader, appendRow, 
    getWordCount, median } = require('./util')

// Function to calculate the module summary
const moduleSummary = (module) => {
  const posts = module.discussionItems.map(item => item.discussionAndReplies.replies).flat().flat()
  //console.log(JSON.stringify(module, null, 3))
  //console.log(posts)
  //const moduleCreatedAt = new Date(module.unlock_at || module.created_at)
  const moduleUnlockedAt  = new Date(module.unlock_at)

  const numberOfPosts = posts.length
  const wordCounts = posts.map(post => getWordCount(post.postMessage))

  const medianWordCount = median(wordCounts)

  const timeDiffs = posts.map(post => (new Date(post.postTimestamp) - moduleUnlockedAt) / (1000 * 60 * 60))
  const averageTimeDiff = timeDiffs.reduce((acc, curr) => acc + curr, 0) / timeDiffs.length

  const postCountsByAuthor = posts.reduce((acc, post) => {
    acc[post.postAuthorId] = (acc[post.postAuthorId] || 0) + 1
    return acc
  }, {})
  const averagePostsPerAuthor = Object.values(postCountsByAuthor).reduce((acc, curr) => acc + curr, 0) / Object.keys(postCountsByAuthor).length

  const firstReplyTimestamp = new Date(Math.min(...posts.map(post => new Date(post.postTimestamp))))
  const timeDiffsFromFirst = posts.map(post => (new Date(post.postTimestamp) - firstReplyTimestamp) / (1000 * 60 * 60))

  const averageTimeToPostFromFirst = timeDiffsFromFirst.length > 0 ? timeDiffsFromFirst.reduce((acc, curr) => acc + curr, 0) / timeDiffsFromFirst.length : 0
  
  return {
    numberOfPosts,
    medianWordCount,
    averageTimeDiff,
    firstReplyTimestamp,
    averageTimeToPostFromFirst,
    averagePostsPerAuthor
  }
}

// Function to write the summary to CSV
const writeSummaryByModuleToCSV = (courseId, modules) => {
  console.log(`Writing summary of module discussion data for course: ${courseId}`)
  const csvPath = path.join(__dirname, `output/${courseId}-module-discussion-summary.csv`)
  const headers = [
    'module_id',
    'module_name',
    'module_unlock_at',
    'number_of_posts',
    'median_word_count',
    'average_time_to_post_hours',
    'first_reply_timestamp',
    'average_time_to_post_from_first_hours',
    'average_posts_per_author'
  ]

  writeHeader(csvPath, headers)

  modules.forEach(module => {
    const summary = moduleSummary(module)
    const moduleDetails = {
      module_id: module.id,
      module_name: stripHTML(escapeComment(module.name)),
      module_created_at: module.unlock_at || module.created_at,
      number_of_posts: summary.numberOfPosts,
      median_word_count: summary.medianWordCount,
      average_time_to_post_hours: summary.averageTimeDiff,
      first_reply_timestamp: summary.firstReplyTimestamp,
      average_time_to_post_from_first_hours: summary.averageTimeToPostFromFirst,
      average_posts_per_author: summary.averagePostsPerAuthor
    }
    appendRow(csvPath, Object.values(moduleDetails))
  })
}

module.exports = writeSummaryByModuleToCSV
