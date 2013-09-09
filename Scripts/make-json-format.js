(function () {
    var FormatView = Backbone.View.extend({
        events: {
            'click button.format' : 'onFormat',
            'click div.alert .close' : 'onAlertClose',
            'click button.btn-group':'onButtonGroupClick'
        },
        initialize: function(){
            //_.bindAll(this, 'generate');
            this.setElement('#formatter');
            this.settings = {
                lines:'multi',
                spacing: 'space'
            };

            $("textarea", this.$el).autosize();
            $("textarea", this.$el).focus();
        },
        onFormat: function(){
            try{
                var object = JSON.parse($('textarea', this.$el).val());
                var result = (this.settings.lines === "single")? JSON.stringify(object) : JSON.stringify(object, null, this.settings.spacing === "space" ? parseInt($('#spacing-space-count', this.$el).val()) : '\t');
                $('textarea', this.$el).val(result).trigger('autosize.resize');;
                this.onAlertClose();
            }catch(ex){
                $(".alert", this.$el).slideDown();
            }
        },
        onAlertClose: function() {
            $(".alert", this.$el).slideUp();
        },
        onButtonGroupClick: function(event){
            var $target = $(event.currentTarget);
            this.settings[$target.data('group')] = $target.data('value');
            $target.parents('.form-group').find('button.btn-group').removeClass('active');
            $target.addClass('active');
        }
    });
    return new FormatView();
})();