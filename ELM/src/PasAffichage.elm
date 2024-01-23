module PasAffichage exposing (hiddenStyle)

import Html exposing (Html, div, h1, button, text, input, label, pre, ul, li)
import Html.Attributes exposing (placeholder, type_, style, checked)

hiddenStyle : Bool -> List (Html.Attribute a)
hiddenStyle isVisible =
    if isVisible then
        []
    else
        [ style "display" "none" ]
