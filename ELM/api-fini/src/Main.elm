module Main exposing (..)

import Browser
import Html exposing (Html, div, text, button)
import Html.Events exposing (onClick)
import Http
import Json.Decode exposing (Decoder, list, field, string, map, map2)

-- MODEL

type alias Meaning =
    { partOfSpeech : String
    , definitions : List String
    }

type alias Model =
    { word : String
    , meanings : List Meaning
    }

init : () -> (Model, Cmd Msg)
init _ =
    ( { word = "cake", meanings = [] }
    , requestDefinition "cake"
    )

-- UPDATE

type Msg
    = DefinitionFetched (Result Http.Error (List Meaning))
    | FetchDefinitionClick

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        DefinitionFetched (Ok meanings) ->
            ({ model | meanings = meanings }, Cmd.none)
        DefinitionFetched (Err _) ->
            ({ model | meanings = [] }, Cmd.none)
        FetchDefinitionClick ->
            (model, requestDefinition model.word)

-- VIEW

view : Model -> Html Msg
view model =
    div []
        [ div [] [ text ("Word: " ++ model.word) ]
        , div [] (List.concatMap viewMeaning model.meanings)
        , button [ onClick FetchDefinitionClick ] [ text "Fetch Definition" ]
        ]

viewMeaning : Meaning -> List (Html Msg)
viewMeaning meaning =
    [ div [] [ text ("Part of Speech: " ++ meaning.partOfSpeech) ]
    , div [] (List.indexedMap viewDefinition meaning.definitions)
    ]

viewDefinition : Int -> String -> Html Msg
viewDefinition index definition =
    div [] [ text (String.fromInt (index + 1) ++ ". " ++ definition) ]


-- HTTP

requestDefinition : String -> Cmd Msg
requestDefinition word =
    Http.get
        { url = "https://api.dictionaryapi.dev/api/v2/entries/en/" ++ word
        , expect = Http.expectJson DefinitionFetched definitionDecoder
        }

-- 解码器

definitionDecoder : Decoder (List Meaning)
definitionDecoder =
    field "0" (field "meanings" (list meaningDecoder))

meaningDecoder : Decoder Meaning
meaningDecoder =
    map2 Meaning
        (field "partOfSpeech" string)
        (field "definitions" (list (field "definition" string)))

-- MAIN

main : Program () Model Msg
main =
    Browser.element { init = init, update = update, view = view, subscriptions = \_ -> Sub.none }
