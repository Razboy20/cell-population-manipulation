import './grammar.js';
import './lib/jquery.js';
import './lib/jcanvas.js';
import './lib/codemirror.js';
import './lib/simplemodeaddon.js';
import './lib/seedrandom.js';
import './lib/jquery.toast.js';
// ^ The current program & seed URL has been saved to clipboard.
let vars;
let cells;
let seed = 'Yet to be created...';
$('#seed').attr('placeholder', seed);

const loadSearchParams = new URLSearchParams(window.location.search);
if (loadSearchParams.has('rules') && loadSearchParams.has('seed')) {
	$('#rules').val(loadSearchParams.get('rules'));
	$('#seed').val(loadSearchParams.get('seed'));
	$('#randomize')[0].checked = false;
	$('#seed').prop('disabled', false);
} else {
	window.history.replaceState(null, null, window.location.origin + window.location.pathname);
}

function lexer(parse) {
	seed = !$('#randomize').is(':checked')
		? $('#seed').val()
		: ('000000000000' + Math.floor(Math.random() * 999999999999)).substr(-12, 12);
	$('#seed').val(seed);
	Math.seedrandom(seed);
	parse = parse[0];
	if (!parse) parse = [];
	vars = new Map();
	let mainIncrement = 0;
	let boardSize = null;
	cells = [];
	let lastError = { error: '' };
	//console.log(parser);
	parse.forEach((line, _lineNum) => {
		const lineNum = _lineNum + 1;
		if (line === null) return null;
		if (typeof line.type == 'undefined') return;
		switch (line.type) {
			case 'f-main':
				if (mainIncrement > 0) {
					lastError.error = `Line ${lineNum}: You cannot re-create the main board twice!`;
					break;
				}
				boardSize = line.size === 'default' ? { x: 150, y: 150 } : line.size;
				//console.log(boardSize);
				const _cells = [];
				for (let i = 0; i < boardSize.x; i++) {
					const _temp = [];
					for (let z = 0; z < boardSize.y; z++) {
						_cells.push([ i, z ]);
						_temp.push({ pos: { x: i, y: z } });
					}
					cells.push(_temp);
				}
				vars.set(line.var, { type: 'main', class: 'group', cells: _cells });
				mainIncrement++;
				break;
			case 'f-leaderelect':
				const cellGroup = setoperations(line.group, { lastError, lineNum });
				//console.log(cellGroup);
				/*const varGroup = vars.get(line.group);
					if (!varGroup) {
						console.error("Group variable does not exist.");
						break;
					} else if (varGroup.class != "group") {
						console.error("Variable is not of type group.");
						break;
					}*/
				//const cell = cellGroup[Math.floor(Math.random() * boardSize.x)][Math.floor(Math.random() * boardSize.y)];
				if (cellGroup.length === 0) {
					lastError.warn = `Line ${lineNum}: Cell Population calling leader_election is empty! (Might be a one time thing, or if it is recurring, double check your work.)`;
					break;
				}

				let cell;
				for (let i = 0; i < 15; i++) {
					const randomNum = Math.floor(Math.random() * cellGroup.length);
					const [ i1, i2 ] = cellGroup[randomNum];
					// cellGroup.splice(randomNum, 1);
					const _cell = cells[i1][i2];
					if (typeof _cell.type != 'undefined') continue;
					cell = _cell;
					break;
				}
				// const randomNum = Math.floor(Math.random() * cellGroup.length);
				// const [ i1, i2 ] = cellGroup[randomNum];
				// // cellGroup.splice(randomNum, 1);
				// cell = cells[i1][i2];
				if (!cell) break;
				cell.type = 'leader';
				cell.color = '#' + Math.random().toString(16).slice(2, 8);
				vars.set(line.setvar, { type: 'leader', class: 'cell', cell: [ cell.pos.x, cell.pos.y ] });
				break;
			case 'f-select':
				const selectGroup = vars.get(line.group);
				if (!selectGroup) {
					lastError.error = `Line ${lineNum}: Group variable does not exist.`;
					break;
				} else if (selectGroup.class !== 'group') {
					lastError.error = `Line ${lineNum}: Variable is not of type group.`;
					break;
				}
				const _temp = [];
				selectGroup.cells.forEach((cell) => {
					if (conditions(line.conds, cell, { lastError, lineNum })) _temp.push(cell);
				});
				const _color1 = '#' + Math.random().toString(16).slice(2, 8);
				_temp.forEach(([ i1, i2 ]) => {
					const cell = cells[i1][i2];
					if (!cell.type) cell.color = _color1;
				});

				vars.set(line.setvar, { type: 'population', class: 'group', cells: _temp });
				break;
			case 'f-set_operation':
				const _scells = setoperations(line.ops, { lastError, lineNum });
				const _color2 = '#' + Math.random().toString(16).slice(2, 8);
				_scells.forEach(([ i1, i2 ]) => {
					const cell = cells[i1][i2];
					if (!cell.type) cell.color = _color2;
				});
				vars.set(line.setvar, { type: 'population', class: 'group', cells: _scells });
				break;
			default:
				break;
		}
	});

	if (lastError.warn) {
		$.toast({
			text: lastError.warn,
			showHideTransition: 'slide',
			heading: 'Potential Error:',
			icon: 'warning',
			position: 'bottom-right',
			hideAfter: 3000,
			stack: 5
		});
	} else if (lastError.error) {
		$.toast({
			text: lastError.error,
			showHideTransition: 'slide',
			heading: 'Error:',
			icon: 'error',
			position: 'bottom-right',
			hideAfter: 5000,
			stack: 5
		});
	}

	return { cells: cells, boardSize: boardSize };
}

function conditions(conds, cell, { lastError, lineNum }) {
	if (!vars.has(conds.left) && isNaN(conds.left) && typeof conds.left != 'object') {
		lastError.error = `Line ${lineNum}: Left leader cell '${conds.left}' does not exist.`;
		return null;
	} else if (!vars.has(conds.right) && isNaN(conds.right) && typeof conds.left != 'object') {
		lastError.error = `Line ${lineNum}: Right leader cell '${conds.right}' does not exist.`;
		return null;
	}
	switch (conds.type) {
		case '==':
			return (
				Math.abs(dist(conds.left, cell) - dist(conds.right, cell)) <=
				Math.sqrt(dist(conds.left, conds.right, true)) * 1.1
			);
		case '>':
			return dist(conds.left, cell) > dist(conds.right, cell);
		case '<':
			return dist(conds.left, cell) < dist(conds.right, cell);
		case '>=':
			return dist(conds.left, cell) >= dist(conds.right, cell);
		case '<=':
			return dist(conds.left, cell) <= dist(conds.right, cell);
		case 'not':
			return !conditions(conds.val, cell, { lastError, lineNum });
		case 'and':
			return (
				conditions(conds.left, cell, { lastError, lineNum }) &&
				conditions(conds.right, cell, { lastError, lineNum })
			);
		case 'or':
			return (
				conditions(conds.left, cell, { lastError, lineNum }) ||
				conditions(conds.right, cell, { lastError, lineNum })
			);
	}
}

/**
 * Returns cells that satisfy the conditions
 * @param {Object} ops Set operations to be used on groups.
 */
function setoperations(ops, { lastError, lineNum }) {
	if (typeof ops == 'string') {
		//console.log("String: " + ops);
		const group = vars.get(ops);
		if (!group) {
			lastError.error = `Line ${lineNum}: Group variable does not exist.`;
			return [];
		} else if (group.class !== 'group') {
			lastError.error = `Line ${lineNum}: Variable is not of type group.`;
			return [];
		}

		return group.cells;
	}

	let lgroup;
	if (typeof ops.left == 'string') {
		const lvar = vars.get(ops.left);
		if (!lvar) {
			lastError.error = `Line ${lineNum}: Left group variable does not exist.`;
			return [];
		} else if (lvar.class !== 'group') {
			lastError.error = `Line ${lineNum}: Left variable is not of type group.`;
			return [];
		}
		lgroup = lvar.cells;
	} else {
		lgroup = setoperations(ops.left, { lastError, lineNum });
	}

	let rgroup;
	if (typeof ops.right == 'string') {
		const rvar = vars.get(ops.right);
		if (!rvar) {
			lastError.error = `Line ${lineNum}: Right group variable does not exist.`;
			return [];
		} else if (rvar.class !== 'group') {
			lastError.error = `Line ${lineNum}: Right variable is not of type group.`;
			return [];
		}
		rgroup = rvar.cells;
	} else {
		rgroup = setoperations(ops.right, { lastError, lineNum });
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
 * @param isLCell
 */
function dist(getLeaderCell, iteratedCell, isLCell = false) {
	if (!isNaN(iteratedCell)) return parseInt(iteratedCell ** 2);
	const [ cx, cy ] = isLCell ? vars.get(iteratedCell).cell : iteratedCell;
	if (isNaN(getLeaderCell)) {
		const leadercell = vars.get(getLeaderCell);
		// console.log(i1, i2, cells[i1][i2]);
		// const leadercell = cells[i1][i2];
		if (!leadercell) {
			//console.error('Leader cell does not exist.');
			return null;
		}
		const [ lx, ly ] = leadercell.cell;
		//}
		return (lx - cx) ** 2 + (ly - cy) ** 2;
	} else {
		return parseInt(getLeaderCell ** 2);
	}
}

function render({ boardSize, cells }) {
	// $('#cellBoard').clearCanvas();
	// const ratio = boardSize.x > boardSize.y ? 1000 / boardSize.x : 1000 / boardSize.y;
	// cells.forEach((group) => {
	// 	group.forEach((cell) => {
	// 		if (!cell.color) return;
	// 		let cellDrawObject = {
	// 			fillStyle: cell.color,
	// 			x: cell.pos.x * ratio,
	// 			y: cell.pos.y * ratio,
	// 			width: ratio,
	// 			height: ratio,
	// 			fromCenter: false
	// 		};

	// 		$('#cellBoard').drawEllipse(cellDrawObject);
	// 	});
	// });
	const canvas = document.getElementById('cellBoard');
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	const ratio = boardSize.x > boardSize.y ? 1000 / boardSize.x : 1000 / boardSize.y;

	cells.forEach((group) => {
		group.forEach((cell) => {
			if (!cell.color) return;
			ctx.fillStyle = cell.color;
			ctx.beginPath();
			ctx.arc(cell.pos.x * ratio + ratio / 2, cell.pos.y * ratio + ratio / 2, ratio / 2, 0, 2 * Math.PI);
			ctx.fill();
		});
	});
}

CodeMirror.defineSimpleMode('formatrules', {
	start: [
		{ regex: /\/\/.*/, token: 'comment' },
		{ regex: /(#)([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\s+/, token: [ 'hexcode1', 'hexcode2' ] },
		{
			regex: /(?:intersect|union|difference|and|or|not|==)\b/,
			token: 'atom'
		},
		{
			regex: /(\w+)(\s*\()/,
			token: [ 'keyword', null ],
			next: 'setops'
		},
		{
			regex: /(?<=\()(\w+)(?=\))/,
			token: [ null, 'variable', null, null ]
		},
		// {
		// 	regex: /(main)(\s*)/,
		// 	token: [ 'keyword', null ]
		// },
		// Rules are matched in the order in which they appear, so there is
		// no ambiguity between this one and the one above
		{ regex: /true|false|null|undefined/, token: 'atom' },

		{ regex: /[=]+/, token: 'operator' },
		// indent and dedent properties guide autoindentation
		{ regex: /[{\[(]/, indent: true },
		{ regex: /[}\])]/, dedent: true },
		{ regex: /[a-z$A-Z][\w$]*/, token: 'variable' }
	],
	setops: [
		{ regex: /\)/, next: 'start' },
		{
			regex: /(?:intersect|union|difference|and|or)\b/i,
			token: 'atom'
		},
		{
			regex: /\b(not)(\s*\()/i,
			token: [ 'atom', null ],
			next: 'setops'
		},
		{
			regex: /(?:==|-|><=|>|>=)/,
			token: 'atom'
		},
		{
			regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
			token: 'number'
		},
		{ regex: /\w+/, token: 'variable' }
	]
});

const rulesEditor = CodeMirror.fromTextArea(document.getElementById('rules'), {
	lineNumbers: true,
	theme: 'neo',
	mode: 'formatrules',
	lineWrapping: true
	// viewportMargin: Infinity
});
// rulesEditor.setSize(400, 700);

function showError() {
	$('.input').removeClass('error');
	void $('.input')[0].offsetWidth;
	$('.input').addClass('error');
}

function parseTextArea() {
	$('#parseButton').prop('disabled', true);
	const toParse = rulesEditor.getValue();
	const Parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
	try {
		Parser.feed(toParse);
		const parsedArr = Parser.finish();
		const output = lexer(parsedArr);
		console.log(output);
		render(output);
	} catch (error) {
		showError();
		console.error(error);
		$.toast({
			text: 'There was an error in parsing your code. Double check that everything is correct.',
			position: 'bottom-right',
			showHideTransition: 'slide',
			heading: 'Parsing error:',
			icon: 'error',
			hideAfter: 7000
		});
	}
	setTimeout(() => {
		$('#parseButton').prop('disabled', false);
	}, 300);
}

$('#parseButton').on('click', parseTextArea);

$('#randomize').click(function() {
	$(this).is(':checked') ? $('#seed').prop('disabled', true) : $('#seed').prop('disabled', false);
});

// code from https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
const copyToClipboard = (str) => {
	const el = document.createElement('textarea');
	el.value = str;
	el.setAttribute('readonly', '');
	el.style.position = 'absolute';
	el.style.left = '-9999px';
	document.body.appendChild(el);
	const selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);
	if (selected) {
		document.getSelection().removeAllRanges();
		document.getSelection().addRange(selected);
	}
};

function saveRules() {
	if (!document.getElementById('seed').value) return;
	document.getElementById('seed').value = seed;
	const searchParams = new URLSearchParams();
	searchParams.set('rules', rulesEditor.getValue());
	searchParams.set('seed', seed);
	window.history.replaceState(
		null,
		null,
		window.location.origin + window.location.pathname + '?' + searchParams.toString()
	);
	copyToClipboard(location.href);

	$('#randomize')[0].checked = false;
	$('#seed').prop('disabled', false);
	$.toast({
		heading: '^ URL copied to clipboard.',

		showHideTransition: 'slide',
		position: 'top-center',

		bgColor: '#4e4e4e',
		textColor: '#eeeeee',
		textAlign: 'center',
		stack: false,
		afterHidden: function() {
			$.toast().reset('all');
		}
	});
}

$('#saveRules').on('click', saveRules);
