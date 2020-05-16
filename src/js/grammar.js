// Generated automatically by nearley, version 2.19.2
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "unsigned_int$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "unsigned_int$ebnf$1", "symbols": ["unsigned_int$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "unsigned_int", "symbols": ["unsigned_int$ebnf$1"], "postprocess": 
        function(d) {
            return parseInt(d[0].join(""));
        }
        },
    {"name": "int$ebnf$1$subexpression$1", "symbols": [{"literal":"-"}]},
    {"name": "int$ebnf$1$subexpression$1", "symbols": [{"literal":"+"}]},
    {"name": "int$ebnf$1", "symbols": ["int$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "int$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "int$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "int$ebnf$2", "symbols": ["int$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "int", "symbols": ["int$ebnf$1", "int$ebnf$2"], "postprocess": 
        function(d) {
            if (d[0]) {
                return parseInt(d[0][0]+d[1].join(""));
            } else {
                return parseInt(d[1].join(""));
            }
        }
        },
    {"name": "unsigned_decimal$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "unsigned_decimal$ebnf$1", "symbols": ["unsigned_decimal$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "unsigned_decimal$ebnf$2$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "unsigned_decimal$ebnf$2$subexpression$1$ebnf$1", "symbols": ["unsigned_decimal$ebnf$2$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "unsigned_decimal$ebnf$2$subexpression$1", "symbols": [{"literal":"."}, "unsigned_decimal$ebnf$2$subexpression$1$ebnf$1"]},
    {"name": "unsigned_decimal$ebnf$2", "symbols": ["unsigned_decimal$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "unsigned_decimal$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "unsigned_decimal", "symbols": ["unsigned_decimal$ebnf$1", "unsigned_decimal$ebnf$2"], "postprocess": 
        function(d) {
            return parseFloat(
                d[0].join("") +
                (d[1] ? "."+d[1][1].join("") : "")
            );
        }
        },
    {"name": "decimal$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "decimal$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "decimal$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "decimal$ebnf$2", "symbols": ["decimal$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "decimal$ebnf$3$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "decimal$ebnf$3$subexpression$1$ebnf$1", "symbols": ["decimal$ebnf$3$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "decimal$ebnf$3$subexpression$1", "symbols": [{"literal":"."}, "decimal$ebnf$3$subexpression$1$ebnf$1"]},
    {"name": "decimal$ebnf$3", "symbols": ["decimal$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "decimal$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "decimal", "symbols": ["decimal$ebnf$1", "decimal$ebnf$2", "decimal$ebnf$3"], "postprocess": 
        function(d) {
            return parseFloat(
                (d[0] || "") +
                d[1].join("") +
                (d[2] ? "."+d[2][1].join("") : "")
            );
        }
        },
    {"name": "percentage", "symbols": ["decimal", {"literal":"%"}], "postprocess": 
        function(d) {
            return d[0]/100;
        }
        },
    {"name": "jsonfloat$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "jsonfloat$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$2", "symbols": ["jsonfloat$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "jsonfloat$ebnf$3$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$3$subexpression$1$ebnf$1", "symbols": ["jsonfloat$ebnf$3$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "jsonfloat$ebnf$3$subexpression$1", "symbols": [{"literal":"."}, "jsonfloat$ebnf$3$subexpression$1$ebnf$1"]},
    {"name": "jsonfloat$ebnf$3", "symbols": ["jsonfloat$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "jsonfloat$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "symbols": [/[+-]/], "postprocess": id},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$2", "symbols": ["jsonfloat$ebnf$4$subexpression$1$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "jsonfloat$ebnf$4$subexpression$1", "symbols": [/[eE]/, "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "jsonfloat$ebnf$4$subexpression$1$ebnf$2"]},
    {"name": "jsonfloat$ebnf$4", "symbols": ["jsonfloat$ebnf$4$subexpression$1"], "postprocess": id},
    {"name": "jsonfloat$ebnf$4", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat", "symbols": ["jsonfloat$ebnf$1", "jsonfloat$ebnf$2", "jsonfloat$ebnf$3", "jsonfloat$ebnf$4"], "postprocess": 
        function(d) {
            return parseFloat(
                (d[0] || "") +
                d[1].join("") +
                (d[2] ? "."+d[2][1].join("") : "") +
                (d[3] ? "e" + (d[3][1] || "+") + d[3][2].join("") : "")
            );
        }
        },
    {"name": "main", "symbols": ["lines"], "postprocess": id},
    {"name": "lines$ebnf$1", "symbols": []},
    {"name": "lines$ebnf$1", "symbols": ["lines$ebnf$1", {"literal":"\n"}], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "lines$ebnf$2", "symbols": []},
    {"name": "lines$ebnf$2", "symbols": ["lines$ebnf$2", {"literal":"\n"}], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "lines", "symbols": ["lines$ebnf$1", "line", "lines$ebnf$2"], "postprocess": function(d) {return [d[1]]}},
    {"name": "lines$ebnf$3", "symbols": []},
    {"name": "lines$ebnf$3", "symbols": ["lines$ebnf$3", {"literal":"\n"}], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "lines$ebnf$4$subexpression$1$ebnf$1", "symbols": [{"literal":"\n"}]},
    {"name": "lines$ebnf$4$subexpression$1$ebnf$1", "symbols": ["lines$ebnf$4$subexpression$1$ebnf$1", {"literal":"\n"}], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "lines$ebnf$4$subexpression$1", "symbols": ["line", "lines$ebnf$4$subexpression$1$ebnf$1"], "postprocess": id},
    {"name": "lines$ebnf$4", "symbols": ["lines$ebnf$4$subexpression$1"]},
    {"name": "lines$ebnf$4$subexpression$2$ebnf$1", "symbols": [{"literal":"\n"}]},
    {"name": "lines$ebnf$4$subexpression$2$ebnf$1", "symbols": ["lines$ebnf$4$subexpression$2$ebnf$1", {"literal":"\n"}], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "lines$ebnf$4$subexpression$2", "symbols": ["line", "lines$ebnf$4$subexpression$2$ebnf$1"], "postprocess": id},
    {"name": "lines$ebnf$4", "symbols": ["lines$ebnf$4", "lines$ebnf$4$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "lines$ebnf$5", "symbols": []},
    {"name": "lines$ebnf$5", "symbols": ["lines$ebnf$5", {"literal":"\n"}], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "lines", "symbols": ["lines$ebnf$3", "lines$ebnf$4", "line", "lines$ebnf$5"], "postprocess": function(d) {return [...d[1], d[2]]}},
    {"name": "line$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "line$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "line", "symbols": ["_", "color", "_", "statement", "_", "line$ebnf$1", "_"], "postprocess": function(d) {return { color: d[1], ...d[3] }}},
    {"name": "line$ebnf$2", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "line$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "line", "symbols": ["_", "color", "_", "var", "_", {"literal":"="}, "_", "function", "_", "line$ebnf$2", "_"], "postprocess": function(d) {return {color: d[1], setvar: d[3], ...d[7]}}},
    {"name": "line$ebnf$3", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "line$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "line", "symbols": ["_", "color", "_", "var", "_", {"literal":"="}, "_", "setp", "_", "line$ebnf$3", "_"], "postprocess": function(d) {return {color: d[1], type: "f-set_operation", setvar: d[3], ops: d[7]}}},
    {"name": "statement$subexpression$1", "symbols": [/[mM]/, /[aA]/, /[iI]/, /[nN]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "statement$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "_", "int", "_", {"literal":","}, "_", "int", "_"]},
    {"name": "statement$ebnf$1", "symbols": ["statement$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "statement$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "statement", "symbols": ["statement$subexpression$1", {"literal":"("}, "_", "var", "_", "statement$ebnf$1", {"literal":")"}], "postprocess": function(d) {let size = "default"; if (d[5]) size = {x: d[5][2], y: d[5][6]}; return {type: "f-main", var: d[3], size: size}}},
    {"name": "function", "symbols": ["f_leader"], "postprocess": id},
    {"name": "function", "symbols": ["f_select"], "postprocess": id},
    {"name": "f_leader$subexpression$1", "symbols": [/[lL]/, /[eE]/, /[aA]/, /[dD]/, /[eE]/, /[rR]/, {"literal":"_"}, /[eE]/, /[lL]/, /[eE]/, /[cC]/, /[tT]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "f_leader$ebnf$1$subexpression$1", "symbols": ["setp"]},
    {"name": "f_leader$ebnf$1", "symbols": ["f_leader$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "f_leader$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "f_leader", "symbols": ["f_leader$subexpression$1", {"literal":"("}, "_", "f_leader$ebnf$1", "_", {"literal":")"}], "postprocess": function(d) {return {type: "f-leaderelect", group: (d[3]) ? d[3][0] : null}}},
    {"name": "f_leader$subexpression$2", "symbols": [/[pP]/, /[lL]/, /[aA]/, /[cC]/, /[eE]/, {"literal":"_"}, /[lL]/, /[eE]/, /[aA]/, /[dD]/, /[eE]/, /[rR]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "f_leader", "symbols": ["f_leader$subexpression$2", {"literal":"("}, "_", "int", "_", {"literal":","}, "_", "int", "_", {"literal":")"}], "postprocess": function(d) {return {type: "f-placeleader", coords: {x: d[3], y: d[7]}}}},
    {"name": "f_select$subexpression$1", "symbols": [/[sS]/, /[eE]/, /[lL]/, /[eE]/, /[cC]/, /[tT]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "f_select$ebnf$1$subexpression$1", "symbols": ["_", "var", "_", {"literal":","}]},
    {"name": "f_select$ebnf$1", "symbols": ["f_select$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "f_select$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "f_select", "symbols": ["f_select$subexpression$1", {"literal":"("}, "f_select$ebnf$1", "_", "conds", "_", {"literal":")"}], "postprocess": function(d) {return {type: "f-select", group: (d[2]) ? d[2][2] : null, conds: d[4]}}},
    {"name": "conds", "symbols": ["or"], "postprocess": id},
    {"name": "p", "symbols": [{"literal":"("}, "_", "or", "_", {"literal":")"}], "postprocess": function(d) {return d[2]}},
    {"name": "or$subexpression$1", "symbols": [/[oO]/, /[rR]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "or", "symbols": ["or", "__", "or$subexpression$1", "__", "or"], "postprocess": function(d) {return {type: "or", left: d[0], right: d[4]}}},
    {"name": "or", "symbols": ["and"], "postprocess": id},
    {"name": "and$subexpression$1", "symbols": [/[aA]/, /[nN]/, /[dD]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "and", "symbols": ["and", "__", "and$subexpression$1", "__", "and"], "postprocess": function(d) {return {type: "and", left: d[0], right: d[4]}}},
    {"name": "and", "symbols": ["cond"], "postprocess": id},
    {"name": "cond$string$1", "symbols": [{"literal":"="}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "cond", "symbols": ["condvar", "_", "cond$string$1", "_", "condvar"], "postprocess": function(d) {return {type: "==", left: d[0], right: d[4]}}},
    {"name": "cond", "symbols": ["condvar", "_", {"literal":">"}, "_", "condvar"], "postprocess": function(d) {return {type: ">", left: d[0], right: d[4]}}},
    {"name": "cond", "symbols": ["condvar", "_", {"literal":"<"}, "_", "condvar"], "postprocess": function(d) {return {type: "<", left: d[0], right: d[4]}}},
    {"name": "cond$string$2", "symbols": [{"literal":">"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "cond", "symbols": ["condvar", "_", "cond$string$2", "_", "condvar"], "postprocess": function(d) {return {type: ">=", left: d[0], right: d[4]}}},
    {"name": "cond$string$3", "symbols": [{"literal":"<"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "cond", "symbols": ["condvar", "_", "cond$string$3", "_", "condvar"], "postprocess": function(d) {return {type: "<=", left: d[0], right: d[4]}}},
    {"name": "cond", "symbols": ["not"], "postprocess": id},
    {"name": "cond", "symbols": ["p"], "postprocess": id},
    {"name": "not$subexpression$1", "symbols": [/[nN]/, /[oO]/, /[tT]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "not", "symbols": ["not$subexpression$1", "_", {"literal":"("}, "_", "or", "_", {"literal":")"}], "postprocess": function(d) {return {type: "not", val: d[4]}}},
    {"name": "setp", "symbols": [{"literal":"("}, "_", "setp", "_", {"literal":")"}], "postprocess": function(d) {return d[2]}},
    {"name": "setp", "symbols": ["setops"], "postprocess": id},
    {"name": "setp", "symbols": ["var"], "postprocess": id},
    {"name": "setops$subexpression$1$subexpression$1", "symbols": [/[uU]/, /[nN]/, /[iI]/, /[oO]/, /[nN]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "setops$subexpression$1", "symbols": ["setops$subexpression$1$subexpression$1"]},
    {"name": "setops$subexpression$1$subexpression$2", "symbols": [/[jJ]/, /[oO]/, /[iI]/, /[nN]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "setops$subexpression$1", "symbols": ["setops$subexpression$1$subexpression$2"]},
    {"name": "setops", "symbols": ["setp", "__", "setops$subexpression$1", "__", "setp"], "postprocess": function(d) {return {type: "union", left: d[0], right: d[4]}}},
    {"name": "setops$subexpression$2$subexpression$1", "symbols": [/[iI]/, /[nN]/, /[tT]/, /[eE]/, /[rR]/, /[sS]/, /[eE]/, /[cC]/, /[tT]/, /[iI]/, /[oO]/, /[nN]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "setops$subexpression$2", "symbols": ["setops$subexpression$2$subexpression$1"]},
    {"name": "setops$subexpression$2$subexpression$2", "symbols": [/[iI]/, /[nN]/, /[tT]/, /[eE]/, /[rR]/, /[sS]/, /[eE]/, /[cC]/, /[tT]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "setops$subexpression$2", "symbols": ["setops$subexpression$2$subexpression$2"]},
    {"name": "setops", "symbols": ["setp", "__", "setops$subexpression$2", "__", "setp"], "postprocess": function(d) {return {type: "intersection", left: d[0], right: d[4]}}},
    {"name": "setops$subexpression$3", "symbols": [{"literal":"-"}]},
    {"name": "setops$subexpression$3$subexpression$1", "symbols": [/[dD]/, /[iI]/, /[fF]/, /[fF]/, /[eE]/, /[rR]/, /[eE]/, /[nN]/, /[cC]/, /[eE]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "setops$subexpression$3", "symbols": ["setops$subexpression$3$subexpression$1"]},
    {"name": "setops$subexpression$3$subexpression$2", "symbols": [/[mM]/, /[iI]/, /[nN]/, /[uU]/, /[sS]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "setops$subexpression$3", "symbols": ["setops$subexpression$3$subexpression$2"]},
    {"name": "setops", "symbols": ["setp", "_", "setops$subexpression$3", "_", "setp"], "postprocess": function(d) {return {type: "difference", left: d[0], right: d[4]}}},
    {"name": "color", "symbols": [{"literal":"#"}, /[A-Fa-f0-9]/, /[A-Fa-f0-9]/, /[A-Fa-f0-9]/, /[A-Fa-f0-9]/, /[A-Fa-f0-9]/, /[A-Fa-f0-9]/], "postprocess": function(d) {return d.join("")}},
    {"name": "color", "symbols": [{"literal":"#"}, /[A-Fa-f0-9]/, /[A-Fa-f0-9]/, /[A-Fa-f0-9]/], "postprocess": function(d) {return d.join("")}},
    {"name": "color", "symbols": [], "postprocess": id},
    {"name": "condvar", "symbols": ["not"], "postprocess": id},
    {"name": "condvar", "symbols": ["var"], "postprocess": id},
    {"name": "var$ebnf$1", "symbols": [/[\w]/]},
    {"name": "var$ebnf$1", "symbols": ["var$ebnf$1", /[\w]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "var", "symbols": ["var$ebnf$1"], "postprocess": function(d) {return d[0].join("")}},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "wschar", "symbols": [/[ \t\v\f]/], "postprocess": id}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
