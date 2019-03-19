const {
  getDiscussionTopics,
  getDiscussionTopic,
  getFullDiscussion
} = require('node-canvas-api')
const { flatten } = require('./util')

function getNestedReplies (replyObj) {
  if (replyObj.hasOwnProperty('replies')) {
    return flatten(
      [{ userId: replyObj.user_id, message: replyObj.message },
        flatten(
          replyObj.replies.map(replyObj => getNestedReplies(replyObj))
        )
      ]
    )
  } else {
    return [{ userId: replyObj.user_id, message: replyObj.message }]
  }
}

async function getDiscussions (courseId) {
  const discussionTopicIds = await getDiscussionTopics(courseId)
    .then(discussions => discussions.map(x => x.id))

  const discussionTopics = await Promise.all(discussionTopicIds.map(topicId =>
    Promise.all([getFullDiscussion(courseId, topicId), getDiscussionTopic(courseId, topicId)])
      .then(([discussion, topic]) => ({ discussion, topic }))
      .then(({ discussion, topic }) => {
        const topicTitle = topic.title
        const topicMessage = topic.message
        // const participants = discussion.participants
        if (discussion.view.length > 0) {
          const replies = discussion.view
            .filter(x => !x.deleted)
            .map(reply => getNestedReplies(reply))
          return {
            topicTitle,
            topicMessage,
            replies
          }
        } else {
          return {
            topicTitle,
            topicMessage
          }
        }
      })
  ))
  console.log(discussionTopics)
}

