module Main exposing (..)

import Browser
import Html exposing (Html, div, h1, button, text, input, label, pre)
import Html.Attributes exposing (placeholder, type_, style, checked)
import Html.Events exposing (onClick, onInput)
import Random exposing (initialSeed, int, Seed, step, Generator)
import Aleatoire exposing (getRandomWord)
import Json.Decode
import String
import List exposing (map)
import Http  


main =
    Browser.sandbox 
    { init = init
    , update = update
    , view = view }

type alias Model =
    { motChoisi : String
    , inputUser : String
    , motTrouve : Bool 
    , message : String
    , title : String
    , showAnswer : Bool 
    , randomSeed : Int
    , jeuInitialise : Bool
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
    , jeuInitialise = False 
    }

type Msg
    = ChangerMot
    | ActualiserInput String
    | MontrerReponse Bool 
    | InitialiserJeu 

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
        
        InitialiserJeu ->
            { model | jeuInitialise= True }

-- Ajoutez une fonction de style pour gérer la visibilité
hiddenStyle : Bool -> List (Html.Attribute a)
hiddenStyle isVisible =
    if isVisible then
        []
    else
        [ style "display" "none" ]

-- ...

-- Modifiez la fonction view pour utiliser la fonction de style
view : Model -> Html Msg
view model =
    div []
        [ button [ onClick InitialiserJeu ] [ text "Initialiser le jeu" ]
        , div ([ style "font-size" "24px", style "font-weight" "bold" ] ++ hiddenStyle model.jeuInitialise) [ text model.title ]
        , button ([ onClick ChangerMot, onInput ActualiserInput ] ++ hiddenStyle model.jeuInitialise) [ text "Choisir un autre mot"]
        , input ([ type_ "text", placeholder "Entre ton mot", Html.Attributes.value model.inputUser, onInput ActualiserInput] ++ hiddenStyle model.jeuInitialise) []
        , div (hiddenStyle model.jeuInitialise) [ text model.message ]
        , div ([ style "color" <| if model.motTrouve then "green" else "black" ] ++ hiddenStyle model.jeuInitialise) [ text <| if model.motTrouve then "Tu as gagné!" else "" ]
        , input ([ type_ "checkbox", Html.Events.on "change" (Json.Decode.map MontrerReponse Html.Events.targetChecked), checked model.showAnswer ] ++ hiddenStyle model.jeuInitialise) []
        , label (hiddenStyle model.jeuInitialise) [ text "Show the answer" ]      
        ]
