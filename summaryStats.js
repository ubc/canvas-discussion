const {getDiscussions, courseIds} = require('./index')

const discussionData = courseIds.map(courseId => getDiscussions(courseId))
//console.log(discussionData)
