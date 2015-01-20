
//SCANS ARTICLES FOR LINKS TO OTHER ARTICLES AND ADDS CURRENT LANGUAGE INTO LINK. SO SPANISH LINKS TO SPANISH WHILE ENGLISH LINKS TO ENGLISH ETC
$(".container.article .body a").each(function(){
  var systemLanguageDesk = $('#system_language').html();
  var newUrl = $(this).attr('href').replace('customer/portal/', 'customer/' + systemLanguageDesk + '/portal/');
    $(this).attr('href', newUrl);
});
