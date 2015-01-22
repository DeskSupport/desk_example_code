
$(function() {
  //-- Real-time auto-suggest
  $('#email_subject').on("keyup paste",function() {
      if ($('#email_subject').val().length > 3 && $('#email_subject').val().length <= 250) {
        clearTimeout(window.timer);
        window.timer=setTimeout(function(){ // setting the delay for each keypress
          articleSuggest();
        }, 500);
      }
    });
  //-- Real-time auto-suggest
  $('#email_body').on("keyup paste",function() {
      if ($('#email_body').val().length > 3 && $('#email_body').val().length <= 250) {
        clearTimeout(window.timer);
        window.timer=setTimeout(function(){ // setting the delay for each keypress
          articleSuggest();
        }, 500);
      }
    });
});
  //-- MULTIBRAND ARTICLE SUGGEST
  articleSuggest = function() {
    $('#desk-brands > div').each( function(i,e) {
      search_query = $('#email_subject').val() + '  ' + $('#email_body').val();
      systemLanguageDesk = $('#system_language').html();
      resultsFound = $('#results_mobile').html().replace('for','');
      brandID = e.id;
      brandName = e.textContent;
      as_count = 0;
      $.ajax({
        url: '//' + document.domain.toString() + '/customer/' + systemLanguageDesk + '/portal/articles/autocomplete?term=' + search_query + '&b_id=' + brandID,
        brandID: brandID,
        brandName: brandName,
        dataType: 'json',
        success: function(data) {
          apiSuccess(data, this.brandID, this.brandName);
          function apiSuccess(data, brandID, brandName) {
            $('.autosuggest div#' + brandID).remove();
            auto_suggest_content = "";
            auto_suggest = "";
            system_snippet_do_these_help = $('#system-snippets-do_these_help').text() || 'Do these help?';
            $('#common h2').html(system_snippet_do_these_help);
            $('#common h4').hide();
            as_count = 0;
            $.each(data, function() {
              var html = $(this.label);
              article_title = html.find(".article-autocomplete-subject").html();
              if(as_count == 3 ) {
                auto_suggest += '<div class="collapse" id="collapse-' + brandID + '">';
              }
              if (this.id.indexOf("questions") !== -1) {
                  auto_suggest += '<li><a target="_blank" href="' + this.id + '" class="discussion"><i class="fa fa-question"></i><span>' + article_title + '</span></a></li>';
              } else {
                  auto_suggest += '<li><a target="_blank" href="' + this.id + '" class="article"><i class="fa fa-file-text-o"></i><span>' + article_title + '</span></a></li>';
              }
              as_count++;
            });
            if (as_count > 9) {
              $('.autosuggest').append('<div id="' + brandID + '"><h4 class="muted"><span>' + as_count + ' + </span>' + resultsFound + ' in ' + brandName + '</h4><ul class="unstyled"></ul>');
            } else {
              $('.autosuggest').append('<div id="' + brandID + '"><h4 class="muted"><span>' + as_count + ' </span>' + resultsFound + ' in ' + brandName + '</h4><ul class="unstyled"></ul>');
            }
            if (as_count > 0) {
              $('.autosuggest div#' + brandID + ' ul').append(auto_suggest);
              if (as_count > 9) {
                $('.autosuggest div#' + brandID + ' ul div').append('<li><a class="btn btn-primary" target="_blank" href="//' + document.domain.toString() + '/customer/' + systemLanguageDesk + '/portal/articles/search?b_id=' + brandID + '&q=' + search_query + '&displayMode=BrandOnly">View All</a></li>');
              }
              $('.autosuggest div#' + brandID + ' ul div').append('</div>');
              if(as_count > 3) {
                $('.autosuggest div#' + brandID + ' ul').append('<button class="btn btn-primary coltrig">More</button>');
              }
              $(".autosuggest").removeClass('hide');
            } else {
              $(".autosuggest").addClass('hide');
            } // IF SUGGESTIONS
            as_count = 0;
          } // FUNCTION API SUCCESS
        } // SUCCESS
      }); // AJAX REQUEST
    });// FOR EACH BRAND

  } // ARTICLE SUGGESTION ON KEYUP FUNCTION

$(document).ajaxComplete(function() {
    $('.coltrig').click(function() {
      $(this).prevAll('div.collapse').collapse()
      $(this).hide();
    });
});

  //NO RESULTS
  apiFail = function(data) {
  }

//-- FORM VALIDATION NEW
$(document).ready(function () {

    $('#email_body').textarea_maxlength();
    $('#new_email').validate({
          submitHandler: function(form) {
               $('#email_submit').prop('disabled',true);
               $('#email_submit').addClass('disabled');
               $('#email_submit_spinner').show();
               form.submit();
           },
          messages:{
            'interaction[name]':{
              'required':$("#system-snippets-name_required").html()
            },
            'interaction[email]':{
              'required':$("#system-snippets-invalid_email").html(),
              'email':$("#system-snippets-invalid_email").html()
            },
            'email[subject]':{
              'required':$("#system-snippets-subject_required").html()
            },
            'email[body]':{
              'required':$("#system-snippets-question_required").html(),
              'maxlength':$("#system-snippets-exceeding_max_chars").html()
            }
          },
          rules:{
            'interaction[name]':{
              'minlength': 2,
              'required':true
            },
            'interaction[email]':{
              'required':true,
              'email':true
            },
            'email[subject]':{
              'required':true,
              'invalidchars':''
            },
            'email[body]':{
              'required':true,
              'maxlength':5000,
              'invalidchars':''
            }
          },
          highlight: function (element) {
              $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
              $('label:empty').remove();
          },
          success: function (element) {
              $(element).closest('.form-group').removeClass('has-error').addClass('has-success');
              $('label:empty').remove();
          }
    });
});
