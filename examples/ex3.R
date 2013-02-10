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

getLogReturns <- function (symbol, start, end) {
    assetPrice <- as.vector(get.hist.quote(symbol,
        start=start, end=end,
        compression="w", quote="Close", quiet=TRUE))
    assetPrice <- hackZeroes(assetPrice)
    assetReturns <- diff(log(assetPrice[1:(length(assetPrice)-1)]))

    assetReturns
}

getReturns <- function (symbol, refDate) {
    ddNow = format(Sys.Date(), "%d")
    mmNow = format(Sys.Date(), "%m")
    yyNow = format(Sys.Date(), "%Y")

    refDate =  as.POSIXct(refDate, format="%a, %d %b %Y %H:%M:%S", tz="GMT")
    ddRef = format(refDate, "%d")
    mmRef = format(refDate, "%m")
    yyRef = format(refDate, "%Y")

    start = paste(as.numeric(yyRef) - 2, mmRef, ddRef, sep="-");
    end = paste(yyRef, mmRef, ddRef, sep="-");
    retsBefore = getLogReturns(symbol, start, end);

    if (ddNow != ddRef || mmNow != mmRef || yyNow != yyRef) {
        start = paste(yyRef, mmRef, ddRef, sep="-");
        end = paste(yyNow, mmNow, ddNow, sep="-");
        retsAfter = getLogReturns(symbol, start, end);
    }

    list(beforeRefDate=retsBefore, afterRefDate=retsAfter)
}

getOptimalPortfolio <- function (jsonObj) {
    x <- c()
    p <- c()

    o = fromJSON(jsonObj)

    symbols <- o$prods
    referenceDate <- o$referenceDate
    targetReturn <- o$targetReturn # target return is annual
    lows <- o$lows
    highs <- o$highs

    for (asset in symbols) {
        rets = getReturns(asset, referenceDate);
        x <- cbind(x, rets$beforeRefDate)
        if (length(rets$afterRefDate)) {
            p <- cbind(p, rets$afterRefDate)
        }
    }

    if (is.null(targetReturn)) {
        pm = mean(x)
    } else {
        pm = (targetReturn + 1) ^ (1 / 52) - 1 # weekly conversion
    }

    res <- list()
    res$optim <- try(portfolio.optim(x, pm=pm, reslow=lows, reshigh=highs), TRUE)
    if (class(res$optim) == "try-error") {
        res$message <- res$optim[1]
        res$optim <- list()
    } else {
        res$message <- ""
        res$perf <- c(0, cumsum(p %*% res$optim$pw)) # performances calc
    }

    return(toJSON(res))
}

test <- function() {
    params <- '{
        "prods": ["IBM", "YHOO", "MSFT"],
        "referenceDate": "Sat, 06 Aug 2011 12:00:00 GMT",
        "lows": [0, 0, 0],
        "highs": [1, 1, 1]
    }'

    res <- getOptimalPortfolio(params)
    o = fromJSON(res)
    print(o$message)
    if (o$message == "") {
        print(o$optim$pw)
        print(o$perf)
    }

    # Optimal weights: 0.27107,0.2688,0.46013
    # Perfs: 0.0000000 -0.0510010 -0.0131090 -0.0039485  0.0173990  0.0692240
}

