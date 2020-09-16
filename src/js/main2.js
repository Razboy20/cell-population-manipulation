import './grammar.js';
import './lib/jquery.js';
import './lib/jcanvas.js';
import './lib/codemirror.js';
import './lib/simplemodeaddon.js';
import './lib/seedrandom.js';
import './lib/jquery.toast.js';
import './lib/codemirror-colorpicker.min.js';
import './lib/comment.js';
// ^ The current program & seed URL has been saved to clipboard.
let vars, cells, mainVar;
let seed = 'Yet to be created...';
let diffusionType = 'default';
let invertSign = true;
let dist = () => {}; // distance function placeholder
let equalityfunc = () => {}; // equality function placeholder
$('#seed').attr('placeholder', seed);

const loadSearchParams = new URLSearchParams(window.location.search);
if (loadSearchParams.has('rules') && loadSearchParams.has('seed')) {
	$('#rules').val(loadSearchParams.get('rules'));
	$('#seed').val(loadSearchParams.get('seed'));
	$('#randomize')[0].checked = false;
	$('#seed').prop('disabled', false);
	if (loadSearchParams.has('diffusion')) {
		diffusionType = loadSearchParams.get('diffusion');
		$('#diffusionType').val(diffusionType);
	}
	$('#exampleCode').val('placeholder');
	$('#placeholderExampleOption').html('(custom)');
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
	mainVar = undefined;
	let lastError = { error: '' };
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
				mainVar = line.var;
				mainIncrement++;
				break;
			case 'f-leaderelect':
				if (!line.group) line.group = mainVar;
				const cellGroup = setoperations(line.group, { lastError, lineNum });

				if (cellGroup.length === 0) {
					lastError.warn = `Line ${lineNum}: Cell Population calling leader_election is empty!`;
					break;
				}

				let cell;
				for (let i = 0; i < 15; i++) {
					const randomNum = Math.floor(Math.random() * cellGroup.length);
					const [ i1, i2 ] = cellGroup[randomNum];
					const _cell = cells[i1][i2];
					if (typeof _cell.type != 'undefined') continue;
					cell = _cell;
					break;
				}
				if (!cell) break;
				cell.type = 'leader';
				cell.color = line.color ? line.color : '#' + Math.random().toString(16).slice(2, 8);
				vars.set(line.setvar, { type: 'leader', class: 'cell', cell: [ cell.pos.x, cell.pos.y ] });
				break;
			case 'f-placeleader':
				let pcell;
				pcell = cells[boardSize.x / 2 + line.coords.x][boardSize.y / 2 + line.coords.y];
				pcell.type = 'leader';
				pcell.color = line.color ? line.color : '#' + Math.random().toString(16).slice(2, 8);
				vars.set(line.setvar, { type: 'leader', class: 'cell', cell: [ pcell.pos.x, pcell.pos.y ] });
				break;
			case 'f-select':
				if (!line.group) line.group = mainVar;
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
				const _color1 = line.color ? line.color : '#' + Math.random().toString(16).slice(2, 8);
				_temp.forEach(([ i1, i2 ]) => {
					const cell = cells[i1][i2];
					if (!cell.type) cell.color = _color1;
				});

				vars.set(line.setvar, { type: 'population', class: 'group', cells: _temp });
				break;
			case 'f-set_operation':
				const _scells = setoperations(line.ops, { lastError, lineNum });
				const _color2 = line.color ? line.color : '#' + Math.random().toString(16).slice(2, 8);
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
			heading: "Current seed didn't work:",
			icon: 'warning',
			position: 'bottom-right',
			hideAfter: 5000,
			stack: 5
		});
	} else if (lastError.error) {
		$.toast({
			text: lastError.error,
			showHideTransition: 'slide',
			heading: "Current seed didn't work:",
			icon: 'warning',
			position: 'bottom-right',
			hideAfter: 7000,
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
	let type = invertSign
		? conds.type.includes('>') ? conds.type.replace('>', '<') : conds.type.replace('<', '>')
		: conds.type;
	switch (type) {
		case '==':
			return equalityfunc(conds.left, conds.right, cell);
		case '<':
			return dist(conds.left, cell) < dist(conds.right, cell);
		case '>':
			return dist(conds.left, cell) > dist(conds.right, cell);
		case '<=':
			return dist(conds.left, cell) <= dist(conds.right, cell);
		case '>=':
			return dist(conds.left, cell) >= dist(conds.right, cell);
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
const _examples = [];

const examples = {
	linearsquare: {
		type: 'default',
		text: `main(X) // default population is named X
a1 = leader_elect(X)
a2 = leader_elect(X)
line1 = select(a1 == a2)
b1 = leader_elect(line1)
b2 = leader_elect(line1)
line2 = select(X, b1 == b2)

center = leader_elect(line1 intersect line2);
circle = select(X, center == 40)

p1 = leader_elect(circle intersect line1)
p2 = leader_elect(circle intersect line1)
p3 = leader_elect(circle intersect line2)
p4 = leader_elect(circle intersect line2)

square = select(p1 < center and p2 < center and p3 < center and p4 < center)`
	},
	ratiosquare: {
		type: 'ratio',
		text: `main(X) // default population is named X
center = place_leader(0,0) // center in (0,0)
//center = leader_elect(X) // or choose center randomly
Circle = select(X, center == 0.03)
p1 = leader_elect(Circle)
A = select(Circle, center == p1)
a = leader_elect(A)
B = select(A, a < 0.1) // "far" from a
b = leader_elect(B)
P2 = select(Circle, a == b and p1 < 0.1)
p2 = leader_elect(P2) // "far" from p1
P3 = select(Circle, p1 == p2)
p3 = leader_elect(P3)
P4 = select(P3, p3 < 0.1) // "far" from p3
p4 = leader_elect(P4)

square = select(p1 < center and p2 < center and p3 < center and p4 < center)`
	}
};

for (const item in examples) {
	_examples.push(examples[item].text);
}

/**
 * Get distance from leader cell to iterated cell.
 * @param {string} getLeaderCell Variable name of the leader.
 * @param {Object} iteratedCell An iterated cell.
 * @param isLCell
 */
const distanceFunctions = {
	default: function(getLeaderCell, iteratedCell, isLCell = false) {
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
	},
	linear: function(getLeaderCell, iteratedCell, isLCell = false) {
		if (!isNaN(iteratedCell)) return parseFloat(iteratedCell);
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
			return ((lx - cx) ** 2 + (ly - cy) ** 2) ** (1 / 2);
		} else {
			return parseFloat(getLeaderCell);
		}
	},
	ratio: function(getLeaderCell, iteratedCell, isLCell = false) {
		if (!isNaN(iteratedCell)) return parseFloat(iteratedCell);
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
			return 1 / ((lx - cx) ** 2 + (ly - cy) ** 2) ** (1 / 2);
		} else {
			return parseFloat(getLeaderCell);
		}
	}
};

const equalityFunctions = {
	default: (left, right, cell) =>
		Math.abs(dist(left, cell) - dist(right, cell)) <= Math.sqrt(dist(left, right, true)),
	linear: (left, right, cell) => Math.abs(dist(left, cell) - dist(right, cell)) < 0.6,
	ratio: (left, right, cell) =>
		0.95 < dist(left, cell) / dist(right, cell) && dist(left, cell) / dist(right, cell) < 1.05
};

function checkDist(diffusionType) {
	switch (diffusionType) {
		case 'default':
			dist = distanceFunctions.default;
			equalityfunc = equalityFunctions.default;
			invertSign = true;
			break;
		case 'linear':
			dist = distanceFunctions.linear;
			equalityfunc = equalityFunctions.linear;
			invertSign = false;
			break;
		case 'ratio':
			dist = distanceFunctions.ratio;
			invertSign = false;
			equalityfunc = equalityFunctions.ratio;
			break;
		default:
			dist = distanceFunctions.default;
			equalityfunc = equalityFunctions.default;
			invertSign = true;
			break;
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
	meta: {
		lineComment: '//'
	},
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
		// {
		// 	regex: /(?<=\()(\w+)(?=\))/,
		// 	token: [ null, 'variable', null, null ]
		// },
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
			regex: /(?:==|-|<|<=|>|>=)/,
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
	lineWrapping: true,
	colorpicker: {
		mode: 'edit'
	},
	extraKeys: {
		'Ctrl-/': 'toggleComment'
	}
	// viewportMargin: Infinity
});
rulesEditor.setOption('extraKeys', {
	'Ctrl-/': 'toggleComment'
});
// rulesEditor.setSize(400, 700);

rulesEditor.on('change', (editor) => {
	const text = editor.getValue();
	if (_examples.includes(text)) return;
	$('#exampleCode').val('placeholder');
	$('#placeholderExampleOption').html('(custom)');
});

function showError() {
	$('.input').removeClass('error');
	void $('.input')[0].offsetWidth;
	$('.input').addClass('error');
}

function parseTextArea() {
	$('#parseButton').prop('disabled', true);
	const toParse = rulesEditor.getValue().replace(/\/\/.*/g, '');
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

$('#diffusionType').change(function() {
	diffusionType = $(this).val();
	console.log(`Diffusion type changed to '${diffusionType}'`);
	checkDist(diffusionType);
});

$('#exampleCode').change(function() {
	if ($(this).val() == 'placeholder') return;
	const example = examples[$(this).val()];
	rulesEditor.setValue(example.text);
	diffusionType = example.type;
	checkDist(diffusionType);
	$('#diffusionType').val(diffusionType);
	console.log(`Code example changed to '${diffusionType}'`);
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
	if (diffusionType != 'default') searchParams.set('diffusion', diffusionType);
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

checkDist(diffusionType);
