const {
  getDiscussionTopics,
  getDiscussionTopic,
  getFullDiscussion
} = require('node-canvas-api')
const { flatten } = require('./util')
const writeToCSV = require('./writeToCSV')

function getNestedReplies (replyObj) {
  if (replyObj.hasOwnProperty('replies')) {
    return flatten(
      [{
        author: replyObj.user_id,
        message: replyObj.message,
        likes: replyObj.rating_sum,
        timestamp: replyObj.created_at
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
      timestamp: replyObj.created_at
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
      // const participants = discussion.participants
      if (discussion.view.length > 0) {
        const replies = discussion.view
          .filter(x => !x.deleted) // remove deleted posts as they contain no data
          .map(reply => getNestedReplies(reply))
        return {
          topicTitle,
          topicMessage,
          author: author.id || '',
          replies
        }
      } else {
        return {
          topicTitle,
          topicMessage,
          author: author.id || '',
          timestamp
        }
      }
    })
  ))
}

getDiscussions(/* add Canvas course id here */)
  .then(discussions => writeToCSV(discussions))
