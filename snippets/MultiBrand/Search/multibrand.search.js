jQuery(document).ready(function() {
  //VARIABLES
    totalCount = 0 //TOTAL RESULTS COUNT
    displayLimit = 3; //LIMIT RESULTS FOR ALL BRANDS; MAX RESULTS IS 10 EACH
    totalOver = false; //TRIGGERS IF GREATER THAN 10 RESULTS IN ANY BRAND ARE FOUND
    themeID = 501703; //ONLY NEEDED IF WORKING ON THEME AND WANT TO RENDER LINKS w/THEME ID
    searchTerm = $('#search-term').html(); //LOADS SEARCH TERM
    systemLanguageDesk = $('#system_language').html(); //LOADS SYSTEM LANGUAGE
  //LOOP THROUGH BRANDS & IDS
    $('#siteResults div.body.row > div').each( function(i,e) {
      //RESULTS
        MultiSearch = function(data) {
          brandID = e.id;
          resultsCount = 0;
          auto_suggest_content = "";
          auto_suggest_articles = "";
          auto_suggest_questions = "";
          $('#' + brandID ).append('<ul class="results"></ul>');
          $.each(data, function() {
            var html = $(this.label);
            article_title = html.find(".article-autocomplete-subject").html();
            article_body = html.find(".article-autocomplete-body").html();
            if (resultsCount < displayLimit) {
              if (this.id.indexOf("questions") !== -1) {
                auto_suggest_questions += '<li><a href="' + this.id + '&t=' + themeID +'" class="question">' + article_title + '</a></li><p>' + article_body +'</p>';
              } else {
                auto_suggest_articles += '<li><a href="' + this.id + '&t=' + themeID + '" class="article">' + article_title + '</a></li><p>' + article_body +'</p>';
              }
            };
            resultsCount++;
          });
          if (resultsCount >= 10) {
            totalOver = true;
          }
          totalCount = totalCount + resultsCount ;
          if (resultsCount > 0) {
            $('div#' + brandID + ' > ul').append(auto_suggest_articles + auto_suggest_questions);
            $('div#' + brandID + ' a.view-all').removeClass('hidden');
            $('div#' + brandID + ' a.view-all').attr('href', '//' + document.domain.toString() + '/customer/' + systemLanguageDesk + '/portal/articles/search?q=' + searchTerm + '&b_id=' + brandID + '&t=' + themeID + '&displayMode=BrandOnly');
            $('#' + brandID ).removeClass('hidden');
          } else {
            $('#' + brandID + ' > h3').removeClass('hidden');
          }
        };
      //NO RESULTS
        MultiFail = function(data) {
           brandID = e.id;
           //DISPLAY NO RESULTS FOR BRAND
           $('#' + brandID + ' > h3').removeClass('hidden');
        };
      //AJAX REQUEST
        brandID = e.id;
        $.ajax({
          url: '//' + document.domain.toString() + '/customer/' + systemLanguageDesk + '/portal/articles/autocomplete?term=' + searchTerm + '&b_id=' + brandID,
          dataType: 'json'
        }).done(MultiSearch).fail(MultiFail);
    }); //END BRANDS & IDS


  //DISPLAY TOTAL NUMBER OF RESULTS
    setTimeout(function() {
      if (totalOver) {
        $('#total').append('Over ' + totalCount);
      } else {
        $('#total').append(totalCount);
      }
    }, 500);


  //CHECK URL PARAMETER
    function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
    displayMode = getParameterByName('displayMode');
  //DISPLAY SITE WIDE RESULTS OR BRAND ONLY RESULTS
    if (displayMode == "BrandOnly") {
      $('#brandResults').removeClass('hidden');
      $('#siteResults').addClass('hidden');
    } else {
      $('#brandResults').addClass('hidden');
      $('#siteResults').removeClass('hidden');
    }
});
