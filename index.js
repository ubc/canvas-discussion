const capi = require('node-canvas-api')
const { flatten } = require('./util')
const writeToCSV = require('./writeToCSV')
require('dotenv').config();

// Check for COURSE_IDS in environment variables
if (!process.env.COURSE_IDS) {
  console.error('Error: COURSE_IDS environment variable is not defined.');
  process.exit(1); // Exit the script with a non-zero status
}

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
    postTimestamp: replyObj.created_at,
    postParentId: replyObj.parent_id || '',
    postId: replyObj.id
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
    const topicId = topic.id
    const topicTitle = topic.title
    const topicMessage = topic.message
    const author = topic.author
    const topicCreatedAt = topic.created_at
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
      topicAuthorId: author.id || '',
      topicAuthorName: author.display_name || '',
      topicCreatedAt,
      replies
    }
  })
}

const courseIds = process.env.COURSE_IDS.split(',').map(id => id.trim());

Promise.all(
  courseIds.map(courseId =>
    getDiscussions(courseId)
      .then(discussions => writeToCSV(courseId, discussions))
  )
).catch(error => {
  const detailedErrorMessage = error.message || 'An unexpected error occurred';
  console.error('Error processing discussions:', detailedErrorMessage);
});

module.exports = {
  getDiscussions,
  courseIds
}