import './grammar.js';
import './assets/jquery.js';
import './assets/jcanvas.js';

let vars;
let cells;

function getVar(varName) {
	// console.log(cells);
	const _temp = [];
	let output = vars.get(varName);
	// console.log(output, 'output');
	if (output.cells)
		output.cells = output.cells.map((cell) => {
			return cells[cell.pos.x][cell.pos.y];
		});
	if (output.cell) output.cell = cells.flat().find((_cell) => _cell === output.cell);

	return output;
}

function lexer(parse) {
	parse = parse[0];
	if (!parse) parse = [];
	let output;
	vars = new Map();
	let mainIncrement = 0;
	let boardSize = null;
	cells = [];
	//console.log(parser);
	parse.forEach((line) => {
		if (line === null) return null;
		if (typeof line.type == 'undefined') return;
		switch (line.type) {
			case 'f-main':
				if (mainIncrement > 0) {
					console.error('You cannot re-create the main board twice!');
					break;
				}
				boardSize = line.size == 'default' ? { x: 45, y: 45 } : line.size;
				//console.log(boardSize);
				const _cells = [];
				for (let i = 0; i < boardSize.x; i++) {
					const _temp = [];
					for (let z = 0; z < boardSize.y; z++) {
						_temp.push({ pos: { x: i, y: z }, color: '#fff' });
						_cells.push({ pos: { x: i, y: z }, color: '#fff' });
					}
					cells.push(_temp);
				}
				vars.set(line.var, { type: 'main', class: 'group', cells: _cells });
				mainIncrement++;
				break;
			case 'f-leaderelect':
				const cellGroup = setoperations(line.group);
				//console.log(cellGroup);
				/*const varGroup = getVar(line.group);
					if (!varGroup) {
						console.error("Group variable does not exist.");
						break;
					} else if (varGroup.class != "group") {
						console.error("Variable is not of type group.");
						break;
					}*/
				//const cell = cellGroup[Math.floor(Math.random() * boardSize.x)][Math.floor(Math.random() * boardSize.y)];
				if (cellGroup.length == 0) {
					console.error(
						'Cell Population calling leader_election is empty! (Might be a one time thing, or if it is recurring, double check your work.)'
					);
					break;
				}
				const cell = cellGroup[Math.floor(Math.random() * cellGroup.length)];
				cell.type = 'leader';
				cell.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
				vars.set(line.setvar, { type: 'leader', class: 'cell', cell: cell });

				break;
			case 'f-select':
				const selectGroup = getVar(line.group);
				if (!selectGroup) {
					console.error('Group variable does not exist.');
					break;
				} else if (selectGroup.class != 'group') {
					console.error('Variable is not of type group.');
					break;
				}
				const _temp = [];
				selectGroup.cells.forEach((cell) => {
					if (conditions(line.conds, cell)) _temp.push(cell);
				});
				const _color1 = '#' + Math.floor(Math.random() * 16777215).toString(16);
				_temp.forEach((cell) => {
					if (!cell.type) cell.color = _color1;
				});

				vars.set(line.setvar, { type: 'population', class: 'group', cells: _temp });
				output = _temp;
				break;
			case 'f-set_operation':
				const _scells = setoperations(line.ops);
				const _color2 = '#' + Math.floor(Math.random() * 16777215).toString(16);
				_cells.forEach((cell) => {
					if (!cell.type) cell.color = _color2;
				});
				vars.set(line.setvar, { type: 'population', class: 'group', cells: _scells });
				break;
			default:
				break;
		}
	});
	if (!output) output = Array.from(cells);
	return { cells: cells, boardSize: boardSize };
}

function conditions(conds, cell) {
	if (!vars.has(conds.left) && isNaN(conds.right)) {
		console.error('Left leader cell does not exist.');
		return null;
	} else if (!vars.has(conds.right) && isNaN(conds.right)) {
		console.error('Right leader cell does not exist.');
		return null;
	}
	switch (conds.type) {
		case '==':
			return Math.abs(dist(conds.left, cell) - dist(conds.right, cell)) <= 0.5;
		case '>':
			return dist(conds.left, cell) > dist(conds.right, cell);
		case '<':
			return dist(conds.left, cell) < dist(conds.right, cell);
		case '>=':
			return dist(conds.left, cell) >= dist(conds.right, cell);
		case '<=':
			return dist(conds.left, cell) <= dist(conds.right, cell);
		case 'not':
			return !conditions(conds.val, cell);
		case 'and':
			return conditions(conds.left, cell) && conditions(conds.right, cell);
		case 'or':
			return conditions(conds.left, cell) || conditions(conds.right, cell);
	}
}

/**
 * Returns cells that satisfy the conditions 
 * @param {Object} ops Set operations to be used on groups.
 */
function setoperations(ops) {
	if (typeof ops == 'string') {
		//console.log("String: " + ops);
		const group = getVar(ops);
		if (!group) {
			console.error('Group variable does not exist.');
			console.log(ops);
			return [];
		} else if (group.class != 'group') {
			console.error('Variable is not of type group.');
			return [];
		}

		return group.cells;
	}

	let lgroup;
	if (typeof ops.left == 'string') {
		const lvar = getVar(ops.left);
		if (!lvar) {
			console.error('Left group variable does not exist.');
			return [];
		} else if (lvar.class != 'group') {
			console.error('Variable is not of type group.');
			return [];
		}
		lgroup = lvar.cells;
	} else {
		lgroup = setoperations(ops.left);
	}

	let rgroup;
	if (typeof ops.right == 'string') {
		const rvar = getVar(ops.right);
		if (!rvar) {
			console.error('Right group variable does not exist.');
			return [];
		} else if (rvar.class != 'group') {
			console.error('Variable is not of type group.');
			return [];
		}
		rgroup = rvar.cells;
	} else {
		rgroup = setoperations(ops.right);
	}

	switch (ops.type) {
		case 'union':
			return [ ...new Set([ ...lgroup, ...rgroup ]) ];
		case 'intersection':
			return lgroup.filter((cell) => rgroup.includes(cell));
		case 'difference':
			return lgroup.filter((cell) => !rgroup.includes(cell));
		default:
			break;
	}
}

/**
 * Get distance from leader cell to iterated cell.
 * @param {string} getLeaderCell Variable name of the leader.
 * @param {Object} iteratedCell An iterated cell.
 */
function dist(getLeaderCell, iteratedCell) {
	if (isNaN(getLeaderCell)) {
		const leadercell = getVar(getLeaderCell).cell;
		// if (!leadercell) {
		// 	console.error('Leader cell does not exist.');
		// 	return null;
		// }
		return Math.sqrt((iteratedCell.pos.x - leadercell.pos.x) ** 2 + (iteratedCell.pos.y - leadercell.pos.y) ** 2);
	} else {
		return parseInt(getLeaderCell);
	}
}

function render({ boardSize, cells }) {
	$('#cellBoard').clearCanvas();
	const ratio =
		boardSize.x > boardSize.y ? $('#cellBoard').width() / boardSize.x : $('#cellBoard').height() / boardSize.y;
	cells.forEach((group) => {
		group.forEach((cell) => {
			let cellDrawObject = {
				fillStyle: cell.color,
				x: cell.pos.x * ratio,
				y: cell.pos.y * ratio,
				width: ratio,
				height: ratio,
				fromCenter: false
			};
			if (boardSize.x === boardSize.y) {
				$('#cellBoard').drawEllipse(cellDrawObject);
			} else {
				$('#cellBoard').drawEllipse(cellDrawObject);
			}
		});
	});
}

function parseTextArea() {
	$('#parseButton').prop('disabled', true);
	const toParse = $('#rules').val();
	const Parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
	try {
		Parser.feed(toParse);
		const parsedArr = Parser.finish();
		const output = lexer(parsedArr);
		console.log(output);
		render(output);
	} catch (error) {
		console.error(error);
	}
	$('#parseButton').prop('disabled', false);
}

$('#parseButton').on('click', parseTextArea);
