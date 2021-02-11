function form_submitted ()
{
    let text_in = document.getElementById ( "text_in" ).value;
    garble_text ( text_in )
}

function garble_text ( text )
{
    console.log ( `Garble ${text}` );
}
