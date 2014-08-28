SezionSDK = function (accountID, accountSecret, callback) {
  
  self = this;
  
  this.Script = function () {};
  
  this.accountID     = accountID;
  this.accountSecret = accountSecret;
  
  this.client = Barrister.httpClient ("https://sezion.com/api?accountID="+accountID+"&accountSecret="+accountSecret);
  this.client.enableTrace();
  this.client.loadContract (function(err) {
    if (err) { 
      callback (err);
    }
    else {
      self.SezionAPI = self.client.proxy ("SezionAPI");
      console.log ("[SezionSDK]: client created", self.client);
      callback (null);
    }
  });
  
}

SezionSDK.prototype.TemplateNew = function (template, callback) {
  
  this.SezionAPI.Template_New (template, function (err, templateID) {
    if (err) 
      return callback (err);
    else
      template.id = templateID;
      return callback (null, template);
  });
  
}

SezionSDK.prototype.TemplateUpdate = function (templateID, update, callback) {
  this.SezionAPI.Template_Update (templateID, update, callback);
}

SezionSDK.prototype.TemplateDelete = function (templateID, callback) {
  this.SezionAPI.Template_Delete (templateID, callback);
}

SezionSDK.prototype.TemplateList = function (callback) {
  this.SezionAPI.Template_List (callback);
}


SezionSDK.prototype.TemplateMediaAssign = function (template, media, callback) {
 
  this.SezionAPI.Template_Media_Assign (template.id, media, function (err, result) {
    if (err)
      return callback (err);
    else
      return callback (null);
  });
  
  
}

SezionSDK.prototype.TemplateVideoNew = function (templateID, video, callback) {
 
  this.SezionAPI.Template_Video_New (templateID, video, function (err, videoID) {
    callback (err, videoID);  
  });
}

SezionSDK.prototype.TemplateVideoList = function (templateID, callback) {
  this.SezionAPI.Template_Video_List (templateID, callback);
}

SezionSDK.prototype.VideoDelete = function (videoID, callback) {
  this.SezionAPI.Video_Delete (videoID, callback);
}

SezionSDK.prototype.VideoSezionLink = function (videoID, sezionID, callback) {
 this.SezionAPI.Video_Sezion_Link (videoID, sezionID, callback); 
}

SezionSDK.prototype.MediaList = function (callback) {
  this.SezionAPI.Media_List (callback);
}

SezionSDK.prototype.MediaDelete = function (mediaID, callback) {
  this.SezionAPI.Media_Delete (mediaID, callback);
}

SezionSDK.prototype.MediaUploadAccount = function (file, name, description, progress, callback) {
  
  var self = this;
  
  var formData = new FormData();
  
  console.log ("[SezionSDK]: uploadfile: ", file);
  
  formData.append ('uploadFile-', file);
   
  console.log ("[SezionSDK]: uploadfile2: ");
  
  $.ajax ({
    url: "/api/upload?accountID="+self.accountID+"&accountSecret="+self.accountSecret,
    type: "POST",
    data: file,
    dataType: "json",
    contentType: file.type,
    async:true,
    cache:false,
    processData: false,    
    
    beforeSend: function (request) {
      request.setRequestHeader ("X-SZN-Filename",    file.name);
      request.setRequestHeader ("X-SZN-Description", description);           
    },
    
//     xhrFields: {
//       onprogress: function (e) {
//         if (progress && e.lengthComputable) {
//           progress (e.loaded / e.total * 100);
//         }
//       }
//     },
    
    xhr: function(){
        // get the native XmlHttpRequest object
        var xhr = $.ajaxSettings.xhr() ;
        // set the onprogress event handler
        if (progress) {
          xhr.upload.onprogress = function(evt){ 
            console.log('progress', evt.loaded/evt.total*100) 
            progress (evt.loaded/evt.total*100);
          };
        }
        // set the onload event handler
        xhr.upload.onload = function(){ console.log('DONE!') } ;
        // return the customized object
        return xhr ;
    }, 
    
    error: function (xhr, textStatus, errorThrown) {
      console.log ("[SezionSDK]: Media upload error", xhr, textStatus, errorThrown);
      callback ('AJAX Error: ' + textStatus + '-' + errorThrown + ' - ' + xhr.responseText);  
    },
    success: function (data, textStatus, xhr) {
      console.log ("[SezionSDK]: ajax callback: ", data);
      callback (data.error, data.media); //'OK: ' + data + ' - ' + textStatus + ' - ' + xhr.responseText );
    }
  });
  
}

SezionSDK.prototype.MediaUploadTemplate = function (file, name, description, templateID, templateSecret, progress, callback) {
  
  var self = this;
  
  var formData = new FormData();
  
  console.log ("[SezionSDK]: uploadfile: ", file);
  
  formData.append ('uploadFile-', file);
   
  console.log ("[SezionSDK]: uploadfile2: ");

  $.ajax ({
    url: "/api/upload?accountID="+self.accountID+"&templateID="+templateID+"&templateSecret="+templateSecret,
    type: "POST",
    data: file,
    //contentType: false,
    dataType: "json",
    contentType: file.type,
    async:true,
    cache:false,
    processData: false,
    
    xhr: function(){
      // get the native XmlHttpRequest object
      var xhr = $.ajaxSettings.xhr() ;
      // set the onprogress event handler
      if (progress) {
        xhr.upload.onprogress = function(evt){ 
          console.log('progress', evt.loaded/evt.total*100) 
          progress (evt.loaded/evt.total*100);
        };
      }
      // set the onload event handler
      xhr.upload.onload = function(){ console.log('DONE!') } ;
      // return the customized object
      return xhr ;
    }, 
    
    beforeSend: function (request) {
      request.setRequestHeader ("X-SZN-Filename",    file.name);
      request.setRequestHeader ("X-SZN-Description", description);
    },
    error: function (xhr, textStatus, errorThrown) {
      console.log ("[SezionSDK]: Media upload error");
      callback ('AJAX Error: ' + textStatus + '-' + errorThrown + ' - ' + xhr.responseText);  
    },
    success: function (data, textStatus, xhr) {
      console.log ("[SezionSDK]: ajax callback: ", data);
      callback (data.error, data.media); //'OK: ' + data + ' - ' + textStatus + ' - ' + xhr.responseText );
    }
  });
  
}


///////////////////
// Script parser //
///////////////////

function VMIX3script () {}

var inputTypes = ['video', 'audio', 'text', 'image', 'rectangle'];
var expr = new sznExpression ();

VMIX3script.getInputs = function (scriptsJSON) {
  
  if (!Array.isArray (scriptsJSON)) scriptsJSON = [scriptsJSON];
    
  try {
    
    var inputs = new Object ();
    
    for (var i = 0; i < scriptsJSON.length; i++) {
    
      var script = JSON.parse (scriptsJSON[i]);
        
      if (!Array.isArray(script)) return false;      
      
      for (var i = 0; i < script.length; i++) { 
        var input = script[i];
        inputType = Object.keys(input)[0];
        if (inputTypes.indexOf(inputType) == -1) return false;
        inputs[input[inputType].id||i] = input[inputType];//{ playTimes: input.play, duration : input.duration };
        inputs[input[inputType].id||i].inputID = input[inputType].id;
        inputs[input[inputType].id||i].type = inputType;
      }
    }
    
    return {inputs: inputs};
  }
  catch (e) {
    console.log ("[VMIX3script]: Error parsing script: ", e);
    return {error: "Error parsing JSON: "+e.message};
  }
}


VMIX3script.checkScript = function (scriptJSON) {
    
  var inputs         = this.getInputs (scriptJSON);
  
  if (inputs.error) return inputs.error;
  
  inputs = inputs.inputs;
  
  var graphDurations = new sznGraph();
  var graphPlay      = new sznGraph();
  
  try {
    
    //console.log ("[VMIX3script]: check script: ", scriptJSON);
    
//     var script = JSON.parse (scriptJSON);
//     
//     if (!Array.isArray(script)) return false;      
//     
//     for (var i = 0; i < script.length; i++) { 
//       var input = script[i];
//       inputType = Object.keys(input)[0];
//       if (inputTypes.indexOf(inputType) == -1) return false;
//       inputs[input[inputType].id||i] = input[inputType];//{ playTimes: input.play, duration : input.duration };
//     }
    
    console.log ("[VMIX3script]: checkScript inputs: ", inputs);
  
    for (var inputID in inputs) {
           
      if (inputs[inputID].duration) {
      
        var objects = expr.getObjectsID (inputs[inputID].duration);
        
        console.log ("[VMIX3script]: objects for %s: ", inputID, objects);
        
        if (!objects) return "No object for duration: "+inputs[inputID].duration;
        
        for (var i = 0; i < objects.length; i++) {
          if (!inputs[objects[i]]) {
            console.log ("[VMIX3script]: No object found: ", objects[i]);
            return "No object found for duration: "+objects[i];
          }
          else {     
            console.log ("Adding input: %s duration: ", inputID, objects[i]);
            graphDurations.addEdge (inputID, objects[i]);
          }
        }
      }
      
      if (inputs[inputID].play) {
        
        if (Array.isArray (inputs[inputID].play)) {
          for (var i = 0; i < inputs[inputID].play.length; i++) {
            var objects = expr.getObjectsID (inputs[inputID].play[i]);
            if (!objects) return "No object for play: "+inputs[inputID].play[i];
            for (var j = 0; j < objects.length; j++) {
              graphPlay.addEdge (inputID, objects[j]);
            }
          }
        }
        else {
          var objects = expr.getObjectsID (inputs[inputID].play);
          if (!objects)  return "No object found for play: "+objects[i];
          for (var i = 0; i < objects.length; i++) {
            graphPlay.addEdge (inputID, objects[i]);
          }
        }
      }
    }

    if (graphDurations.isCyclic()) return "Error: cycle detect for duration";
    if (graphPlay.isCyclic())      return "Error: cycle detect for play";
    return true;
    
  }
  catch (e) {
    console.log ("[VMIX3script]: Error parsing script: ", e);
    return "Error parsing JSON: "+e;
  }
}

VMIX3script.checkScriptSet = function (scripts) {

  console.log ("[VMIX3script]: checkScriptSet: ", scripts);
  
  if (!scripts || !scripts.length) return true;
  
  for (var i = 0; i < scripts.length; i++) {
    if (!VMIX3script.checkScript (scripts[i])) 
      return false;
  }
  return true;
}

VMIX3script.checkMedia = function (scripts, mediaID, mediaType) {
  
  console.log ("[VMIX3script]: checkMedia "+mediaID+"=>"+mediaType+"\n"+scripts);
  
  var inputs = this.getInputs (scripts);  
  
  console.log ("[VMIX3script]: inputs: ", inputs);
  
  if (!inputs[mediaID]) return false;
  if (inputs[mediaID].type == mediaType || mediaType=="none") return true;   
  else return false;

}

VMIX3script.templateFreeVars = function (scripts, medias) {
  
  var inputs = this.getInputs (scripts);
  
  for (var input in inputs) {
    if (inputs[input].type == "rectangle") delete inputs[input];
  }
  
  for (var i=0; i < medias.length; i++) {
    if (!inputs[medias[i].inputID]) {
    }
    else delete inputs[medias[i].inputID];
  }
  
  return Object.keys(inputs).length;
  
}

VMIX3script.checkScriptAndMedia = function (scripts, medias, mediaType) {

  var inputs = this.getInputs (scripts);
  
  for (var input in inputs) {
    if (inputs[input].type == "rectangle") delete inputs[input];
  }
    
  for (var i=0; i < medias.length; i++) {
    if (!inputs[medias[i].inputID]) {
      console.log ("[VMIX3script]: no input for media: ", medias[i]);
      return false;
    }
    else if (inputs[medias[i].inputID].type != medias[i].type) {
      console.log ("[VMIX3script]: types mistmatch for media: ", medias[i]);
      return false;
    }
    else delete inputs[medias[i].inputID];
  }
  
  return Object.keys(inputs).length == 0;
    
}

VMIX3script.getInputTypes = function (scripts) {
  
  var result = {
    audio: 0,
    video: 0,
    image: 0,
    text:  0
  }
  
  for (var i=0; scripts && i < scripts.length; i++) {    
    var scriptJSON = JSON.parse (scripts[i]);
    for (var input in scriptJSON.input) {
      var type = Object.keys(scriptJSON.input[input])[0];
      result[type]++;
    }
  }
  
  return result;
  
}

function sznGraph () {  
  this.adj         = new Object(); //std::set<int>        *_adj;   _adj = new std::set<int>[_numNodes];
  this.visitOrder  = new Array (); //std::list<void*>      _visitOrder; 
}

sznGraph.prototype.addEdge = function (node1, node2) {
    
    if (!this.adj[node1]) this.adj[node1] = new Object();
    this.adj[node1][node2] = true;    //_adj[node1].insert(node2);

}

sznGraph.prototype.isCyclicUtil = function (node, visited, recStack) {
   
  if (visited[node] == false) {
    // Mark the current node as visited and part of recursion stack
    visited[node]  = true;
    recStack[node] = true;
            
      // Recur for all the vertices adjacent to this vertex
      
    for (var i in this.adj[node]) {
      if (!visited[i] && this.isCyclicUtil (i, visited, recStack))
        return true;
      else if (recStack[i])
        return true;
      else if (this.nodeObjects)
        this.visitOrder.push (this.nodeObjects[node]||null);
    }
  }

  recStack[node] = false;  // remove the vertex from recursion stack
  return false;
}

sznGraph.prototype.isCyclic = function () {
  
  console.log ("[sznGraph]: Graph: ", this.adj);

  // Mark all the vertices as not visited and not part of recursion
  // stack
  var visited  = new Object();  //bool *visited  = new bool[_numNodes];
  var recStack = new Object(); //bool *recStack = new bool[_numNodes];
  
  for (var i in this.adj) {
      visited [i] = false;
      recStack[i] = false;
  }

  // Call the recursive helper function to detect cycle in different
  // DFS trees
  for (var i in this.adj) {
      if (this.isCyclicUtil (i, visited, recStack)) return true;
  }

  return false;
}

Array.prototype.top = function() {
  return this[this.length - 1];
}

function sznExpression () {
  
  this.OpMap = new Object(); //typedef std::map <std::string, std::pair<int,int> > OpMap;
   
  this.OpMap["+"] = {precedence:0, asoc:"LEFT"};
  this.OpMap["-"] = {precedence:0, asoc:"LEFT"};
  this.OpMap["*"] = {precedence:5, asoc:"LEFT"};
  this.OpMap["/"] = {precedence:5, asoc:"LEFT"};

}

// Test associativity of operator token          
sznExpression.prototype.isAssociative = function (token, type) {
  return this.OpMap[token].asoc == type;
}  

sznExpression.prototype.cmpPrecedence = function (token1, token2) {
  return this.OpMap[token1].precedence - this.OpMap[token2].precedence;
} 

sznExpression.prototype.isParenthesis = function (token) {          
  return token == "(" || token == ")";        
}        
      
sznExpression.prototype.isOperator = function (token) {          
  return token == "+" || token == "-" || token == "*" || token == "/";        
}        

sznExpression.prototype.isNumber = function (token) { 
  return !isNaN (token);
}

sznExpression.prototype.isVariable = function (token, selfID, inputs) {
         
  var objectID;
  var objectAttr;
  var vars = new Array();
            
  if (token.indexOf(".")==-1) {
    objectID   = selfID;
    objectAttr = token;
  }
  else {
    var t = token.split (".");
    objectID   = t[0];
    objectAttr = t[1];
  }
  
  console.log ("isVariable: "+objectID+"=>"+objectAttr);
  
  if (objectID.length == 0 || objectAttr.length == 0) return false;
  
  var object = inputs[objectID];          
  if (!object) return false;
              
  if (objectAttr == "start") {
    vars.push.apply (vars, object.play);
    return vars;
  }
  else if (objectAttr == "end") {
    vars.push.apply (vars, object.play+object.duration);
    return vars;
  }
  else if (objectAttr == "duration") {
    vars.push (object.duration);
    return vars;
  }
  else return false;
              
}


sznExpression.prototype.getExpressionTokens = function (expression) {
  
  var tokens = new Array ();  //std::vector<std::string> tokens;
  var str    = "";           //std::string str = "";      
      
  for (var i = 0; i < expression.length; ++i) {
    
    var token = expression.charAt (i);
    if (this.isOperator (token) || this.isParenthesis(token)) {
      if (str.length !== 0) {
        tokens.push (str);
      }
      str = "";
      tokens.push (token);
    }
    else {
      if (token.length !== 0 && token != " ") {
        str+=token;
      }
      else {
        if (str != "") {
          tokens.push (str);
          str = "";
        }
      }
      if (i == expression.length-1) {
        if (str != "") tokens.push (str);
      }
      
    }
  }
  return tokens;
}




sznExpression.prototype.infixToRPN = function (inputTokens, self, inputs) {       

  var success = true;      
  var stack = new Array ();
  var outs = new Array (1);
  outs[0] = new Array ();

  for (var i = 0; i < inputTokens.length; i++) {
    var token = inputTokens[i];
    console.log ("infixToRPN: %d=> token: ", i, token);
    var vars = new Array ();
    
    if (this.isOperator (token)) {
      var o1 = token;
      if (stack.length != 0) {
        var o2 = stack.top ();
        while (this.isOperator (o2) && 
               ((this.isAssociative (o1, "LEFT") && this.cmpPrecedence (o1, o2) == 0) ||
               (this.cmpPrecedence (o1, o2) < 0 )))
        {
          stack.pop();
          for (var j=0; j < outs.length; j++) outs[j].push (o2);
          if (stack.length != 0)
            o2 = stack.top();
          else
            break;
        }
      }
      stack.push (o1);
    }
        
    else if (token == "(") {
      stack.push (token);
    }
    else if (token == ")") {
      var topToken = stack.top ();
      while (topToken != "(") {
        for (var j=0; j < outs.length; j++) outs[j].push (topToken);
        stack.pop ();
        if (stack.length == 0) break;
        topToken = stack.top();
      }
      if (stack.length != 0) stack.pop();
      if (topToken != "(") return false;
    }
    else if (this.isNumber (token)) {
      for (var j = 0; j < outs.length; j++) outs[j].push (token);
    }
    else if ((vars = this.isVariable (token, self, inputs))) {
      if (vars.length == 1) {
        for (var j=0; j < outs.length; j++) outs[j].push (vars[0]);
      }
      else {
        var newout = new Array();
        for (var k=0; k < outs.length; k++) {
          for (var j=0; j < vars.length; j++) {
            var oldout = outs[k].slice(0);         
            oldout.push (vars[j]);
            newout.push (oldout);
          }
        }
        outs = newout;
      }
    }
    else {
      return false;
    }
  }
  while (stack.length != 0) {
    var stackToken = stack.top();
    if (this.isParenthesis (stackToken)) {
      return false;
    }
    for (var j=0; j < outs.length; j++) outs[j].push (stackToken);
    stack.pop();
  }
  
  return outs;
}
      
sznExpression.prototype.RPNtoDouble = function (tokens) {    
  
  var st = new Array ();
  
  for (var i=0; i < tokens.length; ++i) {
    var token = tokens[i];
    if (!this.isOperator(token)) {
      st.push (token);
    }
    else {
      var result = 0;
      var val2 = st.top ();
      st.pop ();
      var d2 = parseFloat(val2);
      if (st.length != 0) {
        val1 = st.top();
        st.pop();
        var d1 = parseFloat(val1);
        result = token == "+" ? d1 + d2 :          
                 token == "-" ? d1 - d2 :          
                 token == "*" ? d1 * d2 :          
                                d1 / d2; 
      }
      else {
        if (token == "-") result = d2 * -1;
        else result = d2;
      }
      st.push (result);
    }
  }
  return st.top();
}

sznExpression.prototype.eval = function (expr, self, inputs) {
    
  var res    = new Array ();
  var tokens = this.getExpressionTokens (expr);
  var rpn    = this.infixToRPN (tokens, self, inputs);

  if (rpn) {
    for (var i=0; i < rpn.length; i++) {
      var val = this.RPNtoDouble (rpn[i]);
      res.push (val);
    }
    return res;
  }
  else {
    return false;
  }
}

sznExpression.prototype.getObjectsID = function (expr) {
    
  var variables = new Array();
  var tokens    = this.getExpressionTokens (expr);
  
  if (tokens) {
  
    for (var i = 0; i < tokens.length; i++) {
      if (this.isNumber(tokens[i]) || this.isOperator(tokens[i]) || this.isParenthesis (tokens[i])) continue;
      else {
        var t = tokens[i].split(".");
        variables.push (t[0]);
      }
    }
    return variables;
  }
  else return false;
}

// var fs = require('fs');
// var contents = fs.readFileSync('/home/nacho/Sezion/szn_vmix3/tests/videoSandwich.json').toString();
// 
// console.log ("Result: "+VMIX3script.checkScript (contents));

//var expr = new sznExpression ();
//console.log ("Result:"+expr.eval ("5+hola.start", "hola", {hola:{duration:5, play:[7, 8]}}));

// var graph = new sznGraph (3);
// 
// graph.addEdge ('mainVideo','mainAudio2');
// graph.addEdge ('mainAudio', 'mainVideo');
// graph.addEdge ('mainText', 'mainVideo');
// 
// console.log ("Graph: "+graph.isCyclic());



