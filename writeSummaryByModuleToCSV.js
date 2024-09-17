
const path = require('path')
const { escapeComment, stripHTML, writeHeader, appendRow, postStatistics, toDateTime, convertToPacificTime } = require('./util')

// Function to calculate the module summary
const moduleSummary = (module) => {
  const posts = module.discussionItems.map(item => item.discussionAndReplies.replies).flat().flat()
  const moduleUnlockedAt = toDateTime(module.unlock_at)

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
    'module_created_at',
    'number_of_posts',
    'median_word_count',
    'average_time_to_post_days',
    'first_reply_timestamp',
    'average_time_to_post_from_first_days',
    'average_posts_per_author'
  ]

  writeHeader(csvPath, headers)



  modules.forEach(module => {
    const summary = moduleSummary(module)

    const moduleDetails = {
      module_id: module.id,
      module_name: stripHTML(escapeComment(module.name)),
      module_unlock_at: convertToPacificTime(toDateTime(module.unlock_at)),
      module_created_at: convertToPacificTime(toDateTime(module.created_at)),
      number_of_posts: summary.numberOfPosts,
      median_word_count: summary.medianWordCount,
      average_time_to_post_from_reference_days: summary.averageTimeDiffFromReference,
      first_reply_timestamp: convertToPacificTime(summary.firstReplyTimestamp),
      average_time_to_post_from_first_days: summary.averageTimeDiffFromFirst,
      average_posts_per_author: summary.averagePostsPerAuthor
    }
    appendRow(csvPath, Object.values(moduleDetails))
  })
}

module.exports = writeSummaryByModuleToCSV
