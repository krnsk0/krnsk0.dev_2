---
title: "Solving Every Skyscraper Puzzle: Part Two"
host: "local"
date: 2019-07-19
description: "Puzzle-solving with constraint propagation and backtracking search in Javascript. Covers clue elimination using sequence filtration, a form of constrained search."
word_count: 4184
permalink: "writing/skyscraper-puzzle-2/"
offsite_link: ""
---

<style>
td {border: none; padding: 0px; text-align: center; display: inline-block; margin: 1px; }
.md_table {margin: 5px auto; font-family: "Roboto Mono", monospace; text-align: center; border-collapse: separate;}
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
.smalltext .border {
  font-size: 1em;
  padding-top: 0.1em;
  line-height: 22px;
}
@media (max-width: 700px) {
  .smalltext {
    line-height: 15px;
    font-size: 0.3em;
  }
  .smalltext .border {
    line-height: 12px;
  }
}
.border {border: 1px solid #313131;}
.dark {background-color: rgb(230, 230, 235);}
.green {color: darkgreen;}
.red {color: red;}
.sequence-list {font-family: var(--monospace-font); display: flex; flex-direction: column; align-items: center; }

</style>

The [last post](/writing/skyscraper-puzzle-1) in this series described and implemented three forms of inference applicable to a [Skyscrapers](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/skyscrapers) puzzle board. In combination, **edge clue initialization**, **resolved-cell constraint propagation**, and **process of elimination** allowed us to draw out all consequences from an initial look at a puzzle's edge clues:

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

In this post, we'll implement our final form of inference, **clue elimination**, using a technique we'll call **sequence filtration**, giving our program the capacity to solve every valid, published Skyscraper puzzle.

## Clue Elimination Examples

The last post concluded with the observation that an an experienced player might next notice that the 2 clue on the top of the board allows the resolution of its adjacent cell. Given that we know the position of the 4 in the last column, the adjacent cell must be 3, as any other value would result in more than two buildings being visible from the standpoint of the clue.

Though this is the only such observation to be made at this point on _this_ board, not all such observations, generally, need begin with a 2 clue across from a resolved cell with value `N`. Consider this row:

<table class="md_table large">
  <tbody>
    <tr>
      <td>3</td>
      <td class="border">2</td>
      <td class="border">13</td>
      <td class="border">4</td>
      <td class="border">13</td>
      <td></td>
    </tr>
  </tbody>
</table>

Here, the three clue combined with the constraints already in place are enough to allow us to resolve the entire row, as only the sequence `2-3-4-1` satisfies the clue.

We've already hinted at a way to generalize about our first case: 2-clues in rows or columns with a cell resolved to `N` allow us to resolve an adjacent cell to `N - 1`. For being so simple, this "2-clue rule" seems like a very good candidate for a constraint we can hard-code to allow us to advance further. Are there other such rules we might discover?

Looking at the second case, we might say: "with the first and the third cells resolved, the clue insists on a value for the second." This seems like it might generally applicable. But what if the second and fourth were resolved instead of the first and third? What if the gap between resolved cells were larger than one cell? When does the clue allow us to resolve cells in relation to the height of the cells on either side of the gap? And how to state answers to each of these questions in terms of a board with size `N`?

While perhaps not impossible to answer these questions concerning a potential "gap rule", we will find that the questions compound as `N` grows-- and as we consider other possible variations on the theme of inference enabled by clues on a constrained row. Every rule must be given a highly-general specification, in order to allow us to apply it to boards of any size. And, the larger the size of the board, the greater the opportunity to discover more (and more complex) patterns.

Indeed, internet guides to the game are [filled with home-spun wisdom](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/skyscrapers/techniques) concerning heuristics like the 2-clue and gap rules. But, while experienced players may have great facility in describing and applying such heuristics, their capacity to reason about clue constraints is hardly exhausted such rules-- since players, it seems, are also capable of _discovering_ them.

This tends to suggest we are not operating at a high enough level of generality in attempting to describe clue constraint inference as potentially exhausted by a set of rules, patterns, or heuristics, no matter how (finitely) large. We need a way to characterize or model the form of reasoning which is common to and underwrites _all_ such rules and heuristics.

## Clue Elimination: Approach

In developing our fist three forms of inference, so far we have considered constraining the board principally on a cell-by-cell basis, even when taking row and column information into account.

But this isn't the only way to think about what values are or are not possible for cells. Clues principally rule out _sequences_ of values for their rows or columns. If two or more cells are unknown, a clue may not tell us much about these cells in isolation, but it can rule out certain _combinations_ of values for these cells, considered together.

This insight makes available to us a powerful mechanism for generalizing about clue elimination. If for every remaining possible sequence for a row or column, the clues rule out _all but_ one or more values for a cell, we can resolve the cell to these values.

That is, suppose we make a list of possible sequences not yet eliminated by our constraints, for a given row or column. Then suppose we filter this list according to which sequences are permitted by clues. We may not yet be able to resolve the entire row--that is, multiple sequences might remain--but if we find that _all remaining sequences_ show just a single value, for a cell, then we know that the cell in question _must_ resolve to this value.

We'll call this technique **sequence filtration**. How does it work? Taking the example from the 4x4 board we've been working with:

<table class="md_table large">
  <tbody>
    <tr>
      <td>2</td>
    </tr>
    <tr>
      <td class="border">123</td>
    </tr>
    <tr>
      <td class="border">123</td>
    </tr>
    <tr>
      <td class="border">123</td>
    </tr>
    <tr>
      <td class="border">4</td>
    </tr>
  </tbody>
</table>

First we'll need to generate a list of valid sequences for these cells-- that is, sequences which don't contain repeated values and which are allowed by the clues:

<div class="sequence-list">
<span>1-3-2-4</span>
<span>1-2-3-4</span>
<span>2-3-1-4</span>
<span>2-1-3-4</span>
<span>3-2-1-4</span>
<span>3-1-2-4</span>
</div>

Now let's filter out those sequences which don't satisfy the two clue:

<div class="sequence-list">
<span>3-2-1-4</span>
<span>3-1-2-4</span>
</div>

While we haven't resolved the entire row, we can effectively rule out all values except 3 for the first cell.

Though somewhat trivial, sequence filtration also captures what happens in our second example:

<table class="md_table large">
  <tbody>
    <tr>
      <td>3</td>
      <td class="border">2</td>
      <td class="border">13</td>
      <td class="border">4</td>
      <td class="border">13</td>
      <td></td>
    </tr>
  </tbody>
</table>

Here, just two sequences are possible: 2-1-4-3 and 2-3-4-1. Only the latter satisfies the constraints, and we can resolve not one but two cells in this row.

Importantly, there will be cases--especially in larger boards--where clue elimination via sequence filtration may not yet allow us to resolve cells completely but will still will allow us to pare down constraint lists. If for the first cell in a row a filtered sequence list shows only two possibilities where we had more possibilities listed, we're justified in constraining the cell to only these two possibilities, since no valid sequences for the row or column contain the other values.

In this way, even where sequence filtration can't resolve cells outright, it can help whittle away at the constraint lists until we can resolve cells. Iterating through this edge constraint technique will, for valid and publishable puzzles, converge toward a solution.

## Is Sequence Filtration "Cheating"?

It might be objected at this point that in using this technique we veer too close to the guess-and-check methodology which we swore off when deciding to attempt to solve the puzzle in something like the way a person might.

While it is indeed the case that all single-row, single-column rules and heuristics can be adequately modeled via sequence filtration, applying rules and heuristics when solving a puzzle does not at all "feel" like generating hundreds of sequences and eliminating those which cannot satisfy clues. More often it involves reasoning about just a few cells whose properties match some rule and then using the results of this reasoning to constrain a row or column.

But in each an every case what we are doing is still best described as applying sequence filtration. In learning about the 3-4-5 right triangle, we might memorize a rule which allows us to fill in a missing side given the two other sides and a ninety degree angle in the correct configuration. Even if we don't know the pythagorean theorem, and even if our "experience" of reasoning about triangles does not involve the "experience" of applying the pythagorean theorem, it remains the case that we are applying the pythagorean theorem. And what holds for 3-4-5 triangle rules in relation to the pythagorean theorem holds for skyscraper heuristics, rules, and patterns, and their relationship to sequence filtration.

Whatever we think of this argument by analogy, this question can in any case be left to philosophers and psychologists, as there is another important _conceptual_ distinction which shows that sequence filtration is within the bounds of the approach we initially delineated. There is a difference between a guess-and-check technique which takes place _within_ a row or column and a _backtracking_ guess-and-check which involves making assumptions about one row or column and tracing out its consequences to find contradictions elsewhere on the board. And this distinction is a just a restatement of what marks off published from merely valid puzzles-- which is just how we specified our problem, to start with.

## Sequence Filtration: Performance

This distinction between single-row/column and board-wide techniques has substantial performance implications. Even if backtracking search were limited to only valid magic squares, the number of combinations to be tested against the clues exhibits a time complexity much worse than `O(N!)`: there are 880 valid 4x4s, 275305224 valid 5x5s, roughly 1.77 \* 10<sup>16</sup> valid 5x5s, and the number of `NxN` magic squares for arbitrary `N > 5` remains an unsolved problem in mathematics.

Of course, our backtracking search space will be highly constrained by edge clues, which is what will make backtracking a viable if sometimes painfully slow means of solving even unpublished puzzles. But this is of a different order than the _merely factorial_ worst-case time complexity of in filtering all possible sequences for a row.

It's not often we find that factorial time complexity represents a preferable alternative to some other more time-complex approach, but that is exactly where we are. Despite being preferable to backtracking, repeated application of sequence filtration will prove to be a bottleneck, and it may be useful to think about improving its performance, at least for some cases.

Indeed, we've already considerably optimized sequence filtration through the _prior_ application of edge clue initialization. Edge-clue initialization is really a special case of the problem we solve with sequence filtration, albeit one in which we begin with a completely unconstrained row or column and derive all information solely from edge clues.

That is, the general rule we applied in pushing edge constraints to cells is no different from any of the other rules or heuristics which we're _avoiding_ having to hard-code through the application of sequence filtration. Indeed, if we wanted to, we could replace edge clue initialization with clue elimination-- but at some cost to performance.

We'll demonstrate the advantages of this particular optimization later. But enough talk; let's write some code.

## Sequence Filtration: Code

First we'll need a function which, when given a list of a row or column's constraint list cells, can return an array of all possible sequences using the values which remain in the constraint lists. This is easiest with recursion:

```js
const makeAllUniqueSequences = constraintLists => {
  let results = []
  function helper(arr, i) {
    for (let value of constraintLists[i]) {
      let copy = arr.slice()
      if (arr.includes(value)) continue
      copy.push(value)

      if (i === constraintLists.length - 1) {
        results.push(copy)
      } else {
        helper(copy, i + 1)
      }
    }
  }
  helper([], 0)
  return results
}
```

Next we'll need a way to filter out sequences which violate a row or column's clues. We'll write two functions. One, `countVisible`, takes in a sequence tells us how many buildings are visible, "looking" at the sequence starting from its first element. Then, we'll need another function `passClueCheck`, which is effectively just a runner for `countVisible` which checks its result against a clue, albeit with the caveat that if it is not passed a clue (that is, a clue with value zero, as we have chosen to symbolize the absence of a clue in this way) it should always return `true`.

```js
const countVisible = sequence => {
  let visible = 0
  let max = 0
  sequence.forEach(value => {
    if (value > max) {
      visible += 1
      max = value
    }
  })
  return visible
}

const passClueCheck = (sequence, clue) => {
  if (clue === 0) return true
  return clue === countVisible(sequence)
}
```

This last `passClueCheck` function can be used to filter the results of `makeAllUniqueSequences`. We'll need to filter the sequence lists twice-- once for each clue. Here's a function that goes from cell indices & clue indices to unique sequences:

```js
const generatePossibleSequences = (
  state,
  cellIndices,
  clueIdxOne,
  clueIdxTwo
) => {
  return makeAllUniqueSequences(
    cellIndices.map(cellIndex => state.board[cellIndex])
  )
    .filter(sequence => passClueCheck(sequence, state.clues[clueIdxOne]))
    .filter(sequence =>
      passClueCheck(sequence.slice().reverse(), state.clues[clueIdxTwo])
    )
}
```

To solve a puzzle we'll need to repeatedly iterate this function over rows and columns. As we have functions which go from clue indices to rows and because we filter against both clues for a row or column, a convenient way to do this is just to iterate through the first half of the clue indices, from `0` to `2 * N - 1`. To make this work, we'll need a helper that can get the opposing clue index, provided an index in this range:

```js
const getOppositeClueIndex = (clueIndex, N) => {
  if (clueIndex < N) return 3 * N - 1 - clueIndex
  else if (clueIndex < 2 * N) return 4 * N - (clueIndex - N) - 1
}
```

Once we get a list of filtered sequences, we'll need to figure out what values remain as possibilities for each cell in the row or column and then modify our constraint lists to reflect any new information. First we'll use `Set()` inside a reducer to figure out which values remain in a given cell in our filtered sequences. Then, we'll compare the values in this new `set` instance to our constraint list, calling `constrainAndEnqueue` to push constraints to the data:

```js
const reconcileConstraints = (state, cellIndices, sequences) => {
  cellIndices.forEach((cellIndex, idx) => {
    const newConstraintList = sequences.reduce((set, sequence) => {
      set.add(sequence[idx])
      return set
    }, new Set())

    state.board[cellIndex].forEach(currentConstraint => {
      if (!newConstraintList.has(currentConstraint)) {
        constrainAndEnqueue(state, cellIndex, currentConstraint)
      }
    })
  })
}
```

We're now in a position to bring things together. First, we get cell indices corresponding to the clue in question. Then, we generate filtered sequence lists for the clue in question. Next, we reconcile what we've learned with our constraint lists, and lastly we empty out the PoE/propagation queue.

```js
// mutates state.board
// mutates state.queue
const edgeConstrainFromClue = (state, clueIndex) => {
  edgeConstrainIterations += 1
  // only accepts clueIndices on the top or right of the board!
  const cellIndices = getCellIndicesFromClueIndex(clueIndex, state.N)
  const filteredSequences = generatePossibleSequences(
    state,
    cellIndices,
    clueIndex,
    getOppositeClueIndex(clueIndex, state.N)
  )
  reconcileConstraints(state, cellIndices, filteredSequences)
  queueProcessor(state)
}
```

All that remains is to set up a means to iterate clues `0` through `N * 2 - 1` until the puzzle is solved. We'll first need a helper to check if the puzzle is solved; we can determine this by adding up the number of values which remain in every constraint list and seeing if the total is equal to `N ^ 2`:

```js
const isPuzzleSolved = state => {
  return (
    state.board.reduce((acc, cell) => acc + cell.size, 0) === state.N * state.N
  )
}
```

Finally, we can iterate the code we've written over our clues:

```js
const iterateEdgeConstraints = state => {
  let clueIndex = 0
  while (!isPuzzleSolved(state)) {
    edgeConstrainFromClue(state, clueIndex)

    clueIndex += 1
    if (clueIndex === state.N * 2) clueIndex = 0
  }
}
```

Calling this function inside our top-level function after running edge clue initialization is enough to solve our 4x4:

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
      <td class="border">2</td>
      <td class="border">1</td>
      <td class="border">4</td>
      <td class="border">3</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="border">3</td>
      <td class="border">4</td>
      <td class="border">1</td>
      <td class="border">2</td>
      <td>2</td>
    </tr>
    <tr>
      <td>1</td>
      <td class="border">4</td>
      <td class="border">2</td>
      <td class="border">3</td>
      <td class="border">1</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="border">1</td>
      <td class="border">3</td>
      <td class="border">2</td>
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

## Sequence Filtration: Optimization

The program we've written is not particularly taxing for a puzzle as small as this. On my 2015 laptop it finishes in under 50ms. A larger puzzle can help us better understand the program's performance; here is a challenging 7x7:

<table class="md_table small">
  <tbody>
  <tr>
    <td> </td>
    <td> </td>
    <td>2</td>
    <td>3</td>
    <td> </td>
    <td>2</td>
    <td> </td>
    <td> </td>
    <td> </td>
  </tr>
  <tr>
    <td> </td>
    <td class="border">7</td>
    <td class="border">6</td>
    <td class="border">2</td>
    <td class="border">1</td>
    <td class="border">5</td>
    <td class="border">4</td>
    <td class="border">3</td>
    <td>5</td>
  </tr>
  <tr>
    <td>4</td>
    <td class="border">1</td>
    <td class="border">3</td>
    <td class="border">5</td>
    <td class="border">4</td>
    <td class="border">2</td>
    <td class="border">7</td>
    <td class="border">6</td>
    <td> </td>
  </tr>
  <tr>
    <td> </td>
    <td class="border">6</td>
    <td class="border">5</td>
    <td class="border">4</td>
    <td class="border">7</td>
    <td class="border">3</td>
    <td class="border">2</td>
    <td class="border">1</td>
    <td>4</td>
  </tr>
  <tr>
    <td> </td>
    <td class="border">5</td>
    <td class="border">1</td>
    <td class="border">7</td>
    <td class="border">6</td>
    <td class="border">4</td>
    <td class="border">3</td>
    <td class="border">2</td>
    <td>5</td>
  </tr>
  <tr>
    <td> </td>
    <td class="border">4</td>
    <td class="border">2</td>
    <td class="border">1</td>
    <td class="border">3</td>
    <td class="border">7</td>
    <td class="border">6</td>
    <td class="border">5</td>
    <td> </td>
  </tr>
  <tr>
    <td> </td>
    <td class="border">3</td>
    <td class="border">7</td>
    <td class="border">6</td>
    <td class="border">2</td>
    <td class="border">1</td>
    <td class="border">5</td>
    <td class="border">4</td>
    <td>4</td>
  </tr>
  <tr>
    <td> </td>
    <td class="border">2</td>
    <td class="border">4</td>
    <td class="border">3</td>
    <td class="border">5</td>
    <td class="border">6</td>
    <td class="border">1</td>
    <td class="border">7</td>
    <td> </td>
  </tr>
  <tr>
    <td> </td>
    <td>6</td>
    <td> </td>
    <td> </td>
    <td> </td>
    <td>2</td>
    <td>4</td>
    <td> </td>
    <td> </td>
  </tr>
</tbody>
</table>

This one gets solved in under 100ms. Not bad-- but we need some better metrics. A flame graph shows (as predicted) that the program spends most of its time inside `generatePossibleSequences`.

Threading some variables through our functions, we can track some performance characteristics on the top level. To solve this 7x7, the program generates and filters 3680 sequences and runs clue constraints for one or another clue 59 times.

We might be able to improve these metrics by changing the order in which we iterate the edge clues when performing clue elimination.

When players look through the board for patterns which allow cell resolution, they often apply a practiced capacity to judge which portions of a board they ought to try and resolve first in order to most quickly resolve the whole. It will be very difficult for us to model just how human players approach this kind of optimization. But it won't be difficult to optimize the order in we perform clue eliminations so as to minimize the number of sequences we need to consider: we simply need to iterate the clues according to which rows or columns will require us to consider the least number of sequences in hopes that doing so will let us take possibilities off of the board.

By re-sorting in this manner after we've gone through all fo the rows, we can push off or eliminate the possibility that we'll need to run a costly round of clue elimination on a row which would require consideration of hundreds or thousands of sequences. It will be possible to construct puzzles that confound this technique, especially for large values `N`, but for most cases it should improve runtime.

To implement our optimizations, we'll need to be able to count remaining values in a row or column:

```js
const countRemainingValues = (state, clueIndex) => {
  return getCellIndicesFromClueIndex(clueIndex, state.N).reduce(
    (total, cellIndex) => {
      return total + state.board[cellIndex].size
    },
    0
  )
}
```

Next we'll need to generate a sorted array of clue indices using this function as a comparator:

```js
const getSortedClueIndices = state => {
  return Array.from({ length: state.N * 2 }, (_, i) => i).sort((a, b) => {
    return countRemainingValues(state, a) - countRemainingValues(state, b)
  })
}
```

Now we need to rewrite `iterateEdgeConstraints` to re-sort the indices after it finishes running through them:

```js
const iterateEdgeConstraints = state => {
  let sortedClueIndices = getSortedClueIndices(state)

  let i = 0
  while (!isPuzzleSolved(state)) {
    edgeConstrainFromClue(state, sortedClueIndices[i])

    i += 1
    if (i === state.N * 2) {
      i = 0
      sortedClueIndices = getSortedClueIndices(state)
    }
  }
}
```

This gets us down to 2053 generated sequences, from 3680-- something of an improvement. It turns out that a good proportion of these combinations are in fact from the program purposelessly generating combinations for rows without clues, at all. An early return in `edgeConstrainFromClue` when both clues are zero solves this:

```js
if (
  state.clues[clueIndex] === 0 &&
  state.clues[getOppositeClueIndex(clueIndex, state.N)] === 0
) {
  return
}
```

This brings us down to 1546 generated sequences. Further inspection reveals that we're also rechecking combinations for rows and columns which haven't changed since the last time they were checked. Some simple (if a bit hacked-together) memoization in the sequence generator helps trim off a few more combinations:

```js
const memo = {}
const makeAllUniqueSequences = rowOrColumn => {
  const args = JSON.stringify(rowOrColumn)
  if (memo[args]) return memo[args]

  let results = []

  function recursiveHelper(arr, i) {
    for (let value of rowOrColumn[i]) {
      let copy = arr.slice()
      if (arr.includes(value)) continue
      copy.push(value)

      if (i === rowOrColumn.length - 1) {
        results.push(copy)
      } else {
        recursiveHelper(copy, i + 1)
      }
    }
  }
  recursiveHelper([], 0)

  memo[args] = results
  return results
}
```

Now we're at 1490 generated sequences, and runtime on my laptop is back in the region of 50ms-- about a 60% improvement, at least for this puzzle. We could conceivably take things much further with a smarter comparator function for sorting clue indices, but we already have a reasonable runtime for small `N` and we can always return to this question if, after implementing backtracking, we end up with problems.

We had mentioned that edge-clue initialization is really just a special case of clue elimination beginning from a fresh, unconstrained row. Now that we've implemented sequence filtration, we can think of edge-clue initialization as essentially a form of optimization which simply constrains the search performed via the sequence filtration technique. But how much of an optimization is it?

Commenting out `performEdgeClueInitialization` inside our top-level function allows us to discover an answer to this question. The puzzle is still solved, but this time some 12000 sequences need to be generated (taking well above 100ms). Paradoxically, the 7x7 is solved in only 38 iterations through edge clues as opposed to the 50+ iterations required to solve it with edge-clue initialization enabled, and similar behavior is exhibited on other puzzles of various sizes. If you have ideas about why this happens, let me know-- my best guess is that with a fresh board the spread of remaining-value counts between unsolved rows and columns is much larger than it is for an edge-clue-constrained board, which permits the sort-based optimization we performed above to do more work, despite the comparatively larger number of sequences which must be considered. But I haven't yet found a good way to test this theory.

## Next Steps

Our program now has the capacity to solve all valid, published skyscraper puzzles for arbitrary N using an efficient technique based on constraint propagation and search. What our program cannot yet do is solve valid but unpublishable puzzles--that is, puzzles whose clues permit one and only one unique solution, but which cannot be solved without cross-row/cross-column guess-and-check. Here is one such puzzle discovered programmatically by CodeWars user [Medved01](https://www.codewars.com/users/medved01):

<table class="md_table small">
  <tbody>
  <tr>
    <td> </td>
    <td>3</td>
    <td>3</td>
    <td>2</td>
    <td>1</td>
    <td>2</td>
    <td>2</td>
    <td>3</td>
    <td> </td>
  </tr>
  <tr>
    <td>3</td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td>4</td>
  </tr>
  <tr>
    <td>2</td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td>3</td>
  </tr>
  <tr>
    <td>5</td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td>2</td>
  </tr>
  <tr>
    <td>2</td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td>4</td>
  </tr>
  <tr>
    <td>4</td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td>1</td>
  </tr>
  <tr>
    <td>1</td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td>4</td>
  </tr>
  <tr>
    <td>3</td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td class="border"></td>
    <td>2</td>
  </tr>
  <tr>
    <td></td>
    <td>2</td>
    <td>3</td>
    <td>5</td>
    <td>4</td>
    <td>1</td>
    <td>4</td>
    <td>2</td>
    <td> </td>
  </tr>
</tbody>
</table>

The program we've written so far loops infinitely within `iterateEdgeConstraints`. Breaking the loop reveals the following board state:

<table class="md_table large smalltext">
  <tbody>
  <tr>
    <td> </td>
    <td>3</td>
    <td>3</td>
    <td>2</td>
    <td>1</td>
    <td>2</td>
    <td>2</td>
    <td>3</td>
    <td> </td>
  </tr>
  <tr>
    <td>3</td>
    <td class="border">12</td>
    <td class="border">13</td>
    <td class="border">12345</td>
    <td class="border">7</td>
    <td class="border">6</td>
    <td class="border">45</td>
    <td class="border">34</td>
    <td>4</td>
  </tr>
  <tr>
    <td>2</td>
    <td class="border">6</td>
    <td class="border">4</td>
    <td class="border">7</td>
    <td class="border">12345</td>
    <td class="border">125</td>
    <td class="border">12</td>
    <td class="border">23</td>
    <td>3</td>
  </tr>
  <tr>
    <td>5</td>
    <td class="border">12</td>
    <td class="border">23</td>
    <td class="border">34</td>
    <td class="border">6</td>
    <td class="border">1234</td>
    <td class="border">7</td>
    <td class="border">5</td>
    <td>2</td>
  </tr>
  <tr>
    <td>2</td>
    <td class="border">5</td>
    <td class="border">7</td>
    <td class="border">6</td>
    <td class="border">1234</td>
    <td class="border">1234</td>
    <td class="border">124</td>
    <td class="border">123</td>
    <td>4</td>
  </tr>
  <tr>
    <td>4</td>
    <td class="border">34</td>
    <td class="border">123</td>
    <td class="border">35</td>
    <td class="border">12345</td>
    <td class="border">12345</td>
    <td class="border">6</td>
    <td class="border">7</td>
    <td>1</td>
  </tr>
  <tr>
    <td>1</td>
    <td class="border">7</td>
    <td class="border">6</td>
    <td class="border">234</td>
    <td class="border">12345</td>
    <td class="border">12345</td>
    <td class="border">35</td>
    <td class="border">1234</td>
    <td>4</td>
  </tr>
  <tr>
    <td>3</td>
    <td class="border">34</td>
    <td class="border">5</td>
    <td class="border">12</td>
    <td class="border">1234</td>
    <td class="border">7</td>
    <td class="border">123</td>
    <td class="border">6</td>
    <td>2</td>
  </tr>
  <tr>
    <td></td>
    <td>2</td>
    <td>3</td>
    <td>5</td>
    <td>4</td>
    <td>1</td>
    <td>4</td>
    <td>2</td>
    <td> </td>
  </tr>
</tbody>
</table>

If you try solving this puzzle by hand beginning from this state, you'll discover that all information which can be gleaned from the clues when examining cells, rows, and columns in isolation has already been pushed to the board. To make further progress it's necessary to make assumptions about nearly-solved cells which must then be tested through constraint propagation and process-of-elimination to see if they produce empty constraint lists elsewhere on the board. In the next installment, we'll add a recursive backtracking mechanism to the program to allow us to handle such cases.
