# In order to start server run following line in examples directory
# `R -f ex6.R --gui-none --no-save` - this will block while Rserve is started

# because we run run.Rserve() the current session will become Rserve session
# so we can initialize the server here

# here goes some code you want to load once for example an echo function
echo <- function(data) {
    print(data)
    return(data);
}

# then run Rserve in process
require('Rserve')
run.Rserve()
