import { 
    useCallback,
    useEffect,
    useState
} from 'react';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import CasinoIcon from '@mui/icons-material/Casino';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import './css/Grid.css';
import GridCell from './GridCell';

const Grid = () => {

    const CELL_SIZE = 25;
    const GRID_WIDTH = 1000;
    const GRID_HEIGHT = 1000;
    const RUNNING_REFRESH_INTERVAL = 300;

    const rowCount = GRID_HEIGHT / CELL_SIZE;
    const columnCount = GRID_WIDTH / CELL_SIZE;

    const [simulationRunning, setSimulationRunning] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(0);

    const getCellCount = useCallback(() => {
        return rowCount * columnCount;
    }, [rowCount, columnCount]);

    const makeEmptyGrid = useCallback(() => {
        const grid = [];

        for (let cellIdx = 0; cellIdx < getCellCount(); cellIdx++) {
            grid[cellIdx] = false; // set to default value - inactive
        }

        return grid;
    }, [getCellCount]);

    const [grid, setGrid] = useState(makeEmptyGrid());

    const coordsToCellIdx = useCallback((row, column) => {
        return (column * columnCount) + row;
    }, [columnCount]);

    const cellIdxToCoords = useCallback((cellIdx) => {
        return {
            column: cellIdx % columnCount,
            row: Math.floor(cellIdx / rowCount),
        };
    }, [columnCount, rowCount]);

    const isCellCoordActive = useCallback((x, y) => {
        const candidateCellIdx = coordsToCellIdx(x, y);

        return !(x === 0 && y === 0) && 
                (x >= 0 && x < columnCount) && 
                (y >= 0 && y < rowCount) &&
                grid[candidateCellIdx];
    }, [grid, columnCount, rowCount, coordsToCellIdx]);

    const getActiveNeighboursCount = useCallback((cellIdx) => {
        const cell = cellIdxToCoords(cellIdx);

        const coord_deltas = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        const states = coord_deltas.map(
            (delta) => isCellCoordActive(cell.column + delta[0], cell.row + delta[1])
        );

        return states.filter(Boolean).length;
    }, [cellIdxToCoords, isCellCoordActive]);

    const runIteration = useCallback(() => {
        const newGrid = makeEmptyGrid();
        
        /*
        Rules:
        1. Any live cell with fewer than two live neighbors dies, as if caused by under population.
        2. Any live cell with two or three live neighbors lives on to the next generation.
        3. Any live cell with more than three live neighbors dies, as if by overpopulation.
        4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
        */
       
        for (let cellIdx = 0; cellIdx < getCellCount(); cellIdx++) {
            const activeNeighouringCells = getActiveNeighboursCount(cellIdx);

            if (grid[cellIdx]) {
                if (activeNeighouringCells === 2 || activeNeighouringCells === 3) {
                    newGrid[cellIdx] = true;
                } else {
                    newGrid[cellIdx] = false;
                }
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

    const handleRunGame = () => {
        setSimulationRunning(true);
        setRefreshInterval(RUNNING_REFRESH_INTERVAL);
        runIteration();
    }

    const handleStopGame = () => {
        setSimulationRunning(false);
        setRefreshInterval(0);
    }

    const handleCellToggle = (cellIdx) => {
        if ((cellIdx >= 0) && (cellIdx <= getCellCount())) {
            setGrid(oldGrid => {
                const newGrid = [...oldGrid];
                newGrid[cellIdx] = !newGrid[cellIdx];
                return newGrid;
            });
        }
    };

    const handleGridRandomise = () => {
        const newGrid = makeEmptyGrid();

        for (let cellIdx = 0; cellIdx < getCellCount(); cellIdx++) {
            // Make active with 0.5 probability.
            if (Math.random() < 0.5) {
                newGrid[cellIdx] = true;
            } else {
                newGrid[cellIdx] = false;
            }
        }

        setGrid(newGrid);
    };

    const handleClearGrid = () => {
        setGrid(makeEmptyGrid());
    };

    return ( 
        <Container> 
            <Box sx={{ m: 1 }}>
                <Stack spacing={2} direction="row" justifyContent="center" alignItems="center">
                    {
                        simulationRunning ?
                            <Button onClick={handleStopGame} variant="outlined" size="large" color="white" startIcon={<StopCircleIcon />}>Stop Game</Button> :
                            <Button onClick={handleRunGame} variant="outlined" size="large" color="white" startIcon={<PlayCircleIcon />}>Run Game</Button>
                    }
                    <ButtonGroup variant="outlined" size="large" color="white" aria-label="outlined white button group">
                        <Button onClick={handleGridRandomise} startIcon={<CasinoIcon />}>Randomise Grid</Button>
                        <Button onClick={handleClearGrid} startIcon={<HighlightOffIcon />}>Clear Grid</Button>
                    </ButtonGroup>
                </Stack>
            </Box>
            <Box 
                sx={{
                    mx: 'auto',
                    my: 1,
                    width: GRID_WIDTH,
                    height: GRID_HEIGHT,
                    position: "relative"
                }}
            >
                {
                    grid.map((cell, cellIdx) => {
                        const { column, row } = cellIdxToCoords(cellIdx);
                        return (
                            <GridCell
                                column={column} row={row} cellSize={CELL_SIZE}
                                isActive={cell}
                                handleClickEvent={() => handleCellToggle(cellIdx)}
                                key={`cell-${cellIdx}`}
                            />
                        );
                    })
                }
            </Box>
        </Container>
    );

}

export default Grid;
