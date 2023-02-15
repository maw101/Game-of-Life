# React Game of Life

## [Live Demo](https://maw101.github.io/Game-of-Life)

An implementation of [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) using React.

The game of life is a cellular automaton model which observes how cells evolve from an initial configuration of live and dead cells.

![](demo.gif)

## Update Transitions

At each iteration, the following transitions occur:
  1. Any live cell with fewer than two live neighbors dies, as if caused by under population.
  2. Any live cell with two or three live neighbors lives on to the next generation.
  3. Any live cell with more than three live neighbors dies, as if by overpopulation.
  4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.

