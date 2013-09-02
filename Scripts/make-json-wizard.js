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

    var Templates = {
        button: LoadExternal("Content/Templates/ButtonQuestion.html"),
        input: LoadExternal("Content/Templates/InputQuestion.html"),
        props: LoadExternal("Content/Templates/PropertiesQuestion.html"),
        prop: LoadExternal("Content/Templates/PropertyForm.html"),
        output: LoadExternal("Content/Templates/WizardOutput.html"),
        backbone: LoadExternal("Content/Templates/BackboneModelShell.html")
    };

    var PropertyTypes = ["String", "Integer", "Float", "Date", "Object"];

    var Questions = {
        1: {
            Question: "My desired output is ...",
            AnswerType: "button",
            Answers: ["A JSON object", "A backbone model"]
        },
/*        2: {
            Question: "How many properties does my object have?",
            AnswerType: "input",
            Answers: ["10"]
        },*/
        2: {
            Question: "My object's properties are ...",
            AnswerType: "props",
            Answers: PropertyTypes
        }
    };

    var Answers = {};
    var Indexer = 1;

    var QuestionView = Backbone.View.extend({
        events:{
            'click button.next':'next',
            'click ul.property-type li' : 'changeProperty',
            'blur input.prop-name': 'growProperties',
            'keyup input.isObject' : 'updateObjectForm'
        },
        initialize: function() {
            _.bindAll(this, 'generate');
            this.Question = 1;
            this.setElement('.question');
            this.render();
        },
        render: function() {
            this.$el.html(_.template(Templates[Questions[this.Question].AnswerType], {Question: Questions[this.Question], Answers: Answers, Index: Indexer}));
        },
        next: function(event) {
            this.collectAnswers(event);
            this.Question++;
            if (this.Question <= Object.keys(Questions).length)
                this.render();
            else
                this.startOutput();

            $('.progress-bar').width( Math.round((this.Question - 1) / Object.keys(Questions).length * 100) + '%');
            $('#message-intro').slideUp();
        },
        collectAnswers: function(event) {
            Answers[this.Question] = _.map($('*[id*=input-]:visible', this.$el), function(e){
                return $(e).val() || $(e).prop('placeholder');
            });

            if (Answers[this.Question].length === 0)
                    Answers[this.Question] = $(event.currentTarget).data('value');

        },
        changeProperty: function(event) {
            var target = $(event.currentTarget);
            var parentFormGroup = target.parents('.form-group');
            var propValue = parentFormGroup.find('.prop-value');

            var value = $(target.children()[0]).text();

            target.parent().siblings('button').html( value + ' ').append($(' <span class="caret"></span>'));

            if (value === "Object")
            {
                var model = {Question: Questions[this.Question], Answers: Answers};
                model.Question.Question  = "The properties of the object named '"+parentFormGroup.find('.prop-name').val()+"' are ...";
                parentFormGroup.find('.prop-name').addClass('isObject');
                Indexer++;
                parentFormGroup.data('link', Indexer);
                this.$el.append(_.template(Templates[Questions[this.Question].AnswerType], {Question: Questions[this.Question], Answers: Answers, Index: Indexer}));
                propValue.fadeOut();
            }else
            {
                if (propValue.is(":hidden"))
                {
                    this.shrinkProperties(parentFormGroup.data('link'));
                    propValue.fadeIn();
                    parentFormGroup.find('.prop-name').removeClass('isObject');
                }
            }
        },
        shrinkProperties: function(group){
            var $group = $("#prop-group-" + group, this.$el);
            var $properties = $group.find('.form-group').not('#properties-submit');
            var self = this;
            _.each($properties, function(p){
                var $p = $(p);

                if ($p.data('link'))
                    self.shrinkProperties($p.data('link'));
            });
            $group.slideUp();

        },
        growProperties: function(event)
        {
            var target = $(event.currentTarget).parents('.form-group');
            if( $('input.prop-name', target.parent()).filter(function(){ return $(this).val() == '' }).length < 2)
            {
                var newInput = $(_.template(Templates.prop, {Types: PropertyTypes, i: $('input.prop-name', this.$el).length }));
                $('#properties-submit', target.parent()).before(newInput);
                newInput.slideDown();
            }
        },
        updateObjectForm: function(event){
            var target = $(event.currentTarget);
            var parentFormGroup = target.parents('.form-group');
            $("#prop-group-" + parentFormGroup.data('link') + " .panel-heading strong", this.$el).text("The properties of the object named '"+parentFormGroup.find('.prop-name').val()+"' are ...");
        },
        startOutput: function(){
            var x = this.generate(1);
             if(Answers[1] === 1){
                 x = _.template(Templates.backbone, {Model: JSON.stringify({defaults: x}, null, 4)});
             }else
             {
                 x = JSON.stringify(x, null, 4)
             }

            this.$el.html(_.template(Templates.output, {Result:x}));

        },
        generate: function(group){
            var result = {};
            var $group = $('#prop-group-' + group, this.$el);
            var $properties = $group.find('.form-group').not('#properties-submit');
            var self = this;

            _.each($properties, function(p){
                var $p = $(p);
                var name = $p.find('input.prop-name').val(),
                    value = $p.find('input.prop-value').val(),
                    vType = $p.find('button').text().trim();

                if (name === '')
                    return;

                switch (vType)
                {
                    case 'Object':
                        result[name] = self.generate($p.data('link'))
                        break;
                    case 'Integer':
                        result[name] = parseInt(value);
                        break;
                    case 'Float':
                        result[name] = parseFloat(value);
                        break;
                    case 'Date':
                        result[name] = moment(value).toString();
                        break;
                    default:
                        result[name] = value
                        break;
                }
            });

            return result;
        }
    });

    return new QuestionView();

})();