const capi = require('node-canvas-api')
const { flatten } = require('./util')
const writeToCSV = require('./writeToCSV')

const getDiscussionTopicIds = courseId => capi.getDiscussionTopics(courseId)
  .then(discussions => discussions.map(x => x.id))

const getNestedReplies = (replyObj, topicId) => {                 // recursively get nested replies and flatten result
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

const getDiscussions = async courseId => {
  const discussionTopicIds = await getDiscussionTopicIds(courseId) // get discussion topic ids for given course
  return Promise.all(
    discussionTopicIds
      .map(topicId => Promise.all([                                // concurrently retrieve discussion topic and any replies for a given discussion topic Id
        capi.getFullDiscussion(courseId, topicId),
        capi.getDiscussionTopic(courseId, topicId)
      ]).then(([discussion, topic]) => {                           // array destructure result of the two API calls
        const topicTitle = topic.title
        const topicMessage = topic.message
        const author = topic.author
        const timestamp = topic.created_at
        const topicId = topic.id
        const replies = discussion.view.length > 0                 // if discussion 'view' array has any element, then there are replies to this discussion
          ? discussion.view
            .filter(x => !x.deleted)                               // remove deleted posts as they contain no data
            .map(reply => getNestedReplies(reply, topicId))
          : []                                                     // discussion doesn't have 'view', so return empty array
        return {
          topicTitle,
          topicMessage,
          id: topicId,
          authorId: author.id || '',
          timestamp,
          replies                                                  // replies to discussion are stored in an array
        }
      }))
  )
}

getDiscussions(30739)                                              // 30739 is ID of hackUBC course
  .then(discussions => writeToCSV(discussions))                    // write result to CSV
