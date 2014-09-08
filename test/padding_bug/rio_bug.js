var d=require("./rio_bug_data")
var rio=require("../../lib/rio")



var cmd="";
var data={name: "displacement", data: d}
//cmd = wrapper.replace(/(\r\n)/g, "\n");
cmd += "\n" + "wrapper" + "(";
cmd += "'" + JSON.stringify(data) + "')";


//log.debug("command",cmd);
var options={}

options.host="127.0.0.1";
options.port=6311

options.callback=function(err, res){
    if(!err && !res) console.log("ERROR: no response from server")
    else console.log("RESULT OK")
//    console.log("res is", res)
};
options.data={};
options.data.name="displacement";
options.data.data=data;
rio.evaluate(cmd, options)
/*
r.exec("displacement", data, function(err, res){
    console.log("err is", err)
//    console.log("res is", res)
})

*/


