const fs = require('fs')
const path = require('path')
const { DateTime } = require('luxon')

const toPacificTimeString = (date) => 
  date
    ? DateTime.fromJSDate(date, { zone: 'utc' })   // Convert JS Date to Luxon DateTime in UTC
        .setZone('America/Los_Angeles')           // Convert to Pacific Time
        .toFormat('yyyy-MM-dd HH:mm:ss ZZZZ')     // Format the DateTime object
    : null

const flatten = arr => arr.reduce((acc, cur) =>
  Array.isArray(cur)
    ? [...acc, ...cur]
    : [...acc, cur]
, [])

const average = (arr) => {
  if (arr.length === 0) return 0
  const sum = arr.reduce((acc, curr) => acc + curr, 0)
  return sum / arr.length
}

// median from array
const median = (arr) => {
  const sorted = arr.slice().sort()
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

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
    return (post.postTimestamp - referenceTimestamp) 
  })

  const averageTimeDiff = parseFloat(average(timeDiffs).toFixed(1)) / (1000 * 60 * 60) // Convert from milliseconds to hours

  const postCountsByAuthor = posts.reduce((acc, post) => {
    acc[post.postAuthorId] = (acc[post.postAuthorId] || 0) + 1
    return acc
  }, {})
  // Average number of posts per postAuthorId

  const postCounts = Object.values(postCountsByAuthor)
  const averagePostsPerAuthor = parseFloat(average(postCounts).toFixed(1))
  
  const firstReplyTimestamp = new Date(Math.min(...posts.map(
    post => new Date(post.postTimestamp))))

  const timeDiffsFromFirst = posts
    .map(post => {
      return post.postTimestamp > firstReplyTimestamp 
        ? (post.postTimestamp - firstReplyTimestamp) / (1000 * 60 * 60) // Convert from milliseconds to hours
        : null
    })
    .filter(diff => diff !== null)
  
  const averageTimeToPostFromFirst = timeDiffsFromFirst.length > 0
    ? parseFloat(average(timeDiffsFromFirst).toFixed(1))
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
  postStatistics,
  toPacificTimeString
}
