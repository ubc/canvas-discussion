const {getDiscussions, courseIds} = require('./index')
const { flatten, escapeComment, stripHTML } = require('./util')

const flattenReplies = discussions => {
    const flattenedDiscussions = discussions.map(discussion => ({
        ...discussion,
        replies: flatten(discussion.replies)
      }));
    
    return flattenedDiscussions
}

const getTotalReplyLikes = replies => {
    const totalLikes = replies.reduce((acc, reply) => acc + reply.postLikes, 0);
    return totalLikes;
  };

const getTotalReplies = replies => {
    const totalReplies = replies.length || 0
    return totalReplies
}

const getWordCount = message => {
    const formattedMessage = stripHTML(escapeComment(message))
    const words = formattedMessage.trim().split(/\s+/) || 0
    return words.length 
}

const getWordCounts = replies => {
    const wordCounts = replies.map(reply => getWordCount(reply.postMessage));
    return wordCounts;
}

const getAverageWordCount = replies => {
    const wordCounts = getWordCounts(replies);
    const totalWords = wordCounts.reduce((total, count) => total + count, 0);
    const totalReplies = replies.length || 1; // To avoid division by zero
    const averageWordCount = totalWords / totalReplies || 0;
    return averageWordCount;
}

const getMinWordCount = replies => {
    const wordCounts = getWordCounts(replies);
    const minWordCount = Math.min(...wordCounts);
    return minWordCount;
}

const getMaxWordCount = replies => {
    const wordCounts = getWordCounts(replies);
    const maxWordCount = Math.max(...wordCounts);
    return maxWordCount;
}

const getMedianWordCount = replies => {
    const wordCounts = getWordCounts(replies);
    wordCounts.sort((a, b) => a - b);
    const mid = Math.floor(wordCounts.length / 2);
    const medianWordCount = wordCounts.length % 2 === 0 ? (wordCounts[mid - 1] + wordCounts[mid]) / 2 : wordCounts[mid];
    return medianWordCount;
}

const addStatsToDiscussion = discussion => {
    // Create a new object with the original discussion properties and add stats
    // pass ...discussion to keep full object
    
    const { replies, ...discussionWithoutReplies } = discussion;
    return {
      ...discussionWithoutReplies,
      stats: {
        totalReplyLikes: getTotalReplyLikes(replies),
        totalReplies: getTotalReplies(replies),
        wordCount: {
          average: getAverageWordCount(replies),
          max: getMaxWordCount(replies),
          min: getMinWordCount(replies),
          median: getMedianWordCount(replies)
        } 
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
