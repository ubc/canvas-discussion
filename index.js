const capi = require('node-canvas-api')
const { flatten } = require('./util')
const writeToCSV = require('./writeToCSV')

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
    authorId: replyObj.user_id,
    authorName: authorName,
    message: replyObj.message,
    likes: replyObj.rating_sum,
    timestamp: replyObj.created_at,
    parentId: replyObj.parent_id || topicId,
    id: replyObj.id
  }, ...replies]
}

const getDiscussions = async courseId => {
  const discussionTopicIds = await getDiscussionTopicIds(courseId)
  const discussionAndTopic = await Promise.all(
    discussionTopicIds
      .map(topicId => Promise.all([
        capi.getFullDiscussion(courseId, topicId),
        capi.getDiscussionTopic(courseId, topicId)
      ]))
  )
  return discussionAndTopic.map(([discussion, topic]) => {
    const topicTitle = topic.title
    const topicMessage = topic.message
    const author = topic.author
    const timestamp = topic.created_at
    const topicId = topic.id
    const participants = discussion.participants
    const replies = discussion.view.length > 0
      ? discussion.view
        .filter(x => !x.deleted)
        .map(reply => getNestedReplies(reply, participants, topicId))
      : []
    return {
      topicTitle,
      topicMessage,
      id: topicId,
      authorId: author.id || '',
      authorName: author.display_name || '',
      timestamp,
      replies
    }
  })
}

Promise.all(
  [
    50827
  ].map(async courseId => {
    const [discussions, enrollments] = await Promise.all([getDiscussions(courseId), capi.getUsersInCourse(courseId)])
    const discussionWithSisId = discussions.map(discussion => {
      const author = enrollments.find(e => e.id === discussion.authorId)
      if (author) {
        discussion.sis_id = author.sis_user_id
      }
      const repliesWithSisId = discussion.replies.map(reply => {
        return reply.map(response => {
          const author = enrollments.find(e => e.id === response.authorId)
          if (author) {
            response.sis_id = author.sis_user_id
          }
          return response
        })
      })
      discussion.replies = repliesWithSisId
      return discussion
    })
    writeToCSV(courseId, discussionWithSisId)
  })
)
