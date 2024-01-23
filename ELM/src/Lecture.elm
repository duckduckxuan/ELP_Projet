module Lecture exposing (extractWordAt)

import Browser
import Html exposing (Html, text, pre, button, div)
import Http
import String
import List exposing (map)


extractWordAt : Int -> String -> List String
extractWordAt position text =
    text
        |> String.words
        |> List.filter (\word -> not (String.isEmpty word))
        |> List.drop (position - 1)
        |> List.take 1
