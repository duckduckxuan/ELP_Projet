module Main exposing (..)

import Browser
import Html exposing (Html, div, button, text, input, label)
import Html.Attributes exposing (value)
import Html.Events exposing (onClick, onInput)
import Http
import Json.Decode as Json exposing (Decoder, field, string, list)

-- Model
type alias Model =
    { word : String
    , definition : String
    , guessedCorrectly : Bool
    }

-- Msg
type Msg
    = FetchDefinition
    | DefinitionFetched (Result Http.Error (List Definition))
    | ClearDefinition
    | UpdateWord String

type alias Definition =
    { meanings : List Meaning }

type alias Meaning =
    { definition : String }

-- init
init : () -> (Model, Cmd Msg)
init _ =
    ({ word = ""
    , definition = ""
    , guessedCorrectly = False
    }, Cmd.none)

-- update
update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        FetchDefinition ->
            if String.isEmpty model.word then
                (model, Cmd.none)
            else
                ( { model | definition = "Fetching definition...", guessedCorrectly = False }, fetchDefinition model.word )

        DefinitionFetched (Ok definitions) ->
            let
                firstDef = definitions
                    |> List.head
                    |> Maybe.andThen (\def -> List.head def.meanings)
                    |> Maybe.map .definition
                    |> Maybe.withDefault "No definition found"
            in
            ( { model | definition = firstDef, guessedCorrectly = False }, Cmd.none )

        DefinitionFetched (Err _) ->
            ( { model | definition = "Error fetching definition", guessedCorrectly = False }, Cmd.none )

        ClearDefinition ->
            ( { model | word = "", definition = "", guessedCorrectly = False }, Cmd.none )

        UpdateWord newWord ->
            ( { model | word = newWord, definition = "", guessedCorrectly = False }, Cmd.none )

-- fetchDefinition
fetchDefinition : String -> Cmd Msg
fetchDefinition word =
    Http.get
        { expect = Http.expectJson definitionDecoder
        , url = urlForWord word
        }

urlForWord : String -> String
urlForWord word =
    "https://api.dictionaryapi.dev/api/v2/entries/en/" ++ word

definitionDecoder : Decoder (List Definition)
definitionDecoder =
    Json.list (Json.map Definition (Json.field "meanings" (Json.list (Json.map Meaning (Json.field "definition" Json.string)))))

-- view
view : Model -> Html Msg
view model =
    div []
        [ div []
            [ label [] [ text "Type in to guess" ]
            , input [ onInput UpdateWord, value model.word ] []
            ]
        , button [ onClick FetchDefinition ] [ text "Fetch Definition" ]
        , button [ onClick ClearDefinition ] [ text "Clear Definition" ]
        , div []
            [ if model.guessedCorrectly then
                text ("Got it! It is indeed " ++ model.word)
              else
                text model.definition
            ]
        ]

-- subscriptions
subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none

-- main
main : Program () Model Msg
main =
    Browser.element { init = init, update = update, view = view, subscriptions = subscriptions }
