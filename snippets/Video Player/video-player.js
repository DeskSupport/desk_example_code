$(document).ready(function() {
  $('.video-player li.vimeo button').on("click", function() {
    $('iframe#VideoPlayer').attr('src', 'https://player.vimeo.com/video/'+ $(this).data("vimeo") +'?autoplay=0&color=009ddc');
    $('h1.header').text($(this).data('title'));
    $('.video-player ul li button').removeClass('btn-primary');
    $('.video-player ul li button i').addClass('hidden');
    $(this).addClass('btn-primary');
    $(this).children( 'i' ).removeClass('hidden');
    $('.container.index.video .panel-default').addClass('hidden');
    $('#' + $(this).data('id')).removeClass('hidden');
  });
  $('.video-player li.youtube button').on("click", function() {
    $('iframe#VideoPlayer').attr('src', 'https://www.youtube.com/embed/'+ $(this).data("youtube") +'?rel=0');
    $('h1.header').text($(this).data('title'));
    $('.video-player ul li button').removeClass('btn-primary');
    $('.video-player ul li button i').addClass('hidden');
    $(this).addClass('btn-primary').children( 'i' ).removeClass('hidden');
    $('.container.index.video .panel-default').addClass('hidden');
    $('#' + $(this).data('id')).removeClass('hidden');
  });
  $(".container.index.video .panel-default").each(function() {
    var $this = $(this);
    $this.html($this.html().replace(/&nbsp;/g, ''));
  });
  $('h1.header').text($('ul.articles.active li .btn-primary').data('title'));
  $('.video-player li h4').click(function() {
    $(this).toggleClass('active');
     $(this).siblings( "ul.articles" ).toggleClass('active');
     $(this).children( 'i.fa' ).toggleClass('fa-plus fa-sort-down');
  });
});