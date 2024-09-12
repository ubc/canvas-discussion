
const path = require('path')
const { escapeComment, stripHTML, writeHeader, appendRow, postStatistics, toPacificTimeString } = require('./util') 

// Function to calculate the module summary
const moduleSummary = (module) => {
  const posts = module.discussionItems.map(item => item.discussionAndReplies.replies).flat().flat()
  const moduleUnlockedAt  = new Date(module.unlock_at)

  const postSummary = postStatistics(posts, moduleUnlockedAt)

  return postSummary
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
      module_created_at: toPacificTimeString(module.unlock_at) || toPacificTimeString(module.created_at),
      number_of_posts: summary.numberOfPosts,
      median_word_count: summary.medianWordCount,
      average_time_to_post_hours: summary.averageTimeDiff,
      first_reply_timestamp: toPacificTimeString(summary.firstReplyTimestamp),
      average_time_to_post_from_first_hours: summary.averageTimeToPostFromFirst,
      average_posts_per_author: summary.averagePostsPerAuthor
    }
    appendRow(csvPath, Object.values(moduleDetails))
  })
}

module.exports = writeSummaryByModuleToCSV
