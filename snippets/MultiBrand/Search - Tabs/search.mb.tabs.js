    jQuery(document).ready(function() {
      //VARIABLES
        themeID = 0; //ONLY NEEDED IF WORKING ON THEME AND WANT TO RENDER LINKS w/THEME ID
        brandCount = 0;
        totalCount = 0;
        searchTerm = $('#search-term').html(); //LOADS SEARCH TERM
        systemLanguageDesk = $('#system_language').html(); //LOADS SYSTEM LANGUAGE
      //FOR EACH BRAND FUNCTION
        $('#site-brands > div').each( function(i,e) {
          //LOOP VARIABLES
            brandID = e.id;
            brandCount ++;
            totalBrands = $('#site-brands > div').length;
            brandName = e.textContent;
            searchBrandURL = 'https://' + document.domain.toString() + '/customer/' + systemLanguageDesk + '/portal/articles/search?q=' + searchTerm + '&b_id=' + brandID + '&t=' + themeID + '&displayMode=BrandOnly'
          //ADDING TAB ELEMENTS FOR BRANDS AND ALL RESULTS
            if (brandCount == 1) {
                $('#siteResults ul.nav-tabs').append('<li role="presentation" class="active"><a href="#allResults" aria-controls="allResults" role="tab" data-toggle="tab">All Results <span></span></a></li>');
                $('#siteResults div.tab-content').append('<div id="allResults" role="tabpanel" class="tab-pane active all"></div>');
            }
            $('#siteResults ul.nav-tabs').append('<li role="presentation"><a href="#' + brandID + 'Results" aria-controls="' + brandID + 'Results" role="tab" data-toggle="tab">' + brandName + '</a></li>');
            $('#siteResults div.tab-content').append('<div id="' + brandID + 'Results" role="tabpanel" class="tab-pane brand"></div>');
          //AJAX REQUEST(S)
            $.ajax({
               async: false,
               type: 'GET',
               url: searchBrandURL,
               success: function(data) {
                  var searchbrandResults = $(data).find('#brandResults article');
                  var resultsCount = $(data).find('#results-count').html();
                  var nextUrl = $(data).find('#paginate_block a.next_page').attr('href');
                  $('#siteResults div.tab-content div#' + brandID + 'Results').append(searchbrandResults);
                  $('a[href$="#' + brandID + 'Results"]').append('<span data-count="' + resultsCount + '">(' + resultsCount + ')</span>');
                  //alert(nextUrl);
                  function nextPageFunk(url, callback) {
                    $.ajax({
                      async: false,
                      type: 'GET',
                      url: url,
                        success: function(datanew) {
                          var articles = $(datanew).find('#brandResults article')
                          var nextUrl = $(datanew).find('#pagination a.next_page');
                          callback(articles);
                          if (nextUrl && nextUrl.attr('href')) nextPageFunk(nextUrl.attr('href'), callback);
                        }
                    });//Second Request(s)
                  }//Next Page Function
                  if(typeof nextUrl != 'undefined') {
                    nextPageFunk(nextUrl, function(articles) {
                      $('#siteResults div.tab-content div#' + brandID + 'Results').append('<hr>');
                      $('#siteResults div.tab-content div#' + brandID + 'Results').append(articles);
                    });
                  }
               }//Success Function
            }); //First Request
          //POST AJAX FUNCTIONALITY (Total Counts / All Results Appending)
            var eachbrandCount = $('a[href$="#' + brandID + 'Results"] span').data('count');
            totalCount = totalCount + eachbrandCount;
            if(eachbrandCount == 0){
              $('a[href$="#' + brandID + 'Results"]').hide();
            } else {
             // $('#allResults').append('<h1>' + eachbrandCount + ' Results from ' + brandName + '</h1><hr>');
              $('#siteResults div.tab-content div#' + brandID + 'Results article').clone().appendTo('#allResults');
            }
            if (i === totalBrands - 1) {
              $('a[href$="#allResults"]').append('<span>(' + totalCount + ')</span>');
              $('span#total').append(totalCount);
            }
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
          $('#brandResults, div.row.footer').addClass('hidden');
          $('#siteResults').removeClass('hidden');
        }
    });
  }
