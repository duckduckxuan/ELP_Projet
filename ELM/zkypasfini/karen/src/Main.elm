module Main exposing (..)

import Browser
import Html exposing (Html, div, input, text, button)
import Html.Attributes exposing (placeholder, type_, style)
import Html.Events exposing (onInput, onClick)
import Random exposing (Generator, initialSeed)
import List exposing (head)
import Maybe exposing (withDefault)

type alias Model =
    { wordToGuess : String
    , userInput : String
    , message : String
    , guessed : Bool
    }

init : Model
init =
    { wordToGuess = getRandomWord ""
    , userInput = ""
    , message = ""
    , guessed = False
    }

type Msg
    = UpdateInput String
    | NewWord

update : Msg -> Model -> Model
update msg model =
    case msg of
        UpdateInput input ->
            let
                result =
                    if input == model.wordToGuess then
                        "Bravo! Tu as trouvé le mot."
                    else
                        "Essaie de deviner."
            in
            { model | userInput = input, message = result, guessed = input == model.wordToGuess }

        NewWord ->
            { model | wordToGuess = getRandomWord model.wordToGuess, userInput = "", message = "", guessed = False }

getRandomWord : String -> String
getRandomWord previousWord =
    let
        wordList =
            [ "chat", "chien", "maison", "fleur", "arbre", "ordinateur", "soleil", "plage", "montagne", "avion"
            , "étoile", "livre", "papillon", "écran", "jardin", "église", "rivière", "cadeau", "bicyclette", "lumière"
            ]
        newWordList =
            List.filter (\word -> word /= previousWord) wordList
        randomIndexGenerator =
            Random.int 0 (List.length newWordList - 1)
        (randomIndex, _) =
            Random.step randomIndexGenerator (initialSeed 42)
        randomElement =
            List.take 1 (List.drop randomIndex newWordList)
    in
    Maybe.withDefault "Mot par défaut" (List.head randomElement)

view : Model -> Html Msg
view model =
    div []
        [ div [ style "font-size" "24px", style "font-weight" "bold" ] [ text model.wordToGuess ]
        , Html.button [ onClick NewWord ] [ text "Choisir un autre mot" ]
        , input [ type_ "text", placeholder "Entre ton mot", Html.Attributes.value model.userInput, onInput UpdateInput ] []
        , div [] [ text model.message ]
        , div
            [ style "color" <| if model.guessed then "green" else "black" ]
            [ text <| if model.guessed then "Tu as gagné!" else "" ]
        ]

main =
    Browser.sandbox { init = init, update = update, view = view }
