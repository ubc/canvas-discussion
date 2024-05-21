[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
# Canvas Discussion
This project pulls via the Canvas API the discussions from the specified Canvas course and exports it as CSV. The columns exported are:
* 'topic_id',
* 'topic_title',
* 'topic_message',
* 'topic_author_id',
* 'topic_author_name',
* 'topic_timestamp',
* 'post_author_id',
* 'post_author_name',
* 'post_id',
* 'post_parent_id',
* 'post_message',
* 'post_likes',
* 'post_timestamp'

Where a `topic` corresponds to a `discussion_topic` and `post` refers to replies to the `discussion_topic`. If a `discussion_topic` has no posts then you will see the `topic_` columns filled with no corresponding `post_` data. A `post` may have a `post_parent_id ` if it is part of a threaded response.

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for use with your own API tokens and Canvas domains.

### Prerequisites

1. **Install [Node 10 or greater](https://nodejs.org)**.
1. **Install [Git](https://git-scm.com/downloads)**.

### Installation and execution of script

1. Clone this repo. `git clone https://github.com/ubccapico/canvas-discussion.git`
1. Then cd into the repo. `cd canvas-discussion`
1. Run the installation script. `npm install` (If you see `babel-node: command not found`, you've missed this step.)
1. Generate Canvas API token and copy it to clipboard.
1. Create a `.env` file.
1. Add the following: `CANVAS_API_TOKEN={YOUR API TOKEN}` and `CANVAS_API_DOMAIN={YOUR API DOMAIN}`. An example `CANVAS_API_DOMAIN` is `https://{school}.instructure.com/api/v1`
1. Add your course ID to `index.js`, where it says: `//{course id} add course ID here!` For example, if my course_id was 1001, The last lines of `index.js` should change from

```
Promise.all([
  /*enter course ids here*/
].map(courseId => getDiscussions(courseId)
  .then(discussions => writeToCSV(courseId, discussions))
))
```

to

```
Promise.all([
  1001
].map(courseId => getDiscussions(courseId)
  .then(discussions => writeToCSV(courseId, discussions))
))
```
1. Run the script. `npm start`.
1. A `{course_id}-discussion.csv` file should be generated with discussion data in the output folder for each provided course_id.

## Authors

* [justin0022](https://github.com/justin0022) -
**Justin Lee** &lt;justin.lee@ubc.ca&gt;

## License

This project is licensed under the GNU General Public License v3.0.
