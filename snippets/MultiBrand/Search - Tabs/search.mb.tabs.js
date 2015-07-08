jQuery(document).ready(function() {
//VARIABLES
    themeID = 0; //ONLY NEEDED IF WORKING ON THEME AND WANT TO RENDER LINKS w/THEME ID
    brandCount = 0;
    displayLimit = 10;
    totalCount = 0;
    searchTerm = $('#search-term').html(); //LOADS SEARCH TERM
    systemLanguageDesk = $('#system_language').html(); //LOADS SYSTEM LANGUAGE
    readArticle = $('#read-article').html(); //LOADS READ ARTICLE SNIPPET
  //FOR EACH BRAND FUNCTION
    $('#site-brands > div').each( function(i,e) {
      //LOOP VARIABLES
        brandID = e.id;
        brandCount ++;
        totalBrands = $('#site-brands > div').length;
        brandName = e.textContent;
      //ADDING TAB ELEMENTS FOR BRANDS AND ALL RESULTS
        if (brandCount == 1) {
          $('#siteResults ul.nav-tabs').append('<li role="presentation" class="active"><a href="#' + brandID + 'Results" aria-controls="' + brandID + 'Results" role="tab" data-toggle="tab">' + brandName + '</a></li>');
          $('#siteResults div.tab-content').append('<div id="' + brandID + 'Results" role="tabpanel" class="tab-pane brand active"><div class="articles"></div><div class="footer col-md-12"></div></div>');
        } else {
          $('#siteResults ul.nav-tabs').append('<li role="presentation"><a href="#' + brandID + 'Results" aria-controls="' + brandID + 'Results" role="tab" data-toggle="tab">' + brandName + '</a></li>');
          $('#siteResults div.tab-content').append('<div id="' + brandID + 'Results" role="tabpanel" class="tab-pane brand"><div class="articles"></div><div class="footer col-md-12"></div></div>');
        }
        MultiSearch = function(data) {
          brandID = e.id;
          resultsCount = 0;
          auto_suggest_content = "";
          auto_suggest_articles = "";
          auto_suggest_questions = "";
          $.each(data, function() {
            var html = $(this.label);
            article_title = html.find(".article-autocomplete-subject").html();
            article_body = html.find(".article-autocomplete-body").html();
            auto_suggest_articles += '<article class="row nomarg result article"><div class="col-md-12"><h3><a href="' + this.id + '&t=' + themeID + '">' + article_title + '</a></h3><p>' + article_body + '</p><a class="btn btn-pill" href="' + this.id + '">' + readArticle + '</a></div></article>';
            resultsCount++;
          });

          totalCount = totalCount + resultsCount ;
          if (resultsCount > 0) {
            $('#siteResults div.tab-content div#' + brandID + 'Results .articles').append(auto_suggest_articles);
          }
          if (resultsCount >= 10) {
            $('#siteResults div.tab-content div#' + brandID + 'Results .footer').append('<button class="next-page btn btn-primary" data-page="2" data-brand="'+brandID+'">Load More Results<i class="fa fa-spinner fa-spin hidden"></i></button>');
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
    }); //END OF EACH BRAND FUNCTION

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

   $('body').on('click', 'button.next-page', function () {
      brandID = $(this).attr('data-brand');
      pageNumber = parseInt($(this).attr('data-page'));
      searchTerm = $('#search-term').html(); //LOADS SEARCH TERM
      systemLanguageDesk = $('#system_language').html(); //LOADS SYSTEM LANGUAGE
      searchBrandURL = 'https://'+document.domain.toString()+'/customer/'+systemLanguageDesk+'/portal/articles/search?q='+searchTerm+'&page='+pageNumber+'&b_id='+brandID+'&displayMode=BrandOnly'
      //AJAX REQUEST(S)
        $.ajax({
           async: true,
           type: 'GET',
           url: searchBrandURL,
           beforeSend: function() {
            $('#siteResults div.tab-content div#' + brandID + 'Results .footer .next-page i').removeClass('hidden');
           },
           complete: function() {
            $('#siteResults div.tab-content div#' + brandID + 'Results .footer .next-page i').addClass('hidden');
            ++pageNumber
            $('#siteResults div.tab-content div#' + brandID + 'Results .footer .next-page').attr('data-page', pageNumber );
           },
           success: function(data) {
              var searchbrandResults = $(data).find('#brandResults .result');
              var resultsCount = $(data).find('#results-count').html();
              var nextUrl = $(data).find('#paginate_block a.next_page').attr('href');
              if(! nextUrl) {
                $('#siteResults div.tab-content div#' + brandID + 'Results button.next-page').hide();
                $('#siteResults div.tab-content div#' + brandID + 'Results .footer').append('<h5> All ' + resultsCount + ' Results Loaded</h5>')
              } else {

              }
              $('#siteResults div.tab-content div#' + brandID + 'Results .articles').append(searchbrandResults);
              if(pageNumber == 2) {
                $('a[href$="#' + brandID + 'Results"]').append('<span data-count="' + resultsCount + '"> (' + resultsCount + ')</span>');
              }
              
           },
           fail: function(){
            alert('no results');
           }
        });

    });
});