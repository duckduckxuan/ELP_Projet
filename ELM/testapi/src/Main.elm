module Main exposing (..)

import Browser
import Html exposing (Html, div, text, button)
import Html.Events exposing (onClick)
import Http


-- MODEL

type alias Model =
    { word : String
    , definition : String
    }

init : () -> (Model, Cmd Msg)
init _ =
    ( { word = "apple", definition = "" }
    , fetchDefinition "apple"
    )


-- UPDATE

type Msg
    = DefinitionFetched (Result Http.Error String)
    | FetchDefinitionClick

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        DefinitionFetched (Ok rawJson) ->
            ({ model | definition = rawJson }, Cmd.none)
        FetchDefinitionClick ->
            (model, fetchDefinition model.word)
        DefinitionFetched (Err _) ->
            ({ model | definition = "Error fetching definition" }, Cmd.none)


-- VIEW

view : Model -> Html Msg
view model =
    div []
        [ div [] [ text ("Word: " ++ model.word) ]
        , div [] [ text ("Definition: " ++ model.definition) ]
        , button [ onClick FetchDefinitionClick ] [ text "Fetch Definition" ]
        ]


-- HTTP

fetchDefinition : String -> Cmd Msg
fetchDefinition word =
    Http.get
        { url = "https://api.dictionaryapi.dev/api/v2/entries/en/" ++ word
        , expect = Http.expectString DefinitionFetched
        }


-- MAIN

main : Program () Model Msg
main =
    Browser.element { init = init, update = update, view = view, subscriptions = \_ -> Sub.none }
