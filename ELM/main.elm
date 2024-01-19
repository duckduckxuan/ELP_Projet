module Main exposing (..)

import Browser exposing (beginnerProgram)
import Html exposing (..)
import Html.Events exposing (onClick)

view jeu =
    h1 []
        [ Html.div [] [Html.text "Guess it!"]
        ]

main =
    beginnerProgram
        { view = view }
