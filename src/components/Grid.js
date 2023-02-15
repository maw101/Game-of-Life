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
import Slider from '@mui/material/Slider';

import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import CasinoIcon from '@mui/icons-material/Casino';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import './css/Grid.css';
import GridCell from './GridCell';

const Grid = () => {

    const CELL_SIZE = 25;
    const RUNNING_REFRESH_INTERVAL = 300;
    const DEFAULT_GRID_SIZE = 25;

    const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);

    const [simulationRunning, setSimulationRunning] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(0);

    const getCellCount = useCallback(() => {
        return gridSize ** 2;
    }, [gridSize]);

    const makeEmptyGrid = useCallback((newCellCount=getCellCount()) => {
        const grid = [];

        for (let cellIdx = 0; cellIdx < newCellCount; cellIdx++) {
            grid[cellIdx] = false; // set to default value - inactive
        }

        return grid;
    }, [getCellCount]);

    const [grid, setGrid] = useState(makeEmptyGrid());

    const coordsToCellIdx = useCallback((row, column) => {
        return (column * gridSize) + row;
    }, [gridSize]);

    const cellIdxToCoords = useCallback((cellIdx) => {
        return {
            column: cellIdx % gridSize,
            row: Math.floor(cellIdx / gridSize),
        };
    }, [gridSize]);

    const isCellCoordActive = useCallback((x, y) => {
        const candidateCellIdx = coordsToCellIdx(x, y);

        return !(x === 0 && y === 0) && 
                (x >= 0 && x < gridSize) && 
                (y >= 0 && y < gridSize) &&
                grid[candidateCellIdx];
    }, [grid, gridSize, coordsToCellIdx]);

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
        handleStopGame();

        setGrid(makeEmptyGrid());
    };

    const handleSizeChange = (e, newSize) => {
        handleStopGame();
        
        setGridSize(newSize);
        setGrid(makeEmptyGrid(newSize ** 2));
    };

    return ( 
        <Container maxWidth={false}> 
            <Box sx={{ my: 2 }}>
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
                <Box sx={{
                    mx: 'auto',
                    mt: 7,
                    mb: 1,
                    width: "50%",
                }}
                >
                    <Slider
                        aria-label="Always visible"
                        step={5}
                        min={5}
                        value={gridSize}
                        max={100}
                        onChange={handleSizeChange}
                        valueLabelDisplay="on"
                        valueLabelFormat={(value) => `Grid Size: ${value}`}
                        color="white"
                    />
                </Box>
            </Box>
            <Box 
                sx={{
                    mx: "auto",
                    my: 1,
                    width: gridSize * CELL_SIZE,
                    height: gridSize * CELL_SIZE,
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
                                key={`cell-${cellIdx}-${cell}`}
                            />
                        );
                    })
                }
            </Box>
        </Container>
    );

}

export default Grid;
