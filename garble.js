let State = {
    AWAIT_INPUT : 1,
    GARBLING : 2
}

let state = State.AWAIT_INPUT;

let langs = [ "en", "ar", "zh", "fr", "de", "it", "pt", "ru", "es" ];

function change_state ( new_state )
{
    state = new_state;
}

function form_submitted ()
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

    for ( let i = 0; i< langs.length; i++ )
    {
        let source = langs [ i ];
        let target = langs [ (i+1) % langs.length ];
        console.log ( `${source} -> ${target}` );
        let response = await translate_text ( text,source, target);
        garbled_text = response.translatedText;
        add_output (garbled_text);
    }


    //console.log ( result.translatedText );


    change_state ( State.AWAIT_INPUT );
}

function add_output ( text )
{
    let text_out = document.getElementById ( "output_div" );

    text_out.innerHTML += text + "<br>";
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
