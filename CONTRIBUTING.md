We love pull requests. Here's a quick guide:

- Fork the repo.

- Run the tests. We only take pull requests with passing tests, and it's great
to know that you have a clean slate: `npm test`.

- Add a test for your change. Only refactoring and documentation changes
require no new tests. If you are adding functionality or fixing a bug, we need
a test!

- Update the documentation, the surrounding one, examples elsewhere, guides,
whatever is affected by your contribution.

- Follow the conventions you see used in the source already. You may give a look
at `.eslintrc.yml`.

- Make the test pass with and without `CI` variable exported
(see enableRecordeMode).

- Push to your fork and submit a pull request (squashing the commits into one).


At this point you are waiting on us. We like to at least comment on, if not
accept, pull requests within three business days (and, typically, one business
day). We may suggest some changes or improvements or alternatives.
