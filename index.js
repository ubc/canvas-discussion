const capi = require('node-canvas-api')
const { flatten, toDateTime } = require('./util')
const writeToCSV = require('./writeToCSV')
const writeSummaryToCSV = require('./writeSummaryToCSV')
require('dotenv').config()

const envVariableWarning = (msg) => {
  console.info(msg)
}

const envVariableError = (msg) => {
  console.error(msg)
  process.exit(1)
}

const checkEnvVariable = (varName, errMsg) => {
  if (!process.env[varName]) {
    if (varName === 'INCLUDE_MODULE_SUMMARY') {
      envVariableWarning(errMsg)
    } else {
      envVariableError(`Error: ${errMsg}. See README for an example.env`)
    }
  }
}

checkEnvVariable('COURSE_IDS', 'COURSE_IDS environment variable is not defined.')
checkEnvVariable('CANVAS_API_TOKEN', 'CANVAS_API_TOKEN environment variable is not defined. You need a token to run this script.')
checkEnvVariable('CANVAS_API_DOMAIN', 'CANVAS_API_DOMAIN environment variable is not defined.')

const getDiscussionTopicIds = courseId => capi.getDiscussionTopics(courseId)
  .then(discussions => discussions.map(x => x.id))

// recursively get nested replies and flatten result
const getNestedReplies = (replyObj, participants, topicId) => {
  const replies = replyObj.hasOwnProperty('replies')
    ? flatten(
      replyObj.replies.map(replyObj => getNestedReplies(replyObj, participants))
    ) : []
  const authorName = participants.find(x => x.id === replyObj.user_id)
    ? participants.find(x => x.id === replyObj.user_id).display_name
    : ''

  return [{
    postAuthorId: replyObj.user_id,
    postAuthorName: authorName,
    postMessage: replyObj.message,
    postLikes: replyObj.rating_sum || 0,
    postTimestamp: toDateTime(replyObj.created_at),
    postParentId: replyObj.parent_id || '',
    postId: replyObj.id
  }, ...replies]
}

const getDiscussionsAndTopics = async (courseId, topicIds) => {
  const fetchDetails = topicId => Promise.all([
    capi.getFullDiscussion(courseId, topicId),
    capi.getDiscussionTopic(courseId, topicId)
  ])

  const discussionsAndTopics = await Promise.all(
    topicIds.map(async topicId => {
      const [discussion, topic] = await fetchDetails(topicId)
      return { discussion, topic }
    })
  )

  return discussionsAndTopics
}

const processDiscussionTopic = ({ discussion, topic }) => {
  const topicId = topic.id
  const topicTitle = topic.title
  const topicMessage = topic.message
  const author = topic.author
  const topicCreatedAt = toDateTime(topic.created_at)
  const topicPostedAt = toDateTime(topic.posted_at)
  const participants = discussion.participants
  const replies = discussion.view.length > 0
    ? discussion.view
      .filter(x => !x.deleted)
      .map(reply => getNestedReplies(reply, participants, topicId))
    : []

  return {
    topicId,
    topicTitle,
    topicMessage,
    topicAuthorId: author.id || '', // the topic author id can be null
    topicAuthorName: author.display_name || '', // the topic author can be null
    topicCreatedAt,
    topicPostedAt,
    replies
  }
}

const getDiscussions = async courseId => {
  const discussionTopicIds = await getDiscussionTopicIds(courseId)
  const discussionsAndTopics = await getDiscussionsAndTopics(courseId, discussionTopicIds)

  return discussionsAndTopics.map(processDiscussionTopic)
}

const courseIds = process.env.COURSE_IDS.split(',').map(id => id.trim())

Promise.all(
  courseIds.map(courseId => {
    getDiscussions(courseId).then(discussions =>
      Promise.all([
        writeToCSV(courseId, discussions), // Writes detailed discussion data to CSV
        writeSummaryToCSV(courseId, discussions) // Writes summary of discussion data to CSV
      ])
    )
  })
).catch(error => {
  console.error('Error processing discussions and modules:', error.message || `An unexpected error occurred: ${error}`)
})
