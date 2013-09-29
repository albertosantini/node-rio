createDummyPlot <- function () {
    filename <- tempfile("plot", fileext = ".png")

    png(filename)
    plot(1:10)
    dev.off()

    image <- readBin(filename, "raw", 29999)
    unlink(filename)

    image
}
