module Main exposing (..)

import Browser
import Html exposing (Html, div, input, text, button, label)
import Html.Attributes exposing (placeholder, type_, style, checked)
import Html.Events exposing (onInput, onClick)
import Random exposing (Generator, initialSeed)
import List exposing (head)
import Maybe exposing (withDefault)
import Html.Events
import Json.Decode


type alias Model =
    { wordToGuess : String
    , userInput : String
    , message : String
    , guessed : Bool
    , title : String
    , showAnswer : Bool
    , randomSeed : Int
    }

init : Model
init =
    { wordToGuess = getRandomWord "" 42  -- 初始种子值可以是任何整数
    , userInput = ""
    , message = ""
    , guessed = False
    , title = "Guess it!"
    , showAnswer = False
    , randomSeed = 42  -- 初始种子值
    }


type Msg
    = UpdateInput String
    | NewWord
    | ToggleShowAnswer Bool

update : Msg -> Model -> Model
update msg model =
    case msg of
        UpdateInput input ->
            let
                isCorrect = input == model.wordToGuess
                result = if isCorrect then "Bravo! Tu as trouvé le mot." else "Essaie de deviner."
                newTitle = if isCorrect then model.wordToGuess else model.title
            in
            { model | userInput = input, message = result, guessed = isCorrect, title = newTitle }

        NewWord ->
            let
                newSeed = model.randomSeed + 1  -- 更新种子值
                newWord = getRandomWord model.wordToGuess newSeed
            in
            { model
                | wordToGuess = newWord
                , userInput = ""
                , message = ""
                , guessed = False
                , title = "Guess it!"
                , showAnswer = False
                , randomSeed = newSeed
            }
 
        ToggleShowAnswer isChecked ->
            if isChecked then
                { model | showAnswer = True, title = model.wordToGuess }
            else
                { model | showAnswer = False, title = "Guess it!" }

getRandomWord : String -> Int -> String
getRandomWord previousWord seed =
    let
        wordList = 
            [ "chat", "chien", "maison", "fleur", "arbre", "ordinateur", "soleil", "plage", "montagne", "avion"
            , "étoile", "livre", "papillon", "écran", "jardin", "église", "rivière", "cadeau", "bicyclette", "lumière"
            ]
        randomIndexGenerator =
            Random.int 0 (List.length wordList - 1)
        (randomIndex, _) =
            Random.step randomIndexGenerator (initialSeed seed)
        randomElement =
            List.take 1 (List.drop randomIndex wordList)
    in
    Maybe.withDefault "Mot par défaut" (List.head randomElement)


view : Model -> Html Msg
view model =
    div []
        [ div [ style "font-size" "24px", style "font-weight" "bold" ] [ text model.title ]
        , Html.button [ onClick NewWord ] [ text "Choisir un autre mot" ]
        , input [ type_ "text", placeholder "Entre ton mot", Html.Attributes.value model.userInput, onInput UpdateInput ] []
        , div [] [ text model.message ]
        , div
            [ style "color" <| if model.guessed then "green" else "black" ]
            [ text <| if model.guessed then "Tu as gagné!" else "" ]
        , input [ type_ "checkbox", Html.Events.on "change" (Json.Decode.map ToggleShowAnswer Html.Events.targetChecked), checked model.showAnswer ] []
        , label [] [ text "Show the answer" ]        
        ]

main =
    Browser.sandbox { init = init, update = update, view = view }
