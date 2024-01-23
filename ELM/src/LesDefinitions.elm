module LesDefinitions exposing (definitionDecoder, meaningDecoder)


import Json.Decode exposing (Decoder, list, field, string, map, map2)

type alias Meaning =
    { partOfSpeech : String
    , definitions : List String
    }

definitionDecoder : Decoder (List Meaning)
definitionDecoder =
    field "0" (field "meanings" (list meaningDecoder))

meaningDecoder : Decoder Meaning
meaningDecoder =
    map2 Meaning
        (field "partOfSpeech" string)
        (field "definitions" (list (field "definition" string)))
