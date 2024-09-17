const capi = require('node-canvas-api')
const { flatten } = require('./util')
const writeToCSV = require('./writeToCSV')
const writeSummaryToCSV = require('./writeSummaryToCSV')
const writeSummaryByModuleToCSV = require('./writeSummaryByModuleToCSV')
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
checkEnvVariable('INCLUDE_MODULE_SUMMARY', 'INCLUDE_MODULE_SUMMARY environment variable is not defined. Define and set to `true` to include summary at module.')
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
    postTimestamp: new Date(replyObj.created_at),
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
  const topicCreatedAt = topic.created_at ? new Date(topic.created_at) : null
  const topicPostedAt = topic.posted_at ? new Date(topic.posted_at) : null
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

const getPublishedModuleDiscussions = async courseId => {
  const modules = await capi.getModules(courseId)

  const modulesWithDiscussionItems = await Promise.all(modules.map(async module => {
    const items = await capi.getModuleItems(courseId, module.id)
    const discussionItems = items.filter(item => item.type === 'Discussion' && item.published)

    const discussionsAndTopics = await getDiscussionsAndTopics(courseId, discussionItems.map(item => item.content_id))
    const processedDiscussions = discussionsAndTopics.map(processDiscussionTopic)

    const discussionItemWithDiscussionData = discussionItems.map(discussionItem => {
      const discussionAndReplies = processedDiscussions.find(d => d.topicId === discussionItem.content_id)
      return {
        ...discussionItem,
        discussionAndReplies
      }
    })

    return {
      ...module,
      discussionItems: discussionItemWithDiscussionData
    }
  }))

  return modulesWithDiscussionItems
}

const courseIds = process.env.COURSE_IDS.split(',').map(id => id.trim())
const returnSummaryByModule = process.env.INCLUDE_MODULE_SUMMARY ? process.env.INCLUDE_MODULE_SUMMARY === 'true' : false

Promise.all(
  courseIds.map(courseId => {
    const basePromise = getDiscussions(courseId).then(discussions =>
      Promise.all([
        writeToCSV(courseId, discussions), // Writes detailed discussion data to CSV
        writeSummaryToCSV(courseId, discussions) // Writes summary of discussion data to CSV
      ])
    )

    const additionalPromise = returnSummaryByModule
      ? getPublishedModuleDiscussions(courseId).then(modulesWithDiscussionItems =>
        writeSummaryByModuleToCSV(courseId, modulesWithDiscussionItems) // Writes summary of module data to CSV
      )
      : Promise.resolve() // No additional operation if condition is false

    return Promise.all([basePromise, additionalPromise])
  })
).catch(error => {
  console.error('Error processing discussions and modules:', error.message || `An unexpected error occurred: ${error}`)
})
