require(RJSONIO)

run <- function(jsonObj) {
    o = fromJSON(jsonObj)

    toJSON(o)
}
