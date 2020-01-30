const flatten = arr => arr.reduce((acc, cur) =>
  Array.isArray(cur)
    ? [...acc, ...cur]
    : [...acc, cur]
, [])

const flattenTopicAndReplies = discussions => {
  return discussions.reduce((acc, cur) => {
    const timestamp = cur.timestamp
    const authorId = cur.authorId
    const discussionId = cur.id
    const topicTitle = cur.topicTitle
    const topicMessage = cur.topicMessage

    acc.push({
      type: 'topic',
      timestamp,
      authorId,
      discussionId,
      topicTitle,
      topicMessage
    })

    flatten(cur.replies).forEach(reply => {
      acc.push({
        type: 'reply',
        timestamp: reply.timestamp,
        parentId: reply.parentId,
        authorId: reply.authorId,
        message: reply.message
      })
    })

    return acc
  }, [])
}

module.exports = {
  flatten,
  flattenTopicAndReplies
}
