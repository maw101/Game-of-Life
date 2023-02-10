import './css/GridCell.css';

const GridCell = (props) => {

    const { column, row, cellSize, isActive, handleClickEvent } = props;

    return (
        <div 
            className={
                isActive ? "cell cell-active" : "cell cell-inactive"
            }
            style={{
                left: `${cellSize * column}px`,
                top: `${cellSize * row}px`,
                width: `${cellSize}px`,
                height: `${cellSize}px`,
            }}
            onClick={handleClickEvent}
        />
    );

};

export default GridCell;
