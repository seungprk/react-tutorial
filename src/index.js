import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className={props.className} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

function OrderBtn(props) {
    return (
        <button onClick={props.onClick}>
            Order List
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i, isHighlighted) {
        const classNameStr = isHighlighted ? "square highlight" : "square"
        return (
            <Square 
                className={classNameStr}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)} 
            />
        );
    }
        
    render() {
        let rows = [];
        for (var i = 0; i < 3; i++) {
            let cols = [];
            for (var ii = 0; ii < 3; ii++) {
                const squareNum = i * 3 + ii;
                const isHighlighted = this.props.winningSquares ? this.props.winningSquares.includes(squareNum) : false;
                cols.push(this.renderSquare(squareNum, isHighlighted));
            }
            rows.push(<div className="board-row">{cols}</div>);
        }
        return (
            <div>{rows}</div>
        );
    }
}

class Game extends React.Component {
    constructor() {
        super();
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            moveHistory: [],
            stepNumber: 0,
            xIsNext: true,
            listIsReversed: false,
            winningSquares: null,
        };    
    }

    handleClick(i) {
        const historyCutNum = this.state.listIsReversed ? 
            this.state.history.length - this.state.stepNumber - 1 : 
            this.state.stepNumber;
        const nextStepNum = this.state.listIsReversed ? 
            0 :
            this.state.stepNumber + 1;

        const history = this.state.history.slice(0, historyCutNum + 1);
        const moveHistory = this.state.moveHistory.slice(0, historyCutNum);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        if (calculateWinner(squares) || squares[i]) {
            return
        }

        squares[i] = this.state.xIsNext ? 'X' : 'O';
        
        // If the set causes winning condition
        let setWinningSquares = null;
        if (calculateWinner(squares)) {
            setWinningSquares = getWinningArray(squares);
        }

        this.setState({
            history: history.concat([{
                squares: squares
            }]),
            moveHistory: moveHistory.concat(i),
            stepNumber: nextStepNum,
            xIsNext: !this.state.xIsNext,     
            winningSquares: setWinningSquares,
        });
    }

    reverseList() {
        this.setState({
            listIsReversed: !this.state.listIsReversed, 
            stepNumber: this.state.history.length - this.state.stepNumber - 1,
        });
    }

    jumpTo(step) {
        // Deal with reversed list
        let nextX = null;
        if (this.state.listIsReversed) {
            nextX = (step % 2) ? true : false; 
        } else {
            nextX = (step % 2) ? false : true;
        }

        // Deal with highlight
        const current = this.state.history[step];
        const squares = current.squares.slice();

        let setWinningSquares = null;
        if (calculateWinner(squares)) {
            setWinningSquares = getWinningArray(squares);    
        }

        this.setState({
            stepNumber: step,
            xIsNext: nextX,
            winningSquares: setWinningSquares,
        });
    }

    render() {
        const listIsReversed = this.state.listIsReversed;
        const history = listIsReversed ? this.state.history.slice(0).reverse() : this.state.history;
        const moveHistory = listIsReversed? this.state.moveHistory.slice(0).reverse() : this.state.moveHistory;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            let desc = null;
            if (listIsReversed) {
                desc = move === history.length - 1 ? 
                    'Game start' : 
                    'Position (' + getVectorString(moveHistory[move]) + ')';
           } else {
                desc = move ?
                    'Position (' + getVectorString(moveHistory[move - 1]) + ')' :
                    'Game start';
            }
            let descWrapper = null
            if (move === this.state.stepNumber) {
                descWrapper = <a href="#" onClick={() => this.jumpTo(move)}>
                    <b>{desc}</b>
                </a>;
            } else {
                descWrapper = <a href="#" onClick={() => this.jumpTo(move)}>
                    {desc}
                </a>;
            }
            return (
                <li key={move}>
                    {descWrapper}
                </li>
            ); 
        });
        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board 
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winningSquares={this.state.winningSquares}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>{moves}</div>
                </div>
                <div>
                    <OrderBtn
                        onClick={() => this.reverseList()}
                    />
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}

function getWinningArray(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return [a, b, c];
        }
    }
    return null;
}

function getVectorString(number) {
    let rowNum = parseInt(number / 3 + 1);
    let colNum = number % 3 + 1;
    return rowNum + ", " + colNum;
}
