function entropy(symbol_counts){
    var H = 0
    var counts_sum = 0
    for (var i=0;i < symbol_counts.length; i++){
        counts_sum += symbol_counts[i]
    }
    
    for (var i=0;i < symbol_counts.length; i++){
        
        H += (symbol_counts[i]/counts_sum)*Math.log(counts_sum/symbol_counts[i])
    }
    H = H/Math.log(2.0)
    return H
}

function rANS_encoder() {
    // Input function
    var countsVal = document.getElementById("symbol_counts").value;
    var inputVal = document.getElementById("input_text").value;
    var symbol_counts = countsVal.split(',').map(function(countsVal){return Number(countsVal);});
    var s_input = inputVal.split(',').map(function(inputVal){return Number(inputVal);});    
    // compute cumulative frequencies
    var cumul_counts = []
    var sum_counts = 0
    for (var i=0;i < symbol_counts.length; i++){
        cumul_counts.push(sum_counts);
        sum_counts += symbol_counts[i];
    }
    
    var state = 0
    var output_string = "<table width=\"50%\">" + "<tr> <th>Input </th> <th> State </th></tr>"
    for (var j=0; j < s_input.length; j++){
        var s = s_input[j]
        var Fs = symbol_counts[s]
        var Cs = cumul_counts[s]
        state = Math.floor(state/Fs)*sum_counts + Cs + (state % Fs)
        output_string += "<tr> <th>" + s + "</th><th>" + state + "</th></tr>"
    }
    output_string += "</table>"
    output_string += "<tt> <small>"
    output_string += "Final State: " + state 
    output_string += "<br> Number of input symbols: " + s_input.length 
    
    var L_avg = Math.ceil(Math.log(state)/Math.log(2.0))/s_input.length
    output_string += "<br> Average codelength: " + L_avg 
    output_string += "<br> Entropy: " + entropy(symbol_counts) + "<br> </tt> </small>"
    document.getElementById("demo").innerHTML = output_string;    
}






function rANS_decoder() {
    // Input function
    var countsVal = document.getElementById("symbol_counts_decoder").value;
    var num_symbols = Number(document.getElementById("num_decoder").value);
    var state = Number(document.getElementById("state_decoder").value);
    var symbol_counts = countsVal.split(',').map(function(countsVal){return Number(countsVal);});
    
    // compute cumulative frequencies
    var cumul_counts = []
    var sum_counts = 0
    for (var i=0;i < symbol_counts.length; i++){
        cumul_counts.push(sum_counts);
        sum_counts += symbol_counts[i];
    }
    
    function c_inv(y){
        for (var i=0;i < symbol_counts.length; i++){
            if (y < cumul_counts[i]) break;        
        }
        return (i-1)
    }

    var output_string = "<table width=\"50%\">" + "<tr> <th>Output </th> <th> State </th></tr>"
    for (var j=0; j < num_symbols; j++){
        var slot = state % sum_counts
        var s = c_inv(slot)
        var Fs = symbol_counts[s]
        var Cs = cumul_counts[s]
        output_string += "<tr> <th>" + s + "</th><th>" + state + "</th></tr>"

        state = Math.floor(state/sum_counts)*Fs + slot - Cs
    }
    output_string += "</table>"
    output_string += "<tt> <small> <br> Final State: " + state + "</tt> </small>"
    document.getElementById("rANS_decoder").innerHTML = output_string;    
}


/*******************************************************************************
 STREAMING RANS VARIANTS
********************************************************************************/

function rANS_streaming_encoder() {
    // Input function
    var countsVal = document.getElementById("symbol_counts_streaming").value;
    var inputVal = document.getElementById("input_text_streaming").value;

    var symbol_counts = countsVal.split(',').map(function(countsVal){return Number(countsVal);});
    var s_input = inputVal.split(',').map(function(inputVal){return Number(inputVal);});    
    // compute cumulative frequencies
    var cumul_counts = []
    var sum_counts = 0
    for (var i=0;i < symbol_counts.length; i++){
        cumul_counts.push(sum_counts);
        sum_counts += symbol_counts[i];
    }
    
    var state = sum_counts
    var rANS_stream = ""
    var output_string = "<table width=\"60%\">" + "<tr> <th> Input </th> <th> State </th> <th>Stream op </th> </tr>"
    for (var j=0; j < s_input.length; j++){
        var s = s_input[j]
        var Fs = symbol_counts[s]
        var Cs = cumul_counts[s]

        var out_bits = ""
        while (state >= 2*Fs){
            out_bits += String(state % 2)
            state = Math.floor(state/2)
        }
        state = Math.floor(state/Fs)*sum_counts + Cs + (state % Fs)
        rANS_stream += out_bits
        output_string += "<tr> <th>" + s + "</th><th>" + state + "</th><th>" + out_bits + "</th></tr>"
    }

    output_string += "</table>"
    output_string += "<tt> <small>"
    output_string += "Final State: " + state
    output_string += "<br> BitStream: " + rANS_stream
    output_string += "<br> Number of input symbols: " + s_input.length 
    
    var L_avg = (Math.ceil(Math.log(state)/Math.log(2.0)) + rANS_stream.length)/s_input.length
    output_string += "<br> Average codelength: " + L_avg 
    output_string += "<br> Entropy: " + entropy(symbol_counts) + "<br> </tt> </small>"
    document.getElementById("rANS_stream_encoder").innerHTML = output_string;    
}


function rANS_streaming_decoder(){
    // Input function
    var countsVal = document.getElementById("symbol_counts_streaming_decoder").value;
    var num_symbols = Number(document.getElementById("num_streaming_decoder").value);
    var state = Number(document.getElementById("state_streaming_decoder").value);
    var streamVal = document.getElementById("rANS_stream_decoder").value;
    var symbol_counts = countsVal.split(',').map(function(countsVal){return Number(countsVal);});
    var rANS_stream = streamVal.split('').map(function(arr){return Number(arr);});
    
    // compute cumulative frequencies
    var cumul_counts = []
    var sum_counts = 0
    for (var i=0;i < symbol_counts.length; i++){
        cumul_counts.push(sum_counts);
        sum_counts += symbol_counts[i];
    }
    
    function c_inv(y){
        for (var i=0;i < symbol_counts.length; i++){
            if (y < cumul_counts[i]) break;        
        }
        return (i-1)
    }

    var output_string = "<table width=\"50%\">" + "<tr> <th>Decoded Symbol </th> <th> State </th></tr>"
    for (var j=0; j < num_symbols; j++){
        var slot = state % sum_counts
        var s = c_inv(slot)
        var Fs = symbol_counts[s]
        var Cs = cumul_counts[s]
        output_string += "<tr> <th>" + s + "</th><th>" + state + "</th></tr>"
        state = Math.floor(state/sum_counts)*Fs + slot - Cs

        while (state < sum_counts){
            state = state*2 + rANS_stream.pop() 
        }

    }
    output_string += "</table>"
    output_string += "<tt> <small> <br> Final State: " + state + "</tt> </small>"
    document.getElementById("rANS_streaming_decoder_output").innerHTML = output_string;    
}


/*******************************************************************************
 TANS Variant
********************************************************************************/

function tANS_encoder(){
    // Input function
    var countsVal = document.getElementById("symbol_counts_tANS").value;
    var symbol_counts = countsVal.split(',').map(function(countsVal){return Number(countsVal);});
    // compute cumulative frequencies
    var cumul_counts = []
    var sum_counts = 0
    for (var i=0;i < symbol_counts.length; i++){
        cumul_counts.push(sum_counts);
        sum_counts += symbol_counts[i];
    }
    

    var output_state_string = "<table width=\"40%\"> <caption> Output State</caption> <tr> <th> Input State </th>"
    var output_bits_string = "<table width=\"40%\"> <caption> BitStream Output</caption><tr> <th> Input State </th>" 

    for (var s=0; s < symbol_counts.length; s++){
        output_state_string += "<th> " + String.fromCharCode(65+s) + " </th>"  
        output_bits_string +=  "<th> " + String.fromCharCode(65+s) + " </th>"
    }
    output_state_string += "</tr>"  
    output_bits_string +=  "</tr>"


    for (var state=sum_counts; state < 2*sum_counts; state++){
        output_state_string += "<tr><th>" + state + "</th>"   
        output_bits_string +=  "<tr><th>" + state + "</th>"
        for (var s=0; s < symbol_counts.length; s++){
            var Fs = symbol_counts[s]
            var Cs = cumul_counts[s]

            var out_bits = ""
            var out_state = state
            while (out_state >= 2*Fs){
                out_bits += String(out_state % 2)
                out_state = Math.floor(out_state/2)
            }
            out_state = Math.floor(out_state/Fs)*sum_counts + Cs + (out_state % Fs)
            
            output_state_string += "<th> " + out_state + " </th>"
            output_bits_string += "<th> " + out_bits + " </th>"
        }
        output_state_string += "</tr>"   
        output_bits_string +=  "</tr>"
    }
        

    output_state_string += "</table><br>"
    output_bits_string += "</table>"
    var output_string = output_state_string + output_bits_string
    
    document.getElementById("tANS_encoder_output").innerHTML = output_string;    
}



function tANS_decoder(){
// Input function
    var countsVal = document.getElementById("symbol_counts_tANS_decoder").value;
    var symbol_counts = countsVal.split(',').map(function(countsVal){return Number(countsVal);});
    // compute cumulative frequencies
    var cumul_counts = []
    var sum_counts = 0
    for (var i=0;i < symbol_counts.length; i++){
        cumul_counts.push(sum_counts);
        sum_counts += symbol_counts[i];
    }
    

    function c_inv(y){
        for (var i=0;i < symbol_counts.length; i++){
            if (y < cumul_counts[i]) break;        
        }
        return (i-1)
    }


    var decoder_table_string = "<table width=\"80%\">  <tr> <th> Input State: </th>"
    for (var state=sum_counts; state < 2*sum_counts; state++){
        decoder_table_string += "<th> " + state + "</th>"
    }
    decoder_table_string += "</tr>"
    decoder_table_string += "<tr> <th> Decoded Symbol: </th>"
    for (var s=0; s < symbol_counts.length; s++){
        var count  = symbol_counts[s]
        var symbol = String.fromCharCode(65+s)
        for (var i=0; i < count; i++){
            decoder_table_string += "<th>" + symbol + "</th>"
        }
    }
    decoder_table_string += "</tr>"

   
    decoder_table_string += "</table><br>"
    var output_string = decoder_table_string
    
    document.getElementById("tANS_decoder_output").innerHTML = output_string; 

}


