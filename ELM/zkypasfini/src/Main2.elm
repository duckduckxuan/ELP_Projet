module Main exposing (..)

import Browser
import Html exposing (Html, div, button, text, input, label)
import Html.Attributes exposing (value)
import Html.Events exposing (onClick, onInput)
import Http
import Json.Decode as Json exposing (Decoder, field, string, list)
import Random exposing (Generator, int, initialSeed, step, generate)

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
    | DefinitionFetched (Result Http.Error (List Definition))
    | ClearDefinition
    | UpdateWord String
    | RandomWordButtonClicked

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
    , wordList =
        [ "apple"
        , "banana"
        , "cherry"
        -- 添加更多单词
        ]
    }, Cmd.none |> getRandomWord)  -- 初始化时获取随机单词

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

        RandomWordButtonClicked ->
            ({ model | guessedCorrectly = False }, Cmd.none |> getRandomWord)  -- 点击按钮时获取随机单词

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
        , button [ onClick RandomWordButtonClicked ] [ text "Random Word" ]  -- 添加一个按钮用于获取随机单词
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

-- 创建一个生成器，用于从词汇库中随机选择一个索引
randomWordIndexGenerator : Generator Int
randomWordIndexGenerator =
    int 0  (List.length wordList - 1)

-- 从词汇库中随机选择一个单词并更新模型
getRandomWord : Model -> Cmd Msg
getRandomWord model =
    case generate randomWordIndexGenerator (initialSeed 42) of
        Ok randomIndex ->
            let
                randomWord =
                    List.Extra.getAt randomIndex model.wordList |> Maybe.withDefault ""
            in
            ( { model | word = randomWord }, Cmd.none )

-- 扩展 List 模块以获取指定索引的元素
module List.Extra exposing (getAt)

getAt : Int -> List a -> Maybe a
getAt n list =
    if n < 0 then
        Nothing
    else
        List.Extra.getAtHelper n list

getAtHelper : Int -> List a -> Maybe a
getAtHelper n list =
    case list of
        [] ->
            Nothing

        x :: xs ->
            if n == 0 then
                Just x
            else
                List.Extra.getAtHelper (n - 1) xs
