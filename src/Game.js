import React from 'react';
import './Game.css';

const CELL_SIZE = 15;
const GRID_WIDTH = 900;
const GRID_HEIGHT = 900;

class Game extends React.Component {

    constructor() {
        super();
        this.rowCount = GRID_HEIGHT / CELL_SIZE;
        this.columnCount = GRID_WIDTH / CELL_SIZE;
        this.grid = this.makeEmptyGrid();
    }

    state = {
        cells: [],
        simulationRunning: false,
        refreshInterval: 200,
    }

    runGame = () => {
        this.setState({simulationRunning: true});
        this.runIteration();
    }

    stopGame = () => {
        this.setState({simulationRunning: false});
        if (this.timeoutHandler) {
            window.clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }
    }

    runIteration() {
        let newGrid = this.makeEmptyGrid();

        /*
        Rules:
            1. Any live cell with fewer than two live neighbors dies, as if caused by under population.
            2. Any live cell with two or three live neighbors lives on to the next generation.
            3. Any live cell with more than three live neighbors dies, as if by overpopulation.
            4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
        */

        for (let row = 0; row < this.rowCount; row++) {
            for (let column = 0; column < this.columnCount; column++) {
                let activeNeighouringCells = this.getActiveNeighboursCount(this.grid, column, row);
                console.log(activeNeighouringCells);
                if (this.grid[column][row]) {
                    if (activeNeighouringCells === 2 || activeNeighouringCells === 3)
                        newGrid[column][row] = true;
                    else
                        newGrid[column][row] = false;
                } else if (!this.grid[column][row] && activeNeighouringCells === 3) {
                    newGrid[column][row] = true;
                }

            }
        }

        this.grid = newGrid;
        this.setState({cells: this.makeCellsArray()});
        this.timeoutHandler = window.setTimeout(() => {this.runIteration();}, this.state.refreshInterval);
    }


    getActiveNeighboursCount(grid, xPos, yPos) {
        let count = 0;
        for (let xAdd = -1; xAdd <= 1; xAdd++) {
            for (let yAdd = -1; yAdd <= 1; yAdd++) {
                let x = xPos + xAdd;
                let y = yPos + yAdd;

                if (!(x === 0 && y === 0) && 
                    (x >= 0 && x < this.columnCount) && 
                    (y >= 0 && y < this.rowCount) && 
                    (grid[y][x]))
                    count++;
            }
        }
        return count;
    }

    makeEmptyGrid() {
        let grid = [];
        for (let row = 0; row < this.rowCount; row++) {
            grid[row] = []; // create an array for each row
            for (let column = 0; column < this.columnCount; column++) {
                grid[row][column] = false; // set to default value - inactive
            }
        }
        return grid;
    }

    makeCellsArray() {
        let cells = [];
        for (let row = 0; row < this.rowCount; row++) {
            for (let column = 0; column < this.columnCount; column++) {
                if (this.grid[row][column])
                    cells.push({column, row}); // if active in grid, add to the cells array
            }
        }
        return cells;
    }

    getElementOffset() {
        // get size of element and position relative to viewpoint
        const rect = this.gridLocation.getBoundingClientRect(); 
        const doc = document.documentElement;

        return {
            x: (rect.left + window.pageXOffset) - doc.clientLeft,
            y: (rect.top + window.pageYOffset) - doc.clientTop,
        };
    }

    handleGridClick = (event) => {
        const elementOffset = this.getElementOffset();
        const offsetX = event.clientX - elementOffset.x;
        const offsetY = event.clientY - elementOffset.y;
        
        const x = Math.floor(offsetX / CELL_SIZE);
        const y = Math.floor(offsetY / CELL_SIZE);

        if ((x >= 0 && x <= this.columnCount) && (y >= 0 && y <= this.rowCount)) {
            this.grid[y][x] = !this.grid[y][x]; // 
        }

        this.setState({cells: this.makeCellsArray()});
    }

    handleNewRefreshInterval = (changeEvent) => {
        this.setState({refreshInterval: changeEvent.target.value});
    }

    handleRandomActiveCells = () => {
        for (let row = 0; row < this.rowCount; row++) {
            for (let column = 0; column < this.columnCount; column++) {
                if (Math.random() < 0.5)
                    this.grid[column][row] = true; // make active
                else
                    this.grid[column][row] = false; // make inactive
            }
        }
        this.setState({cells: this.makeCellsArray()});
    }

    render() {
        const {cells, simulationRunning} = this.state;

        return ( 
            <div> 
                <div id="form">
                    {
                        simulationRunning ?
                            <button onClick={this.stopGame}>Stop Game</button> :
                            <button onClick={this.runGame}>Run Game</button>
                    }
                    <button onClick={this.handleRandomActiveCells}>Random Active</button>
                </div>
                <div id="grid"
                    style={
                        {
                            width: GRID_WIDTH,
                            height: GRID_HEIGHT,
                            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
                        }
                    } 
                    onClick={this.handleGridClick} 
                    ref={(loc) => { this.gridLocation = loc; }}>

                    {cells.map(cell => (
                            <GridCell xCoord={cell.column} yCoord={cell.row} key={`${cell.column},${cell.row}`}/>
                        ))}
                </div>
            </div> );
    }

}

class GridCell extends React.Component {

    render() {
        const {xCoord ,yCoord} = this.props; // takes value of spread attribute to make the passing of properties easier
        return (
            <div className="cell" style={{
                left: `${CELL_SIZE * xCoord + 1}px`,
                top: `${CELL_SIZE * yCoord + 1}px`,
                width: `${CELL_SIZE - 1}px`,
                height: `${CELL_SIZE - 1}px`,
            }} />
        ); // takes into account the grids lines with +- 1px value
    }

}

export default Game;