var osmosis = require('../../');

var elements = {

}
osmosis.get('https://developer.mozilla.org/en-US/docs/Web/API')
.find('.indexListRow:starts-with("HTML"):has(code:ends-with("Element"))')
.set('name')
.set({
    link: 'a@href',
    descripton: 'a@title',
    experimental: '.icon-beaker',
    deprecated: '.icon-thumbs-down-alt',
    non_standard: '.icon-warning-sign',
    obsolete: '.icon-trash',
    read_only: '.readOnly',
})
.follow('a@href')
.set({
    properties: [osmosis.find('#Properties + * + table > tbody > tr:has-child(td), #Properties + * + dl > dt')
                .set({
                    name: 'code',
                    description: 'self::node() + dd, td[3]',
                    experimental: '.icon-beaker',
                    deprecated: '.icon-thumbs-down-alt',
                    non_standard: '.icon-warning-sign',
                    obsolete: '.icon-trash',
                    read_only: '.readOnly',
                    details: 'code[0]/parent::a@title',
                    link: 'code[0]/parent::a@href',
                })],
    methods: [osmosis.find('#Methods + * + table > tbody > tr:has-child(td), #Methods + * + dl > dt')
                .set({
                    name: 'code',
                    description: 'self::node() + dd, td[3]',
                    experimental: '.icon-beaker',
                    deprecated: '.icon-thumbs-down-alt',
                    non_standard: '.icon-warning-sign',
                    obsolete: '.icon-trash',
                    read_only: '.readOnly',
                    details: 'a:has(code)@title',
                    link: 'a:not(.new):has(code)@href',
                    args: osmosis.follow('code[0]/parent::a:not(.new)@href').find('h2 + * + ul > li code, dl > dt code')
                })]
})
.data(function(data) {
    var name = data.name.replace(/^HTML/, '').replace(/Element$/, '').toLowerCase();
    var props = data.properties;
    var methods = data.methods;
    delete data.props;
    delete data.methods;
    data.link = 'https://developer.mozilla.org'+data.link,
    data.methods = {};
    data.properties = {};
    elements[name] = toBool(data);
    props.forEach(function(prop) {
        var pname = prop.name.replace(data.name+'.', '');
        if (prop.link)
            prop.link = 'https://developer.mozilla.org'+prop.link;
        elements[name].properties[pname] = toBool(prop);
    })
    methods.forEach(function(prop) {
        var pname = prop.name.replace(data.name+'.', '').replace(/\((.*?)\)/, function(s, a) {
            if (!prop.args && a.length > 0)
                prop.args = a.split(', ');
            return '';
        });
        if (prop.link)
            prop.link = 'https://developer.mozilla.org'+prop.link;
        elements[name].methods[pname] = toBool(prop);
    })
})
.done(function() {
    console.log(JSON.stringify(elements, null, ' '))
})
//.log(console.log)
//.error(console.log)

var boolKeys = ['obsolete', 'non_standard', 'deprecated', 'experimental', 'read_only'];
function toBool(obj) {
    boolKeys.forEach(function(key) {
        if (obj[key] !== undefined)
            obj[key] = true;
    })
    return obj;
}
