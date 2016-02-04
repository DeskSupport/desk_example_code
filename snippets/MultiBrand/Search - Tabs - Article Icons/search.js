jQuery(document).ready(function() {
    //VARIABLES
    themeID = 0; //ONLY NEEDED IF WORKING ON THEME AND WANT TO RENDER LINKS w/THEME ID
    brandCount = 0;
    displayLimit = 10;
    totalCount = 0;
    searchTerm = $('#search-term').html(); //LOADS SEARCH TERM
    systemLanguageDesk = $('#system_language').html(); //LOADS SYSTEM LANGUAGE
    //FOR EACH BRAND FUNCTION
    $('#desk-brands > div').each(function(i, e) {
        //LOOP VARIABLES
        brandID = e.id;
        brandCount++;
        totalBrands = $('#desk-brands > div').length;
        brandName = e.textContent;
        //ADDING TAB ELEMENTS FOR BRANDS AND ALL RESULTS
        if (brandCount == 1) {
            $('#siteResults ul.nav-tabs').append('<li role="presentation" class="active"><a href="#' + brandID + 'Results" aria-controls="' + brandID + 'Results" role="tab" data-toggle="tab">Combined Results</a></li>');
            $('#siteResults div.tab-content').append('<div id="' + brandID + 'Results" role="tabpanel" class="tab-pane brand active"><div class="articles"></div><div class="footer"></div></div>');
        } else {
            $('#siteResults ul.nav-tabs').append('<li role="presentation"><a href="#' + brandID + 'Results" aria-controls="' + brandID + 'Results" role="tab" data-toggle="tab">' + brandName + '</a></li>');
            $('#siteResults div.tab-content').append('<div id="' + brandID + 'Results" role="tabpanel" class="tab-pane brand"><div class="articles"></div><div class="footer"></div></div>');
        }
        MultiSearch = function(data) {
            brandID = e.id;
            resultsCount = 0;
            auto_suggest_content = "";
            auto_suggest_articles = "";
            auto_suggest_questions = "";
            $('#' + brandID).append('<div class="all-results"></div>');
            $.each(data, function() {
                var html = $(this.label);
                article_title = html.find(".article-autocomplete-subject").html();
                article_body = html.find(".article-autocomplete-body").html();
                if (resultsCount < displayLimit) {
                    if (this.id.indexOf("questions") !== -1) {
                        auto_suggest_questions += '<article class="article-support article"><h2 class="article-title"><a href="' + this.id + '&t=' + themeID + '">' + article_title + '</a></h2><p>' + article_body + '</p></article>';
                    } else {
                        //CHANGE THIS BRAND ID TO REFLECT YOUR "VIDEO BRAND"
                        if (brandID == 10994) {
                            auto_suggest_articles += '<article class="article-support question"><h2 class="article-title"><a href="' + this.id + '&t=' + themeID + '">' + article_title.replace('video::', '') + '<label class="video"><i class="fa fa-video-camera"></i>Video</label></a></h2><p>' + article_body + '</p></article>';
                        } else if (article_title.toLowerCase().indexOf("video::") >= 0) {
                            auto_suggest_articles += '<article class="article-support question"><h2 class="article-title"><a href="' + this.id + '&t=' + themeID + '">' + article_title.replace('video::', '') + '<label class="video"><i class="fa fa-video-camera"></i>Video</label></a></h2><p>' + article_body + '</p></article>';
                        } else {
                            auto_suggest_articles += '<article class="article-support question"><h2 class="article-title"><a href="' + this.id + '&t=' + themeID + '">' + article_title.replace('video::', '') + '</a></h2><p>' + article_body + '</p></article>';
                        }
                    }
                };
                resultsCount++;
            });

            totalCount = totalCount + resultsCount;

            if (resultsCount > 0) {
                $('#siteResults div.tab-content div#' + brandID + 'Results .articles').append(auto_suggest_articles + auto_suggest_questions);
            }
            if (resultsCount >= 10) {
                $('#siteResults div.tab-content div#' + brandID + 'Results .footer').append('<button class="next-page btn btn-primary" data-page="2" data-brand="' + brandID + '">Load more <span></span> Results <i class="fa fa-spinner fa-spin hidden"></i></button>');
            }
            if (resultsCount == 0) {
                $('#siteResults div.tabs-content div#' + brandID + 'Results .articles').remove();
                $('#siteResults ul.nav-tabs li a[href="#' + brandID + 'Results"]').remove();
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

    $('body').on('click', 'button.next-page', function() {
        brandID = $(this).attr('data-brand');
        pageNumber = parseInt($(this).attr('data-page'));
        brandCount = 0;
        displayLimit = 10;
        totalCount = 0;
        themeID = 0;
        searchTerm = $('#search-term').html(); //LOADS SEARCH TERM
        systemLanguageDesk = $('#system_language').html(); //LOADS SYSTEM LANGUAGE
        searchBrandURL = 'https://' + document.domain.toString() + '/customer/' + systemLanguageDesk + '/portal/articles/search?q=' + searchTerm + '&page=' + pageNumber + '&b_id=' + brandID + '&t=' + themeID + '&displayMode=BrandOnly'
            //AJAX REQUEST(S)
        $.ajax({
            async: true,
            type: 'GET',
            url: searchBrandURL,
            beforeSend: function() {
                $('#siteResults div.tab-content div#' + brandID + 'Results .footer .next-page i').removeClass('hidden');
            },
            complete: function() {
                ++pageNumber
                $('#siteResults div.tab-content div#' + brandID + 'Results .footer .next-page i').addClass('hidden');
                $('#siteResults div.tab-content div#' + brandID + 'Results .footer .next-page').attr('data-page', pageNumber);
            },
            success: function(data) {
                var searchbrandResults = $(data).find('#brandResults div.body .article-support');
                var resultsCount = $(data).find('#results-count').html();
                var nextUrl = $(data).find('#paginate_block a.next_page').attr('href');
                if (!nextUrl) {
                    $('#siteResults div.tab-content div#' + brandID + 'Results button.next-page').hide();
                    $('#siteResults div.tab-content div#' + brandID + 'Results .footer').append('<h5> All ' + resultsCount + ' Results Loaded</h5>')
                } else {
                    $('#siteResults div.tab-content div#' + brandID + 'Results .footer button.next-page span').html('of the ' + resultsCount + ' total ');
                    if (brandID == 7112) {
                        $('.page-heading span#total').html(resultsCount + ' total ');
                    };
                }
                $('#siteResults div.tab-content div#' + brandID + 'Results .articles').append('<hr/>');
                $('#siteResults div.tab-content div#' + brandID + 'Results .articles').append(searchbrandResults);
                if (pageNumber == 2) {
                    $('a[href$="#' + brandID + 'Results"]').append('<span data-count="' + resultsCount + '"> (' + resultsCount + ')</span>');
                }

            },
            fail: function() {
                alert('no results');
            }
        });

    });
});
