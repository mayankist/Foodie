$(document).ready(function() {
  $('#searchTerm').on('submit', function() {
    $.ajax({
      type: 'GET',
      data: search,
      url: '/phone/',
      success: function(data) {
        console.log(data);
      },
      error: function(error) {
        console.log(error);
      }
    });
  });
});

// $('.regular').slick({
//       infinite:true,
//       arrows:true,
//       autoplay:true,
//       slidesToShow: 4,
//       slidesToScroll : 1,
//       centerMode:true,
//       centerPadding:"2px"
//     });

$('.regular').slick({
      infinite: true,
      slidesToShow: 4,
      slidesToScroll: 1,
      swipeToSlide: true,
      arrows:true,
      edgeFriction: 0,
      autoplay:true,
      centerMode:true,
      centerPadding:"2px",
      responsive: [
        {
          breakpoint: 680,
          settings: {
            arrows: false,
            centerPadding:"10px",
            slidesToShow: 2,
            slidesToScroll : 1
          }
        }
      ]
    });

$(function () {
  $('[data-toggle="popover"]').popover({
  	html:true
  });
});

$('#ownerpassword, #confirm_password').on('keyup', function () {
  if ($('#ownerpassword').val() == $('#confirm_password').val()) {
    $('#ownermessage').html('Matching').css('color', 'green');
  } else {
    $('#ownermessage').html('Not Matching').css('color', 'red');
  }
});