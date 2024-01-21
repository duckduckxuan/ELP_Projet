module Main exposing (..)

import Browser
import Html exposing (Html, div, h1, button, text, input, label)
import Html.Attributes exposing (placeholder, type_, style, checked)
import Html.Events exposing (onClick, onInput)
import Random exposing (initialSeed, int, Seed, step, Generator)
import Aleatoire exposing (getRandomWord)
import Json.Decode

type alias Model =
    { motChoisi : String
    , inputUser : String
    , motTrouve : Bool 
    , message : String
    , title : String
    , showAnswer : Bool 
    , randomSeed : Int
    }

init : Model
init =
    { motChoisi = getRandomWord "" 42
    , inputUser = ""
    , motTrouve = False
    , message = ""
    , title = "Guess it!"
    , showAnswer = False
    , randomSeed = 42
    }

type Msg
    = ChangerMot
    | ActualiserInput String
    | MontrerReponse Bool 

update : Msg -> Model -> Model
update msg model =
    case msg of
        ChangerMot ->
            let
                newSeed = model.randomSeed + 1  
                nouveauMot = getRandomWord model.motChoisi newSeed
            in
            { model 
            | motChoisi = nouveauMot
            , randomSeed = newSeed
            , inputUser = ""
            , message = ""
            , title = "Guess it!"
            , motTrouve = False
            , showAnswer = False}

        ActualiserInput input ->
            let 
                isCorrect = input == model.motChoisi
                result = 
                    if isCorrect then 
                        "Bravo !"
                    else 
                        "Essaie de deviner"
                newTitle = if isCorrect then model.motChoisi else model.title
            in 
            {model | inputUser = input, message = result, motTrouve = input == model.motChoisi, title = newTitle}

        MontrerReponse isChecked -> 
            if isChecked then 
                { model | showAnswer = True, title = model.motChoisi}
            else
                { model | showAnswer = False, title = "Guess it!" }


-- VIEW
view : Model -> Html Msg
view model =
    div []
        [ div [ style "font-size" "24px", style "font-weight" "bold" ] [ text model.title ]
        , button [ onClick ChangerMot, onInput ActualiserInput ] [ text "Choisir un autre mot"]
        , input [ type_ "text", placeholder "Entre ton mot", Html.Attributes.value model.inputUser, onInput ActualiserInput] []
        , div [] [ text model.message ]
        , div
            [ style "color" <| if model.motTrouve then "green" else "black" ]
            [ text <| if model.motTrouve then "Tu as gagné!" else "" ]
        , input [ type_ "checkbox", Html.Events.on "change" (Json.Decode.map MontrerReponse Html.Events.targetChecked), checked model.showAnswer ] []
        , label [] [ text "Show the answer" ]      
        ]


main =
    Browser.sandbox { init = init, update = update, view = view }