[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
# Canvas Discussion
This project pulls via the Canvas API the discussions from the specified Canvas course and exports it as CSV. The columns exported are:
* 'author_id',
* 'author_name',
* 'post_id',
* 'post_parent_id',
* 'discussion_topic_title',
* 'discussion_topic_message',
* 'post_message',
* 'count_of_likes',
* 'timestamp'

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for use with your own API tokens and Canvas domains.

### Prerequisites

1. **Install [Node 15 or greater](https://nodejs.org)**.
2. **Install [Git](https://git-scm.com/downloads)**.

### Installation and execution of script

1. Clone this repo. `git clone https://github.com/ubccapico/canvas-discussion.git`
1. Then cd into the repo. `cd canvas-discussion`
1. Run the installation script. `npm install` (If you see `babel-node: command not found`, you've missed this step.)
1. Generate Canvas API token and copy it to clipboard.
1. Create a `.env` file.
2. Add the following: `CANVAS_API_TOKEN={YOUR API TOKEN}` and `CANVAS_API_DOMAIN={YOUR API DOMAIN}`. An example `CANVAS_API_DOMAIN` is `https://{school}.instructure.com/api/v1`
3. Add your course ID to `index.js`, where it says: `//{course id} add course ID here!`
4. Run the script. `npm start`.
5. An `output.csv` file should be generated with discussion data in the output folder.

## Authors

* [justin0022](https://github.com/justin0022) -
**Justin Lee** &lt;justin.lee@ubc.ca&gt;

## License

This project is licensed under the GNU General Public License v3.0.
