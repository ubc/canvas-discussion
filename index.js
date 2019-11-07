const capi = require('node-canvas-api')
const { flatten } = require('./util')
const writeToCSV = require('./writeToCSV')

const getDiscussionTopicIds = courseId => capi.getDiscussionTopics(courseId)
  .then(discussions => discussions.map(x => x.id))

// recursively get nested replies and flatten result
const getNestedReplies = (replyObj, topicId) => {
  const replies = replyObj.hasOwnProperty('replies')
    ? flatten(
      replyObj.replies.map(replyObj => getNestedReplies(replyObj))
    ) : []
  return [{
    authorId: replyObj.user_id,
    message: replyObj.message,
    likes: replyObj.rating_sum,
    timestamp: replyObj.created_at,
    parentId: replyObj.parent_id || topicId,
    id: replyObj.id
  }, ...replies]
}

const getDiscussions = async courseId => {
  // get discussion topic ids for given course
  const discussionTopicIds = await getDiscussionTopicIds(courseId)
  return Promise.all(
    discussionTopicIds
      // concurrently retrieve discussion topic and any replies for a given discussion topic Id
      .map(topicId => Promise.all([
        capi.getFullDiscussion(courseId, topicId),
        capi.getDiscussionTopic(courseId, topicId)
      ])
        // array destructure result of the two API calls
        .then(([discussion, topic]) => {
          const topicTitle = topic.title
          const topicMessage = topic.message
          const author = topic.author
          const timestamp = topic.created_at
          const topicId = topic.id
          // if discussion 'view' array has any element, then there are replies to this discussion
          const replies = discussion.view.length > 0
            ? discussion.view
              // remove deleted posts as they contain no data
              .filter(x => !x.deleted)
              .map(reply => getNestedReplies(reply, topicId))
            // discussion doesn't have 'view', so return empty array
            : []
          return {
            topicTitle,
            topicMessage,
            id: topicId,
            authorId: author.id || '',
            timestamp,
            replies
          }
        }))
  )
}

// add course ID here!
getDiscussions(46341)
  // write result to CSV
  .then(discussions => writeToCSV(discussions))
