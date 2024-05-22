const {getDiscussions, courseIds} = require('./index')
const { flatten } = require('./util')

const flattenReplies = discussions => {
    const flattenedDiscussions = discussions.map(discussion => ({
        ...discussion,
        replies: flatten(discussion.replies)
      }));
    
    return flattenedDiscussions
}

const getTotalReplyLikes = discussion => {
    const totalLikes = discussion.replies.reduce((acc, reply) => acc + reply.postLikes, 0);
    return totalLikes;
  };

const getTotalReplies = discussion => {
    const totalReplies = discussion.replies.length || 0
    return totalReplies
}

const getWordCount = reply => {
    const wordCount = 0
    return wordCount 
}

const addStatsToDiscussion = discussion => {
    // Create a new object with the original discussion properties and add stats
    return {
      ...discussion,
      stats: {
        totalReplyLikes: getTotalReplyLikes(discussion),
        totalReplies: getTotalReplies(discussion)
      }
    };
  };

  Promise.all(
    courseIds.map(courseId =>
      getDiscussions(courseId)
        .then(flattenReplies)
        .then(discussions => {
          // Map over discussions and add computed properties
          //console.log(discussions)
          return discussions.map(discussion => addStatsToDiscussion(discussion));
        })
    )
  )
  .then(allCoursesDiscussions => {
    console.log(JSON.stringify(allCoursesDiscussions, null, 2));
  })
  .catch(error => {
    const detailedErrorMessage = error.message || 'An unexpected error occurred';
    console.error('Error processing discussions:', detailedErrorMessage);
  });
