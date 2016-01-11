'use strict';
/**
 * Based on: http://code.google.com/p/css2xpath/ by Andrea Giammarchi
 */

var urlAttrs = '@href|@src';
function domain(str) {
    return 'substring-before(concat(substring-after('+(str||urlAttrs)+',"://"),"/"),"/")';
}

function get_url(str) {
    return 'substring-before(concat(substring-after('+(str||urlAttrs)+',"://"),"?"),"?")';
}

function get_path(str) {
    return 'substring-after('+(str||urlAttrs)+',"/")';
}

function ends_with(str1, str2) {
    return 'substring('+str1+',string-length('+str1+')-string-length('+str2+')+1)='+str2;
}

function lower(s) {
    return "translate("+(s||'normalize-space()')+", 'ABCDEFGHJIKLMNOPQRSTUVWXYZ', 'abcdefghjiklmnopqrstuvwxyz')";
}

var lower_s = lower();

var ns_uri = 'ancestor-or-self::*[last()]/@url';
var ns_path = get_path(get_url(ns_uri));
var has_proto = '(starts-with('+urlAttrs+',"http://") or starts-with('+urlAttrs+',"https://"))';
var is_internal = 'starts-with('+get_url()+','+domain(ns_uri)+') or '+ends_with(domain(), domain(ns_uri));
var is_local = '('+has_proto+' and starts-with('+get_url()+','+get_url(ns_uri)+'))';
var is_path = 'starts-with('+urlAttrs+',"/")';
var is_local_path = 'starts-with('+get_path()+','+ns_path+')';
var normal = "normalize-space()";

var xpath_internal = '[not('+has_proto+') or '+is_internal+']';
var xpath_external = '['+has_proto+' and not('+is_internal+')]';

var quote_regex = /("[^"]*"|'[^']*')/g;

var operator_char = String.fromCharCode(28);
var filter_char = String.fromCharCode(29);
var literal_char = String.fromCharCode(30);
var expression_char = String.fromCharCode(31);

var css2xpath = (function(){
    var re      = [
            /\[([^\@\|\*\=\^\~\$\!\(\/]+\(?)(([\|\*\~\^\$\!]?)=\s*['"]?([^\]\x1F]+?)['"]?)?\]/g, function(str, attr, comp, op, val) {
                switch (op) {
                    case '!':
                        return '[not(@'+attr+') or @'+attr+'!="'+val+'"]';
                    case '$':
                        return '[substring(@'+attr+',string-length(@'+attr+')-(string-length("'+val+'")-1))="'+val+'"]';
                    case '^':
                        return '[starts-with(@'+attr+',"'+val+'")]';
                    case '~':
                        return '[contains(concat(" ",normalize-space(@'+attr+')," "),concat(" ","'+val+'"," "))]';
                    case '*':
                        return '[contains(@'+attr+',"'+val+'")]';
                    case '|':
                        return '[@'+attr+'="'+val+'" or starts-with(@'+attr+',concat("'+val+'","-"))]';
                    default:
                        if (comp === undefined) {
                            if (attr.charAt(attr.length-1) === '(' || attr.search(/^[0-9]+$/) !== -1 || attr.indexOf(':') !== -1)
                                return str;
                            return '[@'+attr+']';
                        }else{
                            return '[@'+attr+'="'+val+'"]'
                        }
                }
            },

            /\s*([+>~, ])\s*(and\s*|or\s*|mod\s*|[^\!\/\(\)\]\|\s\+\>\<\=\'\"\,\x1D-\x1F]+\(?)/g, function(s, a, b, offset) {
                if (b.search(/^([0-9]+$|[a-z\-]+\($|[^\:]+?::|and|or|mod)/) !== -1)
                    return s;
                if (a === ' ')
                    return '//'+b;
                else if (a === '+')
                    return (offset==0?'.//':'/')+'following-sibling::*[1]/self::'+b;
                else if (a === '>')
                    return '/'+b;
                else if (a === '~')
                    return '/following-sibling::';
                else if (a === ',')
                    if (b.charAt(0) === '/' || b.charAt(1) === '/')
                        return '|'+b;
                    else
                        return '|.//'+b;
            },

            /:([a-z\-]+)(\((\x1F+)(([^\x1F]+(\3\x1F+)?)*)(\3\)))?/g, function(str, name, m1, m2, arg) {
                if (name === 'odd' || name === 'even') {
                    arg  = name;
                    name = "nth-of-type";
                }
                switch (name) {
                    case 'first-child':
                        return "[not(preceding-sibling::*)]";
                    case 'last-child':
                        return "[not(following-sibling::*)]";
                    case 'only-child':
                        return "[not(preceding-sibling::*) and not(following-sibling::*)]";
                    case 'nth-child':
                        if (arg.match(/^[0-9]+$/))
                            return '[(count(preceding-sibling::*)+1) = '+arg+']';
                        switch(arg) {
                            case    "even":
                                return "[(count(preceding-sibling::*)+1) mod 2=0]";
                            case    "odd":
                                return "[(count(preceding-sibling::*)+1) mod 2=1]";
                            default:
                                var a = (arg || "0").replace(/^([0-9]*)n.*?([0-9]*)$/, "$1+$2").split("+");
                                a[0] = a[0] || "1";
                                a[1] = a[1] || "0";
                                return "[(count(preceding-sibling::*)+1)>="+ a[1] +" and ((count(preceding-sibling::*)+1)-"+a[1]+") mod "+ a[0] +"=0]";
                        }
                    case 'empty':
                        return "[not(*) and not(normalize-space())]";
                    case 'checked':
                        return "[@selected or @checked]";
                    case 'enabled':
                    case 'disabled':
                        return "[@"+name+"]";
                    case 'istarts-with':
                        return "[starts-with("+ lower_s +','+ lower(arg) +')]';
                    case 'starts-with':
                        return "[starts-with("+ normal +','+ arg +')]';
                    case 'iends-with':
                        return "["+ends_with(lower_s, lower(arg))+"]";
                    case 'ends-with':
                        return "["+ends_with(normal, arg)+"]";
                    case 'icontains':
                        return "[contains("+ lower_s +","+ lower(arg) + ")]";
                    case 'contains':
                        return "[contains("+ normal +","+ arg + ")]";
                    case 'has':
                        var xpath = css2xpath(arg, true)
                        if (xpath.charAt(0) === '[')
                            xpath = 'self::node()/'+xpath;
                        return "[count("+ xpath +") > 0]";
                    case 'has-sibling':
                        var xpath = css2xpath(arg, true);
                        return "[count(preceding-sibling::"+xpath+") > 0 or count(following-sibling::"+xpath+") > 0]";
                    case 'has-parent':
                        return "[count("+ css2xpath('parent::'+arg, true) +") > 0]";
                    case 'has-ancestor':
                        return "[count("+ css2xpath('ancestor::'+arg, true) +") > 0]";
                    case 'before':
                        return "[count("+ css2xpath('following::'+arg, true) +") > 0]";
                    case 'before-sibling':
                        return "[count("+ css2xpath('following-sibling::'+arg, true) +") > 0]";
                    case 'after':
                        return "[count("+ css2xpath('preceding::'+arg, true) +") > 0]";
                    case 'after-sibling':
                        return "[count("+ css2xpath('preceding-sibling::'+arg, true) +") > 0]";
                    case 'first':
                    case 'limit':
                    case 'first-of-type':
                        if (arg === undefined)
                            return '[1]';
                        return '[position()<='+arg+']';
                    case 'last':
                    case 'last-of-type':
                        if (arg !== undefined)
                            return "[position()>last()-"+arg+"]";
                        return "[last()]";
                    case 'skip':
                    case 'skip-first':
                        return "[position()>"+arg+"]";
                    case 'skip-last':
                        if (arg !== undefined)
                            return "[last()-position()>="+arg+"]";
                        return "[position()<last()]";
                    case 'range':
                        var arr = arg.split(',');
                        return "["+arr[0]+"<=position() and position()<="+arr[1]+"]";
                    case 'nth-of-type':
                        if (arg.match(/^[0-9]+$/))
                            return '['+arg+']';
                        switch (arg) {
                            case "odd":
                                return "[position() mod 2=1]";
                            case "even":
                                return "[position() mod 2=0 and position()>=0]";
                            default:
                                var a = (arg || "0").replace(/^([-0-9]*)n.*?([0-9]*)$/, "$1+$2").split("+");
                                a[0] = a[0] || "1";
                                a[1] = a[1] || "0";
                                return "[position()>="+a[1]+" and (position()-"+a[1]+") mod "+a[0]+"=0]";
                        }
                    case 'internal':
                        return xpath_internal;
                    case 'external':
                        return xpath_external;
                    case 'http':
                    case 'https':
                    case 'javascript':
                        return '[starts-with(@href,concat("'+name+'",":"))]';
                    case 'domain':
                        return '[(string-length('+domain()+')=0 and contains('+domain(ns_uri)+','+arg+')) or contains('+domain()+','+arg+')]';
                    case 'path':
                        return  '[starts-with('+get_path()+',substring-after("'+arg+'","/"))]'
                    case 'not':
                        var xpath = css2xpath(arg, true);
                        if (xpath.charAt(0) === '[')
                            xpath = 'self::node()'+xpath;
                        return '[not('+xpath+')]';
                    case 'target':
                        return '[starts-with(@href, "#")]';
                    case 'root':
                        return 'ancestor-or-self::*[last()]';
                    /*case 'active':
                    case 'focus':
                    case 'hover':
                    case 'link':
                    case 'visited':
                        return '';*/
                    case 'lang':
                        return '[@lang="'+arg+'"]';
                    case 'read-only':
                    case 'read-write':
                        return '[@'+name.replace('-', '')+']';
                    case 'valid':
                    case 'required':
                    case 'in-range':
                    case 'out-of-range':
                        return '[@'+name+']';
                    default:
                        return str;
                }
            },

            // #ids and .classes
            /(#|\.)([^\#\.\/\(\[\)\]\|\:\s\+\>\<\'\"\x1D-\x1F]+)/g, function(str, op, val) {
                if (op === '#')
                    return '[@id="'+val+'"]';
                return '[contains(concat(" ",normalize-space(@class)," ")," '+val+' ")]';
            }
        ],
        length  = re.length
    ;
    return function css2xpath(s, nested) {
        if (nested !== true) {
            var literals = [];
            s = s.trim().replace(quote_regex, function(s, a) {
                return repeat(literal_char, literals.push(a.substr(1, a.length-2)));
            });
            s = escapeChar(s, '(', ')', expression_char);
        }

        var i = 0;
        if (nested === true)
            i = 2;
        while (i < length)
            s = s.replace(re[i++], re[i++]);

        /*if (nested === true) {
            // normalize multiple filters
            s = escapeChar(s, '[', ']', filter_char);
            s = s.replace(/(\x1D+)\]\[\1(.+?[^\x1D])\1\]/g, ' and ($2)$1]')
        }*/
        if (nested !== true) {
            s = s.replace(/['"]?(\x1E+)['"]?/g, function(s, a) {
                var str = literals[a.length-1];
                if (str.indexOf('"') === -1)
                    return '"'+str+'"';
                else
                    return "'"+str+"'"
            })
            s = s.replace(/[\x1D-\x1F]+/g, '');
            var char = s.charAt(0);
            if (char !== '.' && char !== '/')
                s = './/'+s;
            literals = [];


            // add "/" between @attribute selectors
            s = s.replace(/([^\(\[\/\|\s\x1F])\@/g, '$1/@');

            // add * to filters
            s = s.replace(/(^|\/|\:)\[/g, '$1*[');
        }
        //console.log(s);
        return s;
    };
})();

function escapeChar(s, open, close, char) {
    var depth = 0;
    return s.replace(new RegExp('[\\'+open+'\\'+close+']', 'g'), function(a) {
        if (a === open)
            depth++;
        if (a === open) {
            return a+repeat(char, depth);
        }else{
            return repeat(char, depth--)+a;
        }
    })
}

function repeat(str, num) {
    num = Number(num);
    var result = '';
    while (true) {
       if (num & 1)
           result += str;
       num >>>= 1;
       if (num <= 0) break;
       str += str;
    }
    return result;
}

module.exports = css2xpath;
