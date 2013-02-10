require(tseries)
require(RJSONIO)

hackZeroes <- function (x) {
    for (i in which(x == 0)) {
        if (i == 1) {
            c = i
            while (x[c] == 0) {
                c = c + 1
            }
            x[i] <- x[c]
        } else {
            x[i] <- x[i - 1]
        }
    }
    x
}

getReturns <- function (symbol) {
    assetPrice <- as.vector(get.hist.quote(symbol,
        start="2009-8-6", end="2011-8-6",
        compression="w", quote="Close", quiet=TRUE))
    assetPrice <- hackZeroes(assetPrice)
    assetReturns <- diff(log(assetPrice[1:(length(assetPrice)-1)]))

    return(assetReturns)
}

getOptimalPortfolio <- function (jsonObj) {
    x <- c()

    o = fromJSON(jsonObj)
    symbols <- o$prods

    for (asset in symbols) {
        rets = getReturns(asset);
        x <- cbind(x, rets)
    }

    # Target Return (pm) is weekly
    res <- portfolio.optim(x, pm = mean(x),
        reslow = c(0, 0, 0), reshigh = c(1, 1, 1))

    return(toJSON(res))
}

# args <- '{"prods":["IBM","YHOO","MSFT"]}';
# res <- getOptimalPortfolio(args)
# fromJSON(res)$pw

# Optimal weights: 0.27107,0.2688,0.46013


