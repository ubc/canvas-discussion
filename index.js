const {
  getDiscussionTopics,
  getDiscussionTopic,
  getFullDiscussion
} = require('node-canvas-api')

async function getDiscussions (courseId) {
  const discussionTopicIds = await getDiscussionTopics(courseId)
    .then(discussions => discussions.map(x => x.id))

  const discussionTopics = await Promise.all(
    discussionTopicIds.map(topicId => getDiscussionTopic(courseId, topicId))
  )

  console.log(discussionTopics)
}

// getDiscussions(/* add your course id here! */)
getDiscussions(15189)
