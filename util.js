const fs = require('fs')
const path = require('path')
const { DateTime } = require('luxon')
const natural = require('natural')

const escapeComment = comment => comment ? '"' + comment.replace(/"/g, "'") + '"' : ''

const stripHTML = comment => comment ? comment.replace(/(<([^>]+)>)/gi, "").replace(/&nbsp;/g, " ") : ''

const writeHeader = (pathToFile, headers) => fs.writeFileSync(pathToFile, headers + '\r\n')

const appendRow = (pathToFile, row) => fs.appendFileSync(pathToFile, row.join(',') + '\r\n')

const toDateTime = (str) => {
  if (!str) 
    return null  
  try {
    const dateTime = DateTime.fromISO(str, { zone: 'utc' })
    return dateTime.isValid ? dateTime : null 
  } catch {
    return null 
  }
}

function formatNumberOutput(value, decimalPlaces = 2, defaultValue = '') {
  return value != null && !isNaN(value) 
    ? Number(value).toFixed(decimalPlaces) 
    : defaultValue
}

const convertToPacificTime = (dateTime) => {
  if (dateTime && dateTime.isValid) {
    return dateTime.setZone('America/Los_Angeles')
  }
  return null  // Return null if the DateTime is invalid or not provided
}

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

const roundedAverage = (arr, decimalPlaces) => {
  const avg = average(arr)
  const roundedAverage = round(avg, decimalPlaces)
  return roundedAverage
}

// median from array
const median = (arr) => {
  const sorted = arr.slice().sort()
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

const round = (num, decimalPlaces) => {
  if (typeof num !== 'number' || typeof decimalPlaces !== 'number') {
    throw new TypeError('Both arguments must be numbers')
  }

  const factor = 10 ** decimalPlaces
  roundedNum = Math.round(num * factor) / factor
  return roundedNum
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
	const referenceDateTime = referenceTimestamp instanceof DateTime 
		? referenceTimestamp 
		: toDateTime(referenceTimestamp)

	const relativeDateTime = relativeTimestamp instanceof DateTime 
		? relativeTimestamp 
		: toDateTime(relativeTimestamp)

	const diffInDays = relativeDateTime.diff(referenceDateTime, 'days').days

	return Math.floor(diffInDays)
}

const calculateAverageDiffInDays = (posts, referenceTimestamp) => {
	if (referenceTimestamp === null) {
		return null
	}

	const differences = posts
		.map(post => getDateDiff(referenceTimestamp, post.postTimestamp))
		.filter(dayDifference => dayDifference !== null)

	// Return the average of the differences, or null if there are no valid differences
	return differences.length > 0 ? roundedAverage(differences, 2) : null
}

// Function to calculate the topic summary
const postStatistics = (posts, referenceTimestamp) => {
  const numberOfPosts = posts.length

  if (numberOfPosts === 0) {
    return {
      numberOfPosts: 0,
      medianWordCount: null,
      averageTimeDiff: null,
      firstReplyTimestamp: null,
      averageTimeDiffFromReference: null,
      averageTimeDiffFromFirst: null,
      averagePostsPerAuthor: null
    }
  }

  const firstReplyMS = Math.min(
    ...posts.map(
    post => post.postTimestamp
  ))

  const firstReplyTimestamp = DateTime.fromMillis(firstReplyMS, { zone: 'utc' });

  const wordCounts = posts.map(post => getWordCount(post.postMessage))
  const medianWordCount = round(median(wordCounts), 2)

  const postCountsByAuthor = posts.reduce((acc, post) => {
    acc[post.postAuthorId] = (acc[post.postAuthorId] || 0) + 1
    return acc
  }, {})

  const postCounts = Object.values(postCountsByAuthor)
  const averagePostsPerAuthor = roundedAverage(postCounts, 2)

  const averageTimeDiffFromReference = calculateAverageDiffInDays(posts, referenceTimestamp)
  const averageTimeDiffFromFirst = calculateAverageDiffInDays(posts, firstReplyTimestamp)

    
  return {
    numberOfPosts,
    medianWordCount,
    referenceTimestamp,
    firstReplyTimestamp,
    averageTimeDiffFromReference,
    averageTimeDiffFromFirst,
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
  convertToPacificTime,
  getDateDiff,
  getWordCount,
  toDateTime, 
  average,
  round,
  roundedAverage,
  formatNumberOutput
}
