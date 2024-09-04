const fs = require('fs')
const path = require('path')

const flatten = arr => arr.reduce((acc, cur) =>
  Array.isArray(cur)
    ? [...acc, ...cur]
    : [...acc, cur]
, [])

const escapeComment = comment => comment ? '"' + comment.replace(/"/g, "'") + '"' : ''
const stripHTML = comment => comment ? comment.replace(/(<([^>]+)>)/gi, "").replace(/&nbsp;/g, " ") : ''
const writeHeader = (pathToFile, headers) => fs.writeFileSync(pathToFile, headers.join(',') + '\r\n')
const appendRow = (pathToFile, row) => fs.appendFileSync(pathToFile, row.join(',') + '\r\n')

// Word count function
const getWordCount = (str) => {
  const cleanStr = str.replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
  return cleanStr.trim().split(/\s+/).length
}

// Median word count
const median = (arr) => {
  const sorted = arr.slice().sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

module.exports = {
  flatten,
  escapeComment,
  stripHTML,
  writeHeader,
  appendRow,
  getWordCount,
  median
}
