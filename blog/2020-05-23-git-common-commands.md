---
slug: git-used-in-real-world-projects
title: Git - Commands Used from Receiving a Task to Creating a PR 🎉
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [JavaScript, TypeScript, NodeJS]
date: '2024-07-29T12:00:00Z'
image: https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&auto=format&fit=crop&q=80
---

Git offers many commands, but which ones are most commonly used in real-world projects? 🤔 As an essential tool for version control, Git helps track changes, collaborate with teams, and maintain code stability. Mastering key commands boosts productivity, reduces conflicts, and keeps the codebase clean. Let’s dive into these frequently used commands! 😉

<!-- truncate-->

## Agenda

## 0. Receiving a Task, for example, task ID 123

- Later, when you see a branch created with the number 123, you can assume it's the `taskId`.
- For example, in my team, we develop on the `develop` branch.

## 1. Get the latest code from the develop branch

```sh
git checkout develop # switch to the develop branch

git pull # lfetch the latest code
```

## 2. Work on the task directly on the develop branch

CODING CHANGES 😎
<br />After finishing your code, review your changes carefully and slowly.
<br />Review the coding conventions.
<br />Check if all console logs are removed.
<br />Verify if there are any redundant imports.
<br />Check for eslint issues.
<br />If there’s complex logic, add comments.
<br />If there’s too much if/else logic, refactor it.
<br />...
<br />Review your code in VSCode for better readability. If you want to look cool, use git diff and check instead! 😎
<br />Make it a habit to review your code thoroughly before handing it to your lead for review! 😉

## 3. Prepare to create a Pull Request (PR)

> After finishing your code, it’s time to prepare a PR.
> <br />However, while you were working, someone else might have updated the develop branch.
> <br />NSo, you must fetch the latest code from the develop branch before applying your changes.

```sh
git add . # stage all changes

git stash  # save all code changes to stash (temporary storage)

git pull  # fetch the latest code
```

## 4. Create a branch for your code changes

```sh
git checkout -b feature/123-add-address-ui
```

## 5. Retrieve your stashed code (saved earlier using git stash)

```sh
git stash pop
```

> OPTIONAL: Resolve conflicts if there are any. Remember to test again to ensure the code still works smoothly. 😅

## 6. Create a commit and write a commit message

```sh
git status # view the changed files
git add . # stage all changes

git commit -m "[123] Add address UI

- More details about your PR
- Keep it short and descriptive"
```

> 📝Note the yellow text:
> <br/> - The first line is the title.
> <br/> - The second line is empty (MANDATORY).
> <br/> - From the third line onward, provide additional details about your Pull Request.
> <br/> This convention helps automatically populate the title and description fields in GitHub, GitLab, Bitbucket, etc.

## 7. Push code to the remote repository (GitHub, GitLab, Bitbucket, etc.)

```sh
git push -u origin feature/123-address-ui
```

## Finally, create a PR/MR into the develop branch on the remote repository and request a lead review. Done! Hehe 😄

**📝NOTES**

- Each project may have different branch naming conventions; follow your team’s rules.
- The branch you work on also depends on the team; it’s not always `develop`.
- `Not everyone` follows the same process as mine; everyone has their own `style`.
- The process shared above is something I’ve applied during my career and found effective. I’m sharing it here for your reference; feel free to adapt it if you find it helpful. 😊

WISH YOU ALL GOOD HEALTH AND SUCCESSFUL LEARNING! ❤️
