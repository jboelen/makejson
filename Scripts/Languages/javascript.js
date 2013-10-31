(function (abstract) {
    var concreteJavaScript = abstract.extend({
        interpret: function(value){
            this.Raw = value;
            return eval('('+ this.Raw + ')');
        }
    });


    return concreteJavaScript;
});