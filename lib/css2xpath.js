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


var ns_uri = 'ancestor-or-self::*[last()]/@url';
var ns_path = get_path(get_url(ns_uri));
var has_proto = '(starts-with('+urlAttrs+',"http://") or starts-with('+urlAttrs+',"https://"))';
var is_internal = 'starts-with('+get_url()+','+domain(ns_uri)+') or '+ends_with(domain(), domain(ns_uri));
var is_local = '('+has_proto+' and starts-with('+get_url()+','+get_url(ns_uri)+'))';
var is_path = 'starts-with('+urlAttrs+',"/")';
var is_local_path = 'starts-with('+get_path()+','+ns_path+')';
var normal = "normalize-space()";
var operator_char = String.fromCharCode(28);
var filter_char = String.fromCharCode(29);
var literal_char = String.fromCharCode(30);
var expression_char = String.fromCharCode(31);
var css2xpath = (function(){
    var re      = [
            /\s*([+>, ])\s*([^\/\(\)\[\]\|\s\+\>\<\=\'\"\,\x1D-\x1F]+\(?)/g, function(s, a, b, offset) {
                if (b.search(/^([0-9]+|[a-z\-]+\(|.+?::.*|and|or|mod)$/) !== -1)
                    return s;
                if (a === ' ')
                    return '//'+b;
                else if (a === '+')
                    return (offset==0?'.//':'/')+'following-sibling::*[1]/self::'+b;
                else if (a === '>')
                    return '/'+b;
                else if (a === ',')
                    if (b.charAt(0) === '/' || b.charAt(1) === '/')
                        return '|'+b;
                    else
                        return '|.//'+b;
            },
            // :has
            /:(has|has-sibling|has-parent|has-ancestor|before|before-sibling|after|after-sibling)?\((\x1F*)(.+?[^\x1F])\2\)/g, function(s, a, b, c){
                var axis = '';
                if (a === 'has-sibling')
                    return "[count("+css2xpath("preceding-sibling::"+c, true)+") > 0 or count("+css2xpath("following-sibling::"+c, true)+") > 0]";
                else if (a === 'has-parent')
                    axis += 'parent::'
                else if (a === 'has-ancestor')
                    axis += 'ancestor::'
                else if (a === 'after')
                    axis += 'preceding::'
                else if (a === 'after-sibling')
                    axis += 'preceding-sibling::'
                else if (a === 'before')
                    axis += 'following::';
                else if (a === 'before-sibling')
                    axis += 'following-sibling::';
                return "[count("+ css2xpath(axis+c, true) +") > 0]";
            },

            // add @ attributes
            /\[([^\@\|\*\=\^\~\$\!\(\/]+\(?)([^\]]*)\]/g, function(s, a, b) {
                if (a.charAt(a.length-1) === '(' || a.search(/^[0-9]+$/) !== -1 || a.indexOf(':') !== -1)
                    return s;
                return '[@'+a+b+']';
            },
            //\[([^\@\|\*\=\^\~\$\!\(\/]+)(\s*\][\|\*\=\^\~\$\!]?=)"?([^\]]*?)"?\]/g, '[@$1$2"$3"]',
            // |= attrib
            /\[\@(.+?)\|=([^\]]+)\]/g, "[@$1=$2 or starts-with(@$1,concat($2,'-'))]",
            // *= attrib
            /\[\@(.+?)\*=([^\]]+)\]/g, "[contains(@$1,$2)]",
            // ~= attrib
            /\[\@(.+?)~=([^\]]+)\]/g, "[contains(concat(' ',normalize-space(@$1),' '),concat(' ',$2,' '))]",
            // ^= attrib
            /\[\@(.+?)\^=([^\]]+)\]/g, "[starts-with(@$1,$2)]",
            // $= attrib
            /\[\@(.+?)\$=([^\]]+)\]/g, function(s, a, b) { return "[substring(@"+ a +",string-length(@"+ a +")-(string-length("+ b +")-1))="+ b +"]" },
            // != attrib
            /\[\@(.+?)\!=([^\]]+)\]/g, "[not(@$1) or @$1!=$2]",

            // #ids
            /#([^\/\(\[\)\]\|\:\s\+\>\<\'\"\x1D-\x1F]+)/g, "[@id='$1']",
            // .classes
            /\.([^\/\(\[\)\]\|\:\s\+\>\<\'\"\x1D-\x1F]+)/g, "[contains(concat(' ',normalize-space(@class),' '),' $1 ')]",

            /:(active|focus|hover|link|visited)/, '',
            /:lang\(\x1F*([^\)]*?)\x1F*\)/, '[@lang=$1]',
            /:read-(only|write)/, '[@read$1]',
            /:(in|out-of)-range/, '[@$1-range]',
            /:(valid|required)/, '[@$1]',
            /:root/, 'ancestor-or-self::*[last()]',
            /:target/, '[starts-with(@href, "#")]',

            // :first-child
            /:first-child/g, "[not(preceding-sibling::*)]", // was: /([^\s\(]+):first-child/g, "*[1]/self::$1",
            // :last-child
            /:last-child/g, "[not(following-sibling::*)]", // was: /([^\s\(]+):last-child/g, "$1[not(following-sibling::*)]",
            // :only-child
            /:only-child/g, "[not(preceding-sibling::*) and not(following-sibling::*)]", // was: /([^\s\(]+):only-child/g, "*[last()=1]/self::$1",
            // :nth-child
            /:nth-child\(\x1F*([^\)]*?)\x1F*\)/g, function(s, a, b){
                if (a.match(/^[0-9]+$/))
                    return '[(count(preceding-sibling::*)+1) = '+a+']';
                switch(a) {
                    case    "even":
                        return "[(count(preceding-sibling::*)+1) mod 2=0]";
                    case    "odd":
                        return "[(count(preceding-sibling::*)+1) mod 2=1]";
                    default:
                        a = (a || "0").replace(/^([0-9]*)n.*?([0-9]*)$/, "$1+$2").split("+");
                        a[0] = a[0] || "1";
                        a[1] = a[1] || "0";
                        return "[(count(preceding-sibling::*)+1)>="+ a[1] +" and ((count(preceding-sibling::*)+1)-"+a[1]+") mod "+ a[0] +"=0]";
                }
            },


            // extras:

            // :empty
            /:empty/g, "[not(*) and not(normalize-space())]",
            // :checked
            /:(checked|selected)/g, "[@selected or @checked]",
            // :enabled
            /:(enabled|disabled)/g, "[@$1]",


            // String comparison:


            // :starts-with
            /:i?starts-with\(([^\)]*)\)/g, function(s, a) {
                if (s.charAt(1) === 'i')
                    return "[starts-with("+ lower() +','+ lower(a) +')]';
                else
                    return "[starts-with("+ normal +','+ a +')]';
            },
            // :ends-with
            /:i?ends-with\(([^\)]*)\)/g, function(s, a) {
                if (s.charAt(1) === 'i')
                    return "["+ends_with(lower(), lower(a))+"]";
                else
                    return "["+ends_with(normal, a)+"]"
            },
            // :contains("str")
            /:i?contains\(([^\)]+)\)/g, function(s, a) {
                if (a.match(/\x1E/) === null)
                    a = '"'+a+'"';
                if (s.charAt(1) === 'i')
                    return "[contains("+ lower() +","+ lower(a) + ")]";
                else
                    return "[contains("+ normal +","+ a + ")]";
            },


            // :first(n), limit(n)
            /:(first(-of-type)?|limit)\(([^\)]+)\)/g, "[position()<=$3]",
            // :first or :first-of-type
            /:first(-of-type)?/g, "[1]",
            // :last(n)
            /:last(-of-type)?\(([^\)]+)\)/g, "[position()>last()-$2]",
            // :last or :last-of-type
            /:last(-of-type)?/g, "[last()]",
            // :skip(n)
            /:skip(-first)?\(([^\)]+)\)/g, "[position()>$2]",
            // :skip-last(n)
            /:skip-last\(([^\)]+)\)/g, "[last()-position()>=$1]",
            /:skip-last/g, "[position()<last()]",
            // :range(n,n)
            /:range\(([^\,]+)\,\s*([^\)]+)\)/g, "[$1<=position() and position()<=$2]",
            // :odd
            /:odd/g, ":nth-of-type(odd)",
            // :even
            /:even/g, ":nth-of-type(even)",
            // :nth-of-type
            /:nth-of-type\(\x1F*([^\)]+?)\x1F*\)/g, function(s, a) {
                if (a.match(/^[0-9]+$/))
                    return '['+a+']';
                switch(a){
                    case    "even":
                        return "[position() mod 2=0 and position()>=0]";
                    case    "odd":
                        return "[position() mod 2=1]";
                    default:
                        a = (a || "0").replace(/^([-0-9]*)n.*?([0-9]*)$/, "$1+$2").split("+");
                        a[0] = a[0] || "1";
                        a[1] = a[1] || "0";
                        return "[position()>="+a[1]+" and (position()-"+a[1]+") mod "+a[0]+"=0]";
                }
            },
            // :internal
            /:internal/g, '[not('+has_proto+') or '+is_internal+']',
            // :external
            /:external/g, '['+has_proto+' and not('+is_internal+')]',
            // :local
            //:local/g, '[starts-with('+urlAttrs+',"./") or ('+is_path+' and '+is_local_path+') or '+is_local+']',
            // :http
            /:(https?|javascript)/g, '[starts-with(@href,concat("$1",":"))]',
            // :domain
            /:domain\((.+?)\)/g, '[(string-length('+domain()+')=0 and contains('+domain(ns_uri)+',$1)) or contains('+domain()+',$1)]',
            // :path
            /:path\((.+?)\)/g, '[starts-with('+get_path()+',substring-after($1,"/"))]',

            /:not\((\x1F+)\[(.+?)\]\1\)/g, '[not($2)]',
            /:not\((\x1F+)(.+?[^\x1F])\1\)/g, '[not($2)]',
            //:not\((\x1F+)(.+?[^\x1F])\1\)/, '[not(self::node()$2)]',

            // escape filter spaces
            /*/([\s\[][0-9]+|\))\s*(and|or|mod|\+|\-|\*|\/|\!?\=|\>\=?|\<\=?)\s*(\x1E|[0-9]+|[a-z\-]+\()/g, function(s, a, b, c) {
                return a.replace(/\s+/g, '')+'\t'+b+'\t'+c;
            },*/

            //\[\s+/, '[',
            //\s+\]/, ']',

            // ~
            /\s*~\s*/g, "/following-sibling::",

            // add "/" between @attribute selectors
            /([^\(\[\/\|\s\x1F])\@/g, '$1/@',

            // add * to filters
            /(^|\/|\:)\[/g, '$1*[',
        ],
        length  = re.length
    ;
    return function css2xpath(s, nested) {
        if (nested !== true) {
            var literals = [];
            s = s.trim().replace(/(['"])(|.*?[^\\])\1/g, function(s, a, b) {
                return repeat(literal_char, literals.push(b));
            });
            s = escapeChar(s, '(', ')', expression_char);
        }

        var i = 0;
        while (i < length)
            s = s.replace(re[i++], re[i++]);

        // normalize multiple filters
        //s = escapeChar(s, '[', ']', filter_char);
        //s = s.replace(/(\x1D+)\]\[\1(.+?[^\x1D])\1\]/g, ' and ($2)$1]')

        if (nested !== true) {
            s = s.replace(/['"]?(\x1E+)['"]?/g, function(s, a) {
                var str = literals[a.length-1];
                if (str.indexOf('"') === -1)
                    return '"'+str+'"';
                else
                    return "'"+str+"'"
            })
            s = s.replace(/[\x1D-\x1F]+/g, '');
        }
        var char = s.charAt(0);
        if (char !== '.' && char !== '/')
            s = './/'+s;
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
