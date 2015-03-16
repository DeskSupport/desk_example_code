jQuery(document).ready(function() {
    //VARIABLES
    displayLimit = 10; //LIMIT RESULTS FOR ALL BRANDS; MAX RESULTS IS 10 EACH
    totalOver = false; //TRIGGERS IF GREATER THAN 10 RESULTS IN ANY BRAND ARE FOUND
    themeID = 542224; //ONLY NEEDED IF WORKING ON THEME AND WANT TO RENDER LINKS w/THEME ID
    brandCount = 0;

    searchTerm = $('#search-term').html(); //LOADS SEARCH TERM
    systemLanguageDesk = $('#system_language').html(); //LOADS SYSTEM LANGUAGE



    $('#desk-brands > div').each( function(i,e) {
        brandID = e.id;
        brandCount ++;
        brandName = e.textContent;
        totalCount = 0;
        searchBrandURL = 'https://' + document.domain.toString() + '/customer/' + systemLanguageDesk + '/portal/articles/search?q=' + searchTerm + '&b_id=' + brandID + '&t=' + themeID + '&displayMode=BrandOnly'
          if (brandCount == 1) {
              $('#siteResults div.tab-content').append('<div id="allResults" role="tabpanel" class="tab-pane active"><ul></ul></div>');
              $('#siteResults ul.nav-tabs').append('<li role="presentation" class="active"><a href="#allResults" aria-controls="' + brandID + 'Results" role="tab" data-toggle="tab">All Results <span></span></a></li>');
          }
          $('#siteResults div.tab-content').append('<div id="' + brandID + 'Results" role="tabpanel" class="tab-pane"><ul></ul></div>');
          $('#siteResults ul.nav-tabs').append('<li role="presentation"><a href="#' + brandID + 'Results" aria-controls="' + brandID + 'Results" role="tab" data-toggle="tab">' + brandName + '</a></li>');
        //alert(searchBrandURL);
        $.ajax({
           async: false,
           type: 'GET',
           url: searchBrandURL,
           success: function(data) {
              var searchbrandResults = $(data).find('#brandResults div.body .article-support');
              var resultsCount = $(data).find('#results-count').html();
              var nextUrl = $(data).find('#paginate_block a.next_page').attr('href');
              $('#siteResults div.tab-content div#' + brandID + 'Results').append(searchbrandResults);
              $('a[href$="#' + brandID + 'Results"').append('<span>(' + resultsCount + ')</span>');
              //alert(nextUrl);
              function nextPageFunk(url, callback) {
                $.ajax({
                  async: false,
                  type: 'GET',
                  url: url,
                    success: function(datanew) {
                      var articles = $(datanew).find('#brandResults div.body .article-support')
                      var nextUrl = $(datanew).find('#pagination a.next_page');
                      callback(articles);
                      if (nextUrl && nextUrl.attr('href')) nextPageFunk(nextUrl.attr('href'), callback);
                    }
                });
              }
              if(typeof nextUrl != 'undefined') {
                nextPageFunk(nextUrl, function(articles) {
                  $('#siteResults div.tab-content div#' + brandID + 'Results').append('<hr>');
                  $('#siteResults div.tab-content div#' + brandID + 'Results').append(articles);
                });
              }
           }//Success Request
        }); //First Request
    }); //END BRANDS & IDS



    $('#desk-brands > div').each( function(i,e) {
      brandID = e.id;
      brandCount ++;
      brandName = e.textContent;

    })

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
