const flatten = arr => arr.reduce((acc, cur) =>
  Array.isArray(cur)
    ? [...acc, ...cur]
    : [...acc, cur]
, [])

const escapeComment = comment => comment ? '"' + comment.replace(/"/g, "'") + '"' : ''

const stripHTML = comment => comment ? comment.replace(/(<([^>]+)>)/gi, "").replaceAll('&nbsp;', " ") : ''

module.exports = {
  flatten,
  escapeComment,
  stripHTML
}
