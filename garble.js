let State = {
    AWAIT_INPUT     : 1,
    GARBLING        : 2,
    DISPLAY_RESULTS : 3
}

let state;

let langs = [ "en", "ar", "zh", "fr", "de", "it", "pt", "ru", "es" ];

function change_state ( new_state )
{
    switch ( new_state )
    {
        case State.AWAIT_INPUT :
            hide_div ( "results_output_div" );
            hide_div ( "garble_output_div" );

            clear_input ();
            show_div ( "input_div" );

            break;

        case State.GARBLING :
            hide_div ( "input_div" );
            hide_div ( "results_output_div" );

            clear_garble_output ();
            show_div ( "garble_output_div" );

            break;

        case State.DISPLAY_RESULTS :
            hide_div ( "input_div" );
            hide_div ( "garble_output_div" );

            show_div ( "results_output_div" );

            break;
    }
    state = new_state;
}

function page_loaded ()
{
    change_state ( State.AWAIT_INPUT );
}

function do_garble_click ()
{
    if ( state == State.AWAIT_INPUT )
    {
        let text_in = document.getElementById ( "text_in" ).value;
        garble_text ( text_in )
    }
}

function do_another_click ()
{
    if ( state == State.DISPLAY_RESULTS )
    {
        change_state ( State.AWAIT_INPUT );
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

    add_garble_output ( `<em>${garbled_text}</em>` );

    for ( let i = 0; i< langs.length; i++ )
    {
        let source = langs [ i ];
        let target = langs [ (i+1) % langs.length ];

        let response = await translate_text ( garbled_text,source, target);
        garbled_text = response.translatedText;

        let out = (i==langs.length-1) ? `<b>${garbled_text}</b>` :
                                              garbled_text;
        add_garble_output ( out );
    }

    set_results_output ( text, garbled_text )
    change_state ( State.DISPLAY_RESULTS );
}

function clear_input ()
{
    document.getElementById ( "text_in" ).value = "";
}

function add_garble_output ( text )
{
    let garble_output_div = document.getElementById ( "garble_output_div" );

    let output = `<div class="garble_display">${text}</div>`
    garble_output_div.innerHTML = output + garble_output_div.innerHTML;
}

function clear_garble_output ()
{
    let garble_output_div = document.getElementById ( "garble_output_div" );
    garble_output_div.innerHTML = "";
}

function set_results_output ( text, garbled_text )
{
    let original_div = document.getElementById ( "results_original_div" );
    original_div.innerHTML = text;

    let garbled_div = document.getElementById ( "results_garbled_div" );
    garbled_div.innerHTML = garbled_text;
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
