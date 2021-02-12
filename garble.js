let State = {
    AWAIT_INPUT : 1,
    GARBLING : 2,
    DISPLAY_RESULT : 3
}

let state = State.AWAIT_INPUT;

let langs = [ "en", "ar", "zh", "fr", "de", "it", "pt", "ru", "es" ];

function change_state ( new_state )
{
    switch ( new_state )
    {
        case State.GARBLING :
            hide_div ( "input_div" );
            clear_output ();
            break;

        case State.AWAIT_INPUT :
            show_div ( "input_div" );
            //clear_output ();
            break;
    }
    state = new_state;
}

function do_garble_click ()
{
    if ( state == State.AWAIT_INPUT )
    {
        let text_in = document.getElementById ( "text_in" ).value;
        garble_text ( text_in )
    }
}

async function garble_text ( text )
{
    if ( state != State.AWAIT_INPUT )
    {
        return;
    }

    change_state ( State.GARBLING );

    console.log ( `Garble: ${text}` );

    let garbled_text = text;

    add_output ( `<em>${garbled_text}</em>` );

    for ( let i = 0; i< langs.length; i++ )
    {
        let source = langs [ i ];
        let target = langs [ (i+1) % langs.length ];

        let response = await translate_text ( garbled_text,source, target);
        garbled_text = response.translatedText;

        let out = (i==langs.length-1) ? `<b>${garbled_text}</b>` :
                                              garbled_text;
        add_output ( out );
    }


    //change_state ( State.AWAIT_INPUT );
}

function add_output ( text )
{
    let text_out = document.getElementById ( "output_div" );

    text_out.innerHTML += text + "<br>";
}

function clear_output ()
{
    let text_out = document.getElementById ( "output_div" );

    text_out.innerHTML = "";
}

function hide_div ( id )
{
    let div = document.getElementById ( id );
    div.style.display="none";
}

function show_div ( id )
{
    let div = document.getElementById ( id );
    div.style.display="block";
}

async function translate_text ( text, source_lang, target_lang )
{
    const response = await fetch ( "https://libretranslate.com/translate",
    {
        method : "POST",
        body : JSON.stringify ({
            q : text,
            source : source_lang,
            target : target_lang
        }),
        headers: { "Content-Type": "application/json" }
    });

    return response.json();
}
