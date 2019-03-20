[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
# Canvas Discussion

This project pulls via the Canvas API the discussions from the specified Canvas course and exports it as CSV/JSON.

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for use with your own API tokens and Canvas domains.

### Prerequisites

1. **Install [Node 10 or greater](https://nodejs.org)**.
2. **Install [Git](https://git-scm.com/downloads)**.

### Installion and execution of script

1. Clone this repo. `git clone https://github.com/justin0022/canvas-discussion.git`
1. Then cd into the repo. `cd canvas-discussion`
1. Run the installation script. `npm install` (If you see `babel-node: command not found`, you've missed this step.)
1. Generate Canvas API token and copy it to clipboard.
1. Rename the `sample.env` file to `.env`, and add your API token to `CANVAS_API_TOKEN=`.
1. Add your course ID to `index.js`, where it says: `getDiscussions(/* add Canvas course id here */)`
1. Run the script. `npm start`.
1. An `output.csv` file should be generated with discussion data.