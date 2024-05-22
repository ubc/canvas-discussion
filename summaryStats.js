const {getDiscussions, courseIds} = require('./index')

const discussionData = courseIds.map(courseId => getDiscussions(courseId))
console.log(discussionData)


Promise.all(
    courseIds.map(courseId =>
      getDiscussions(courseId)
        .then(discussion => console.log(discussion))
    )
  ).catch(error => {
    const detailedErrorMessage = error.message || 'An unexpected error occurred';
    console.error('Error processing discussions:', detailedErrorMessage);
  });