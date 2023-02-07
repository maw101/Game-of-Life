import { 
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';
import './Game.css';

const CELL_SIZE = 15;
const GRID_WIDTH = 900;
const GRID_HEIGHT = 900;

const Game = () => {

    const rowCount = GRID_HEIGHT / CELL_SIZE;
    const columnCount = GRID_WIDTH / CELL_SIZE;

    
    const [cells, setCells] = useState([]);
    const [simulationRunning, setSimulationRunning] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(0);

    const gridLocation = useRef(null);

    const makeEmptyGrid = useCallback(() => {
        let grid = [];
        for (let row = 0; row < rowCount; row++) {
            grid[row] = []; // create an array for each row
            for (let column = 0; column < columnCount; column++) {
                grid[row][column] = false; // set to default value - inactive
            }
        }
        return grid;
    }, [rowCount, columnCount]);

    const [grid, setGrid] = useState(makeEmptyGrid());

    const makeCellsArray = useCallback(() => {
        let cells = [];
        for (let row = 0; row < rowCount; row++) {
            for (let column = 0; column < columnCount; column++) {
                if (grid[row][column])
                    cells.push({column, row}); // if active in grid, add to the cells array
            }
        }
        return cells;
    }, [grid, rowCount, columnCount]);

    const clearGrid = () => {
        setGrid(makeEmptyGrid());
        setCells([]);
    };

    const getActiveNeighboursCount = useCallback((grid, xPos, yPos) => {
        let count = 0;
        for (let xAdd = -1; xAdd <= 1; xAdd++) {
            for (let yAdd = -1; yAdd <= 1; yAdd++) {
                let x = xPos + xAdd;
                let y = yPos + yAdd;

                if (!(x === 0 && y === 0) && 
                    (x >= 0 && x < columnCount) && 
                    (y >= 0 && y < rowCount) && 
                    (grid[y][x]))
                    count++;
            }
        }
        return count;
    }, [rowCount, columnCount]);

    const runIteration = useCallback(() => {
        let newGrid = makeEmptyGrid();
        
        /*
        Rules:
        1. Any live cell with fewer than two live neighbors dies, as if caused by under population.
        2. Any live cell with two or three live neighbors lives on to the next generation.
        3. Any live cell with more than three live neighbors dies, as if by overpopulation.
        4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
        */
       
       for (let row = 0; row < rowCount; row++) {
           for (let column = 0; column < columnCount; column++) {
                let activeNeighouringCells = getActiveNeighboursCount(grid, column, row);

                if (grid[column][row]) {
                    if (activeNeighouringCells === 2 || activeNeighouringCells === 3)
                    newGrid[column][row] = true;
                    else
                    newGrid[column][row] = false;
                } else if (!grid[column][row] && activeNeighouringCells === 3) {
                    newGrid[column][row] = true;
                }
            }
        }
        
        setGrid(newGrid);
        setCells(makeCellsArray());
    }, [grid, setGrid, setCells, columnCount, getActiveNeighboursCount, makeCellsArray, makeEmptyGrid, rowCount]);
    
    useEffect(() => {
        if (refreshInterval && refreshInterval > 0) {
            const interval = setInterval(runIteration, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [refreshInterval, runIteration]);
    
    const runGame = () => {
        setSimulationRunning(true);
        setRefreshInterval(200);
        runIteration();
    }
    
    const stopGame = () => {
        setSimulationRunning(false);
        setRefreshInterval(0);
    }

    const getElementOffset = () => {
        // get size of element and position relative to viewpoint
        const rect = gridLocation.getBoundingClientRect();
        const doc = document.documentElement;

        return {
            x: (rect.left + window.pageXOffset) - doc.clientLeft,
            y: (rect.top + window.pageYOffset) - doc.clientTop,
        };
    }

    const handleGridClick = (event) => {
        const elementOffset = getElementOffset();
        const offsetX = event.clientX - elementOffset.x;
        const offsetY = event.clientY - elementOffset.y;
        
        const x = Math.floor(offsetX / CELL_SIZE);
        const y = Math.floor(offsetY / CELL_SIZE);

        if ((x >= 0 && x <= columnCount) && (y >= 0 && y <= rowCount)) {
            grid[y][x] = !grid[y][x]; // 
        }

        setCells(makeCellsArray());
    }

    const handleRandomActiveCells = () => {
        for (let row = 0; row < rowCount; row++) {
            for (let column = 0; column < columnCount; column++) {
                if (Math.random() < 0.5)
                    grid[column][row] = true; // make active
                else
                    grid[column][row] = false; // make inactive
            }
        }

        setCells(makeCellsArray());
    }

    return ( 
        <div> 
            <div id="form">
                {
                    simulationRunning ?
                        <button onClick={stopGame}>Stop Game</button> :
                        <button onClick={runGame}>Run Game</button>
                }
                <button onClick={handleRandomActiveCells}>Random Active</button>
                <button onClick={clearGrid}>Clear Grid</button>
            </div>
            <div id="grid"
                style={
                    {
                        width: GRID_WIDTH,
                        height: GRID_HEIGHT,
                        backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
                    }
                } 
                onClick={handleGridClick} 
                ref={(loc) => { gridLocation.current = loc; }}
            >

                {cells.map(cell => (
                        <GridCell xCoord={cell.column} yCoord={cell.row} key={`${cell.column},${cell.row}`}/>
                ))}
            </div>
        </div>
    );

}

const GridCell = (props) => {

    const { xCoord, yCoord } = props;

    return (
        <div className="cell" style={{
            left: `${CELL_SIZE * xCoord + 1}px`,
            top: `${CELL_SIZE * yCoord + 1}px`,
            width: `${CELL_SIZE - 1}px`,
            height: `${CELL_SIZE - 1}px`,
        }} />
    ); // takes into account the grids lines with +- 1px value // TODO: look into this?

}

export default Game;