/*

  utilities for the conversion of blobs to urls, dataURLs, dataURLs or blobURLs to blobs, etc etc.
  following funcs are attached to the window object:
  
    window.__URLToBlob(url)         input a blobURL to dataURL, returns a blob object. does not auto-revoke blob urls, you should do that manually.
    window.__blobToDataURL(blob)    convert a blob to DataURL

    window.__URLToBlobAsynch(url,callback)
    window.__blobToDataURLAsynch(blob,callback)
  
  the following funcs create the respective file on the fly using the provided input as a string. i like to use template strings since its easier.
  this is convenient if you want to generate a simple html file for a popup or something, or if you wanna make a webworker without making a separate file.
  
    window.__createTextBlob(string)
    window.__createHTMLBlob(stringOfHTMLCode)
    window.__createJSBlob(stringOfJSCode)

    window.__createTextDataURL(string)
    window.__createHTMLDataURL(stringOfHTMLCode)
    window.__createJSDataURL(stringOfJSCode)

*/

window[new Error().stack.match(location.href.match(/(.*)\//g)+"(.*?):")[1]]=()=>{


  window.__URLToBlob=function(url){
    // works with dataURL or blobURL
    // note - technically xhr can also be used to load dataURLs, 
    // but i am also including another method specifically for dataURLs
    // because it could be useful later on if(/when???) xhr becomes deperecated
    try{
      if(url.startsWith("data:")){// handle dataurl
        var byteString = atob(url.split(",")[1]);
        var mimeString = url.split(",")[0].split(":")[1].split(";")[0];
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for(let i=0;i<byteString.length;i++){
          ia[i]=byteString.charCodeAt(i);
        }
        return new Blob([ab],{type:mimeString});
      }else if(url.startsWith("blob:")){// handle blob
        var xhr=new XMLHttpRequest();
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
        xhr.open("GET",url,false);
        xhr.send();
        var mimeType=xhr.getResponseHeader("content-type");
        var ui8=Uint8Array.from(xhr.response,c=>c.charCodeAt(0));
        return new Blob([ui8],{type:mimeType});
      }else{
        console.error("error: invalid url. cannot convert to blob.");
        return null;
      }
    }catch(e){
      console.error("error: invalid url. cannot convert to blob.");
      console.error(e);
      return null;
    }
  };
  
  
  // convert blob to url
  window.__blobToDataURL=function(blob){
    var mimeType=blob.type;
    var uri=URL.createObjectURL(blob);
    var xhr=new XMLHttpRequest();
    xhr.overrideMimeType("text/plain; charset=x-user-defined");
    xhr.open("GET",uri,false);
    xhr.send();
    URL.revokeObjectURL(uri);
    var ui8=Uint8Array.from(xhr.response, c => c.charCodeAt(0));
    return "data:"+mimeType+";base64,"+btoa([].reduce.call(ui8,function(p,c){return p+String.fromCharCode(c)},""));
  };
  
  
  window.__URLToBlobAsynch=function(url,callback){
    // works with dataURL or blobURL
    fetch(url).then((e)=>{
      return e.blob();
    }).then((blob)=>{
      callback(blob);
    }).catch((e)=>{
      console.error("error: invalid url. cannot fetch blob");
      callback(null);
    });
  };
  window.__blobToDataURLAsynch=function(blob,callback){
    var f=new FileReader();
    f.readAsDataURL(blob);
    f.onload=(e)=>{
      callback(e.target.result);
    };
  };
  
  
  
  window.__createTextBlob=function(text){
    return new Blob([text],{type:"text/plain"});
  };
  window.__createHTMLBlob=function(HTMLText){
    return new Blob([HTMLText],{type:"text/html"});
  };
  window.__createJSBlob=function(JSText){
    return new Blob([JSText],{type:"text/javascript"});
  };
  
  window.__createTextDataURL=function(text){
    var blob=__createTextBlob(text);
    var dataURL=__blobToDataURL(blob);
    return dataURL;
  };
  window.__createHTMLDataURL=function(HTMLText){
    var blob=__createHTMLBlob(HTMLText);
    var dataURL=__blobToDataURL(blob);
    return dataURL;
  };
  window.__createJSDataURL=function(JSText){
    var blob=__createJSBlob(JSText);
    var dataURL=__blobToDataURL(blob);
    return dataURL;
  };

};
