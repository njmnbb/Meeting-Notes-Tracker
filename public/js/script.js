// form.addEventListener("submit", function(e) {
//     e.preventDefault();

//     const form = document.getElementById('cronJobForm');

//     const XHR = new XMLHttpRequest();

//     // Bind the FormData object and the form element
//     const FD = new FormData( form );

//     // Define what happens on successful data submission
//     XHR.addEventListener( "load", function(event) {
//         alert( event.target.responseText );
//     } );

//     // Define what happens in case of error
//     XHR.addEventListener( "error", function( event ) {
//         alert( 'Oops! Something went wrong.' );
//     } );

//     // Set up our request
//     XHR.open( "POST", "/update" );

//     // The data sent is what the user provided in the form
//     XHR.send( FD );
// });



