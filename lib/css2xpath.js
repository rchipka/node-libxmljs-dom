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
    return 'substring('+str1+',string-length('+str1+')-string-length('+str2+')+1)='+str2+'';
}

var ns_uri = 'namespace-uri(ancestor-or-self::*[last()])';
var ns_path = get_path(get_url(ns_uri));
var has_proto = '(starts-with('+urlAttrs+',"http://") or starts-with('+urlAttrs+',"https://"))';
var is_internal = 'starts-with('+get_url()+','+domain(ns_uri)+') or '+ends_with(domain(), domain(ns_uri));
var is_local = '('+has_proto+' and starts-with('+get_url()+','+get_url(ns_uri)+'))';
var is_path = 'starts-with('+urlAttrs+',"/")';
var is_local_path = 'starts-with('+get_path()+','+ns_path+')';
var normal = "normalize-space()";
var lower = "translate(normalize-space(), 'ABCDEFGHJIKLMNOPQRSTUVWXYZ', 'abcdefghjiklmnopqrstuvwxyz')";
var literal_char = String.fromCharCode(30);
var expression_char = String.fromCharCode(31);
var css2xpath = (function(){
    var re      = [
            // multiple queries
            /\s*([^\\]),\s*/g, "$1|.//",

            // add @ attributes
            /\[([^\@\|\*\=\^\~\$\!\(]+)\]/g, '[@$1]',
            /\[([^\@\|\*\=\^\~\$\!\(]+)([\|\*\=\^\~\$\!]?=)"?([^\]]*?)"?\]/g, '[@$1$2"$3"]',
            // |= attrib
            /\[\@(.+)\|=([^\]]+)\]/g, "[@$1=$2 or starts-with(@$1,concat($2,'-'))]",
            // *= attrib
            /\[\@(.+)\*=([^\]]+)\]/g, "[contains(@$1,$2)]",
            // ~= attrib
            /\[\@(.+)~=([^\]]+)\]/g, "[contains(concat('\\ ',normalize-space(@$1),'\\ '),concat('\\ ',$2,'\\ '))]",
            // ^= attrib
            /\[\@(.+)\^=([^\]]+)\]/g, "[starts-with(@$1,$2)]",
            // $= attrib
            /\[\@(.+)\$=([^\]]+)\]/g, function(s, a, b){return "[substring(@".concat(a, ",string-length(@", a, ")-", b.length - 3, ")=", b, "]");},
            // != attrib
            /\[\@(.+)!=([^\]]+)\]/g, "[not(@$1) or @$1!=$2]",

            // #ids
            /#([^\/\(\[\)\]\:\s]+)/g, "[@id='$1']",
            // .classes
            /\.([^\/\(\[\)\]\:\s]+)/g, "[contains(concat('\\ ',normalize-space(@class),'\\ '),'\\ $1\\ ')]",

            // :first-child
            /:first-child/g, "[count(preceding-sibling::*)=0]", // was: /([^\s\(]+):first-child/g, "*[1]/self::$1",
            // :last-child
            /:last-child/g, "[count(following-sibling::*)=0]", // was: /([^\s\(]+):last-child/g, "$1[not(following-sibling::*)]",
            // :only-child
            /:only-child/g, "[count(preceding-sibling::*)=0 and count(following-sibling::*)=0]", // was: /([^\s\(]+):only-child/g, "*[last()=1]/self::$1",
            // :nth-child
            /([^\s\(]*):nth-child\(([^\)]*)\)/g, function(s, a, b){
            switch(b){
                case    "n":
                    return a;
                case    "even":
                    if (a !== undefined)
                        return "*[position() mod 2=0 and position()>=0]/self::" + a;
                    else
                        return "[(count(preceding-sibling::*)+1) mod 2=0]"
                case    "odd":
                    return a + "[(count(preceding-sibling::*)+1) mod 2=1]";
                default:
                    b = (b || "0").replace(/^([0-9]*)n.*?([0-9]*)$/, "$1+$2").split("+");
                    b[1] = b[1] || "0";
                    return "*[(position()-".concat(b[1], ") mod ", b[0], "=0 and position()>=", b[1], "]/self::", a);
                }
            },


            // extras:

            // :empty
            /:empty/g, "[not(*) and not(normalize-space())]",
            // :checked
            /:(checked|selected)/g, "[@selected or @checked]",
            // :has
            /:(has|before|before-sibling)\((\x1F*)(.+?[^\x1F])\2\)/g, function(s, a, b, c){
                var prefix = '';
                if (a === 'before')
                    prefix += 'following::';
                else if (a === 'before-sibling')
                    prefix += 'following-sibling::';
                return String().concat("[count(", (css2xpath(prefix+c)), ") > 0]");
            },


            // String comparison:


            // :starts-with
            /:i?starts-with\("?([^\)]*?)"?\)/g, function(s, a){
                return "[starts-with("+(s.charAt(1)==='i'?lower:normal)+',"' + a.replace("\\ ", ' ') + '")]';
            },
            // :ends-with
            /:i?ends-with\("?([^\)]*?)"?\)/g, function(s, a){
                var str = normal;
                var search = a;
                if (s.charAt(1)==='i') {
                    search = search.toLowerCase();
                    str = lower;
                }
                return "[substring(" + str + ",string-length(" + str + ') - ' + search.length + "+1)=\""+search+"\"]";
            },
            // :contains("str")
            /:i?contains\(([^\)]+)\)/g, function(s, a) {
                if (a.match(/\x1E/) === null)
                    a = '"'+a+'"';
                return "[contains("+(s.charAt(1)==='i'?lower:normal)+',' + a + ')]';
            },


            // :first(n), limit(n)
            /:(first(-of-type)?|limit)\(([0-9]+)\)/g, "[position()<=$3]",
            // :first or :first-of-type
            /:first(-of-type)?/g, "[1]",
            // :last(n)
            /:last(-of-type)?\(([0-9]+)\)/g, "[position()>last()-$2]",
            // :last or :last-of-type
            /:last(-of-type)?/g, "[last()]",
            // :skip(n)
            /:skip(-first)?\(([0-9]+)\)/g, "[position()>$2]",
            // :skip-last(n)
            /:skip-last/g, "[position()<last()]",
            /:skip-last\(([0-9]+)\)/g, "[last()-position()>$1]",
            // :range(n,n)
            /:range\(([0-9]+)\|([0-9]+)\)/g, "[$1<=position() and position()<=$2]",
            // :odd
            /:odd/g, ":nth-of-type(odd)",
            // :even
            /:even/g, ":nth-of-type(even)",
            // :nth-of-type
            /:nth-of-type\(([^\)]*)\)/g, function(s, a){
                if (a.match(/^[0-9]+$/))
                    return '['+a+']';
                switch(a){
                    case    "even":
                        return "[position() mod 2=0 and position()>=0]";
                    case    "odd":
                        return "[position() mod 2=1]";
                    default:
                        a = (a || "0").replace(/^([-0-9]*)n.*?([0-9]*)$/, "$1+$2").split("+");
                        a[1] = a[1] || "0";
                        return "*[(position()-".concat(a[1], ") mod ", a[0], "=0 and position()>=", a[1], "]");
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
            /:domain\((.+?)\)/g, '[(string-length('+domain()+')>0 and contains('+domain()+',$1)) or contains('+domain(ns_uri)+',$1)]',
            // :path
            /:path\((.+?)\)/g, '[starts-with('+get_path()+',substring-after($1,"/"))]',

            /:not\((\x1F*)\[(.*)\]\1\)/g, '[not($2)]',
            /:not\((\x1F*)(.+?[^\x1F])\1\)/g, '[not($2)]',

            // escape filter spaces
            /([\s\[][0-9]+|\))\s*(and|or|mod|\+|\-|\*|\/|\!?\=|\>\=?|\<\=?)\s*/g, '$1\t$2\t',
            /\[\s+/, '[',
            /\s+\]/, ']',

            // >
            /([^\t]) *> *([^\t])/g, "$1/$2",

            // +
            /([^\t]) *\+ *([^\t])/g, "$1/following-sibling::*[1]/self::$2",

            // ~
            /\s*~\s*/g, "/following-sibling::",

            /\s*(and|or|mod|[\>\<]?\=|\,)\s+/g, '\t$1\t',

            // remaining whitespace == descentant-or-self
            /([^\\]) +/g, '$1//',

            /(and|or)\s*@/g, '$1\t@',

            // add "/" between @attribute selectors
            /([^\(\[\/\|\t])\@/g, '$1/@',

            // add * to filters
            /(^|\/|\:)\[/g, '$1*[',

            // unescape whitespace
            /(\\ |\t+)/g, ' ',

            // normalize multiple filters
            //\]\[([^\[\]]+|(\[[^\]]+\])[1,])/g, " and ($1)",
        ],
        length  = re.length
    ;
    return function css2xpath(s) {
        var literals = [];
        s = s.replace(/([^\\][\[\(=\,])['"](.*?)['"]([\,\]\)])/g, function(s, a, b, c) {
            return a+literal_char+literals.push(b)+c;
        });

        var type;
        var filter = false;
        var depth = 0;
        s = s.replace(/([\(\)])/g, function(s, a) {
            if (a === '(') {
                depth++;
            }
            var str = "";
            for (var i = depth; i--;) {
                str += expression_char;
            }
            if (a === '(') {
                return a+str;
            }else{
                depth--;
                return str+a;
            }
        })
        var i = 0;
        while (i < length)
            s = s.replace(re[i++], re[i++]);
        s = s.replace(/\x1F/g, '');
        s = s.replace(/['"]?\x1E([0-9]+)['"]?/g, function(s, a) {
            return '"'+literals[parseInt(a)-1]+'"';
        })
        if (s.charAt(0) !== '.' && s.charAt(0) !== '/')
            s = './/'+s;
        return s;
    };
})();
module.exports = css2xpath;
