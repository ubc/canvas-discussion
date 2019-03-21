const {
  getDiscussionTopics,
  getDiscussionTopic,
  getFullDiscussion
} = require('node-canvas-api')
const { flatten } = require('./util')
const writeToCSV = require('./writeToCSV')

// recursively get nested replies and flatten it out
function getNestedReplies (replyObj) {
  if (replyObj.hasOwnProperty('replies')) {
    return flatten(
      [{
        author: replyObj.user_id,
        message: replyObj.message,
        likes: replyObj.rating_sum,
        timestamp: replyObj.created_at,
        parentId: replyObj.parent_id || '',
        id: replyObj.id
      },
      flatten(
        replyObj.replies.map(replyObj => getNestedReplies(replyObj))
      )]
    )
  } else {
    return [{
      author: replyObj.user_id,
      message: replyObj.message,
      likes: replyObj.rating_sum,
      timestamp: replyObj.created_at,
      parentId: replyObj.parent_id || '',
      id: replyObj.id
    }]
  }
}

async function getDiscussions (courseId) {
  const discussionTopicIds = await getDiscussionTopics(courseId)
    .then(discussions => discussions.map(x => x.id))

  return Promise.all(discussionTopicIds.map(topicId =>
    Promise.all([
      getFullDiscussion(courseId, topicId),
      getDiscussionTopic(courseId, topicId)
    ]).then(([discussion, topic]) => {
      const topicTitle = topic.title
      const topicMessage = topic.message
      const author = topic.author
      const timestamp = topic.created_at
      const topicId = topic.id
      // const participants = discussion.participants
      if (discussion.view.length > 0) {
        const replies = discussion.view
          .filter(x => !x.deleted) // remove deleted posts as they contain no data
          .map(reply => getNestedReplies(reply))
        return {
          topicTitle,
          topicMessage,
          authorId: author.id || '',
          authorName: author.name || '',
          replies
        }
      } else {
        return {
          topicTitle,
          topicMessage,
          id: topicId,
          authorId: author.id || '',
          authorName: author.name || '',
          timestamp
        }
      }
    })
  ))
}

getDiscussions(30739)
  .then(discussions => writeToCSV(discussions))
