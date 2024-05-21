const fs = require('fs')
const path = require('path')
const fswrite = fs.writeFileSync
const fsappend = fs.appendFileSync

const writeHeader = (pathToFile, header) => fswrite(pathToFile, header + '\r\n')
const append = (pathToFile, row) => fsappend(pathToFile, row + '\r\n')

const escapeComment = comment => comment ? '"' + comment.replace(/"/g, "'") + '"' : ''

const stripHTML = comment => comment ? comment.replace(/(<([^>]+)>)/gi, "").replaceAll('&nbsp;', " ") : ''

const writeToCSV = (courseId, data) => {
  const csv = path.join(__dirname, `output/${courseId}-discussion.csv`);

  const header = [
    'topic_id',
    'topic_title',
    'topic_message',
    'topic_author_id',
    'topic_author_name',
    'topic_timestamp',
    'reply_author_id',
    'reply_author_name',
    'reply_id',
    'reply_parent_id',
    'reply_message',
    'reply_likes',
    'reply_timestamp'
  ];

  writeHeader(csv, header);

  data.forEach(discussion => {
    const topicDetails = [
      discussion.topicId,
      stripHTML(escapeComment(discussion.topicTitle)),
      stripHTML(escapeComment(discussion.topicMessage)),
      discussion.topicAuthorId,
      escapeComment(discussion.topicAuthorName),
      discussion.topicCreatedAt
    ];

    if (Array.isArray(discussion.replies) && discussion.replies.length > 0) {
      discussion.replies.flat().forEach(reply => {
        append(csv, [
          discussion.topicId,
          stripHTML(escapeComment(discussion.topicTitle)),
          stripHTML(escapeComment(discussion.topicMessage)),
          discussion.topicAuthorId,
          escapeComment(discussion.topicAuthorName),
          discussion.topicCreatedAt,
          reply.postAuthorId,
          escapeComment(reply.postAuthorName),
          reply.postId,
          reply.postParentId,
          stripHTML(escapeComment(reply.postMessage)),
          reply.postLikes,
          reply.postTimestamp
        ]);
      });
    } else {
      append(csv, topicDetails);
    }
  });
};

module.exports = writeToCSV

