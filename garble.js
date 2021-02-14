let State = {
    AWAIT_INPUT     : 1,
    GARBLING        : 2,
    DISPLAY_RESULTS : 3,
    ERROR           : 4
}

let state;
let last_result = "";

function change_state ( new_state )
{
    let hide_divs = () => {
        hide_div ( "input_div" );
        hide_div ( "results_output_div" );
        hide_div ( "garble_output_div" );
        hide_div ( "error_div" );
    };

    switch ( new_state )
    {
        case State.AWAIT_INPUT :
            hide_divs ();
            clear_input ();
            show_div ( "input_div" );
            break;

        case State.GARBLING :
            hide_divs ();
            clear_garble_output ();
            show_div ( "garble_output_div" );
            break;

        case State.DISPLAY_RESULTS :
            hide_divs ();
            show_div ( "results_output_div" );
            break;

        case State.ERROR :
            hide_divs ();
            show_div ( "error_div" );
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

    let error_cb = () => change_state ( State.ERROR );

    translate_text ( garble_data.garbled_text,
                     garble_data.current_lang (), 
                     garble_data.next_lang (), 
                     next_step,
                     error_cb
    );
}

function translate_text ( text, source_lang, target_lang, 
                          translation_cb, error_cb )
{
    fetch ( "https://libretranslate.com/translate",
    {
        method : "POST",
        body : JSON.stringify ({
            q : text,
            source : source_lang,
            target : target_lang
        }),
        headers: { "Content-Type": "application/json" }
    })
    .then ( response => 
    {
        if ( response.status == 200 )
            return response;
        else
            throw "Bad response from API.";
    })
    .then ( response => response.json () )
    .then ( result   => translation_cb ( result.translatedText ) )
    .catch ( error   => error_cb () );
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
    if ( state != State.AWAIT_INPUT )
        return;

    let text_in = document.getElementById ( "text_in" ).value;

    if ( text_in.length > 0 )
        garble_text ( text_in )
}

function do_another_click ()
{
    if ( state == State.DISPLAY_RESULTS || state == State.ERROR )
    {
        change_state ( State.AWAIT_INPUT );
    }
}

function garble_again_click ()
{
    console.log(state);
    if ( state != State.DISPLAY_RESULTS )
        return;

    garble_text ( last_result );

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

    last_result = garbled_text;
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

