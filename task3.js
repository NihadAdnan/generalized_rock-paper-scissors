import crypto from 'crypto';
import readlineSync from 'readline-sync';
import AsciiTable from 'ascii-table';

class HMAC {
    static generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    static calculateHMAC(key, message) {
        return crypto.createHmac('sha256', key).update(message).digest('hex');
    }
}

class Rules {
    constructor(moves) {
        this.moves = moves;
        this.n = moves.length;
        this.p = Math.floor(this.n / 2);
    }

    determineOutcome(computerMove, userMove) {
        const a = this.moves.indexOf(computerMove);
        const b = this.moves.indexOf(userMove);
        const result = Math.sign((a - b + this.p + this.n) % this.n - this.p);
        if (result === 0) return 'Draw';
        return result > 0 ? 'Computer wins' : 'You win';
    }
}

class HelpTable {
    constructor(moves) {
        this.moves = moves;
    }

    generateTable() {
        const table = new AsciiTable();
        table.setHeading(['PC\\User', ...this.moves]);
        const rules = new Rules(this.moves);
        this.moves.forEach(move => {
            const row = [move];
            this.moves.forEach(userMove => {
                row.push(rules.determineOutcome(move, userMove));
            });
            table.addRow(row);
        });
        return table.toString();
    }
}

class Game {
    constructor(moves) {
        this.moves = moves;
        this.rules = new Rules(moves);
        this.key = HMAC.generateKey();
        this.computerMove = moves[Math.floor(Math.random() * moves.length)];
        this.hmac = HMAC.calculateHMAC(this.key, this.computerMove);
    }

    play() {
        console.log(`HMAC: ${this.hmac}`);
        console.log('Available moves:');
        this.moves.forEach((move, index) => {
            console.log(`${index + 1} - ${move}`);
        });
        console.log('0 - exit');
        console.log('? - help');

        while (true) {
            const input = readlineSync.question('Enter your move: ');
            if (input === '0') {
                console.log('Exiting the game.');
                break;
            } else if (input === '?') {
                const helpTable = new HelpTable(this.moves);
                console.log(helpTable.generateTable());
            } else if (!isNaN(input) && input > 0 && input <= this.moves.length) {
                const userMove = this.moves[input - 1];
                console.log(`Your move: ${userMove}`);
                console.log(`Computer move: ${this.computerMove}`);
                console.log(this.rules.determineOutcome(this.computerMove, userMove));
                console.log(`HMAC key: ${this.key}`);
                break;
            } else {
                console.log('Invalid Move! Please try again');
            }
        }
    }
}

function main() {
    const moves = process.argv.slice(2);
    
    if (moves.length === 0) {
        console.log('Error: No moves provided. Please provide an odd number of non-repeating moves.');
    } else if (moves.length === 1) {
        console.log('Error: Only one move provided. Please provide an odd number of non-repeating moves greater than 1.');
    } else if (moves.length % 2 === 0) {
        console.log('Error: Even number of moves provided. Please provide an odd number of non-repeating moves.');
    } else if (new Set(moves).size !== moves.length) {
        console.log('Error: Duplicate moves found. Please provide non-repeating moves.');
    } else {
        const game = new Game(moves);
        game.play();
    }
}

main();
