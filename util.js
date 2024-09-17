const fs = require('fs')
const path = require('path')
const { DateTime } = require('luxon')
const natural = require('natural')

const escapeComment = comment => comment ? '"' + comment.replace(/"/g, "'") + '"' : ''

const stripHTML = comment => comment ? comment.replace(/(<([^>]+)>)/gi, "").replace(/&nbsp;/g, " ") : ''

const writeHeader = (pathToFile, headers) => fs.writeFileSync(pathToFile, headers + '\r\n')

const appendRow = (pathToFile, row) => fs.appendFileSync(pathToFile, row.join(',') + '\r\n')

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

// Word count function
const getWordCount = (str) => {
  tokenizer = new natural.WordTokenizer()

  const cleanStr = stripHTML(escapeComment(str))
  //const cleanStr = str.replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
  const tokens = tokenizer.tokenize(cleanStr)
  const tokenCount = tokens.length 
  return tokenCount
}

const getDateDiff = (referenceTimestamp, relativeTimestamp) => {

  const referenceDateTime = DateTime.fromISO(referenceTimestamp)
  const relativeDateTime = DateTime.fromISO(relativeTimestamp)

  // Calculate the difference in days
  const diffInDays = relativeDateTime.diff(referenceDateTime, 'days').days

  // Return the floor of the difference in days
  return Math.floor(diffInDays)

}

const msToHours = ms => ms / (1000 * 60 * 60)
const msToDays = ms => ms / (1000 * 60 * 60 * 24)

// Function to calculate average time difference in a specified unit
const calculateAverageTimeDiff = (posts, referenceTimestamp, timeUnit = 'hours') => {
  const getTimeDiffInMs = (timestamp, reference) => {
    const diff = timestamp - reference;
    return diff > 0 ? diff : null;
  }
  
  // Convert the average time difference to the specified unit
  const unitConverter = timeUnit === 'hours' ? msToHours : (timeUnit === 'days' ? msToDays : msToHours)
  
  return unitConverter(
    average(
      posts
        .map(post => getTimeDiffInMs(post.postTimestamp, referenceTimestamp))
        .filter(diff => diff !== null)
    )
  )
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

  const wordCounts = posts.map(post => getWordCount(post.postMessage))
  const medianWordCount = Math.round(median(wordCounts) * 10) / 10

  const postCountsByAuthor = posts.reduce((acc, post) => {
    acc[post.postAuthorId] = (acc[post.postAuthorId] || 0) + 1
    return acc
  }, {})

  const postCounts = Object.values(postCountsByAuthor)
  const averagePostsPerAuthor = parseFloat(average(postCounts).toFixed(1))

  const averageTimeDiffFromReferenceInHours = calculateAverageTimeDiff(posts, referenceTimestamp, 'hours')
  const averageTimeDiffFromFirstInHours = calculateAverageTimeDiff(posts, firstReplyTimestamp, 'hours')

    
  return {
    numberOfPosts,
    medianWordCount,
    referenceTimestamp,
    firstReplyTimestamp,
    averageTimeDiffFromReferenceInHours,
    averageTimeDiffFromFirstInHours,
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
  toPacificTimeString,
  getDateDiff,
  getWordCount
}
