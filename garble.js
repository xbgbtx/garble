let State = {
    AWAIT_INPUT     : 1,
    GARBLING        : 2,
    DISPLAY_RESULTS : 3
}

let state;

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

/****************************************************************************
 * TEXT GARBLING
 ***************************************************************************/

class GarbleData
{
    constructor ( start_text, langs )
    {
        this.start_text = start_text;
        this.langs = langs;

        this.garbled_text = start_text;
        this.current_step = 0;
    }

    garble_complete ()
    {
        return this.current_step >= this.langs.length;
    }

    current_lang ()
    {
        return this.langs [ this.current_step ];
    }

    next_lang ()
    {
        return this.langs [ ( this.current_step + 1 ) % this.langs.length ];
    }

    garble_step ( next_text )
    {
        if ( this.garble_complete () ) 
        {
            throw "garble_step after garble_complete";
        }

        this.garbled_text = next_text;
        this.current_step += 1;
    }
}

function garble_text ( text )
{
    if ( state != State.AWAIT_INPUT )
    {
        return;
    }

    let langs = [ "en", "ar", "zh", "fr", "de", "it", "pt", "ru", "es" ];

    change_state ( State.GARBLING );

    console.log ( `Garble: ${text}` );

    let garble_data = new GarbleData ( text, langs );

    garble_step ( garble_data, 
        ( text ) => add_garble_output ( text ),
        ( text, garbled_text ) => 
        {
            set_results_output ( text, garbled_text )
            change_state ( State.DISPLAY_RESULTS );
        } );
}

function garble_step ( garble_data, step_cb, complete_cb )
{
    if ( garble_data.garble_complete () )
    {
        complete_cb ( garble_data.start_text, garble_data.garbled_text );
        return;
    }

    step_cb ( garble_data.garbled_text );

    let next_step = ( translatedText ) => 
    {
        garble_data.garble_step ( translatedText );
        garble_step ( garble_data, step_cb, complete_cb );
    };

    translate_text ( garble_data.garbled_text,
                     garble_data.current_lang (), 
                     garble_data.next_lang (), 
                     next_step );
}

async function translate_text ( text, source_lang, target_lang, call_back )
{
    console.log ( text );
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

    const response_json = await response.json ();


    call_back ( response_json.translatedText );
}

/****************************************************************************
 * BROWSER EVENTS
 ***************************************************************************/

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

/****************************************************************************
 * DOM MANIPULATION
 ***************************************************************************/

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

