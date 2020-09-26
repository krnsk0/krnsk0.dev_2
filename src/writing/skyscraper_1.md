---
title: "Solving Every Skyscraper Puzzle: Part One"
host: "local"
date: 2019-07-14
description: "Puzzle-solving with constraint propagation and backtracking search in Javascript. Covers approach, architecture, and first three forms of inference."
word_count: 4441
permalink: "writing/skyscraper-puzzle-1/"
offsite_link: ""
---

<style>
td {border: none; padding: 0px; text-align: center; display: inline-block; margin: 1px; }
.md_table {margin: 5px auto; font-family: "IBM Plex Mono", monospace; text-align: center; border-collapse: separate;}
@media (max-width: 700px) {
    .md_table {
      font-size: 0.9em;
    }
}
.small td { width: 1.5em; height: 1.5em;}
.large td { width: 3em; height: 3em; padding-top: 0.75em;}
@media (max-width: 700px) {
    .large {
      font-size: 0.8em;
    }
}
.border {border: 1px solid #313131;}
.dark {background-color: rgb(230, 230, 235);}
.green {color: darkgreen;}
.red {color: red;}
</style>

A relative of Sudoku and other [Latin-Square](https://en.wikipedia.org/wiki/Latin_square)-derived puzzles, the [skyscraper](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/skyscrapers/rules) puzzle asks the player to place buildings of varying & unique heights on a grid so as to satisfy clues given on the grid's edges. These "edge clues" tell the player how many buildings are visible from the standpoint of a given clue's placement along the board's edge.

Taller skyscrapers block the visibility of shorter skyscrapers, but not vice versa. For example, in a 4x4 puzzle, a row with heights 2-4-3-1 has two skyscrapers visible from its left side, and three on its right side. Both would be valid clues a puzzle author could provide, for this row-- but notably, the starting point for a skyscraper puzzle need not provide clues for every side of each row and column. Often, the fewer clues given, the harder the puzzle.

This post walks through the use of [constraint propagation](https://en.wikipedia.org/wiki/Constraint_satisfaction), a technique dating to the era of [symbolic AI](https://en.wikipedia.org/wiki/Symbolic_artificial_intelligence), to model the inferential reasoning employed by skyscraper enthusiasts. While building a vocabulary of concepts to help us reason about the puzzle, we'll use Javascript to also build, first, an algorithm capable of solving _published_ puzzles of arbitrary size and difficulty without resorting to backtracking, and then build in backtracking to allow us to solve _all_ possible Skyscraper puzzles, full-stop.

## Approach

Why the caveat that we'll only at first be able to solve _published_ puzzles?

A valid skyscraper puzzle is a collection of clues which contain enough information to permit one and only one solution. Puzzle authors make a rule of only publishing puzzles which are not only valid, but which can be solved _without using guess-and-check_, the enthusiast's name for recursive backtracking search. Published puzzles thus ought to be solvable programmatically without backtracking provided we can imitate the way players think about the game.

When solving puzzles, enthusiasts typically alternate through applying several forms of inference to reason about the board, with skilled players deciding the sequence in which to employ these forms of inference according to some higher-order heuristics. Let's begin with these forms of inference.

1. Performed at the start of a game, **edge clue initialization** allows players to derive initial information about rows and columns starting from their clues, in some cases allowing us to determine the values of cells outright and in other cases allowing us to rule out certain values.

2. **Resolved cell constraint propagation** allows players, once a the value of a cell has been determined, to rule out that value for all cells in the resolved cell's row and column.

3. **Process of elimination** resolves a cell to a value when it is the only cell in a given row or column for whom said value has not been eliminated.

4. Finally, **clue elimination** allows players--having applied method (1) and iterated through some successive applications of methods (2) and (3)--to look back at clues to rule out values and resolve additional cells.

Beginners often start by learning to apply edge clue initialization, resolved cell constraint propagation, and process of elimination. Skilled players, in addition to an acquired mastery of these inferential techniques, are marked by two further characteristics: grasp of a sizable repertoire of patterns which allow rapid application of clue elimination, and a good "feel" for the order in which to iteratively apply techniques 2-4 to quickly solve a puzzle.

The algorithm we build up won't be able to model everything a sophisticated organic neural network brings to the skyscraper puzzle, but we'll get close. We'll alternate between describing forms of inference and implementing them, starting with edge clue initialization.

## Edge Clue Initialization: Approach

In a board of size N, a clue with value N allows us to resolve an entire row or column:

<table class="md_table small">
  <tbody>
    <tr>
      <td class="">5</td>
      <td class="border">1</td>
      <td class="border">2</td>
      <td class="border">3</td>
      <td class="border">4</td>
      <td class="border">5</td>
    </tr>
  </tbody>
</table>

A 1 clue allows us to resolve only the adjacent cell:

<table class="md_table small">
  <tbody>
    <tr>
      <td class="">1</td>
      <td class="border">5</td>
      <td class="border"> </td>
      <td class="border"> </td>
      <td class="border"> </td>
      <td class="border"> </td>
    </tr>
  </tbody>
</table>

While clues between 1 and N don't let us resolve cells, they do allow us to rule out some values. For example, on a 5x5 board, a 5 clue allows us to rule out 5, 4, and 3 for the adjacent cell: a 5 would block all other buildings, making only one visible where we need four; a 4 would allow for only one taller where we need three; and a 3 would allow for only two taller where we need three. For the second cell, a 4 clue lets us rule out 5 and 4: a 5 in that cell would mean a maximum of two buildings are visible and a 4 would mean a maximum of three are visible. Finally, for the third cell in, a 4 clue lets us rule out a building with a height of 5.

<table class="md_table small">
  <tbody>
    <tr>
      <td>5</td>
      <td class="border"></td>
      <td class="border"></td>
      <td class="border"></td>
      <td class="border"></td>
      <td class="border"></td>
    </tr>
    <tr>
      <td></td>
      <td class="red">5</td>
      <td class="red">5</td>
      <td class="red">5</td>
      <td class="green">5</td>
      <td class="green">5</td>
    </tr>
    <tr>
      <td></td>
      <td class="red">4</td>
      <td class="red">4</td>
      <td class="green">4</td>
      <td class="green">4</td>
      <td class="green">4</td>
    </tr>
    <tr>
      <td></td>
      <td class="red">3</td>
      <td class="green">3</td>
      <td class="green">3</td>
      <td class="green">3</td>
      <td class="green">3</td>
    </tr>
    <tr>
      <td></td>
      <td class="green">2</td>
      <td class="green">2</td>
      <td class="green">2</td>
      <td class="green">2</td>
      <td class="green">2</td>
    </tr>
    <tr>
      <td></td>
      <td class="green">1</td>
      <td class="green">1</td>
      <td class="green">1</td>
      <td class="green">1</td>
      <td class="green">1</td>
    </tr>
  </tbody>
</table>

In general, this rule can be expressed as follows. On an `N * N` board, for clues `c` where `1 < c < N`, where `d` is the distance from the edge counting from zero, we can cross off all values from `N - c + 2 + d` up to `N`, inclusive.

Given the above example, let's determine what to cross off for the _second_ cell over from our 5 clue. We're 1 cell from the edge, which is `d`; we know `c` is 5; and, we're on a 5x5 board, so `N` is 5. `N - c + 2 + d`, then, is 3. So we can cross off all values from 3 to 5, inclusive, for this cell. Call this the **edge constraint rule**. I won't walk through how it can be derived, but trust me that it works.

## First Steps

We'll need a data structure to represent the current state of our knowledge of possibilities for a cell. Arrays would work, but Javascript's Set object gets us some nice built-ins which will sweeten our syntax. Let's call this structure which represents remaining possibilities for a cell a **constraint list**.

```javascript
const constraintListFactory = N => {
  return new Set(Array.from({ length: N }, (_, i) => i + 1))
}
```

How to store our knowledge of possibilities for the entire board? We could use a multidimensional array, but operations that involve iterating the board will be simpler with an array of length `N * N`.

```javascript
const boardFactory = N => {
  return Array.from({ length: N * N }, () => constraintListFactory(N))
}
```

Let's plan on our top-level function accepting clues in the form of an array which starts from the top left and goes clockwise around the board. If we're given an array with length 16--say, `[0, 0, 1, 2, 0, 2, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0]`-- we'll know we have a 4x4 board that initially looks like this:

<table class="md_table small">
  <tbody>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td>1</td>
      <td>2</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="border"></td>
      <td class="border"></td>
      <td class="border"></td>
      <td class="border"></td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="border"></td>
      <td class="border"></td>
      <td class="border"></td>
      <td class="border"></td>
      <td>2</td>
    </tr>
    <tr>
      <td>1</td>
      <td class="border"></td>
      <td class="border"></td>
      <td class="border"></td>
      <td class="border"></td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="border"></td>
      <td class="border"></td>
      <td class="border"></td>
      <td class="border"></td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td>3</td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

Because we're choosing to store our board as a single-dimensional array, we'll need some helpers to allow us to access our data by row and column. Let's have these functions take in a row or column index, counting from zero in the top left, and return an array of indices pointing to the corresponding constraint lists. The caller will also need to pass in N, the size of the board.

```javascript
const getCellIndicesFromRowIndex = (rowIndex, N) => {
  return Array.from({ length: N }, (_, i) => {
    return rowIndex * N + i
  })
}

const getCellIndicesFromColIndex = (colIndex, N) => {
  return Array.from({ length: N }, (_, i) => {
    return colIndex + i * N
  })
}
```

It will also often be necessary to access rows and columns corresponding to a particular clue's index, so we'll need the rows and columns to be returned to us from the standpoint of that clue. That is, if we're in clue position 5 on a 4x4 board, we'll want to 'see' row zero, only in 'reverse' with respect to a coordinate system starting in the upper-left corner. Here's a function which wrangles returning the correct cell indices in the correct order for clues on all sides of the board:

```javascript
const getCellIndicesFromClueIndex = (clueIndex, N) => {
  if (clueIndex < N) {
    // top side
    return getCellIndicesFromColIndex(clueIndex, N)
  } else if (clueIndex >= N && clueIndex < 2 * N) {
    // right side
    return getCellIndicesFromRowIndex(clueIndex - N, N).reverse()
  } else if (clueIndex >= 2 * N && clueIndex < 3 * N) {
    // bottom side
    return getCellIndicesFromColIndex(3 * N - clueIndex - 1, N).reverse()
  } else if (clueIndex >= 3 * N && clueIndex < 4 * N) {
    // left side
    return getCellIndicesFromRowIndex(4 * N - clueIndex - 1, N)
  }
}
```

To get everything moving we'll need some top-level infrastructure, starting with a `solveSkyscraper` function that accepts clues and returns a solution. But how should we store and pass around our data? It would certainly be convenient to keep our board, clues, the value of `N`, and so on as globals rather than passing them in to our functions-- or at least convenient to keep them in the scope of our top-level function such that they don't need to be passed around, so much.

Once we get to the point where we need backtracking recursion, we'll need to avoid mutating state in the enclosing scope, as the bookkeeping to roll back mutations after a backtrack can become prohibitively complex. So we'll be writing some functions that can mutate state--those not involved in backtracking recursion--and others which cannot. We'll have to pay close attention to this distinction as we proceed.

In any case, to avoid having to pass too many extra arguments into our functions, let's condense the data into an object:

```js
const initializeState = clues => {
  return {
    N: clues.length / 4,
    board: boardFactory(clues.length / 4),
    clues,
  }
}
```

Storing `N` in our state object lets us avoid having to repeat `clues.length / 4` all over the place. We'll be adding more to this state object later, but this is a fine starting point. We can kick things off like this:

```js
const solveSkyscraper = clues => {
  let state = initializeState(clues)
  // todo
  return []
}
```

Now we're ready to start solving.

## Edge Clue Initialization: Code

To perform edge clue initialization, we'll need to iterate our clues, get the corresponding row and column indices, and cross off values based on the general form of our edge constraint rule. Let's combine what we've written so far, starting for `1 < c < N`:

```js
const performEdgeClueInitialization = state => {
  // mutates cell!
  const constrainCellWithClue = (cell, c, distance) => {
    const minimum = state.N - c + 2 + distance
    for (let i = minimum; i <= state.N; i += 1) {
      cell.delete(i)
    }
  }

  state.clues.forEach((c, clueIndex) => {
    // get some cells
    const cellIndices = getCellIndicesFromClueIndex(clueIndex, state.N)

    // apply the edge constraint rule
    if (1 < c && c < state.N) {
      cellIndices.forEach((cellIndex, distance) => {
        const cell = state.board[cellIndex]
        constrainCellWithClue(cell, c, distance)
      })
    }
    // resolve the first cell to N when the clue is 1
    else if (c === 1) {
      const cell = state.board[cellIndices[0]]
      cell.clear()
      cell.add(state.N)
    }
    // resolve the entire row when the clue is N
    else if (c === state.N) {
      cellIndices.forEach((cellIndex, distance) => {
        const cell = state.board[cellIndex]
        cell.clear()
        cell.add(distance + 1)
      })
    }
  })
}
```

First we define a helper, then iterate all of the clues, for `1 < c < N`. Then we apply the helper function to eliminate values ruled out by the clue in question. We don't need to deep clone and return our state object, here-- it's okay to mutate objects in the enclosing scope because we'll only initialize from edge clues once, and won't need to involve this code in recursion, later.

Now to go back and handle the special cases, `c === 1` and `c === N`, which allow us to completely resolve a cell and an entire row/column, respectively:

```js
// resolve the first cell to N when the clue is 1
else if (c === 1) {
  constraintLists[0].clear();
  constraintLists[0].add(state.N);
}
// resolve the entire row when the clue is N
else if (c === state.N) {
  constraintLists.forEach((cell, distance) => {
    cell.clear();
    cell.add(distance + 1);
  });
}
```

## Resolved Cell Constraint Propagation

What do we have so far? We can take an empty board and cross off values for some cells based on the clues. For many boards, we'll already have resolved some cells, either because of 1 or `N` clues, or because intersecting row/column edge constraints where `1 < c < N` have narrowed cells down to just one possibility.

If we were to write code to pretty-print the state for our 4x4 example, we'd get something like this:

<table class="md_table large">
  <tbody>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td>1</td>
      <td>2</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="border">1234</td>
      <td class="border">1234</td>
      <td class="border">4</td>
      <td class="border">123</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="border">1234</td>
      <td class="border">1234</td>
      <td class="border">1234</td>
      <td class="border">123</td>
      <td>2</td>
    </tr>
    <tr>
      <td>1</td>
      <td class="border">4</td>
      <td class="border">1234</td>
      <td class="border">123</td>
      <td class="border">1234</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="border">1234</td>
      <td class="border">1234</td>
      <td class="border">12</td>
      <td class="border">1234</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td>3</td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

The second form of inference--**constraint propagation**--starts from a resolved cell and rules out that value for all other cells in its row and column. Since we know that third cell in the first row is 4, we can eliminate of all of the remaining 4s in the "cross" formed by first row and third column.

<table class="md_table large">
  <tbody>
    <tr>
      <td class="border dark">123<span class="red">4</span></td>
      <td class="border dark">123<span class="red">4</span></td>
      <td class="border dark">4</td>
      <td class="border dark">123</td>
    </tr>
    <tr>
      <td class="border">1234</td>
      <td class="border">1234</td>
      <td class="border dark">123<span class="red">4</span></td>
      <td class="border">123</td>
    </tr>
    <tr>
      <td class="border">4</td>
      <td class="border">1234</td>
      <td class="border dark">123</td>
      <td class="border">1234</td>
    </tr>
    <tr>
      <td class="border">1234</td>
      <td class="border">1234</td>
      <td class="border dark">12</td>
      <td class="border">1234</td>
    </tr>
  </tbody>
</table>

To implement this programmatically, we'll first need a helper function that takes the index of a cell and returns the indices of all of all of the cells in its corresponding "cross."

```js
const getCrossIndicesFromCell = (state, cellIndex) => {
  const x = cellIndex % state.N
  const y = Math.floor(cellIndex / state.N)

  return [
    ...getCellIndicesFromColIndex(x, state.N),
    ...getCellIndicesFromRowIndex(y, state.N),
  ].filter(idx => idx !== cellIndex)
}
```

Next we'll need a function that, when called with a cell index, eliminates the resolved value from the constraint lists referenced by the results of `getCrossIndicesFromCell()`. We'll assume this function always gets called on a constraint list with just one value remaining and we'll use iterator syntax to access the remaining value in our set of constraints:

```js
const propagateFromResolvedCell = (originalState, cellIndex) => {
  let list = state.board[cellIndex]
  const valueToEliminate = list.values().next().value
  const crossIndices = getCrossIndicesFromCell(state, cellIndex)
  crossIndices.forEach(crossIndex => {
    state.board[crossIndex].delete(valueToEliminate)
  })
}
```

How to call this function? After applying the edge constraints, we can iterate our constraint lists and as soon as we find one with only a single element, call `propagateFromResolvedCell` on it:

```js
const propagateConstraints = state => {
  state.board.forEach((cell, cellIndex) => {
    if (cell.size === 1) {
      propagateFromResolvedCell(state, cellIndex)
    }
  })
}
```

## Implementing a Constraint Propagation Queue

This works for handling any cells that were resolved by the edge clue constraints. But what if propagating constraints from a resolved cell results in new resolved cells--that is, cells with only only one value not crossed off--such that we would want to propagate constraints from these cells, in turn?

We could just call `propagateConstraints` repeatedly until we notice that nothing changes from one iteration to the next, checking every cell each time for for `cell.size === 1`. But this is a lot of extra work as most cells won't have changed. Instead, let's check constraint list size right after modifying a cell in `propagateFromResolvedCell`, which ensures we only check cells that _have_ changed.

When we find that a cell which has just changed has `size === 1`, how should we kick off constraint propagation? We could recursively call `propagateFromResolvedCell`, but this could in some circumstances lead to code that's very difficult to step through, as our algorithm "chases" changes around the board, initiating new rounds of constraint propagation before completing prior rounds. It will be easier to reason about a "breadth first" approach in which each propagation operation finishes before initiating "child" propagation operations. To do this, let's add a `queue` key to our state which holds an array and set up `propagateConstraints` to use this queue. Inside `propagateFromResolvedCell`:

```js
crossIndices.forEach(crossIndex => {
  const cell = state.board[crossIndex]
  cell.delete(valueToEliminate)
  if (cell.size === 1) {
    state.queue.push(crossIndex)
  }
})
```

Inside `propagateConstraints`, let's add a while block after we iterate the board:

```js
while (state.queue.length) {
  propagateFromResolvedCell(state, state.queue.shift())
}
```

Now, having established this pattern, why bother having `propagateConstraints` iterate the board at all to check for `cell.size === 1`? We could add a size check and and enqueue operation to `performEdgeClueInitialization`, and have `propagateConstraints` be driven solely by the queue. But, we'd have to perform this size check for all three cases for `c` in `performEdgeClueInitialization`, each of which use slightly different methods to alter constraint lists. We need an abstraction around all of these methods versatile enough to handle not only the ways we modify constraint lists in the edge clue functions but also, hopefully, ways we might modify constraint lists in the future-- as we'll want to make sure we propagate constraints every time they change.

How to approach this? So far, we've used `Set.prototype.delete()` to eliminate individual values from cells, but have also used `.clear()` followed by `.add()` to quickly resolve a cell with multiple values in its constraint list to just a single value. This suggests two basic use cases: deleting a value, and deleting everything but a value. Since the latter is reducible to repeated applications of the former, let's treat `.delete()` as primitive:

```js
// mutates state.queue
// mutates state.board
const constrainAndEnqueue = (state, cellIndex, valueToDelete) => {
  const cell = state.board[cellIndex]

  let mutated = cell.delete(valueToDelete)

  if (mutated && cell.size === 1) {
    state.queue.push({
      type: "PROPAGATE_CONTSTRAINTS_FROM",
      cellIndex,
    })
  }

  if (mutated) {
    poeSearchAndEnqueue(state, cellIndex, valueToDelete)
  }
}

// mutates state.queue
// mutates state.board
const resolveAndEnqueue = (state, cellIndex, valueToResolveTo) => {
  for (let value of state.board[cellIndex]) {
    if (value !== valueToResolveTo) {
      constrainAndEnqueue(state, cellIndex, value)
    }
  }
}
```

After updating `performEdgeClueInitialization` and `propagateFromResolvedCell` to use these new function, where does this leave us? The program is capable of making inferences from edge clues and repeatedly propagating constraints from cells resolved in this process, drawing out all possible consequences from these two methods in combination.

Where does this get us with our example? After propagating constraints from the two 4 cells resolved by the edge clues, the board looks like this:

<table class="md_table large">
  <tbody>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td>1</td>
      <td>2</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="border">123</td>
      <td class="border">123</td>
      <td class="border">4</td>
      <td class="border">123</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="border">123</td>
      <td class="border">1234</td>
      <td class="border">123</td>
      <td class="border">123</td>
      <td>2</td>
    </tr>
    <tr>
      <td>1</td>
      <td class="border">4</td>
      <td class="border">123</td>
      <td class="border">123</td>
      <td class="border">123</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="border">123</td>
      <td class="border">1234</td>
      <td class="border">12</td>
      <td class="border">1234</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td>3</td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

We can't get any farther without introducing a third form of inference.

## Process of Elimination

**Process of elimination** allows the player to resolve a cell to a value when that value is no longer present in any other cells in either that cell's row or column. That is: if a given cell's constraint list shows a 4 as a possibility for itself, but no other cells show a four in its row or column, we know that the cell in question _must_ be the 4 in its row and column.

For instance, in the example we've been working with, the absence of a 4 in all cells of row two except the second allows us to resolve that cell to 4:

<table class="md_table large">
  <tbody>
    <tr>
      <td class="border">123</td>
      <td class="border">123</td>
      <td class="border">4</td>
      <td class="border">123</td>
    </tr>
    <tr>
      <td class="border dark">123</td>
      <td class="border dark">123<span class="border">4</span></td>
      <td class="border dark">123</td>
      <td class="border dark">123</td>
    </tr>
    <tr>
      <td class="border">4</td>
      <td class="border">123</td>
      <td class="border">123</td>
      <td class="border">123</td>
    </tr>
    <tr>
      <td class="border">123</td>
      <td class="border">1234</td>
      <td class="border">12</td>
      <td class="border">1234</td>
    </tr>
  </tbody>
</table>

How to implement PoE? We don't want to replicate the design we optimized away in kicking off constraint propagation, in which we iteratively scanned the entire board for some pattern or criteria. We'll want to call PoE function right after we mutate our data, which will make sure we run PoE all and only when necessary. Described from the top down, we'll need a function which:

1. Takes in a value that has just been crossed off a constraint list for a given cell
2. Gets the row indices for the modified cell
3. Filters this list to just those cells which still contain the value in question
4. If this list has just one index left, resolve the cell pointed to by the index to the value in question
5. Repeats steps (2)-(4) for the mutated cell's column, instead of its row.

We'll get some "false positives" in step four whenever we kick off PoE after resolving a cell to a single value, but as `constrainAndEnqueue` is idempotent with respect to both the board and queue, this is no problem.

We'll need helpers to get row and cell indices from a cell index:

```js
const getRowIndicesFromCellIndex = (state, cellIndex) => {
  const y = Math.floor(cellIndex / state.N)
  return [...getCellIndicesFromRowIndex(y, state.N)].filter(
    idx => idx !== cellIndex
  )
}

const getColIndicesFromCellIndex = (state, cellIndex) => {
  const x = cellIndex % state.N
  return [...getCellIndicesFromColIndex(x, state.N)].filter(
    idx => idx !== cellIndex
  )
}
```

Now to wire things up:

```js
const poeCellSearch = (state, modifiedCellIndex, deletedValue) => {
  const rowIndices = getRowIndicesFromCellIndex(state, modifiedCellIndex)
  const colIndices = getColIndicesFromCellIndex(state, modifiedCellIndex)
  const results = []

  ;[rowIndices, colIndices].forEach(cellIndices => {
    let filteredIndices = cellIndices.filter(index => {
      return state.board[index].has(deletedValue)
    })

    if (filteredIndices.length === 1) {
      results.push(poeCellIndex)
    }
  })
}
```

Here we're returning an array of cell indices which are resolvable to the `deletedValue` passed in to `poeCellSearch`. All we'll need to do next after calling `poeCellSearch` is iterate this array, resolving the cell pointed to by each index.

But here we run in to a problem. We want to run `poeCellSearch` inside `constrainAndEnqueue`, the abstraction we wrapped around `Set.prototype.delete()` for our constraint lists. But PoE will need to call `constrainAndEnqueue` so that we properly draw out consequences from cells resolved through PoE, which again can put us in the position of "chasing" changes around the board with an increasingly deep call stack-- which will make debugging challenging.

We need to interrupt this potential runaway chain of function calls by having our PoE functions enqueue rather than perform the work they discover. Right now `poeCellSearch` returns an array of cells to resolve; perhaps instead of a return we can push to the queue inside of `poeCellSearch`. But, here we'd be enqueueing a different kind of entity than what currently lives in `state.queue`, which right now is a list of newly-resolved cell indices from which constraints need to be propagated.

That is: `state.queue` is currently used to schedule future _post-cell-mutation_ work; what we're now talking about enqueueing is _cell mutation_, itself. We could create separate queues for these types of work and empty them out each in sequence inside `propagateConstraints`, but it would make debugging easier if scheduled work executed in exactly the order it was scheduled.

Instead of enqueueing cell IDs, let's pass the queue objects which tell `propagateConstraints` what kind of work to perform. In fact, we should start by renaming `propagateConstraints`, which now does more than this; let's call it `queueProcessor`.

Next, we'll modify `constrainAndEnqueue` to pass an object into the queue with a `type` property where previously we'd just passed in a cell index:

```js
if (mutated && cell.size === 1) {
  state.queue.push({ type: "PROPAGATE_CONTSTRAINTS_FROM", idxToConstrain })
}
```

Now we need a branching structure in `queueProcessor`:

```js
const queueProcessor = state => {
  while (state.queue.length) {
    const action = state.queue.shift()
    if (action.type === `PROPAGATE_CONTSTRAINTS_FROM`) {
      propagateFromResolvedCell(state, action.cellIndex)
    } else {
      // todo
    }
  }
}
```

Next, let's set up `poeCellSearch` to push to the queue. We're probably due for a re-name, here, as well; let's call it `poeSearchAndEnqueue`:

```js
// mutates state.queue
const poeSearchAndEnqueue = (state, modifiedCellIndex, deletedValue) => {
  const rowIndices = getRowIndicesFromCellIndex(state, modifiedCellIndex)
  const colIndices = getColIndicesFromCellIndex(state, modifiedCellIndex)

  ;[rowIndices, colIndices].forEach(cellIndices => {
    let filteredIndices = cellIndices.filter(index => {
      return state.board[index].has(deletedValue)
    })

    if (filteredIndices.length === 1) {
      resolveAndEnqueue(state, filteredIndices[0], deletedValue)
    }
  })
}
```

Then, inside of `constrainAndEnqueue`, we just need to call `poeSearchAndEnqueue` to run after we mutate a cell:

```js
if (mutated) {
  poeSearchAndEnqueue(state, idxToConstrain, valueToDelete)
}
```

Lastly, we need to add a new case inside of `queueProcessor`:

```js
if (action.type === `PROPAGATE_CONTSTRAINTS_FROM`) {
  propagateFromResolvedCell(state, action.cellIndex)
} else if (action.type === "RESOLVE_CELL_TO_VALUE") {
  resolveAndEnqueue(state, action.cellIndex, action.resolveToValue)
}
```

## Next Steps

Where does all of this code get us? After constraining the board with clues, propagating these constraints, and applying PoE, we're in a position to resolve a few cells in the 4x4 example we've been working with:

<table class="md_table large">
  <tbody>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td>1</td>
      <td>2</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="border">123</td>
      <td class="border">123</td>
      <td class="border">4</td>
      <td class="border">123</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="border">123</td>
      <td class="border">4</td>
      <td class="border">123</td>
      <td class="border">123</td>
      <td>2</td>
    </tr>
    <tr>
      <td>1</td>
      <td class="border">4</td>
      <td class="border">123</td>
      <td class="border">123</td>
      <td class="border">123</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="border">123</td>
      <td class="border">123</td>
      <td class="border">12</td>
      <td class="border">4</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td>3</td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

Skilled puzzle-solvers often begin by resolving the position of the tallest tower in each row. That our approach also ends up doing this is an early indicator that we're accurately modeling how players approach the game.

An experienced player might next notice that the 2 clue on the top allows us to resolve its adjacent cell to 3, now that we know the last cell in its column is 4, as any other value would result in more than two buildings being visible from the standpoint of the clue. This is a characteristic example of inference which incorporates information from both the clue and from constraints already set on the board.

In the next [installment](/writing/skyscraper-puzzle-2), we'll try to abstractly characterize this form of inference and translate these abstractions into Javascript.
