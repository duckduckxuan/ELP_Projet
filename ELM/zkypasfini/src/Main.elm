module Main exposing (..)

import Browser
import Html exposing (Html, div, button, text, input, label)
import Html.Attributes exposing (value)
import Html.Events exposing (onClick, onInput)

-- Model
type alias Model =
    { word : String
    , definition : String
    , guessedCorrectly : Bool
    , wordList : List String
    }

-- Msg
type Msg
    = FetchDefinition
    | ClearDefinition
    | UpdateWord String
    | RandomWordButtonClicked

-- init
init : Model
init =
    { word = ""
    , definition = ""
    , guessedCorrectly = False
    , wordList = ["apple", "banana", "cherry"]
    }

-- update
update : Msg -> Model -> Model
update msg model =
    case msg of
        FetchDefinition ->
            model

        ClearDefinition ->
            { model | word = "", definition = "", guessedCorrectly = False }

        UpdateWord newWord ->
            { model | word = newWord, guessedCorrectly = (newWord == model.word) }

        RandomWordButtonClicked ->
            model

-- view
view : Model -> Html Msg
view model =
    div []
        [ div [] [ label [] [ text "Type in to guess" ]
        , input [ onInput UpdateWord, value model.word ] []
        , button [ onClick FetchDefinition ] [ text "Fetch Definition" ]
        , button [ onClick ClearDefinition ] [ text "Clear Definition" ]
        , div [] [ text model.definition ]
        , div [] [ text (if model.guessedCorrectly then "Correct!" else "") ]
        ]]

-- subscriptions
subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none

-- main
main : Program () Model Msg
main =
    Browser.sandbox
        { init = init
        , update = update
        , view = view
        }
