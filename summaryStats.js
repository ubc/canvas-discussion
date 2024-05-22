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
    // Return the total likes count
    console.log('Total Likes: ', totalLikes)
    return totalLikes;
  };

const getTotalReplies = discussion => {
    const totalReplies = discussion.replies.length || 0
    console.log('Total replies: ', totalReplies)
    return totalReplies
}

Promise.all(
    courseIds.map(courseId =>
      getDiscussions(courseId)
        .then(flattenReplies)
        .then(discussions => {
          // Map over discussions and add computed properties
          return discussions.map(discussion => ({
            ...discussion,
            totalReplyLikes: getTotalReplyLikes(discussion),
            totalReplies: getTotalReplies(discussion)
          }));
        })
    )
  )
  .then(allCoursesDiscussions => {
    // allCoursesDiscussions contains an array of discussions for each course
    // You can now use these discussions for further processing
    console.log(allCoursesDiscussions);
  })
  .catch(error => {
    const detailedErrorMessage = error.message || 'An unexpected error occurred';
    console.error('Error processing discussions:', detailedErrorMessage);
  });

// // Function to calculate average time (in minutes) to reply to the discussion
// function calculateAverageReplyTime(discussion) {
//     const totalReplies = discussion.replies.length;
//     if (totalReplies === 0) return 0; // Return 0 if there are no replies
  
//     const topicCreatedAt = new Date(discussion.topicCreatedAt);
//     const totalReplyTime = discussion.replies.reduce((acc, reply) => {
//       const postTimestamp = new Date(reply[0].postTimestamp);
//       const replyTime = (postTimestamp - topicCreatedAt) / (1000 * 60); // Convert to minutes
//       return acc + replyTime;
//     }, 0);
  
//     return totalReplyTime / totalReplies;
//   }
  
//   // Function to calculate average reply word count
// function calculateAverageReplyWordCount(discussion) {
//     const totalReplies = discussion.replies.length;
//     if (totalReplies === 0) return 0; // Return 0 if there are no replies
  
//     const totalWords = discussion.replies.reduce((acc, reply) => {
//       return acc + reply[0].postMessage.split(/\s+/).length;
//     }, 0);
  
//     return totalWords / totalReplies;
//   }
  
//   // Function to get the number of replies
// function getNumberOfReplies(discussion) {
//     return discussion.replies.length;
//   }
  
//   // Function to get the number of students with at least 1 reply
// function getNumberOfStudentsWithReplies(discussion) {
//     const students = new Set();
//     discussion.replies.forEach(reply => {
//       students.add(reply[0].postAuthorId);
//     });
//     return students.size;
//   }
  
//   // Calculate statistics for each discussion
// const discussionStatistics = discussions.map(discussion => {
//     const hasReplies = discussion.replies && discussion.replies.length > 0;

//     return {
//         topicId: discussion.topicId,
//         averageReplyTime: hasReplies ? calculateAverageReplyTime(discussion) : 0,
//         averageReplyWordCount: hasReplies ? calculateAverageReplyWordCount(discussion) : 0,
//         numberOfReplies: hasReplies ? getNumberOfReplies(discussion) : 0,
//         numberOfStudentsWithReplies: hasReplies ? getNumberOfStudentsWithReplies(discussion) : 0
//     };
// });
  
// console.log(discussionStatistics);

// Promise.all(
//     courseIds.map(courseId =>
//         getDiscussions(courseId)
//             .then(discussion => {
//                 console.log(JSON.stringify(discussion, null, 2))
//                 return discussion// Return the discussion object
//             })
//     )
// ).catch(error => {
//     const detailedErrorMessage = error.message || 'An unexpected error occurred'
//     console.error('Error processing discussions:', detailedErrorMessage)
// })
