const { getDiscussionTopics, getDiscussionTopic, getFullDiscussion } = require('node-canvas-api')
const { flatten } = require('./util')
const writeToCSV = require('./writeToCSV')

// recursively get nested replies and flatten result
function getNestedReplies(replyObj, topicId) {
  const replies = replyObj.hasOwnProperty('replies')
    ? flatten(
      replyObj.replies.map(replyObj => getNestedReplies(replyObj))
    ) : []
  return flatten(
    [{
      authorId: replyObj.user_id,
      message: replyObj.message,
      likes: replyObj.rating_sum,
      timestamp: replyObj.created_at,
      parentId: replyObj.parent_id || topicId,
      id: replyObj.id
    }, ...replies]
  )
}

const getDiscussionTopicIds = courseId => getDiscussionTopics(courseId)
  .then(discussions => discussions.map(x => x.id))

const getDiscussions = async courseId => {
  const discussionTopicIds = await getDiscussionTopicIds(courseId)
  return Promise.all(
    discussionTopicIds
      .map(topicId =>
        Promise.all([
          getFullDiscussion(courseId, topicId),
          getDiscussionTopic(courseId, topicId)
        ]).then(([discussion, topic]) => {
          const topicTitle = topic.title
          const topicMessage = topic.message
          const author = topic.author
          const timestamp = topic.created_at
          const topicId = topic.id
          const replies = discussion.view.length > 0
            ? discussion.view
              .filter(x => !x.deleted) // remove deleted posts as they contain no data
              .map(reply => getNestedReplies(reply, topicId))
            : []
          return {
            topicTitle,
            topicMessage,
            id: topicId,
            authorId: author.id || '',
            timestamp,
            replies
          }
        })
      )
  )
}

getDiscussions(30739)
  .then(discussions => writeToCSV(discussions))
