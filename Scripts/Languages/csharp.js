(function (abstract) {

    var expressions = {
        findClass: /^.* class (.*)\{/,
        findProp: /public (string|int|char) ([^ ]*)/i,
        findDefault: /asd/
    };

    var concreteCSharp = abstract.extend({
        extractClass: function(){
            alert(this.Raw.match(expressions.findClass)[1]);
            alert(this.Raw.match(expressions.findProp)[2]);
        },
        extractProperty: function(){

        },
        extractGetterSetter: function(){

        },
        extractDefaults: function(){

        }
    });


    return concreteCSharp;
});