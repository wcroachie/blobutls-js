/*

  utilities for the conversion of blobs to urls, dataURLs, dataURLs or blobURLs to blobs, etc etc
  
  

*/

window[new Error().stack.match(location.href.match(/(.*)\//g)+"(.*?):")[1]]=()=>{


  window.__URLToBlob=function(url,callback){
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

};
