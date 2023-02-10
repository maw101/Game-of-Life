import { 
    useCallback,
    useEffect,
    useState
} from 'react';
import './Game.css';

const CELL_SIZE = 25;
const GRID_WIDTH = 1000;
const GRID_HEIGHT = 1000;
const RUNNING_REFRESH_INTERVAL = 300;

const Game = () => {

    const rowCount = GRID_HEIGHT / CELL_SIZE;
    const columnCount = GRID_WIDTH / CELL_SIZE;

    const [simulationRunning, setSimulationRunning] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(0);

    const getCellCount = useCallback(() => {
        return rowCount * columnCount;
    }, [rowCount, columnCount]);

    const makeEmptyGrid = useCallback(() => {
        let grid = [];

        for (let cellIdx = 0; cellIdx < getCellCount(); cellIdx++) {
            grid[cellIdx] = false; // set to default value - inactive
        }

        return grid;
    }, [getCellCount]);

    const [grid, setGrid] = useState(makeEmptyGrid());

    const clearGrid = () => {
        setGrid(makeEmptyGrid());
    };

    const coordsToCellIdx = useCallback((row, column) => {
        return (column * columnCount) + row;
    }, [columnCount]);

    const cellIdxToCoords = useCallback((cellIdx) => {
        return {
            column: cellIdx % columnCount,
            row: Math.floor(cellIdx / rowCount),
        };
    }, [columnCount, rowCount]);

    const getActiveNeighboursCount = useCallback((grid, cellIdx) => {
        const cell = cellIdxToCoords(cellIdx);

        let count = 0;
        for (let xAdd = -1; xAdd <= 1; xAdd++) {
            for (let yAdd = -1; yAdd <= 1; yAdd++) {
                let x = cell.column + xAdd;
                let y = cell.row + yAdd;
                let candidateCellIdx = coordsToCellIdx(x, y);

                if (!(x === 0 && y === 0) && 
                    (x >= 0 && x < columnCount) && 
                    (y >= 0 && y < rowCount) && 
                    grid[candidateCellIdx])
                    count++;
            }
        }
        return count;
    }, [rowCount, columnCount, cellIdxToCoords, coordsToCellIdx]);

    const runIteration = useCallback(() => {
        let newGrid = makeEmptyGrid();
        
        /*
        Rules:
        1. Any live cell with fewer than two live neighbors dies, as if caused by under population.
        2. Any live cell with two or three live neighbors lives on to the next generation.
        3. Any live cell with more than three live neighbors dies, as if by overpopulation.
        4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
        */
       
        for (let cellIdx = 0; cellIdx < getCellCount(); cellIdx++) {
            let activeNeighouringCells = getActiveNeighboursCount(grid, cellIdx);

            if (grid[cellIdx]) {
                if (activeNeighouringCells === 2 || activeNeighouringCells === 3)
                    newGrid[cellIdx] = true;
                else
                    newGrid[cellIdx] = false;
            } else if (!grid[cellIdx] && activeNeighouringCells === 3) {
                newGrid[cellIdx] = true;
            }
        }
        
        setGrid(newGrid);
    }, [grid, setGrid, getActiveNeighboursCount, getCellCount, makeEmptyGrid]);
    
    useEffect(() => {
        if (refreshInterval && refreshInterval > 0) {
            const interval = setInterval(runIteration, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [refreshInterval, runIteration]);
    
    const runGame = () => {
        setSimulationRunning(true);
        setRefreshInterval(RUNNING_REFRESH_INTERVAL);
        runIteration();
    }
    
    const stopGame = () => {
        setSimulationRunning(false);
        setRefreshInterval(0);
    }

    const handleGridClick = (cellIdx) => {
        if ((cellIdx >= 0) && (cellIdx <= getCellCount())) {
            setGrid(oldGrid => {
                const newGrid = [...oldGrid];
                newGrid[cellIdx] = !newGrid[cellIdx];
                return newGrid;
            });
        }
    }

    const handleRandomActiveCells = () => {
        let newGrid = makeEmptyGrid();

        for (let cellIdx = 0; cellIdx < getCellCount(); cellIdx++) {
            if (Math.random() < 0.5)
                newGrid[cellIdx] = true; // make active
            else
                newGrid[cellIdx] = false; // make inactive
        }

        setGrid(newGrid);
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
            >
                {
                    grid.map((cell, cellIdx) => {
                        const { column, row } = cellIdxToCoords(cellIdx);
                        return (
                            <GridCell
                                column={column} row={row}
                                isActive={cell}
                                handleClickEvent={() => handleGridClick(cellIdx)}
                                key={`cell-${cellIdx}`}
                            />
                        );
                    })
                }
            </div>
        </div>
    );

}

const GridCell = (props) => {

    const { column, row, isActive, handleClickEvent } = props;

    return (
        <div 
            className={
                isActive ? "cell cell-active" : "cell cell-inactive"
            }
            style={{
                left: `${CELL_SIZE * column}px`,
                top: `${CELL_SIZE * row}px`,
                width: `${CELL_SIZE}px`,
                height: `${CELL_SIZE}px`,
            }}
            onClick={handleClickEvent}
        />
    );

}

export default Game;