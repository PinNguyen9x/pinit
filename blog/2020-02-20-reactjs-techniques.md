---
slug: reactjs-techniques-hooks
title: Reactjs - Techniques useEffect & useLayoutEffect hooks
author: Pin Nguyen
tags: [reactjs, useEffect, useEffect]
date: '2024-07-29T12:00:00Z'
---

useEffect and useLayoutEffect are both hooks in React that are used to handle side effects in functional components. However, they have different timing for when they are executed within the component lifecycle.

<!-- truncate-->

## Differences Between `useEffect` and `useLayoutEffect`

### `useEffect`

- **Timing**: Runs asynchronously after the render is committed to the screen. This means that the DOM is updated before the side effects are executed.
- **Use Cases**: Ideal for side effects that do not need to interfere with the layout or visual presentation of the component, such as fetching data, subscribing to events, or setting up timers.
- **Execution Steps**:
  1. **Render Phase**: React calculates the changes needed to the DOM based on the component's state and props.
  2. **Commit Phase**: React commits the changes to the actual DOM.
  3. **Paint Phase**: The browser paints the updated DOM to the screen.
  4. **useEffect Execution**: After the paint phase, `useEffect` runs asynchronously, ensuring that the DOM is already updated and visible on the screen.

### `useLayoutEffect`

- **Timing**: Runs synchronously after all DOM mutations but before the browser paints the screen. This means that the effect is executed before the screen is updated, making it useful for measuring layout or changing the layout before it is visible to the user.
- **Use Cases**: Ideal for operations that need to read or modify the DOM layout, such as measuring elements or making style adjustments before the browser paints the new layout to the screen.
- **Execution Steps**:
  1. **Render Phase**: React calculates the changes needed to the DOM based on the component's state and props.
  2. **Commit Phase**: React commits the changes to the actual DOM.
  3. **useLayoutEffect Execution**: Immediately after the DOM updates, `useLayoutEffect` runs synchronously.
  4. **Paint Phase**: The browser paints the updated DOM to the screen after `useLayoutEffect` has run.

### Key Differences

- **Execution Timing**:

  - `useEffect` runs after the render and paint, ensuring the DOM changes are visible before executing the side effects.
  - `useLayoutEffect` runs before the paint, allowing for synchronous changes to the DOM that will be reflected immediately when the browser paints.

- **Blocking Nature**:
  - `useEffect` does not block the paint and runs asynchronously.
  - `useLayoutEffect` blocks the browser from painting until the effect is run, which can cause performance issues if used incorrectly.

### Visual Representation

```text
Rendering Phase:
---------------------------------------------------------
| 1. Virtual DOM Calculations | React Render Phase     |
---------------------------------------------------------
Committing Phase:
---------------------------------------------------------
| 2. DOM Updates Committed    | React Commit Phase     |
---------------------------------------------------------
useLayoutEffect:
---------------------------------------------------------
| 3. useLayoutEffect Runs     | Before Paint           |
---------------------------------------------------------
Painting Phase:
---------------------------------------------------------
| 4. Browser Paints Screen    | Browser Paint Phase    |
---------------------------------------------------------
useEffect:
---------------------------------------------------------
| 5. useEffect Runs           | After Paint            |
---------------------------------------------------------
```
