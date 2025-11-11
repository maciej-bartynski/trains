enum Direction {
    Top = 'top',
    Bottom = 'bottom',
    Left = 'left',
    Right = 'right',
}

const OpositeDirection = {
    [Direction.Top]: Direction.Bottom,
    [Direction.Bottom]: Direction.Top,
    [Direction.Left]: Direction.Right,
    [Direction.Right]: Direction.Left,
}

export default Direction;

export { OpositeDirection };