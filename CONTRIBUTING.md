# Contributing

Thanks for wanting to make a contribution and wanting to improve this library for everyone! This repository uses Typescript so please continue to do so, you can always reach out in the repo or the [discord](https://pmnd.rs/discord)

## How to Contribute

1.  Fork and clone the repo
2.  Run `yarn install` to install dependencies
3.  Create a branch for your PR with `git checkout -b pr-type/issue-number-your-branch-name beta
4.  Let's get cooking! 👨🏻‍🍳🥓

## Commit Guidelines

Be sure your commit messages follow this specification: https://www.conventionalcommits.org/en/v1.0.0-beta.4/

## Publishing

We use `semantic-release-action` to deploy the package. Because of this only certain commits will trigger the action of creating a release:

- `fix:` will create a `0.0.x` version
- `feat:` will create a `0.x.0` version
- `BREAKING CHANGE:` will create a `x.0.0` version

We release on `master`, `beta` & `alpha`. `beta` & `alpha` are configured to be prerelease. Any other commits will not fire a release.
