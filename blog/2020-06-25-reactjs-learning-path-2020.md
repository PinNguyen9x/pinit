---
slug: reactjs-basic-learning-path-2020
title: Basic ReactJS Learning Path for Beginners 2020 🥰
author: Pin Nguyen
tags: [reactjs, basic reactjs learning path]
date: '2024-07-29T12:00:00Z'
---

Learning ReactJS can be overwhelming due to its vast ecosystem and many concepts to grasp, from components and state management to routing and forms. This guide is designed to simplify the process, offering a structured path with curated resources, practical tips, and personal insights to help you confidently start your ReactJS journey. 😉

<!-- truncate-->

- **Target audience**: Beginners who don’t know where to start learning ReactJS.

- **Prerequisites**:
  - Basic JavaScript: [https://javascript.info/](https://javascript.info/)
  - ES6 syntax: [http://es6-features.org/#Constants](http://es6-features.org/#Constants)
  - Basic Git: Learn how to manage source code.
  - NPM (Node Package Manager): Understand what it is.
  - English (most documentation is in English).

If you don’t know what JavaScript is, I suggest learning JS first before jumping into ReactJS, to avoid feeling overwhelmed! 😉

## Basic Knowledge (MANDATORY)

**A FEW NOTES:**

- ReactJS is a `library` for building UI components, not a `framework`.
- What’s the difference between `library` and `framework`? Please Google to learn more.
- What’s the current version of ReactJS?
- Who or what organization created ReactJS?
- Why do we need ReactJS? Why not just use plain JavaScript?
- It may be a bit confusing when starting with ReactJS, but don’t worry, keep going! 😄

### 0. Set up your development environment

**What you need to start coding ReactJS:**

- Install [NodeJS](https://nodejs.org/en/) (a JavaScript runtime).
- Code editor: Use [VSCode](https://code.visualstudio.com/).
- Install some useful VSCode extensions (OPTIONAL):
  - Live Server
  - Material Theme Icons
  - Material Theme
  - Use Fira Code font
  - ReactJS code snippets
  - ESLint
  - Babel JavaScript
  - Bracket Pair Colorizer
- Start a project:
  - Use the `Create React App` tool to create a sample ReactJS project: [https://create-react-app.dev/docs/getting-started/](https://create-react-app.dev/docs/getting-started/)

Tada! At this point, you should have a simple ReactJS website running.  
Now, let’s start learning ReactJS! 😎

### 1. Foundational Knowledge

- Go through the Main Concepts section of ReactJS, starting here: [https://reactjs.org/docs/hello-world.html](https://reactjs.org/docs/hello-world.html).

> **Note**:
>
> - Don’t rush. Take your time to understand everything.
> - Learn step by step. Run the code in VSCode and see how it works to understand it.
> - If something is unclear, find blogs or videos on that topic for more explanation.

- After completing this section, try building a simple website you like:
  - `Todo App`: Add, delete, edit, and display a list of TODOS.
  - `Simple Cart`: Display a product list, add items to a cart, and calculate the total.
  - ...

> The goal here is to ensure you understand and can apply ReactJS concepts.

- Additionally, you can check out my videos for more clarity on ReactJS fundamentals: [https://www.youtube.com/playlist?list=PLeS7aZkL6GOsPo-bFZSNuu4VhYicRjlAq](https://www.youtube.com/playlist?list=PLeS7aZkL6GOsPo-bFZSNuu4VhYicRjlAq).

### 2. Type Checking

- This is OPTIONAL. Your code will run fine without it.
- Sometimes, you may see code like this:

```js
import PropTypes from 'prop-types'

function Item() {
  // ...
}

Item.propTypes = {
  data: PropTypes.object.isRequired,
  isSpecial: PropTypes.bool,
}

export default Item
```

- Notice the `Item.propTypes` part; whether it's there or not, your code will still run.

**So, what’s the point of Type Checking, and why should you consider adding it?**

- **Error warning when passing the wrong data type** during development. Sometimes, we might forget or overlook the type of data passed to a component, leading to incorrect calculations and unexpected results. With `Type Checking`, it will warn us to fix these issues early.
- Type Checking only works during development and doesn’t run in production, so it won’t affect performance.
- When your component grows and uses more props, this declaration helps you quickly identify which props the component uses. Without it, you’d have to scan through all the component code to figure that out. 😭

> Reference link: [https://reactjs.org/docs/typechecking-with-proptypes.html#proptypes](https://reactjs.org/docs/typechecking-with-proptypes.html)

### 3. Form

In real projects, developers rarely handle form-related issues manually. Instead, they use libraries. Here are some candidates:

- `React Hook Form` (recommended): the latest.
- `Formik`: the most popular.
- `Redux Form`: requires Redux 😉

You can choose one of these to learn and apply to your project. However, it’s recommended to stick with `React Hook Form` or `Formik`.

When working with forms, you’ll need a schema validator to validate form data. Here are two candidates:

- [Joi](https://hapi.dev/module/joi/api/)
- [Yup](https://github.com/jquense/yup): inspired by Joi.

**What to keep in mind when working with forms?**

- How to set the initial values for the form.
- How to structure the form. It’s essential to distinguish three levels:
  - **Form**: The library managing the form, like `Formik` or `react-hook-form`.
  - **Form Field**: Bridges the `form` values to the `UI control`.
  - **UI Control**: Controls from libraries like Bootstrap, Material Design, or AntDesign.
  - To understand this better, check out this video: [https://youtu.be/LuNYJuyQxKE](https://youtu.be/LuNYJuyQxKE)

### 4. Routing

- For this, you’ll use the `react-router-dom` package. 😄
- Reference documentation: [https://reacttraining.com/react-router/web/guides/quick-start](https://reacttraining.com/react-router/web/guides/quick-start)
- Simple routing setup in a project: [https://youtu.be/mAhUJdf0Kug](https://youtu.be/mAhUJdf0Kug)

Some things to keep in mind when working with routing:

- What steps are needed to set up routing in a project?
- Learn about Router, Switch, Route, and Redirect.
- How to set up nested routing? This is how to create a common layout in the parent component and render child components based on the child routing.

### 5. API

- API is the method for communication between the client and the server.
- Here are some options for making API calls:
  - [XHR](https://javascript.info/xmlhttprequest): a bit outdated, written in a callback style.
  - [Fetch](https://javascript.info/fetch): browser-native, written with Promises.
  - [Axios](https://github.com/axios/axios) (recommended): great for real-world projects.

**How to organize API modules in a real project?**

- Typically, API files are stored in a folder named `api`.
- Choose an HTTP client: usually `axios`. For smaller or simpler projects, `fetch` can work since it doesn’t require additional libraries. However, with axios, you’ll need to install the `axios` package.

```
api
|__ axiosClient.js or fetchClient.js: Configures the HTTP client and provides methods like get, post, put, ...
|__ productApi.js
|__ categoryApi.js
|__ userApi.js
|__ ... Each resource will have a corresponding API file 😉
```

- A video explaining this API module will be added soon.

### 6. Hooks

- Hooks were introduced to enhance Functional Components, even surpassing Class Components.
- I’ve created a simple, detailed series on hooks. You can check it out here: [https://www.youtube.com/playlist?list=PLeS7aZkL6GOsHNoyeEpeL8B1PnbKoQD9m](https://www.youtube.com/playlist?list=PLeS7aZkL6GOsHNoyeEpeL8B1PnbKoQD9m)

### 7. State Management

When handling state, ask these questions:

- If the state is only used in one component --> Use component state.
- If the state is shared across multiple components --> Use a state management library.

Currently, [Redux](https://redux.js.org/introduction/getting-started) is a strong contender for state management.

- Now, with [Redux Toolkit](https://redux-toolkit.js.org/), using Redux has become simpler, requiring less code and more built-in handling.
- It’s recommended to learn basic Redux first before diving into Redux Toolkit.

Recently, Facebook has been experimenting with a state management library for ReactJS called [Recoil](https://recoiljs.org/).

- Note that it’s still experimental, so avoid using it in production.
- I’ve created a few videos on Recoil. If you’re interested, feel free to check them out.

## Advanced Topics

### 1. HOC

- Reference: [https://reactjs.org/docs/higher-order-components.html](https://reactjs.org/docs/higher-order-components.html)

### 2. Authentication

This includes login, registration, forgot password, etc. Most projects have these features set up once and rarely revisit them since they’re quite complex.

Some big players can help with this:

- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Auth0](https://auth0.com/)

Make sure to read the documentation to understand these tools.

- Understand the login and registration flow.
- What is a token? Why is it needed? Can you manage without it?
- Will entering a username and password on the server expose the data during transit?
- Where should tokens be stored on the website?
- What if a token expires? How should it be handled?
- ...

### 3. I18n

- Google what i18n stands for.
- It’s used to support multiple languages. When you click on a language option, the website switches languages instantly.
- The recommended package is [React i18next](https://react.i18next.com/).
- It works with both Class and Functional Components (with hooks).
- Does every project require multilingual support? It depends, so determine this early and set it up at the start if needed.

### 4. Static Sites

- [React Static](https://github.com/react-static/react-static)
- [Gatsby](https://www.gatsbyjs.org/)
- [NextJS](https://nextjs.org/)

### 5. Deployment

How to deploy a website to a server to share your work.

- Check out this simple deployment method in the video:
- Full deployment options here: [https://create-react-app.dev/docs/deployment/](https://create-react-app.dev/docs/deployment/)

## Reference Materials

A comprehensive list of ReactJS-related libraries: [https://github.com/enaqx/awesome-react](https://github.com/enaqx/awesome-react). Feel free to explore. 😉

> **WARNING**: You might get lost due to the abundance of links. 🤣

The information in this post is based on personal experience, so there might be gaps. Please feel free to contribute and improve it.  
Thank you so much! ❤️
