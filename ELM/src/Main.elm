module Main exposing (..)

import Browser
import Html exposing (Html, div, h1, button, text, input, label, pre, ul, li)
import Html.Attributes exposing (placeholder, type_, style, checked)
import Html.Events exposing (onClick, onInput)
import Json.Decode exposing (Decoder, list, field, string, map, map2)
import Random exposing (int,initialSeed, Seed, step, Generator)
import List exposing (map, head)
import MotAleatoire exposing (getRandomWord)
import LesDefinitions exposing (definitionDecoder, meaningDecoder)
import PasAffichage exposing (hiddenStyle)
import Debug exposing (log)
import Time 
import String
import Http 

-- Le MAIN 
main : Program () Model Msg
main =
    Browser.element { init = init, update = update, view = view, subscriptions = subscriptions }
-- DECLARATION DES TYPES 
type alias Meaning =
    { partOfSpeech : String
    , definitions : List String
    }

type alias Model =
    { motChoisi : String
    , meanings : List Meaning
    , listMots : List String
    , randomSeed : Int
    , inputUser : String
    , motTrouve : Bool 
    , title : String 
    , showAnswer : Bool 
    , jeuInitialise : Bool
    , finJeu : Bool 
    , secondes : Int
    , correctMessage : Bool 
    , compter : Int
    , motDevines : List String 
    }

-- MESSAGES
type Msg
    = DefinitionFetched (Result Http.Error (List Meaning))
    | InitialiserJeu
    | GotText (Result Http.Error String)
    | ActualiserInput String 
    | MontrerReponse Bool 
    | ChangerMot 
    | Tick 
    | DelayedMessage

-- INITIALISATION
init : () -> (Model, Cmd Msg)
init _ =
    ( { motChoisi  = "", meanings = [], listMots =[], randomSeed = 30, 
        inputUser = "", motTrouve = False, title = "Guess it!", showAnswer = False, jeuInitialise = False, finJeu = False, 
        secondes = 60, correctMessage = False, compter = 0, motDevines = []
    }
    , requestDefinition ""
    )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of

        DefinitionFetched (Ok meanings) ->
            ({ model | meanings = meanings }, Cmd.none)

        DefinitionFetched (Err _) ->
            ({ model | meanings = [] }, Cmd.none)

        InitialiserJeu ->
            if model.finJeu then 
                let 
                    (newModel, cmd) = init ()
                in
                (newModel, cmd)
            else 
                ({ model | jeuInitialise = True }, Http.get { url = "/static/monFichier.txt", expect = Http.expectString GotText })
        
        GotText result ->
            case result of
                Ok fullText ->
                    let
                        laListe = extractListOfWords fullText
                        newSeed = model.randomSeed + 1
                        newMot = getRandomWord laListe newSeed
                    in
                    ({ model | motChoisi = newMot, listMots = laListe}, requestDefinition newMot)
                Err _ ->
                    (model, Cmd.none)

        ChangerMot ->
            let
                newSeed = model.randomSeed + 1  
                nouveauMot = getRandomWord (List.filter (\mot -> mot /= model.motChoisi) model.listMots) newSeed
            in
            ({ model | motChoisi = nouveauMot, randomSeed = newSeed, inputUser = ""
            , title = "Guess it!", motTrouve = False, showAnswer = False}, requestDefinition nouveauMot)

        ActualiserInput input ->
            let 
                isCorrect = input == model.motChoisi
                newTitle = if isCorrect then model.motChoisi else model.title
                newSeed = model.randomSeed + 1  
                nouveauMot = getRandomWord (List.filter (\mot -> mot /= model.motChoisi) model.listMots) newSeed
            in 
            if isCorrect then 
                ({ model | motChoisi = nouveauMot, randomSeed = newSeed, inputUser = ""
                , title = "Guess it!", motTrouve = False, showAnswer = False, correctMessage = True,
                compter = model.compter + 1, motDevines = model.motDevines ++ [model.motChoisi]}, requestDefinition nouveauMot)
            else 
                ({model | inputUser = input, motTrouve = input == model.motChoisi, title = newTitle, correctMessage = False}, Cmd.none)
        

        DelayedMessage ->
           ({ model | correctMessage = False }, Cmd.none)

        MontrerReponse isChecked -> 
            if isChecked then ({ model | showAnswer = True, title = model.motChoisi}, Cmd.none)
            else ({ model | showAnswer = False, title = "Guess it!" }, Cmd.none)
        
        Tick ->
            if model.jeuInitialise && model.secondes > 0 then 
                ({model | secondes= model.secondes - 1 }, Cmd.none)
            else if model.jeuInitialise && model.secondes == 0 then 
                ({model | finJeu = True }, Cmd.none)
            else 
                (model, Cmd.none)

        

extractListOfWords : String -> List String
extractListOfWords text =
    text
        |> String.words
        |> List.filter (\word -> not (String.isEmpty word))

requestDefinition : String -> Cmd Msg
requestDefinition word =
    Http.get
        { url = "https://api.dictionaryapi.dev/api/v2/entries/en/" ++ word
        , expect = Http.expectJson DefinitionFetched definitionDecoder
        }

---- AFICHAGE
view : Model -> Html Msg
view model =
    div []
        [ 
        -- AFFICHAGE DEBUT DU JEU 
        div [style "height" "16px", style "width" "100%", style "margin" "0"] []
        , div ([style "font-size" "45px"] ++ hiddenStyle (not model.jeuInitialise) )  
        [ text "R I D D L E" ]
        , div ([style "font-size" "20px"] ++ hiddenStyle (not model.jeuInitialise) )  
        [ text "We are going to give you the different definitions of a word and you can try to guess it!" ]
        , div ([style "font-size" "20px"] ++ hiddenStyle (not model.jeuInitialise) )  
        [ text "How many words can you guess in a minute?" ]       
        , div [style "height" "16px", style "width" "100%", style "margin" "0"] [] 
        , button [ onClick InitialiserJeu, style "display" <| if model.jeuInitialise then "none" else "block"] 
        [ text "Start the game " ]

        -- AFFICHAGE JEU 
        , div ([ style "font-size" "24px", style "font-weight" "bold", style "margin-left" "5%" ] ++ hiddenStyle model.jeuInitialise)
        [ text model.title ]
        , div [style "height" "16px", style "width" "100%", style "margin" "0"] []
        , button ([ onClick ChangerMot, onInput ActualiserInput, style "margin-left" "5%"  ] ++ hiddenStyle model.jeuInitialise) 
        [ text "Choose another word"]
        , div ([style "font-size" "18px", style "margin-left" "5%" ] ++ hiddenStyle model.jeuInitialise ) 
        [text <| "Time remaining: " ++ String.fromInt (model.secondes)]
        , div [style "height" "16px", style "width" "100%", style "margin" "0"] []
        , input ([ type_ "text", placeholder "Write your answer here", Html.Attributes.value model.inputUser, onInput ActualiserInput, style "margin-left" "5%" ] ++ hiddenStyle model.jeuInitialise ) []
        , div ([ style "color" <| if model.motTrouve then "green" else "black" ] ++ hiddenStyle model.jeuInitialise ) 
        [ text <| if model.motTrouve then "Yeah ! you found the answer :)))" else "" ]
        , div [style "height" "16px", style "width" "100%", style "margin" "0"] []
        , input ([ type_ "checkbox", Html.Events.on "change" (Json.Decode.map MontrerReponse Html.Events.targetChecked), checked model.showAnswer, style "margin-left" "5%" ] ++ hiddenStyle model.jeuInitialise ) []
        , label (hiddenStyle model.jeuInitialise) 
        [ text "     Show the answer" ]

        --AFFICHAGE JEU FINI

        , div [style "position" "fixed", style "top" "25%", style "left" "50%", style "transform" "translate(-50%, -50%)"
               , style "width" "300px", style "height" "200px", style "background-color" "black", style "color" "white"
               , style "font-size" "24px", style "text-align" "center", style "display" <| if model.finJeu then "block" else "none"]
            [ div [style "height" "16px", style "width" "100%", style "margin" "0"] []
            , text "Game Over"
            , div [style "margin-top" "20px"] [ text <| "You guessed " ++ String.fromInt model.compter ++ " words." ]
            , div [style "margin-top" "20px"] [ button [onClick InitialiserJeu] [ text "Play Again" ] ]
            ]


        -- AFFICHAGE DEFINITIONS 
        , div ([style "font-size" "15px"] ++ hiddenStyle model.jeuInitialise ) (List.concatMap viewMeaning model.meanings)
        , div [style "position" "fixed", style "width" "20%",style "top" "10%", style "left" "70%", style "border-left" "1px solid #ccc", style "padding" "10px"]
        (List.map (\word -> div [] [text word]) model.motDevines)
        , if model.correctMessage then
            div [style "position" "fixed", style "top" "10%", style "left" "40%", style "transform" "translate(-50%, -50%)"
                , style "font-size" "40px", style "text-align" "center", style "color" "green"]
                [ text "CORRECT" ]
          else
            div []
                []
        ]

viewMeaning : Meaning -> List (Html Msg)
viewMeaning meaning =
    [ div [style "width" "60%", style "float" "left", style "margin-left" "5%" ] [ text ("Part of Speech: " ++ meaning.partOfSpeech) ]
    , ul [] (List.indexedMap viewDefinition meaning.definitions)
    ]

viewDefinition : Int -> String -> Html Msg
viewDefinition index definition =
    div [style "width" "60%", style "float" "left", style "margin-left" "5%" ]
        [ li [] [ text (definition) ] ]

subscriptions model =
    Sub.batch
        [ Time.every 1000 (\_ -> Tick)
        , if model.correctMessage then Time.every 200 (\_ -> DelayedMessage) else Sub.none
        ]
