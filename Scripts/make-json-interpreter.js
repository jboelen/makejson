(function () {
    var LoadExternal = function (url) {
        var data = "<div>Unable to Load Template</div>";
        $.ajax({
            async: false,
            url: url,
            success: function (response) {
                data = response;
            }
        });
        return data;
    };

    var location = '/Scripts/Languages/';
    var templates = {
        optionButton: LoadExternal('/Content/Templates/interpreter-selections.html')
    }
    var Languages = {
        /*"CSharp" : { file:'csharp.js', name:"CSharp", display:'C#', language: null},
        "Cpp" : { file:'csharp.js', name:"Cpp", display:'C++', language: null},
        "Java" : { file:'csharp.js', name:"Java", display:'Java', language: null},*/
        "JavaScript" : {
            file:'javascript.js',
            name:"JavaScript",
            display:'JavaScript',
            description: 'Enter a JavaScript object and press go.',
            language: null}
    };

    var abstractLanguage = Backbone.View.extend({
        events:{

        },
        interpret: function(value){
            this.Raw = value;
            return this.extractClass();
        },
        extractClass: function(){},
        extractProperty: function(){},
        extractGetterSetter: function(){},
        extractDefaults: function(){}
    });

    var view = Backbone.View.extend({
        events:{
            'click #interpreter-submit': 'onGo'
        },
        initialize: function(){
            this.setElement('#interpreter');
            this.render();
            var self = this;
            $(window).on('hashchange', function() {
                self.render();
            });
        },
        render: function(){
            this.$('.alert').slideUp();
            this.Language = window.location.hash !== '' ? Languages[window.location.hash.match(/#!(.*)/)[1]] : undefined;
            if (this.Language !== undefined){
                this.$('#message-intro').html(this.Language.description);
                $('#interpreter-container .wrapper',this.$el).html('<div class="form-group"><div><textarea id="raw-input" class="form-control" rows="3"></textarea></div></div>');
                $('#interpreter-container h4 strong',this.$el).html(this.Language.display + ' Interpreter');
                $('#interpreter-submit',this.$el).slideDown();
                this.Language.language = new (eval(LoadExternal(location + this.Language.file))(abstractLanguage))();
                $("textarea", this.$el).autosize();
                $("textarea", this.$el).focus();

            }
            else
            {
                var self = this;
                this.$('#message-intro').html('Select a language, paste your class, press go.');
                $('#interpreter-submit',this.$el).hide();
                $('#interpreter-container h4 strong',this.$el).html('Select Language');
                $("#interpreter-container .wrapper",self.$el).html('');
                $('#interpreter-output',this.$el).hide();
                $('#formatted-output pre',this.$el).html('');
                _.each(Languages, function(l){
                    $("#interpreter-container .wrapper",self.$el).append(_.template(templates.optionButton, l));
                });

            }
        },
        onGo: function(){
            try {
                var interpretation = this.Language.language.interpret($('#raw-input', this.$el).val());
                $('#formatted-output pre',this.$el).html(JSON.stringify(interpretation));
                $('#interpreter-output',this.$el).slideDown();
                this.$('.alert').slideUp();
            } catch (exception) {
                this.$('.alert').slideDown();
            }
        }
    });

    return new view();
})();