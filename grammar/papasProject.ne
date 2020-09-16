#@builtin "whitespace.ne"
@builtin "number.ne"


main -> lines {% id %}

lines -> "\n":* line "\n":* {% function(d) {return [d[1]]} %}
		| "\n":* (line "\n":+ {% id %}):+ line "\n":* {% function(d) {return [...d[1], d[2]]} %}
		
line -> _ color _ statement _ ";":? _ {% function(d) {return { color: d[1], ...d[3] }} %}
		| _ color _ var _ "=" _ function _ ";":? _ {% function(d) {return {color: d[1], setvar: d[3], ...d[7]}} %}
		| _ color _ var _ "=" _ setp _ ";":? _ {% function(d) {return {color: d[1], type: "f-set_operation", setvar: d[3], ops: d[7]}} %}
		
statement -> "main"i "(" _ var _ ("," _ int _ "," _ int _ ):? ")" {% function(d) {let size = "default"; if (d[5]) size = {x: d[5][2], y: d[5][6]}; return {type: "f-main", var: d[3], size: size}} %}
		
function -> f_leader {% id %}
		| f_select {% id %}
		
f_leader -> "leader_elect"i "(" _ (setp):? _ ")" {% function(d) {return {type: "f-leaderelect", group: (d[3]) ? d[3][0] : null}} %}
		| "place_leader"i "(" _ int _ "," _ int _ ")" {% function(d) {return {type: "f-placeleader", coords: {x: d[3], y: d[7]}}} %}

f_select -> "select"i "(" (_ var _ ","):? _ conds _ ")" {% function(d) {return {type: "f-select", group: (d[2]) ? d[2][1] : null, conds: d[4]}} %}


# Conditions
conds -> or {% id %}

p -> "(" _ or _ ")" {% function(d) {return d[2]} %}
		
or -> or __ "or"i __ or {% function(d) {return {type: "or", left: d[0], right: d[4]}} %}
		| and {% id %}
and -> and __ "and"i __ and {% function(d) {return {type: "and", left: d[0], right: d[4]}} %}
		| cond {% id %}

cond -> condvar _ "==" _ condvar {% function(d) {return {type: "==", left: d[0], right: d[4]}} %}
		| condvar _ ">" _ condvar {% function(d) {return {type: ">", left: d[0], right: d[4]}} %}
		| condvar _ "<" _ condvar {% function(d) {return {type: "<", left: d[0], right: d[4]}} %}
		| condvar _ ">=" _ condvar {% function(d) {return {type: ">=", left: d[0], right: d[4]}} %}
		| condvar _ "<=" _ condvar {% function(d) {return {type: "<=", left: d[0], right: d[4]}} %}
#		| conds _ "and" _ conds
#		| conds _ "or" _ conds
		| not {% id %}
		| p {% id %}
		
not -> "not"i _ "(" _ or _ ")" {% function(d) {return {type: "not", val: d[4]}} %}


#Set Operations
setp -> "(" _ setp _ ")" {% function(d) {return d[2]} %}
		| setops {% id %}
		| var {% id %}

setops -> setp __ ("union"i | "join"i) __ setp {% function(d) {return {type: "union", left: d[0], right: d[4]}} %}
		| setp __ ("intersection"i | "intersect"i) __ setp {% function(d) {return {type: "intersection", left: d[0], right: d[4]}} %}
		| setp _ ("-" | "difference"i | "minus"i) _ setp {% function(d) {return {type: "difference", left: d[0], right: d[4]}} %}


# --- static ---

color -> "#" [A-Fa-f0-9] [A-Fa-f0-9] [A-Fa-f0-9] [A-Fa-f0-9] [A-Fa-f0-9] [A-Fa-f0-9] {% function(d) {return d.join("")} %}
		| "#" [A-Fa-f0-9] [A-Fa-f0-9] [A-Fa-f0-9] {% function(d) {return d.join("")} %}
		| null {% id %}

condvar -> not {% id %}
		| var {% id %}
		| decimal {% id %}

var -> [\w]:+ {% function(d) {return d[0].join("")} %}

_  -> wschar:* {% function(d) {return null;} %}
__ -> wschar:+ {% function(d) {return null;} %}

wschar -> [ \t\v\f] {% id %}