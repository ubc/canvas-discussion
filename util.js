const fs = require('fs')
const path = require('path')

const flatten = arr => arr.reduce((acc, cur) =>
  Array.isArray(cur)
    ? [...acc, ...cur]
    : [...acc, cur]
, [])

const escapeComment = comment => comment ? '"' + comment.replace(/"/g, "'") + '"' : ''
const stripHTML = comment => comment ? comment.replace(/(<([^>]+)>)/gi, "").replace(/&nbsp;/g, " ") : ''
const writeHeader = (pathToFile, headers) => fs.writeFileSync(pathToFile, headers + '\r\n')
const appendRow = (pathToFile, row) => fs.appendFileSync(pathToFile, row.join(',') + '\r\n')

// Word count function
const getWordCount = (str) => {
  const cleanStr = stripHTML(escapeComment(str))
  //const cleanStr = str.replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
  return cleanStr.trim().split(/\s+/).length
}

// Median word count
const median = (arr) => {
  const sorted = arr.slice().sort()
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

// Function to calculate the topic summary
const postStatistics = (posts, referenceTimestamp) => {
  // Number of posts
  const numberOfPosts = posts.length

  if (numberOfPosts === 0) {
    return {
      numberOfPosts: 0,
      medianWordCount: 0,
      averageTimeDiff: null,
      firstReplyTimestamp: null,
      averageTimeToPostFromFirst: null,
      averagePostsPerAuthor: null
    }
  }

  // Word counts
  const wordCounts = posts.map(post => getWordCount(post.postMessage))

  const medianWordCount = Math.round(median(wordCounts) * 10) / 10

  // Average time in hours from topicCreatedAt to postTimestamp
  const timeDiffs = posts.map(post => {
    const postTimestamp = new Date(post.postTimestamp)
    return (postTimestamp - referenceTimestamp) / (1000 * 60 * 60) // Convert from milliseconds to hours
  })

  const averageTimeDiff = Math.round((timeDiffs.reduce((acc, curr) => acc + curr, 0) / timeDiffs.length) * 10) / 10

  const postCountsByAuthor = posts.reduce((acc, post) => {
    acc[post.postAuthorId] = (acc[post.postAuthorId] || 0) + 1
    return acc
  }, {})
  // Average number of posts per postAuthorId
  const averagePostsPerAuthor = Math.round((Object.values(postCountsByAuthor).reduce((acc, curr) => acc + curr, 0) / Object.keys(postCountsByAuthor).length) * 10) / 10

  
  const firstReplyTimestamp = new Date(Math.min(...posts.map(post => new Date(post.postTimestamp))))
  const timeDiffsFromFirst = posts
    .map(post => {
      const postTimestamp = new Date(post.postTimestamp)
      return postTimestamp > firstReplyTimestamp 
        ? (postTimestamp - firstReplyTimestamp) / (1000 * 60 * 60) // Convert from milliseconds to hours
        : null
    })
    .filter(diff => diff !== null)
  
  const averageTimeToPostFromFirst = timeDiffsFromFirst.length > 0
    ? Math.round((timeDiffsFromFirst.reduce((acc, curr) => acc + curr, 0) / timeDiffsFromFirst.length) * 10) / 10
    : 0
    
  return {
    numberOfPosts,
    medianWordCount,
    averageTimeDiff,
    firstReplyTimestamp,
    averageTimeToPostFromFirst,
    averagePostsPerAuthor
  }

}
module.exports = {
  flatten,
  escapeComment,
  stripHTML,
  writeHeader,
  appendRow,
  postStatistics
}
